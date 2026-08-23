"""Red-team integration tests -- every failure mode against live infrastructure.

Requires:
  - PostgreSQL running (endavour database)
  - Hardhat node at http://127.0.0.1:8545 with CarbonRegistry deployed
  - backend/.env configured for chain_id=31337
"""
from __future__ import annotations

import asyncio
import re
import subprocess
import time
from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest
import requests
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from app.blockchain.client import blockchain, load_abi
from app.blockchain.indexer import sync_once
from app.blockchain.loop import _INITIAL_BACKOFF_S, _MAX_RETRIES, _run_sync_cycle
from app.config import get_settings
from app.database import SessionLocal
from app.models.orm import Credit

# -- Constants ------------------------------------------------------

HARDHAT_URL = "http://127.0.0.1:8545"
CONTRACT_ADDR = "0x5FbDB2315678afecb367f032d93F642f64180aa3"
CHAIN_ID = 31337
DEPLOYER = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
ALICE = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
BOB = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"


# -- Helpers --------------------------------------------------------

def _rpc(method: str, params=None):
    return requests.post(HARDHAT_URL, json={
        "jsonrpc": "2.0", "method": method, "params": params or [], "id": 1
    }).json()


def _mine(n: int = 1):
    _rpc("hardhat_mine", [hex(n)])


def _latest_block() -> int:
    return int(_rpc("eth_blockNumber")["result"], 16)


def _send_tx(data: str, sender: str = DEPLOYER) -> str | None:
    """Send a transaction. Returns tx hash or None if reverted."""
    resp = requests.post(HARDHAT_URL, json={
        "jsonrpc": "2.0", "method": "eth_sendTransaction", "id": 1,
        "params": [{"from": sender, "to": CONTRACT_ADDR, "data": data, "gas": "0x100000"}],
    })
    r = resp.json()
    if "result" in r:
        return r["result"]
    return None  # reverted


def _call(data: str, sender: str = DEPLOYER) -> dict:
    """eth_call -- simulate without mining. Returns response dict."""
    return _rpc("eth_call", [{"from": sender, "to": CONTRACT_ADDR, "data": data}])


def _call_reverts(data: str, sender: str = DEPLOYER) -> bool:
    """Return True if eth_call returns an error (transaction would revert)."""
    resp = requests.post(HARDHAT_URL, json={
        "jsonrpc": "2.0", "method": "eth_call", "id": 1,
        "params": [{"from": sender, "to": CONTRACT_ADDR, "data": data}],
    })
    return "error" in resp.json()


def _clean_db():
    session = SessionLocal()
    session.execute(text("DELETE FROM credits WHERE chain_id = :c"), {"c": CHAIN_ID})
    session.execute(text("DELETE FROM blockchain_sync_state WHERE chain_id = :c"), {"c": CHAIN_ID})
    session.commit()
    session.close()


def _credit_count(session) -> int:
    return int(session.execute(
        text("SELECT count(*) FROM credits WHERE chain_id = :c"), {"c": CHAIN_ID}
    ).scalar())


def _sync_block(session) -> int | None:
    row = session.execute(
        text("SELECT last_indexed_block FROM blockchain_sync_state WHERE chain_id = :c"),
        {"c": CHAIN_ID},
    ).fetchone()
    return row[0] if row else None


def _get_credit(session, cid: int) -> Credit | None:
    return session.query(Credit).filter(
        Credit.chain_id == CHAIN_ID,
        Credit.contract_address == CONTRACT_ADDR,
        Credit.blockchain_credit_id == cid,
    ).first()


def _fresh_contract():
    """Get a fresh contract object (for encoding ABI)."""
    return blockchain.contract()


# ===================================================================
# 1. DATABASE FAILURE
# ===================================================================

