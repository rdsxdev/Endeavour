from enum import StrEnum


class ErrorCode(StrEnum):
    VALIDATION_ERROR = "VALIDATION_ERROR"
    WALLET_NOT_CONNECTED = "WALLET_NOT_CONNECTED"
    WRONG_NETWORK = "WRONG_NETWORK"
    CREDIT_NOT_FOUND = "CREDIT_NOT_FOUND"
    TRANSACTION_NOT_FOUND = "TRANSACTION_NOT_FOUND"
    NOT_OWNER = "NOT_OWNER"
    CREDIT_ALREADY_RETIRED = "CREDIT_ALREADY_RETIRED"
    CREDIT_NOT_VERIFIED = "CREDIT_NOT_VERIFIED"
    INVALID_ADDRESS = "INVALID_ADDRESS"
    DUPLICATE_REQUEST = "DUPLICATE_REQUEST"
    RATE_LIMITED = "RATE_LIMITED"
    DATABASE_UNAVAILABLE = "DATABASE_UNAVAILABLE"
    RPC_UNAVAILABLE = "RPC_UNAVAILABLE"
    BLOCKCHAIN_TRANSACTION_FAILED = "BLOCKCHAIN_TRANSACTION_FAILED"
    TRANSACTION_PENDING = "TRANSACTION_PENDING"
    CONTRACT_NOT_CONFIGURED = "CONTRACT_NOT_CONFIGURED"
    BACKEND_UNAVAILABLE = "BACKEND_UNAVAILABLE"
    TIMEOUT = "TIMEOUT"
    INTERNAL_ERROR = "INTERNAL_ERROR"


STATUS_FOR_CODE: dict[ErrorCode, int] = {
    ErrorCode.VALIDATION_ERROR: 422,
    ErrorCode.WALLET_NOT_CONNECTED: 401,
    ErrorCode.WRONG_NETWORK: 409,
    ErrorCode.CREDIT_NOT_FOUND: 404,
    ErrorCode.TRANSACTION_NOT_FOUND: 404,
    ErrorCode.NOT_OWNER: 403,
    ErrorCode.CREDIT_ALREADY_RETIRED: 409,
    ErrorCode.CREDIT_NOT_VERIFIED: 409,
    ErrorCode.INVALID_ADDRESS: 422,
    ErrorCode.DUPLICATE_REQUEST: 409,
    ErrorCode.RATE_LIMITED: 429,
    ErrorCode.DATABASE_UNAVAILABLE: 503,
    ErrorCode.RPC_UNAVAILABLE: 503,
    ErrorCode.BLOCKCHAIN_TRANSACTION_FAILED: 400,
    ErrorCode.TRANSACTION_PENDING: 202,
    ErrorCode.CONTRACT_NOT_CONFIGURED: 503,
    ErrorCode.BACKEND_UNAVAILABLE: 503,
    ErrorCode.TIMEOUT: 504,
    ErrorCode.INTERNAL_ERROR: 500,
}


PUBLIC_MESSAGE: dict[ErrorCode, str] = {
    ErrorCode.VALIDATION_ERROR: "The request could not be processed because some fields are invalid.",
    ErrorCode.CREDIT_NOT_FOUND: "That carbon credit does not exist in the registry.",
    ErrorCode.TRANSACTION_NOT_FOUND: "That transaction was not found.",
    ErrorCode.NOT_OWNER: "You can't manage this credit because the connected wallet isn't its owner.",
    ErrorCode.CREDIT_ALREADY_RETIRED: "This credit has already been retired. The action cannot be repeated.",
    ErrorCode.CREDIT_NOT_VERIFIED: "This credit must be verified before it can be retired.",
    ErrorCode.INVALID_ADDRESS: "The recipient wallet address is not a valid Ethereum address.",
    ErrorCode.DUPLICATE_REQUEST: "This request was already submitted. No additional changes were made.",
    ErrorCode.RATE_LIMITED: "Too many requests. Please wait a moment and try again.",
    ErrorCode.DATABASE_UNAVAILABLE: "Endeavour's database is temporarily unavailable. No changes were made.",
    ErrorCode.RPC_UNAVAILABLE: "The blockchain network is temporarily unavailable. Please try again in a moment.",
    ErrorCode.BLOCKCHAIN_TRANSACTION_FAILED: "The blockchain rejected this transaction. No changes were made.",
    ErrorCode.TRANSACTION_PENDING: "The transaction was submitted and is still waiting for confirmation.",
    ErrorCode.CONTRACT_NOT_CONFIGURED: "The registry contract is not configured on this server.",
    ErrorCode.BACKEND_UNAVAILABLE: "We couldn't reach Endeavour's server. Your transaction was not submitted.",
    ErrorCode.TIMEOUT: "The request timed out before it could be confirmed. Check your wallet activity before retrying.",
    ErrorCode.INTERNAL_ERROR: "An unexpected error occurred. No changes were made.",
}


class AppError(Exception):
    def __init__(
        self,
        code: ErrorCode,
        message: str | None = None,
        status_code: int | None = None,
        details: dict | None = None,
    ) -> None:
        self.code = code
        self.message = message or PUBLIC_MESSAGE[code]
        self.status_code = status_code or STATUS_FOR_CODE[code]
        self.details = details or {}
        super().__init__(self.message)
