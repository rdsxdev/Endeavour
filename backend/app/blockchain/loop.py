import asyncio
import logging

from app.blockchain.indexer import sync_once
from app.config import get_settings
from app.database import SessionLocal

logger = logging.getLogger(__name__)


async def indexer_loop(stop: asyncio.Event) -> None:
    settings = get_settings()
    while not stop.is_set():
        try:
            with SessionLocal() as session:
                result = await asyncio.to_thread(sync_once, session)
                logger.info("indexer_tick", extra={"result": result})
        except Exception:
            logger.exception("indexer_tick_failed")
        try:
            await asyncio.wait_for(stop.wait(), timeout=settings.indexer_poll_seconds)
        except TimeoutError:
            continue