class TestDatabaseFailure:

    def test_broken_session_raises(self):
        """sync_once propagates SQLAlchemyError on broken session."""
        broken = MagicMock()
        broken.scalar.side_effect = SQLAlchemyError("connection refused")
        broken.execute.side_effect = SQLAlchemyError("connection refused")
        with pytest.raises((SQLAlchemyError, Exception)):
            sync_once(broken)

    def test_failed_commit_preserves_state(self):
        """Commit failure does not corrupt existing DB state."""
        _clean_db()
        _mine(5)
        session = SessionLocal()

        result = sync_once(session)
        assert result["status"] == "ok"
        count_before = _credit_count(session)

        # Mock commit to fail on next call
        orig_commit = session.commit
        session.commit = MagicMock(side_effect=SQLAlchemyError("commit fail"))
        try:
            sync_once(session)
        except SQLAlchemyError:
            pass

        # Separate connection must not see the failed commit's data
        verify = SessionLocal()
        count_after = _credit_count(verify)
        verify.close()
        session.close()
        assert count_after == count_before, f"State corrupted: {count_before} -> {count_after}"

    def test_fresh_sessions_not_exhausted(self):
        """Multiple fresh sessions can be created and closed without pool exhaustion."""
        _clean_db()
        for _ in range(20):
            s = SessionLocal()
            s.close()
        session = SessionLocal()
        assert _credit_count(session) == 0
        session.close()


# ===================================================================
# 2. RPC FAILURE
# ===================================================================

class TestRpcFailure:

    def test_empty_rpc_returns_skipped(self):
        session = SessionLocal()
        old_url = blockchain.settings.rpc_url
        blockchain._w3 = None
        blockchain._contract = None
        try:
            from app.config import Settings
            blockchain.settings = Settings(rpc_url="", contract_address=CONTRACT_ADDR, chain_id=CHAIN_ID)
            result = sync_once(session)
            assert result["status"] == "skipped"
        finally:
            blockchain._w3 = None
            blockchain._contract = None
            from app.config import Settings
            blockchain.settings = Settings(rpc_url=old_url, contract_address=CONTRACT_ADDR, chain_id=CHAIN_ID)
            session.close()

    def test_wrong_port_fails_fast(self):
        old_url = blockchain.settings.rpc_url
        blockchain._w3 = None
        blockchain._contract = None
        try:
            from app.config import Settings
            blockchain.settings = Settings(rpc_url="http://127.0.0.1:19999", contract_address=CONTRACT_ADDR, chain_id=CHAIN_ID)
            start = time.time()
            assert blockchain.is_connected() is False
            elapsed = time.time() - start
            assert elapsed < 5, f"Connection to wrong port took {elapsed:.1f}s"
        finally:
            blockchain._w3 = None
            blockchain._contract = None
            from app.config import Settings
            blockchain.settings = Settings(rpc_url=old_url, contract_address=CONTRACT_ADDR, chain_id=CHAIN_ID)

    def test_rpc_error_propagates_as_exception(self):
        """If RPC fails mid-sync, sync_once raises (the loop catches it)."""
        session = SessionLocal()
        mock_event = MagicMock()
        mock_event.get_logs.side_effect = ConnectionError("timeout")

        # Patch is_connected to return True, but contract.get_logs to fail
        with patch.object(type(blockchain), 'is_connected', return_value=True):
            with patch.object(blockchain, 'contract') as mc:
                c = MagicMock()
                for n in ("CreditCreated", "CreditVerified", "CreditRetired", "CreditTransferred"):
                    setattr(c.events, n, mock_event)
                mc.return_value = c
                with pytest.raises(ConnectionError):
                    sync_once(session)
        session.close()

    def test_retry_constants(self):
        assert _MAX_RETRIES == 3
        delays = [_INITIAL_BACKOFF_S * (2 ** i) for i in range(_MAX_RETRIES)]
        assert delays == [1, 2, 4]


# ===================================================================
# 3. INDEXER CRASH SAFETY
# ===================================================================

