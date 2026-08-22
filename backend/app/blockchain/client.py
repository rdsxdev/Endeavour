import json
from functools import lru_cache
from pathlib import Path

from web3 import Web3
from web3.contract import Contract
from web3.providers.rpc import HTTPProvider

from app.config import get_settings
from app.exceptions.errors import AppError, ErrorCode

ABI_PATH = Path(__file__).with_name("CarbonRegistry.json")


@lru_cache
def load_abi() -> list:
    if not ABI_PATH.exists():
        raise AppError(
            ErrorCode.CONTRACT_NOT_CONFIGURED,
            "Contract ABI is missing from the backend image.",
        )
    payload = json.loads(ABI_PATH.read_text())
    if isinstance(payload, dict) and "abi" in payload:
        return payload["abi"]
    if isinstance(payload, list):
        return payload
    raise AppError(ErrorCode.CONTRACT_NOT_CONFIGURED, "Contract ABI is malformed.")


def explorer_base_url(chain_id: int) -> str:
    if chain_id == 11155111:
        return "https://sepolia.etherscan.io"
    if chain_id == 1:
        return "https://etherscan.io"
    return ""


class BlockchainClient:
    def __init__(self) -> None:
        settings = get_settings()
        self.settings = settings
        self._w3: Web3 | None = None
        self._contract: Contract | None = None

    @property
    def configured(self) -> bool:
        return bool(self.settings.rpc_url and self.settings.contract_address)

    def web3(self) -> Web3:
        if not self.settings.rpc_url:
            raise AppError(ErrorCode.RPC_UNAVAILABLE)
        if self._w3 is None:
            provider = HTTPProvider(
                self.settings.rpc_url,
                request_kwargs={"timeout": self.settings.rpc_timeout_seconds},
            )
            self._w3 = Web3(provider)
        return self._w3

    def is_connected(self) -> bool:
        if not self.settings.rpc_url:
            return False
        try:
            return bool(self.web3().is_connected())
        except Exception:
            return False

    def latest_block(self) -> int | None:
        if not self.is_connected():
            return None
        try:
            return int(self.web3().eth.block_number)
        except Exception:
            return None

    def contract(self) -> Contract:
        if not self.settings.contract_address:
            raise AppError(ErrorCode.CONTRACT_NOT_CONFIGURED)
        if self._contract is None:
            self._contract = self.web3().eth.contract(
                address=Web3.to_checksum_address(self.settings.contract_address),
                abi=load_abi(),
            )
        return self._contract

    def get_receipt(self, tx_hash: str):
        try:
            return self.web3().eth.get_transaction_receipt(tx_hash)
        except Exception as exc:
            raise AppError(ErrorCode.RPC_UNAVAILABLE) from exc


blockchain = BlockchainClient()
