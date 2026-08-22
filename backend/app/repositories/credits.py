from collections.abc import Sequence
from datetime import UTC, datetime

from eth_utils import to_checksum_address
from sqlalchemy import Select, and_, func, select
from sqlalchemy.orm import Session

from app.models.orm import AuditEvent, BlockchainSyncState, Credit, IdempotencyKey, Transaction, Wallet
from app.schemas.api import CreditOut


def credit_to_out(row: Credit) -> CreditOut:
    created = row.created_at
    if created.tzinfo is None:
        created = created.replace(tzinfo=UTC)
    return CreditOut(
        id=row.blockchain_credit_id,
        project=row.project,
        country=row.country,
        vintage_year=row.vintage_year,
        owner=row.owner_address,
        verified=row.verified,
        retired=row.retired,
        created_at=int(created.timestamp()),
        contract_address=row.contract_address,
        chain_id=row.chain_id,
        creation_tx_hash=row.creation_tx_hash,
        creation_block_number=row.creation_block_number,
    )


class CreditRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    def get_by_onchain_id(
        self, chain_id: int, contract: str, credit_id: int
    ) -> Credit | None:
        stmt = select(Credit).where(
            Credit.chain_id == chain_id,
            Credit.contract_address == contract,
            Credit.blockchain_credit_id == credit_id,
        )
        return self.session.scalar(stmt)

    def upsert_created(
        self,
        *,
        chain_id: int,
        contract: str,
        credit_id: int,
        project: str,
        country: str,
        vintage_year: int,
        owner: str,
        created_at: datetime,
        tx_hash: str,
        block_number: int,
    ) -> Credit:
        row = self.get_by_onchain_id(chain_id, contract, credit_id)
        if row is None:
            row = Credit(
                blockchain_credit_id=credit_id,
                project=project,
                country=country,
                vintage_year=vintage_year,
                owner_address=to_checksum_address(owner),
                verified=False,
                retired=False,
                created_at=created_at,
                contract_address=contract,
                chain_id=chain_id,
                creation_tx_hash=tx_hash,
                creation_block_number=block_number,
            )
            self.session.add(row)
        else:
            row.project = project
            row.country = country
            row.vintage_year = vintage_year
            row.owner_address = to_checksum_address(owner)
            row.creation_tx_hash = tx_hash
            row.creation_block_number = block_number
        return row

    def mark_verified(self, chain_id: int, contract: str, credit_id: int) -> None:
        row = self.get_by_onchain_id(chain_id, contract, credit_id)
        if row:
            row.verified = True

    def mark_retired(self, chain_id: int, contract: str, credit_id: int) -> None:
        row = self.get_by_onchain_id(chain_id, contract, credit_id)
        if row:
            row.retired = True

    def mark_transferred(
        self, chain_id: int, contract: str, credit_id: int, new_owner: str
    ) -> None:
        row = self.get_by_onchain_id(chain_id, contract, credit_id)
        if row:
            row.owner_address = to_checksum_address(new_owner)

    def list_filtered(
        self,
        *,
        chain_id: int,
        contract: str,
        search: str | None,
        country: str | None,
        vintage_year: int | None,
        retired: bool | None,
        verified: bool | None,
        owner: str | None,
        sort: str,
        page: int,
        page_size: int,
    ) -> tuple[Sequence[Credit], int]:
        stmt: Select[tuple[Credit]] = select(Credit).where(
            Credit.chain_id == chain_id,
            Credit.contract_address == contract,
        )
        count_stmt = select(func.count()).select_from(Credit).where(
            Credit.chain_id == chain_id,
            Credit.contract_address == contract,
        )
        if search:
            like = f"%{search.strip()}%"
            filt = Credit.project.ilike(like) | Credit.country.ilike(like)
            if search.strip().isdigit():
                filt = filt | (Credit.blockchain_credit_id == int(search.strip()))
            stmt = stmt.where(filt)
            count_stmt = count_stmt.where(filt)
        if country:
            stmt = stmt.where(Credit.country.ilike(country.strip()))
            count_stmt = count_stmt.where(Credit.country.ilike(country.strip()))
        if vintage_year is not None:
            stmt = stmt.where(Credit.vintage_year == vintage_year)
            count_stmt = count_stmt.where(Credit.vintage_year == vintage_year)
        if retired is not None:
            stmt = stmt.where(Credit.retired == retired)
            count_stmt = count_stmt.where(Credit.retired == retired)
        if verified is not None:
            stmt = stmt.where(Credit.verified == verified)
            count_stmt = count_stmt.where(Credit.verified == verified)
        if owner:
            stmt = stmt.where(Credit.owner_address == to_checksum_address(owner))
            count_stmt = count_stmt.where(Credit.owner_address == to_checksum_address(owner))

        if sort == "oldest":
            stmt = stmt.order_by(Credit.created_at.asc(), Credit.blockchain_credit_id.asc())
        elif sort == "vintage":
            stmt = stmt.order_by(Credit.vintage_year.desc(), Credit.blockchain_credit_id.desc())
        else:
            stmt = stmt.order_by(Credit.created_at.desc(), Credit.blockchain_credit_id.desc())

        total = int(self.session.scalar(count_stmt) or 0)
        offset = (page - 1) * page_size
        rows = self.session.scalars(stmt.offset(offset).limit(page_size)).all()
        return rows, total

    def stats(self, chain_id: int, contract: str) -> dict:
        base = (
            Credit.chain_id == chain_id,
            Credit.contract_address == contract,
        )
        total = int(self.session.scalar(select(func.count()).select_from(Credit).where(and_(*base))) or 0)
        verified = int(
            self.session.scalar(select(func.count()).select_from(Credit).where(and_(*base), Credit.verified.is_(True))) or 0
        )
        retired = int(
            self.session.scalar(select(func.count()).select_from(Credit).where(and_(*base), Credit.retired.is_(True))) or 0
        )
        countries = int(
            self.session.scalar(
                select(func.count(func.distinct(Credit.country))).where(and_(*base))
            )
            or 0
        )
        projects = int(
            self.session.scalar(
                select(func.count(func.distinct(Credit.project))).where(and_(*base), Credit.retired.is_(False))
            )
            or 0
        )
        return {
            "total_credits": total,
            "verified_credits": verified,
            "retired_credits": retired,
            "active_projects": projects,
            "countries": countries,
        }


class WalletRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    def touch(self, address: str) -> Wallet:
        checksum = to_checksum_address(address)
        row = self.session.scalar(select(Wallet).where(Wallet.wallet_address == checksum))
        now = datetime.now(UTC)
        if row is None:
            row = Wallet(wallet_address=checksum, last_seen_at=now)
            self.session.add(row)
        else:
            row.last_seen_at = now
        return row


class TransactionRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    def get_by_hash(self, tx_hash: str) -> Transaction | None:
        return self.session.scalar(select(Transaction).where(Transaction.tx_hash == tx_hash.lower()))

    def create_submitted(self, **kwargs) -> Transaction:
        row = Transaction(**kwargs)
        self.session.add(row)
        self.session.flush()
        return row


class SyncRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    def get(self, chain_id: int, contract: str) -> BlockchainSyncState | None:
        return self.session.scalar(
            select(BlockchainSyncState).where(
                BlockchainSyncState.chain_id == chain_id,
                BlockchainSyncState.contract_address == contract,
            )
        )

    def upsert(self, chain_id: int, contract: str, block: int) -> BlockchainSyncState:
        row = self.get(chain_id, contract)
        if row is None:
            row = BlockchainSyncState(
                chain_id=chain_id,
                contract_address=contract,
                last_indexed_block=block,
            )
            self.session.add(row)
        else:
            row.last_indexed_block = block
        return row


class IdempotencyRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    def get(self, key: str) -> IdempotencyKey | None:
        return self.session.scalar(select(IdempotencyKey).where(IdempotencyKey.key == key))

    def save(self, key: str, request_hash: str, status: int, body: dict) -> IdempotencyKey:
        row = IdempotencyKey(
            key=key, request_hash=request_hash, response_status=status, response_body=body
        )
        self.session.add(row)
        return row


def record_audit(
    session: Session,
    event_type: str,
    *,
    wallet: str | None = None,
    credit_id: int | None = None,
    transaction_id: int | None = None,
    metadata: dict | None = None,
) -> None:
    session.add(
        AuditEvent(
            event_type=event_type,
            wallet_address=wallet,
            credit_id=credit_id,
            transaction_id=transaction_id,
            metadata_json=metadata,
        )
    )