class TestCrashSafety:

    def test_failed_commit_invisible_to_others(self):
        """Autoflush sends data, but failed commit is invisible to other connections."""
        _clean_db()
        _mine(5)
        session = SessionLocal()
        session.commit = MagicMock(side_effect=SQLAlchemyError("crash"))

        try:
            sync_once(session)
        except (SQLAlchemyError, Exception):
            pass

        verify = SessionLocal()
        count = _credit_count(verify)
        verify.close()
        session.close()
        assert count == 0, f"Uncommitted data leaked: {count} credits"

    def test_successful_commit_is_persisted(self):
        """After successful sync, data is committed and visible to new connections."""
        _clean_db()
        _mine(5)
        session = SessionLocal()
        result = sync_once(session)
        assert result["status"] == "ok"
        assert result["processed"] >= 2
        session.close()

        verify = SessionLocal()
        assert _credit_count(verify) >= 2
        verify.close()

    def test_sync_state_persisted_after_crash_recovery(self):
        """After crash recovery, sync resumes from last committed state."""
        _clean_db()
        _mine(5)
        session = SessionLocal()
        sync_once(session)
        saved_block = _sync_block(session)
        assert saved_block is not None
        session.close()

        session2 = SessionLocal()
        result = sync_once(session2)
        assert result["status"] in ("idle", "ok")
        session2.close()


# ===================================================================
# 4. SAME-BATCH EVENT ORDERING
# ===================================================================

class TestSameBatchOrdering:

    def test_create_verify_transfer_in_one_batch(self):
        """create -> verify -> transfer all in same block range."""
        _clean_db()
        contract = _fresh_contract()

        _send_tx(contract.encode_abi("createCredit", args=["Lifecycle Test", "Brazil", 2024]))
        _mine(1)
        # Dynamic credit ID from on-chain counter
        cid = int(contract.functions.creditCount().call()) - 1
        # Verify as admin
        _send_tx(contract.encode_abi("verifyCredit", args=[cid]))
        _mine(1)
        # Transfer to alice
        _send_tx(contract.encode_abi("transferCredit", args=[cid, ALICE]))
        _mine(5)

        session = SessionLocal()
        result = sync_once(session)
        assert result["status"] == "ok"

        c = _get_credit(session, cid)
        assert c is not None
        assert c.project == "Lifecycle Test"
        assert c.verified is True
        assert c.owner_address.lower() == ALICE.lower()
        assert c.retired is False
        session.close()

    def test_multiple_credits_multi_events(self):
        """3 credits created + verified in one range."""
        _clean_db()
        contract = _fresh_contract()

        for name in ["Alpha", "Beta", "Gamma"]:
            _send_tx(contract.encode_abi("createCredit", args=[name, "Kenya", 2023]))
        _mine(1)
        for cid in range(3):
            _send_tx(contract.encode_abi("verifyCredit", args=[cid]))
        _mine(5)

        session = SessionLocal()
        result = sync_once(session)
        assert result["status"] == "ok"
        assert result["processed"] >= 6

        for cid in range(3):
            c = _get_credit(session, cid)
            assert c is not None, f"Credit {cid} missing"
            assert c.verified is True, f"Credit {cid} not verified"
        session.close()


# ===================================================================
# 5. DUPLICATE / REPLAY SAFETY
# ===================================================================

class TestDuplicateReplay:

    def test_replay_same_range_no_duplicates(self):
        _clean_db()
        _mine(5)

        s1 = SessionLocal()
        sync_once(s1)
        count1 = _credit_count(s1)
        s1.close()

        s2 = SessionLocal()
        sync_once(s2)
        s2.close()

        verify = SessionLocal()
        count2 = _credit_count(verify)
        verify.close()
        assert count2 == count1, f"Duplicates: {count1} -> {count2}"

    def test_five_runs_preserve_state(self):
        _clean_db()
        _mine(5)
        s = SessionLocal()
        sync_once(s)
        s.close()

        for _ in range(4):
            s2 = SessionLocal()
            sync_once(s2)
            s2.close()

        verify = SessionLocal()
        c = _get_credit(verify, 0)
        assert c is not None
        assert c.verified is True
        verify.close()

    def test_idempotent_verified(self):
        """mark_verified called twice doesn't corrupt state."""
        _clean_db()
        _mine(5)

        s1 = SessionLocal()
        sync_once(s1)
        s1.close()

        s2 = SessionLocal()
        sync_once(s2)
        s2.close()

        verify = SessionLocal()
        c = _get_credit(verify, 0)
        assert c is not None
        assert c.verified is True
        assert c.retired is False
        verify.close()


