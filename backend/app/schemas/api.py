from datetime import datetime
from typing import Literal

from eth_utils import is_address, to_checksum_address
from pydantic import BaseModel, ConfigDict, Field, field_validator

CURRENT_YEAR = datetime.utcnow().year


class ApiErrorBody(BaseModel):
    code: str
    message: str
    request_id: str
    details: dict | None = None


class ApiErrorResponse(BaseModel):
    success: Literal[False] = False
    error: ApiErrorBody


class CreateCreditRequest(BaseModel):
    project: str = Field(min_length=5, max_length=120)
    country: str = Field(min_length=2, max_length=60)
    vintage_year: int

    @field_validator("project", "country")
    @classmethod
    def trim(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("field is required")
        return cleaned

    @field_validator("country")
    @classmethod
    def country_chars(cls, value: str) -> str:
        if not all(ch.isalpha() or ch in " -'." for ch in value):
            raise ValueError("country must contain letters, spaces, or hyphens only")
        return value

    @field_validator("vintage_year")
    @classmethod
    def vintage_year_valid(cls, value: int) -> int:
        if value < 1990 or value > CURRENT_YEAR:
            raise ValueError(f"vintage_year must be between 1990 and {CURRENT_YEAR}")
        return value


class TransferCreditRequest(BaseModel):
    new_owner: str

    @field_validator("new_owner")
    @classmethod
    def valid_eth_address(cls, value: str) -> str:
        value = value.strip()
        if not is_address(value):
            raise ValueError("new_owner must be a valid Ethereum address")
        return to_checksum_address(value)


class ReportTransactionRequest(BaseModel):
    operation_type: Literal["create", "retire", "transfer", "verify"]
    tx_hash: str
    wallet_address: str
    credit_id: int | None = Field(default=None, ge=0)
    idempotency_key: str | None = Field(default=None, max_length=128)

    @field_validator("tx_hash")
    @classmethod
    def valid_tx_hash(cls, value: str) -> str:
        value = value.strip()
        if not value.startswith("0x") or len(value) != 66:
            raise ValueError("tx_hash must be a 32-byte hex string")
        int(value[2:], 16)
        return value.lower()

    @field_validator("wallet_address")
    @classmethod
    def valid_wallet(cls, value: str) -> str:
        if not is_address(value):
            raise ValueError("wallet_address must be a valid Ethereum address")
        return to_checksum_address(value)


class CreditOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    project: str
    country: str
    vintage_year: int
    owner: str
    verified: bool
    retired: bool
    created_at: int
    contract_address: str
    chain_id: int
    creation_tx_hash: str | None = None
    creation_block_number: int | None = None


class CreditListResponse(BaseModel):
    items: list[CreditOut]
    page: int
    page_size: int
    total: int
    total_pages: int


class TransactionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    operation_type: str
    credit_id: int | None
    wallet_address: str
    tx_hash: str
    status: str
    error_code: str | None = None
    error_message: str | None = None
    submitted_at: datetime
    confirmed_at: datetime | None = None
    block_number: int | None = None


class HealthResponse(BaseModel):
    status: str
    app: str


class ReadyCheck(BaseModel):
    database: bool
    rpc: bool
    contract: bool


class ReadyResponse(BaseModel):
    status: str
    checks: ReadyCheck
    latest_block: int | None = None
    chain_id: int
    contract_address: str


class ContractConfigResponse(BaseModel):
    chain_id: int
    contract_address: str
    explorer_base_url: str
    confirmation_depth: int


class StatsResponse(BaseModel):
    total_credits: int
    verified_credits: int
    retired_credits: int
    active_projects: int
    countries: int
