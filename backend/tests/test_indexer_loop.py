"""Focused tests for the hardened indexer loop and blockchain client.

These tests mock sync_once and asyncio primitives so they run without
a real blockchain node or database.  They do NOT modify the existing
tests in test_api.py.
"""

import asyncio
import logging
import time
from unittest.mock import MagicMock, patch

import pytest

# ---------------------------------------------------------------------------
# Environment must be set before any app imports.
# ---------------------------------------------------------------------------
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

from sqlalchemy.exc import SQLAlchemyError

from app.blockchain.loop import (
    _INITIAL_BACKOFF_S,
    _MAX_RETRIES,
    _run_sync_cycle,
    indexer_loop,
)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _instant_wait_for(coro, timeout):
    """Mock wait_for that does not sleep but still allows stop-checks."""
    # Close the coroutine we were given to avoid "was never awaited" warnings
    coro.close()
    return None


# ---------------------------------------------------------------------------
# 1. Successful cycle
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_successful_cycle():
    """One good sync_once call → returns, session is closed."""
    mock_session = MagicMock()
    fake_result = {"status": "ok", "processed": 5, "to_block": 100, "latest": 105}

    with (
        patch("app.blockchain.loop.SessionLocal", return_value=mock_session),
        patch("app.blockchain.loop.sync_once", return_value=fake_result) as mock_sync,
    ):
        stop = asyncio.Event()
        await _run_sync_cycle(stop)

    mock_sync.assert_called_once_with(mock_session)
    mock_session.close.assert_called_once()


# ---------------------------------------------------------------------------
# 2. Transient failure followed by success
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_transient_failure_then_success():
    """First attempt raises RPC-like error, second succeeds."""
    call_count = 0

    def _side_effect(session):
        nonlocal call_count
        call_count += 1
        if call_count == 1:
            raise ConnectionError("RPC node unreachable")
        return {"status": "ok", "processed": 0, "to_block": 0, "latest": 10}

    with (
        patch("app.blockchain.loop.SessionLocal", return_value=MagicMock()),
        patch("app.blockchain.loop.sync_once", side_effect=_side_effect),
        patch("app.blockchain.loop.asyncio.wait_for", side_effect=_instant_wait_for),
    ):
        stop = asyncio.Event()
        await _run_sync_cycle(stop)

    assert call_count == 2


# ---------------------------------------------------------------------------
# 3. Retry exhaustion
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_retry_exhaustion(caplog):
    """All retries fail → one error log emitted."""
    total_attempts = _MAX_RETRIES + 1  # 1 initial + 3 retries

    with (
        patch("app.blockchain.loop.SessionLocal", return_value=MagicMock()),
        patch("app.blockchain.loop.sync_once", side_effect=ConnectionError("down")),
        patch("app.blockchain.loop.asyncio.wait_for", side_effect=_instant_wait_for),
        caplog.at_level("WARNING", logger="app.blockchain.loop"),
    ):
        stop = asyncio.Event()
        await _run_sync_cycle(stop)

    assert any("indexer_sync_exhausted" in r.message for r in caplog.records)
    # Verify all attempts were made (sync_once called once per attempt)
    # Warning logs appear for each attempt
    warnings = [r for r in caplog.records if r.levelname == "WARNING" and "indexer_sync_error" in r.message]
    assert len(warnings) == total_attempts


# ---------------------------------------------------------------------------
# 4. Backoff behaviour
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_backoff_timing():
    """Verify exponential delays are passed to wait_for."""
    delays_seen: list[float] = []

    async def _tracking_wait_for(coro, timeout):
        delays_seen.append(timeout)
        coro.close()
        return None

    with (
        patch("app.blockchain.loop.SessionLocal", return_value=MagicMock()),
        patch("app.blockchain.loop.sync_once", side_effect=RuntimeError("transient")),
        patch("app.blockchain.loop.asyncio.wait_for", side_effect=_tracking_wait_for),
    ):
        stop = asyncio.Event()
        await _run_sync_cycle(stop)

    # 4 total attempts → backoff waits on attempts 2, 3, 4
    assert len(delays_seen) == _MAX_RETRIES  # 3
    assert delays_seen[0] == 1   # attempt 2 → 1s
    assert delays_seen[1] == 2   # attempt 3 → 2s
    assert delays_seen[2] == 4   # attempt 4 → 4s


