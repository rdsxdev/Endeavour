from datetime import UTC, datetime
import hashlib
import json

from eth_utils import to_checksum_address
from sqlalchemy.orm import Session

from app.blockchain.client import blockchain
from app.config import get_settings
from app.exceptions.errors import AppError, ErrorCode
from app.models.orm import TransactionStatus
from app.repositories.credits import (
    CreditRepository,
    IdempotencyRepository,
    TransactionRepository,
    WalletRepository,
    credit_to_out,
    record_audit,
)
from app.schemas.api import CreditListResponse, ReportTransactionRequest, TransactionOut


def _contract_scope() -> tuple[int, str]:
    settings = get_settings()
    if not settings.contract_address:
        raise AppError(ErrorCode.CONTRACT_NOT_CONFIGURED)
    return settings.chain_id, to_checksum_address(settings.contract_address)


def list_credits(
    session: Session,
    *,
    page: int,
    page_size: int,
    search: str | None,
    country: str | None,
    vintage_year: int | None,
    retired: bool | None,
    verified: bool | None,
    owner: str | None,
    sort: str,
) -> CreditListResponse:
    chain_id, contract = _contract_scope()
    repo = CreditRepository(session)
    rows, total = repo.list_filtered(
        chain_id=chain_id,
        contract=contract,
        search=search,
        country=country,
        vintage_year=vintage_year,
        retired=retired,
        verified=verified,
        owner=owner,
        sort=sort,
        page=page,
        page_size=page_size,
    )
    total_pages = (total + page_size - 1) // page_size if page_size else 0
    return CreditListResponse(
        items=[credit_to_out(row) for row in rows],
        page=page,
        page_size=page_size,
        total=total,
        total_pages=total_pages,
    )


def get_credit(session: Session, credit_id: int):
    chain_id, contract = _contract_scope()
    row = CreditRepository(session).get_by_onchain_id(chain_id, contract, credit_id)
    if row is None:
        raise AppError(ErrorCode.CREDIT_NOT_FOUND)
    return credit_to_out(row)


def get_stats(session: Session) -> dict:
    chain_id, contract = _contract_scope()
    return CreditRepository(session).stats(chain_id, contract)


def report_transaction(session: Session, body: ReportTransactionRequest) -> TransactionOut:
    tx_repo = TransactionRepository(session)
    existing = tx_repo.get_by_hash(body.tx_hash)
    if existing:
        return TransactionOut.model_validate(existing)

    if body.idempotency_key:
        idem = IdempotencyRepository(session).get(body.idempotency_key)
        if idem:
            if idem.request_hash != _hash_request(body):
                raise AppError(ErrorCode.DUPLICATE_REQUEST)
            return TransactionOut.model_validate(idem.response_body)

    WalletRepository(session).touch(body.wallet_address)
    row = tx_repo.create_submitted(
        operation_type=body.operation_type,
        credit_id=body.credit_id,
        wallet_address=body.wallet_address,
        tx_hash=body.tx_hash,
        status=TransactionStatus.SUBMITTED,
        submitted_at=datetime.now(UTC),
    )
    record_audit(
        session,
        "transaction_submitted",
        wallet=body.wallet_address,
        credit_id=body.credit_id,
        transaction_id=row.id,
        metadata={"tx_hash": body.tx_hash, "operation": body.operation_type},
    )
    payload = TransactionOut.model_validate(row)
    if body.idempotency_key:
        IdempotencyRepository(session).save(
            body.idempotency_key,
            _hash_request(body),
            202,
            payload.model_dump(mode="json"),
        )
    return payload


def refresh_transaction(session: Session, tx_hash: str) -> TransactionOut:
    row = TransactionRepository(session).get_by_hash(tx_hash.lower())
    if row is None:
        raise AppError(ErrorCode.TRANSACTION_NOT_FOUND)
    if row.status == TransactionStatus.CONFIRMED:
        return TransactionOut.model_validate(row)
    if not blockchain.is_connected():
        raise AppError(ErrorCode.RPC_UNAVAILABLE)
    try:
        receipt = blockchain.web3().eth.get_transaction_receipt(tx_hash)
    except Exception:
        return TransactionOut.model_validate(row)

    if receipt is None:
        return TransactionOut.model_validate(row)
    if int(receipt.get("status", 0)) == 0:
        row.status = TransactionStatus.FAILED
        row.error_code = ErrorCode.BLOCKCHAIN_TRANSACTION_FAILED
        row.error_message = "The blockchain rejected this transaction. No changes were made."
        row.block_number = int(receipt.get("blockNumber") or 0)
        return TransactionOut.model_validate(row)

    latest = int(blockchain.web3().eth.block_number)
    block_number = int(receipt["blockNumber"])
    if latest - block_number < get_settings().confirmation_depth:
        row.block_number = block_number
        return TransactionOut.model_validate(row)

    row.status = TransactionStatus.CONFIRMED
    row.confirmed_at = datetime.now(UTC)
    row.block_number = block_number
    return TransactionOut.model_validate(row)


def _hash_request(body: ReportTransactionRequest) -> str:
    canonical = json.dumps(body.model_dump(mode="json"), sort_keys=True)
    return hashlib.sha256(canonical.encode()).hexdigest()
