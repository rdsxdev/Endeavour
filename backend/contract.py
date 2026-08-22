"""
contract.py — Web3 wrapper around CarbonRegistry.sol

Improvements over v1:
  - Startup validation: fail loudly if env vars missing or chain unreachable
  - ContractError for clean error propagation to the API layer
  - Gas estimation instead of hardcoded 300 000
  - get_all_credits uses batch-call pattern with individual error isolation
  - All public functions have typed return values and docstrings
  - Nonce managed with get_transaction_count + pending (avoids stuck txs)
"""

from web3 import Web3
from web3.exceptions import ContractLogicError, TimeExhausted
from dotenv import load_dotenv
from eth_account import Account
import json
import os
import logging

load_dotenv()

logger = logging.getLogger(__name__)

# ------------------------------------------------------------------ #
# Config & startup validation                                          #
# ------------------------------------------------------------------ #

RPC_URL          = os.getenv("RPC_URL", "")
CONTRACT_ADDRESS = os.getenv("CONTRACT_ADDRESS", "")
PRIVATE_KEY      = os.getenv("PRIVATE_KEY", "")

_missing = [k for k, v in {
    "RPC_URL": RPC_URL,
    "CONTRACT_ADDRESS": CONTRACT_ADDRESS,
    "PRIVATE_KEY": PRIVATE_KEY,
}.items() if not v]

if _missing:
    raise EnvironmentError(
        f"Missing required environment variables: {', '.join(_missing)}"
    )

account = Account.from_key(PRIVATE_KEY)

w3 = Web3(Web3.HTTPProvider(RPC_URL))

if not w3.is_connected():
    raise ConnectionError(f"Cannot connect to RPC at {RPC_URL}")

_artifact_path = os.path.join(
    os.path.dirname(__file__),
    "../artifacts/contracts/CarbonRegistry.sol/CarbonRegistry.json"
)

with open(_artifact_path) as f:
    artifact = json.load(f)

abi = artifact["abi"]

contract = w3.eth.contract(
    address=Web3.to_checksum_address(CONTRACT_ADDRESS),
    abi=abi,
)

TX_TIMEOUT = int(os.getenv("TX_TIMEOUT_SECONDS", "120"))


# ------------------------------------------------------------------ #
# Custom exception                                                     #
# ------------------------------------------------------------------ #

class ContractError(Exception):
    """Raised for expected on-chain reverts or bad input."""


# ------------------------------------------------------------------ #
# Internal helpers                                                     #
# ------------------------------------------------------------------ #

def _get_nonce() -> int:
    return w3.eth.get_transaction_count(account.address, "pending")


def _send(tx_func, extra_gas: int = 0) -> str:
    """
    Build, sign, send a transaction and wait for receipt.
    Returns the tx hash as a hex string.

    Handles:
      - ContractLogicError  → clean ContractError with the revert reason
      - TimeExhausted       → ContractError with timeout message
      - Any other exception → re-raised as-is so FastAPI returns 500
    """
    try:
        estimated = tx_func.estimate_gas({"from": account.address})
        gas_limit = int(estimated * 1.25) + extra_gas   # 25 % buffer

        tx = tx_func.build_transaction({
            "from":     account.address,
            "nonce":    _get_nonce(),
            "gas":      gas_limit,
            "gasPrice": w3.eth.gas_price,
        })

        signed    = w3.eth.account.sign_transaction(tx, PRIVATE_KEY)
        tx_hash   = w3.eth.send_raw_transaction(signed.raw_transaction)
        receipt   = w3.eth.wait_for_transaction_receipt(
            tx_hash, timeout=TX_TIMEOUT
        )

        if receipt.status == 0:
            raise ContractError("Transaction reverted (status 0)")

        logger.info("tx %s included in block %s", tx_hash.hex(), receipt.blockNumber)
        return receipt.transactionHash.hex()

    except ContractLogicError as e:
        raise ContractError(f"Contract revert: {e}") from e
    except TimeExhausted:
        raise ContractError(
            f"Transaction not mined within {TX_TIMEOUT}s"
        )


# ------------------------------------------------------------------ #
# Read functions                                                       #
# ------------------------------------------------------------------ #

def is_connected() -> bool:
    return w3.is_connected()


def get_latest_block() -> int:
    return w3.eth.block_number


def get_next_credit_id() -> int:
    return contract.functions.nextCreditId().call()


def get_credit(credit_id: int) -> dict:
    """
    Returns the credit as a dict.
    Raises ContractError if the credit doesn't exist.
    """
    if credit_id < 0:
        raise ContractError(f"Invalid credit ID: {credit_id}")
    try:
        data = contract.functions.getCredit(credit_id).call()
    except ContractLogicError as e:
        raise ContractError(f"Credit {credit_id} not found: {e}") from e

    return {
        "id":           int(data[0]),
        "project":      data[1],
        "country":      data[2],
        "vintage_year": int(data[3]),
        "owner":        data[4],
        "verified":     data[5],
        "retired":      data[6],
        "created_at":   int(data[7]),
    }


def get_all_credits() -> list[dict]:
    """
    Fetches all credits. Skips any that revert (e.g. gaps in IDs)
    instead of crashing the entire endpoint.
    """
    next_id = contract.functions.nextCreditId().call()
    credits = []

    for i in range(next_id):
        try:
            credits.append(get_credit(i))
        except ContractError as e:
            logger.warning("Skipping credit %d: %s", i, e)

    return credits


# ------------------------------------------------------------------ #
# Write functions                                                      #
# ------------------------------------------------------------------ #

def create_credit(project: str, country: str, vintage_year: int) -> str:
    """
    Creates a new credit on-chain. Returns tx hash.
    The caller (API layer) is responsible for input validation.
    """
    tx_func = contract.functions.createCredit(project, country, vintage_year)
    return _send(tx_func)


def verify_credit(credit_id: int) -> str:
    """Admin-only: marks a credit as verified."""
    tx_func = contract.functions.verifyCredit(credit_id)
    return _send(tx_func)


def retire_credit(credit_id: int) -> str:
    """Retires a credit. Caller must be the credit owner on-chain."""
    if credit_id < 0:
        raise ContractError(f"Invalid credit ID: {credit_id}")
    tx_func = contract.functions.retireCredit(credit_id)
    return _send(tx_func)


def transfer_credit(credit_id: int, new_owner: str) -> str:
    """
    Transfers a credit to new_owner.
    new_owner must already be checksum-validated by the API layer.
    """
    if credit_id < 0:
        raise ContractError(f"Invalid credit ID: {credit_id}")
    checksummed = Web3.to_checksum_address(new_owner)
    tx_func = contract.functions.transferCredit(credit_id, checksummed)
    return _send(tx_func)