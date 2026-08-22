from datetime import datetime
from enum import StrEnum

from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.types import JSON

from app.database import Base


class TransactionStatus(StrEnum):
    PENDING = "pending"
    SUBMITTED = "submitted"
    CONFIRMED = "confirmed"
    FAILED = "failed"


class OperationType(StrEnum):
    CREATE = "create"
    RETIRE = "retire"
    TRANSFER = "transfer"
    VERIFY = "verify"


class Wallet(Base):
    __tablename__ = "wallets"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    wallet_address: Mapped[str] = mapped_column(String(42), unique=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
    last_seen_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class Credit(Base):
    __tablename__ = "credits"
    __table_args__ = (
        UniqueConstraint(
            "chain_id",
            "contract_address",
            "blockchain_credit_id",
            name="uq_credit_onchain",
        ),
        Index("ix_credits_owner", "owner_address"),
        Index("ix_credits_country", "country"),
        Index("ix_credits_vintage", "vintage_year"),
        Index("ix_credits_retired", "retired"),
        Index("ix_credits_verified", "verified"),
        Index("ix_credits_project", "project"),
        Index("ix_credits_created_at", "created_at"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    blockchain_credit_id: Mapped[int] = mapped_column(Integer, nullable=False)
    project: Mapped[str] = mapped_column(String(120), nullable=False)
    country: Mapped[str] = mapped_column(String(60), nullable=False)
    vintage_year: Mapped[int] = mapped_column(Integer, nullable=False)
    owner_address: Mapped[str] = mapped_column(String(42), nullable=False)
    verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    retired: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
    contract_address: Mapped[str] = mapped_column(String(42), nullable=False)
    chain_id: Mapped[int] = mapped_column(Integer, nullable=False)
    creation_tx_hash: Mapped[str | None] = mapped_column(String(66))
    creation_block_number: Mapped[int | None] = mapped_column(Integer)


class Transaction(Base):
    __tablename__ = "transactions"
    __table_args__ = (
        UniqueConstraint("tx_hash", name="uq_transactions_tx_hash"),
        Index("ix_transactions_wallet", "wallet_address"),
        Index("ix_transactions_status", "status"),
        Index("ix_transactions_credit", "credit_id"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    operation_type: Mapped[str] = mapped_column(String(32), nullable=False)
    credit_id: Mapped[int | None] = mapped_column(Integer)
    wallet_address: Mapped[str] = mapped_column(String(42), nullable=False)
    tx_hash: Mapped[str] = mapped_column(String(66), nullable=False)
    status: Mapped[str] = mapped_column(String(32), default=TransactionStatus.SUBMITTED, nullable=False)
    error_code: Mapped[str | None] = mapped_column(String(64))
    error_message: Mapped[str | None] = mapped_column(Text)
    submitted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    confirmed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    block_number: Mapped[int | None] = mapped_column(Integer)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class AuditEvent(Base):
    __tablename__ = "audit_events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    event_type: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    wallet_address: Mapped[str | None] = mapped_column(String(42), index=True)
    credit_id: Mapped[int | None] = mapped_column(Integer)
    transaction_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("transactions.id"))
    metadata_json: Mapped[dict | None] = mapped_column("metadata", JSON)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class BlockchainSyncState(Base):
    __tablename__ = "blockchain_sync_state"
    __table_args__ = (
        UniqueConstraint("chain_id", "contract_address", name="uq_sync_contract"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    chain_id: Mapped[int] = mapped_column(Integer, nullable=False)
    contract_address: Mapped[str] = mapped_column(String(42), nullable=False)
    last_indexed_block: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class IdempotencyKey(Base):
    __tablename__ = "idempotency_keys"
    __table_args__ = (UniqueConstraint("key", name="uq_idempotency_key"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    key: Mapped[str] = mapped_column(String(128), nullable=False)
    request_hash: Mapped[str] = mapped_column(String(64), nullable=False)
    response_status: Mapped[int] = mapped_column(Integer, nullable=False)
    response_body: Mapped[dict] = mapped_column(JSON, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