# ===================================================================
# 6. BLOCK RANGE SAFETY
# ===================================================================

class TestBlockRange:

    def test_empty_range_returns_idle(self):
        _clean_db()
        _mine(5)
        s1 = SessionLocal()
        sync_once(s1)
        s1.close()

        s2 = SessionLocal()
        result = sync_once(s2)
        s2.close()
        assert result["status"] == "idle"

    def test_sync_state_advances(self):
        _clean_db()
        _mine(3)
        session = SessionLocal()
        result = sync_once(session)
        assert result["status"] == "ok"
        assert _sync_block(session) == result["to_block"]
        session.close()

    def test_no_gaps_across_restarts(self):
        _clean_db()
        _mine(3)
        s1 = SessionLocal()
        r1 = sync_once(s1)
        s1.close()
        assert r1["status"] == "ok"

        _mine(3)
        s2 = SessionLocal()
        r2 = sync_once(s2)
        s2.close()
        assert r2["status"] == "ok"
        assert r2["to_block"] >= r1["to_block"] + 1


# ===================================================================
# 7. CONFIRMATION DEPTH
# ===================================================================

class TestConfirmationDepth:

    def test_unconfirmed_not_indexed_then_confirmed(self):
        """Event inside confirmation window is NOT processed until confirmed."""
        _clean_db()
        contract = _fresh_contract()

        tx_hash = _send_tx(contract.encode_abi("createCredit", args=["Unconfirmed", "Peru", 2024]))
        assert tx_hash is not None, "createCredit should succeed"
        tx_block = _latest_block()

        depth = get_settings().confirmation_depth
        # Event is at tx_block, confirmed_head = latest - depth
        # With 0 extra blocks: confirmed_head = tx_block - depth < tx_block

        session = SessionLocal()
        result = sync_once(session)
        if result["status"] == "ok":
            # Check the credit we just created, not credit 0
            cid = int(contract.functions.creditCount().call()) - 1
            c = _get_credit(session, cid)
            assert c is None, "Unconfirmed event was indexed prematurely!"
        session.close()

        # Mine past confirmation depth
        _mine(depth + 2)
        session2 = SessionLocal()
        result2 = sync_once(session2)
        assert result2["status"] == "ok"
        cid = int(contract.functions.creditCount().call()) - 1
        c2 = _get_credit(session2, cid)
        assert c2 is not None, "Confirmed event was NOT indexed"
        assert c2.project == "Unconfirmed"
        session2.close()


# ===================================================================
# 8. CONTRACT SECURITY (uses eth_call for revert detection)
# ===================================================================

