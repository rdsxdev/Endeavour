from fastapi import APIRouter, Depends, Header, Query
from sqlalchemy.orm import Session

from app.blockchain.client import blockchain, explorer_base_url
from app.blockchain.indexer import sync_once
from app.config import get_settings
from app.database import get_db
from app.exceptions.errors import AppError, ErrorCode
from app.schemas.api import (
    ContractConfigResponse,
    CreditListResponse,
    CreditOut,
    HealthResponse,
    ReadyCheck,
    ReadyResponse,
    ReportTransactionRequest,
    StatsResponse,
    TransactionOut,
)
from app.services import credits as credit_service

router = APIRouter()


@router.get("/", response_model=HealthResponse)
def root() -> HealthResponse:
    return HealthResponse(status="ok", app=get_settings().app_name)


@router.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(status="ok", app=get_settings().app_name)


@router.get("/ready", response_model=ReadyResponse)
def ready() -> ReadyResponse:
    settings = get_settings()
    db_ok = True
    try:
        from sqlalchemy import text

        from app.database import get_engine

        with get_engine().connect() as conn:
            conn.execute(text("SELECT 1"))
    except Exception:
        db_ok = False

    rpc_ok = blockchain.is_connected()
    contract_ok = blockchain.configured
    status = "ready" if db_ok and rpc_ok and contract_ok else "not_ready"
    return ReadyResponse(
        status=status,
        checks=ReadyCheck(database=db_ok, rpc=rpc_ok, contract=contract_ok),
        latest_block=blockchain.latest_block() if rpc_ok else None,
        chain_id=settings.chain_id,
        contract_address=settings.contract_address,
    )


@router.get("/config", response_model=ContractConfigResponse)
def contract_config() -> ContractConfigResponse:
    settings = get_settings()
    if not settings.contract_address:
        raise AppError(ErrorCode.CONTRACT_NOT_CONFIGURED)
    return ContractConfigResponse(
        chain_id=settings.chain_id,
        contract_address=settings.contract_address,
        explorer_base_url=explorer_base_url(settings.chain_id),
        confirmation_depth=settings.confirmation_depth,
    )


@router.get("/credits", response_model=CreditListResponse)
def list_credits(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=100),
    search: str | None = None,
    country: str | None = None,
    vintage_year: int | None = Query(default=None, ge=1990),
    retired: bool | None = None,
    verified: bool | None = None,
    owner: str | None = None,
    sort: str = Query("newest", pattern="^(newest|oldest|vintage)$"),
) -> CreditListResponse:
    return credit_service.list_credits(
        db,
        page=page,
        page_size=page_size,
        search=search,
        country=country,
        vintage_year=vintage_year,
        retired=retired,
        verified=verified,
        owner=owner,
        sort=sort,
    )


@router.get("/credits/stats", response_model=StatsResponse)
def stats(db: Session = Depends(get_db)) -> StatsResponse:
    return StatsResponse(**credit_service.get_stats(db))


@router.get("/credits/{credit_id}", response_model=CreditOut)
def get_credit(credit_id: int, db: Session = Depends(get_db)) -> CreditOut:
    if credit_id < 0:
        raise AppError(ErrorCode.VALIDATION_ERROR, "credit_id must be >= 0")
    return credit_service.get_credit(db, credit_id)


@router.post("/transactions", response_model=TransactionOut, status_code=202)
def report_transaction(
    body: ReportTransactionRequest,
    db: Session = Depends(get_db),
    idempotency_key: str | None = Header(default=None, alias="Idempotency-Key"),
) -> TransactionOut:
    if idempotency_key and not body.idempotency_key:
        body.idempotency_key = idempotency_key
    return credit_service.report_transaction(db, body)


@router.get("/transactions/{tx_hash}", response_model=TransactionOut)
def get_transaction(tx_hash: str, db: Session = Depends(get_db)) -> TransactionOut:
    return credit_service.refresh_transaction(db, tx_hash)


@router.post("/index/sync")
def trigger_sync(db: Session = Depends(get_db)) -> dict:
    return sync_once(db)
