import asyncio
import logging

from sqlalchemy.exc import SQLAlchemyError

from app.blockchain.indexer import sync_once
from app.config import get_settings
from app.database import SessionLocal

logger = logging.getLogger(__name__)

_MAX_RETRIES = 3
_INITIAL_BACKOFF_S = 1


async def indexer_loop(stop: asyncio.Event) -> None:
    """Background loop that syncs blockchain events into the database.

    On failure, retries up to _MAX_RETRIES times with exponential backoff
    (1 s, 2 s, 4 s).  After success or exhausted retries, waits
    INDEXER_POLL_SECONDS before the next cycle.  Shutdown remains responsive
    during every wait.
    """
    settings = get_settings()
    while not stop.is_set():
        await _run_sync_cycle(stop)
        # Always wait the normal poll interval before the next cycle,
        # whether the cycle succeeded or retries were exhausted.
        try:
            await asyncio.wait_for(
                stop.wait(), timeout=settings.indexer_poll_seconds
            )
        except asyncio.TimeoutError:
            pass
        else:
            # stop was set during the wait
            break


async def _run_sync_cycle(stop: asyncio.Event) -> None:
    """Attempt one sync cycle with bounded retries.

    First attempt is immediate.  On failure, retries up to _MAX_RETRIES
    times with exponential backoff (_INITIAL_BACKOFF_S, ×2 each retry).
    Each attempt gets a fresh database session so a partially-failed
    session never leaks state into a retry.
    """
    for attempt in range(1, _MAX_RETRIES + 2):
        # Exponential back-off for retries (skip on the first attempt).
        if attempt > 1:
            delay = _INITIAL_BACKOFF_S * (2 ** (attempt - 2))  # 1, 2, 4
            logger.info(
                "indexer_retry",
                extra={
                    "attempt": attempt,
                    "max_retries": _MAX_RETRIES,
                    "backoff_seconds": delay,
                },
            )
            try:
                await asyncio.wait_for(stop.wait(), timeout=delay)
            except asyncio.TimeoutError:
                pass
            if stop.is_set():
                return

        session = SessionLocal()
        try:
            result = await asyncio.to_thread(sync_once, session)
            logger.info(
                "indexer_tick",
                extra={
                    "status": result.get("status", "unknown"),
                    "attempt": attempt,
                },
            )
            return
        except SQLAlchemyError as exc:
            logger.warning(
                "indexer_db_error",
                extra={"attempt": attempt, "error": str(exc)},
            )
            try:
                session.rollback()
            except Exception:
                logger.warning("indexer_rollback_failed")
        except Exception as exc:
            # RPC / network / transient errors — retry with back-off.
            logger.warning(
                "indexer_sync_error",
                extra={"attempt": attempt, "error": str(exc)},
            )
        finally:
            session.close()

    # All retries exhausted — log once, then the caller will wait the normal
    # poll interval before starting a fresh cycle.
    logger.error(
        "indexer_sync_exhausted",
        extra={"max_retries": _MAX_RETRIES},
    )
