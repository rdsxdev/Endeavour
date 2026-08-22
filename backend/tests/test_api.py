from datetime import UTC, datetime
import os

os.environ.setdefault("APP_ENV", "test")
os.environ.setdefault("DATABASE_URL", "sqlite+pysqlite:///:memory:")
os.environ.setdefault("INDEXER_ENABLED", "false")
os.environ.setdefault("RATE_LIMIT_ENABLED", "false")
os.environ.setdefault("LOG_JSON", "false")
os.environ.setdefault("CONTRACT_ADDRESS", "0x0000000000000000000000000000000000000001")
os.environ.setdefault("CHAIN_ID", "11155111")
os.environ.setdefault("RPC_URL", "")
os.environ.setdefault("CORS_ORIGINS", "http://localhost:5173")

from fastapi.testclient import TestClient
import pytest

from app.config import get_settings
from app.database import Base, get_engine, reset_engine
from app.main import create_app
from app.models.orm import Credit
from app.repositories.credits import CreditRepository


@pytest.fixture()
def client():
    get_settings.cache_clear()
    reset_engine()
    engine = get_engine()
    Base.metadata.create_all(engine)
    app = create_app()
    with TestClient(app) as test_client:
        yield test_client
    Base.metadata.drop_all(engine)
    reset_engine()
    get_settings.cache_clear()


def test_health(client: TestClient):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"
    assert "X-Request-ID" in response.headers


def test_ready_without_rpc(client: TestClient):
    response = client.get("/ready")
    assert response.status_code == 200
    body = response.json()
    assert body["checks"]["database"] is True
    assert body["checks"]["rpc"] is False
    assert body["status"] == "not_ready"


def test_create_validation(client: TestClient):
    from app.schemas.api import CreateCreditRequest
    from pydantic import ValidationError

    with pytest.raises(ValidationError):
        CreateCreditRequest(project="ab", country="Indonesia", vintage_year=2024)
    with pytest.raises(ValidationError):
        CreateCreditRequest(project="Valid Project Name", country="Indonesia", vintage_year=1980)
    with pytest.raises(ValidationError):
        CreateCreditRequest(project="Valid Project Name", country="!!!", vintage_year=2024)


def test_malformed_transfer_address():
    from app.schemas.api import TransferCreditRequest
    from pydantic import ValidationError

    with pytest.raises(ValidationError):
        TransferCreditRequest(new_owner="not-an-address")


def _seed_credit(session, **overrides):
    defaults = dict(
        blockchain_credit_id=0,
        project="Rimba Raya Biodiversity Reserve",
        country="Indonesia",
        vintage_year=2023,
        owner_address="0x1111111111111111111111111111111111111111",
        verified=True,
        retired=False,
        created_at=datetime.now(UTC),
        contract_address="0x0000000000000000000000000000000000000001",
        chain_id=11155111,
        creation_tx_hash="0x" + "ab" * 32,
        creation_block_number=100,
    )
    defaults.update(overrides)
    session.add(Credit(**defaults))
    session.commit()


def test_list_and_detail(client: TestClient):
    from app.database import SessionLocal

    with SessionLocal() as session:
        _seed_credit(session)
        _seed_credit(session, blockchain_credit_id=1, project="Lake Turkana Wind Power", country="Kenya", retired=True)

    listed = client.get("/credits?page=1&page_size=25")
    assert listed.status_code == 200
    payload = listed.json()
    assert payload["total"] == 2
    assert len(payload["items"]) == 2

    kenya = client.get("/credits?country=Kenya")
    assert kenya.json()["total"] == 1

    detail = client.get("/credits/0")
    assert detail.status_code == 200
    assert detail.json()["project"] == "Rimba Raya Biodiversity Reserve"

    missing = client.get("/credits/99")
    assert missing.status_code == 404
    assert missing.json()["success"] is False
    assert missing.json()["error"]["code"] == "CREDIT_NOT_FOUND"


def test_report_transaction_idempotency(client: TestClient):
    body = {
        "operation_type": "create",
        "tx_hash": "0x" + "11" * 32,
        "wallet_address": "0x2222222222222222222222222222222222222222",
        "idempotency_key": "create-1",
    }
    first = client.post("/transactions", json=body)
    assert first.status_code == 202
    second = client.post("/transactions", json=body)
    assert second.status_code == 202
    assert first.json()["tx_hash"] == second.json()["tx_hash"]


def test_stats(client: TestClient):
    from app.database import SessionLocal

    with SessionLocal() as session:
        _seed_credit(session)
    response = client.get("/credits/stats")
    assert response.status_code == 200
    assert response.json()["total_credits"] == 1


def test_database_failure(client: TestClient, monkeypatch):
    from app.services import credits as credit_service
    from sqlalchemy.exc import SQLAlchemyError

    def boom(*_args, **_kwargs):
        raise SQLAlchemyError("db down")

    monkeypatch.setattr(credit_service, "list_credits", boom)
    response = client.get("/credits")
    assert response.status_code == 503
    assert response.json()["error"]["code"] == "DATABASE_UNAVAILABLE"


def test_rpc_refresh_failure(client: TestClient, monkeypatch):
    from app.blockchain.client import blockchain
    from app.exceptions.errors import AppError, ErrorCode

    body = {
        "operation_type": "retire",
        "tx_hash": "0x" + "22" * 32,
        "wallet_address": "0x2222222222222222222222222222222222222222",
        "credit_id": 0,
    }
    submitted = client.post("/transactions", json=body)
    assert submitted.status_code == 202

    monkeypatch.setattr(blockchain, "is_connected", lambda: False)
    response = client.get("/transactions/" + body["tx_hash"])
    assert response.status_code == 503
    assert response.json()["error"]["code"] == "RPC_UNAVAILABLE"


def test_nonexistent_transaction(client: TestClient):
    response = client.get("/transactions/" + "0x" + "33" * 32)
    assert response.status_code == 404
