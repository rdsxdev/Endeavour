from datetime import UTC, datetime
import logging

from eth_utils import to_checksum_address
from sqlalchemy.orm import Session
from web3 import Web3

from app.blockchain.client import blockchain
from app.config import get_settings
from app.models.orm import TransactionStatus
from app.repositories.credits import CreditRepository, SyncRepository, TransactionRepository

logger = logging.getLogger(__name__)


def _event_ts(w3: Web3, block_number: int) -> datetime:
    block = w3.eth.get_block(block_number)
    return datetime.fromtimestamp(int(block["timestamp"]), tz=UTC)


def sync_once(session: Session) -> dict:
    settings = get_settings()
    if not blockchain.configured:
        return {"status": "skipped", "reason": "contract_not_configured"}
    if not blockchain.is_connected():
        return {"status": "skipped", "reason": "rpc_unavailable"}

    w3 = blockchain.web3()
    contract = blockchain.contract()
    contract_address = to_checksum_address(settings.contract_address)
    chain_id = settings.chain_id
    latest = int(w3.eth.block_number)
    confirmed_head = max(latest - settings.confirmation_depth, 0)

    sync_repo = SyncRepository(session)
    credits = CreditRepository(session)
    txs = TransactionRepository(session)
    state = sync_repo.get(chain_id, contract_address)
    from_block = (state.last_indexed_block + 1) if state else max(confirmed_head - settings.indexer_max_block_span, 0)

    if from_block > confirmed_head:
        return {
            "status": "idle",
            "from_block": from_block,
            "to_block": confirmed_head,
            "latest": latest,
        }

    processed = 0
    to_block = from_block
    while from_block <= confirmed_head:
        to_block = min(from_block + settings.indexer_max_block_span - 1, confirmed_head)
        logs = []
        for event_name in ("CreditCreated", "CreditVerified", "CreditRetired", "CreditTransferred"):
            event = getattr(contract.events, event_name)
            logs.extend(event.get_logs(from_block=from_block, to_block=to_block))
        logs.sort(key=lambda item: (item["blockNumber"], item["logIndex"]))

        for event in logs:
            name = event["event"]
            args = event["args"]
            tx_hash = event["transactionHash"].hex()
            if not tx_hash.startswith("0x"):
                tx_hash = "0x" + tx_hash
            tx_hash = tx_hash.lower()
            block_number = int(event["blockNumber"])
            credit_id = int(args["id"])

            if name == "CreditCreated":
                credits.upsert_created(
                    chain_id=chain_id,
                    contract=contract_address,
                    credit_id=credit_id,
                    project=args["project"],
                    country=args["country"],
                    vintage_year=int(args["vintageYear"]),
                    owner=args["owner"],
                    created_at=_event_ts(w3, block_number),
                    tx_hash=tx_hash,
                    block_number=block_number,
                )
            elif name == "CreditVerified":
                credits.mark_verified(chain_id, contract_address, credit_id)
            elif name == "CreditRetired":
                credits.mark_retired(chain_id, contract_address, credit_id)
            elif name == "CreditTransferred":
                credits.mark_transferred(chain_id, contract_address, credit_id, args["to"])

            row = txs.get_by_hash(tx_hash)
            if row:
                row.status = TransactionStatus.CONFIRMED
                row.confirmed_at = datetime.now(UTC)
                row.block_number = block_number
                if row.credit_id is None:
                    row.credit_id = credit_id
            processed += 1

        sync_repo.upsert(chain_id, contract_address, to_block)
        session.commit()
        from_block = to_block + 1

    logger.info(
        "indexer_sync",
        extra={"processed": processed, "to_block": to_block, "latest": latest},
    )
    return {
        "status": "ok",
        "processed": processed,
        "to_block": to_block,
        "latest": latest,
    }