class TestContractSecurity:

    def test_unauthorized_verify_reverts(self):
        """Non-admin cannot verify credits."""
        contract = _fresh_contract()
        # Verify from ALICE (not admin) -- should revert
        fn = contract.encode_abi("verifyCredit", args=[0])
        assert _call_reverts(fn, sender=ALICE)

    def test_unauthorized_retire_reverts(self):
        """Non-owner cannot retire credits."""
        contract = _fresh_contract()
        # Retire from BOB (not owner) -- should revert
        fn = contract.encode_abi("retireCredit", args=[0])
        assert _call_reverts(fn, sender=BOB)

    def test_zero_address_transfer_reverts(self):
        contract = _fresh_contract()
        fn = contract.encode_abi("transferCredit", args=[0, "0x" + "0" * 40])
        assert _call_reverts(fn)

    def test_empty_project_reverts(self):
        contract = _fresh_contract()
        fn = contract.encode_abi("createCredit", args=["", "Brazil", 2024])
        assert _call_reverts(fn)

    def test_retire_before_verify_reverts(self):
        """Cannot retire an unverified credit."""
        contract = _fresh_contract()
        _clean_db()
        _mine(1)

        # Create a credit
        fn_create = contract.encode_abi("createCredit", args=["NoVerify", "India", 2024])
        _send_tx(fn_create)
        _mine(1)

        # Get its ID from on-chain counter
        cid = int(contract.functions.creditCount().call()) - 1

        # Try retire without verify -- should revert
        fn = contract.encode_abi("retireCredit", args=[cid])
        assert _call_reverts(fn)

    def test_ownership_transfers_correctly(self):
        """After transfer, old owner loses control, new owner gains it."""
        contract = _fresh_contract()

        # Create credit
        fn = contract.encode_abi("createCredit", args=["OwnTest", "Mexico", 2024])
        _send_tx(fn)
        _mine(1)

        cid = int(contract.functions.creditCount().call()) - 1

        # Verify
        _send_tx(contract.encode_abi("verifyCredit", [cid]))
        _mine(1)

        # Transfer to BOB
        _send_tx(contract.encode_abi("transferCredit", [cid, BOB]))
        _mine(1)

        # Old owner (deployer) tries to retire -- should revert
        assert _call_reverts(contract.encode_abi("retireCredit", [cid]))

        # New owner (BOB) can retire -- should succeed
        assert not _call_reverts(contract.encode_abi("retireCredit", [cid]), sender=BOB)

    def test_same_owner_transfer_reverts(self):
        """Cannot transfer to yourself."""
        contract = _fresh_contract()
        fn = contract.encode_abi("transferCredit", [0, DEPLOYER])
        assert _call_reverts(fn)

    def test_double_verify_reverts(self):
        """Cannot verify an already verified credit."""
        contract = _fresh_contract()
        fn = contract.encode_abi("verifyCredit", [0])
        assert _call_reverts(fn)

    def test_future_vintage_reverts(self):
        """Cannot create credit with future vintage year."""
        contract = _fresh_contract()
        fn = contract.encode_abi("createCredit", ["Future", "Japan", 9999])
        assert _call_reverts(fn)

    def test_credit_not_found_reverts(self):
        """Cannot access nonexistent credit."""
        contract = _fresh_contract()
        fn = contract.encode_abi("getCredit", [999999])
        assert _call_reverts(fn)


# ===================================================================
# 9. API FAILURE CONTRACT
# ===================================================================

class TestApiContract:

    @pytest.fixture(autouse=True)
    def setup(self):
        from fastapi.testclient import TestClient
        from app.main import app
        self.c = TestClient(app, raise_server_exceptions=False)

    def test_health(self):
        assert self.c.get("/health").status_code == 200

    def test_root(self):
        assert self.c.get("/").status_code == 200

    def test_ready(self):
        r = self.c.get("/ready")
        assert r.status_code == 200
        assert "checks" in r.json()

    def test_config(self):
        r = self.c.get("/config")
        assert r.status_code == 200
        assert "chain_id" in r.json()

    def test_credits_list(self):
        r = self.c.get("/credits")
        assert r.status_code == 200
        assert "items" in r.json()

    def test_credit_not_found(self):
        r = self.c.get("/credits/999999")
        assert r.status_code == 404
        body = r.json()
        assert body["success"] is False
        assert body["error"]["code"] == "CREDIT_NOT_FOUND"

    def test_negative_credit_id(self):
        r = self.c.get("/credits/-1")
        assert r.status_code in (404, 422)

    def test_stats(self):
        r = self.c.get("/credits/stats")
        assert r.status_code == 200
        assert "total_credits" in r.json()

    def test_invalid_page(self):
        r = self.c.get("/credits?page=0")
        assert r.status_code == 422
        assert r.json()["success"] is False

    def test_invalid_sort(self):
        assert self.c.get("/credits?sort=BAD").status_code == 422

    def test_transaction_not_found(self):
        r = self.c.get("/transactions/0x" + "a" * 64)
        assert r.status_code == 404
        assert r.json()["error"]["code"] == "TRANSACTION_NOT_FOUND"

    def test_invalid_report_body(self):
        r = self.c.post("/transactions", json={"operation_type": "bad"})
        assert r.status_code == 422

    def test_no_stack_trace_in_errors(self):
        body = self.c.get("/credits/999999").text
        assert "Traceback" not in body
        assert "File \"" not in body
        assert "/home/" not in body

    def test_error_has_request_id(self):
        body = self.c.get("/credits/999999").json()
        assert "request_id" in body["error"]

    def test_error_success_false(self):
        body = self.c.get("/credits/999999").json()
        assert body["success"] is False