# ---------------------------------------------------------------------------
# 5. Shutdown during backoff
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_shutdown_during_backoff():
    """stop.set() during backoff → cycle returns immediately."""
    call_count = 0

    def _fail(session):
        nonlocal call_count
        call_count += 1
        raise RuntimeError("down")

    stop_event = asyncio.Event()

    async def _stop_during_wait(coro, timeout):
        coro.close()
        stop_event.set()  # stop fires during backoff
        return None

    with (
        patch("app.blockchain.loop.SessionLocal", return_value=MagicMock()),
        patch("app.blockchain.loop.sync_once", side_effect=_fail),
        patch("app.blockchain.loop.asyncio.wait_for", side_effect=_stop_during_wait),
    ):
        await _run_sync_cycle(stop_event)

    # Only the first attempt runs (no backoff on attempt 1), then the
    # stop check after backoff on attempt 2 triggers early return.
    assert call_count == 1


# ---------------------------------------------------------------------------
# 6. DB rollback on failed cycle
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_db_rollback_on_sqlalchemy_error():
    """SQLAlchemyError triggers session.rollback(); session is still closed."""
    mock_session = MagicMock()

    with (
        patch("app.blockchain.loop.SessionLocal", return_value=mock_session),
        patch(
            "app.blockchain.loop.sync_once",
            side_effect=SQLAlchemyError("deadlock"),
        ),
        patch("app.blockchain.loop.asyncio.wait_for", side_effect=_instant_wait_for),
    ):
        stop = asyncio.Event()
        await _run_sync_cycle(stop)

    assert mock_session.rollback.called
    assert mock_session.close.called


@pytest.mark.asyncio
async def test_rollback_failure_does_not_crash():
    """If rollback itself raises, the cycle still completes gracefully."""
    mock_session = MagicMock()
    mock_session.rollback.side_effect = RuntimeError("connection lost")

    with (
        patch("app.blockchain.loop.SessionLocal", return_value=mock_session),
        patch(
            "app.blockchain.loop.sync_once",
            side_effect=SQLAlchemyError("deadlock"),
        ),
        patch("app.blockchain.loop.asyncio.wait_for", side_effect=_instant_wait_for),
    ):
        stop = asyncio.Event()
        # Should not raise
        await _run_sync_cycle(stop)

    assert mock_session.close.called


# ---------------------------------------------------------------------------
# 7. Single BlockchainClient singleton
# ---------------------------------------------------------------------------

def test_blockchain_singleton_only_one():
    """There is exactly one BlockchainClient() instantiation in client.py."""
    import inspect

    import app.blockchain.client as mod

    source = inspect.getsource(mod)
    instantiation_lines = [
        line.strip()
        for line in source.splitlines()
        if "BlockchainClient()" in line and not line.strip().startswith("#")
    ]
    assert len(instantiation_lines) == 1, (
        f"Expected exactly 1 BlockchainClient() instantiation, found {len(instantiation_lines)}: "
        f"{instantiation_lines}"
    )


# ---------------------------------------------------------------------------
# 8. Integration: indexer_loop respects poll interval then stops
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_indexer_loop_full_cycle():
    """indexer_loop runs sync_once, then waits poll interval, then can exit."""
    call_count = 0

    def _succeed(session):
        nonlocal call_count
        call_count += 1
        return {"status": "ok"}

    stop = asyncio.Event()
    wait_calls: list[float] = []

    async def _track_wait(coro, timeout):
        wait_calls.append(timeout)
        coro.close()
        # After the poll wait, set stop so the loop exits
        stop.set()
        return None

    with (
        patch("app.blockchain.loop.SessionLocal", return_value=MagicMock()),
        patch("app.blockchain.loop.sync_once", side_effect=_succeed),
        patch("app.blockchain.loop.get_settings") as mock_settings,
        patch("app.blockchain.loop.asyncio.wait_for", side_effect=_track_wait),
    ):
        mock_settings.return_value.indexer_poll_seconds = 12
        await indexer_loop(stop)

    assert call_count == 1
    assert any(t == 12 for t in wait_calls)


# ---------------------------------------------------------------------------
# 9. Verify no request_id in background logger calls
# ---------------------------------------------------------------------------

def test_loop_logger_has_no_request_id():
    """Ensure loop.py never passes request_id via logger extra."""
    import inspect

    from app.blockchain import loop as mod

    source = inspect.getsource(mod)
    assert "request_id" not in source, "loop.py must not reference request_id"


# ---------------------------------------------------------------------------
# 10. Constants sanity
# ---------------------------------------------------------------------------

def test_retry_constants():
    assert _MAX_RETRIES == 3
    assert _INITIAL_BACKOFF_S == 1
    # 1 initial + 3 retries = 4 total attempts
    # Backoff delays: 1s, 2s, 4s
    total_attempts = _MAX_RETRIES + 1
    assert total_attempts == 4
    delays = [_INITIAL_BACKOFF_S * (2 ** i) for i in range(_MAX_RETRIES)]
    assert delays == [1, 2, 4]
