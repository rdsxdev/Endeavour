"""empty
"""
from alembic import op
import sqlalchemy as sa

revision = "001_initial"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "wallets",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("wallet_address", sa.String(length=42), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("last_seen_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.UniqueConstraint("wallet_address"),
    )
    op.create_index("ix_wallets_wallet_address", "wallets", ["wallet_address"])

    op.create_table(
        "credits",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("blockchain_credit_id", sa.Integer(), nullable=False),
        sa.Column("project", sa.String(length=120), nullable=False),
        sa.Column("country", sa.String(length=60), nullable=False),
        sa.Column("vintage_year", sa.Integer(), nullable=False),
        sa.Column("owner_address", sa.String(length=42), nullable=False),
        sa.Column("verified", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("retired", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("contract_address", sa.String(length=42), nullable=False),
        sa.Column("chain_id", sa.Integer(), nullable=False),
        sa.Column("creation_tx_hash", sa.String(length=66)),
        sa.Column("creation_block_number", sa.Integer()),
        sa.UniqueConstraint("chain_id", "contract_address", "blockchain_credit_id", name="uq_credit_onchain"),
    )
    op.create_index("ix_credits_owner", "credits", ["owner_address"])
    op.create_index("ix_credits_country", "credits", ["country"])
    op.create_index("ix_credits_vintage", "credits", ["vintage_year"])
    op.create_index("ix_credits_retired", "credits", ["retired"])
    op.create_index("ix_credits_verified", "credits", ["verified"])
    op.create_index("ix_credits_project", "credits", ["project"])
    op.create_index("ix_credits_created_at", "credits", ["created_at"])

    op.create_table(
        "transactions",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("operation_type", sa.String(length=32), nullable=False),
        sa.Column("credit_id", sa.Integer()),
        sa.Column("wallet_address", sa.String(length=42), nullable=False),
        sa.Column("tx_hash", sa.String(length=66), nullable=False),
        sa.Column("status", sa.String(length=32), nullable=False, server_default="submitted"),
        sa.Column("error_code", sa.String(length=64)),
        sa.Column("error_message", sa.Text()),
        sa.Column("submitted_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("confirmed_at", sa.DateTime(timezone=True)),
        sa.Column("block_number", sa.Integer()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.UniqueConstraint("tx_hash", name="uq_transactions_tx_hash"),
    )
    op.create_index("ix_transactions_wallet", "transactions", ["wallet_address"])
    op.create_index("ix_transactions_status", "transactions", ["status"])
    op.create_index("ix_transactions_credit", "transactions", ["credit_id"])

    op.create_table(
        "audit_events",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("event_type", sa.String(length=64), nullable=False),
        sa.Column("wallet_address", sa.String(length=42)),
        sa.Column("credit_id", sa.Integer()),
        sa.Column("transaction_id", sa.Integer(), sa.ForeignKey("transactions.id")),
        sa.Column("metadata", sa.JSON()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_audit_events_event_type", "audit_events", ["event_type"])
    op.create_index("ix_audit_events_wallet_address", "audit_events", ["wallet_address"])

    op.create_table(
        "blockchain_sync_state",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("chain_id", sa.Integer(), nullable=False),
        sa.Column("contract_address", sa.String(length=42), nullable=False),
        sa.Column("last_indexed_block", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.UniqueConstraint("chain_id", "contract_address", name="uq_sync_contract"),
    )

    op.create_table(
        "idempotency_keys",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("key", sa.String(length=128), nullable=False),
        sa.Column("request_hash", sa.String(length=64), nullable=False),
        sa.Column("response_status", sa.Integer(), nullable=False),
        sa.Column("response_body", sa.JSON(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.UniqueConstraint("key", name="uq_idempotency_key"),
    )


def downgrade() -> None:
    op.drop_table("idempotency_keys")
    op.drop_table("blockchain_sync_state")
    op.drop_table("audit_events")
    op.drop_table("transactions")
    op.drop_table("credits")
    op.drop_table("wallets")