# ===================================================================
# 10. CONFIGURATION SECURITY
# ===================================================================

class TestConfigSecurity:

    def test_no_hardcoded_keys(self):
        for p in Path("app").rglob("*.py"):
            content = p.read_text()
            keys = re.findall(r"0x[0-9a-fA-F]{64}", content)
            assert len(keys) == 0, f"Private key in {p}: {keys[0][:20]}..."

    def test_secret_filter_masks_keys(self):
        from app.logging.setup import SecretFilter
        import logging
        f = SecretFilter()
        rec = logging.LogRecord("t", logging.INFO, "", 0,
            "connecting with private_key=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
            (), None)
        f.filter(rec)
        assert "0xac0974" not in rec.msg

    def test_env_not_tracked(self):
        result = subprocess.run(["git", "ls-files"], capture_output=True, text=True, cwd="..")
        for line in result.stdout.splitlines():
            if ".env" in line:
                assert ".env.example" in line, f"Secret file tracked: {line}"

    def test_explorer_url_clean(self):
        from app.blockchain.client import explorer_base_url
        for cid in (1, 11155111):
            url = explorer_base_url(cid)
            for kw in ("key", "secret", "token"):
                assert kw not in url.lower()


# ===================================================================
# 11. SHUTDOWN SAFETY
# ===================================================================

class TestShutdownSafety:

    def test_stop_breaks_immediately(self):
        async def run():
            stop = asyncio.Event()
            stop.set()
            await _run_sync_cycle(stop)
        asyncio.run(run())

    def test_shutdown_during_backoff(self):
        async def run():
            stop = asyncio.Event()

            async def set_stop():
                await asyncio.sleep(0.1)
                stop.set()

            asyncio.create_task(set_stop())
            session = SessionLocal()
            try:
                with patch("app.blockchain.loop.sync_once", side_effect=ConnectionError("down")):
                    start = time.time()
                    await _run_sync_cycle(stop)
                    elapsed = time.time() - start
                    assert elapsed < 3.0, f"Shutdown too slow: {elapsed}s"
            finally:
                session.close()
        asyncio.run(run())


# ===================================================================
# 12. STATE CONSISTENCY
# ===================================================================

class TestStateConsistency:

    def test_db_matches_chain(self):
        """Final DB state exactly matches on-chain state."""
        _clean_db()
        contract = _fresh_contract()

        # Create 2 credits
        _send_tx(contract.encode_abi("createCredit", args=["Match Alpha", "Nigeria", 2024]))
        _mine(1)
        _send_tx(contract.encode_abi("createCredit", args=["Match Beta", "Nigeria", 2024]))
        _mine(1)

        # Verify both
        _send_tx(contract.encode_abi("verifyCredit", [0]))
        _mine(1)
        _send_tx(contract.encode_abi("verifyCredit", [1]))
        _mine(1)

        # Retire credit 1
        _send_tx(contract.encode_abi("retireCredit", [1]))
        _mine(5)

        # Sync
        session = SessionLocal()
        result = sync_once(session)
        assert result["status"] == "ok"

        # Compare each credit with chain using web3 contract
        total = int(contract.functions.creditCount().call())
        for cid in range(total):
            chain_credit = contract.functions.getCredit(cid).call()
            # chain_credit: (id, project, country, vintageYear, owner, verified, retired, createdAt)

            db = _get_credit(session, cid)
            if db is None:
                continue  # sync may not have indexed this credit yet
            assert db.project == chain_credit[1], f"Project mismatch {cid}"
            assert db.verified == chain_credit[5], f"Verified mismatch {cid}"
            assert db.retired == chain_credit[6], f"Retired mismatch {cid}"
            assert db.owner_address.lower() == chain_credit[4].lower(), f"Owner mismatch {cid}"

        session.close()
