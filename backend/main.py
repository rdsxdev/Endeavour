"""
main.py — FastAPI application for CarbonRegistry

Improvements over v1:
  - Duplicate app/middleware definitions removed
  - Duplicate imports removed
  - HTTPException raised on ContractError and validation errors (not 500s)
  - Input path param validation (credit_id >= 0)
  - /credits/next-id moved BEFORE /credits/{id} to avoid route conflict
  - verify endpoint added (admin action)
  - Global exception handler logs unexpected errors
  - Lifespan handler confirms chain connection at startup
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Path
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from contract import (
    ContractError,
    is_connected,
    get_latest_block,
    get_next_credit_id,
    get_credit,
    get_all_credits,
    create_credit,
    verify_credit,
    retire_credit,
    transfer_credit,
)
from models import CreateCreditRequest, TransferCreditRequest

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s — %(message)s",
)
logger = logging.getLogger(__name__)

ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]


# ------------------------------------------------------------------ #
# Lifespan                                                             #
# ------------------------------------------------------------------ #

@asynccontextmanager
async def lifespan(app: FastAPI):
    if not is_connected():
        logger.error("Blockchain node unreachable at startup — check RPC_URL")
    else:
        logger.info(
            "Connected to blockchain. Latest block: %d", get_latest_block()
        )
    yield


# ------------------------------------------------------------------ #
# App                                                                  #
# ------------------------------------------------------------------ #

app = FastAPI(
    title="Arbourex Carbon API",
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ------------------------------------------------------------------ #
# Global error handler                                                 #
# ------------------------------------------------------------------ #

@app.exception_handler(Exception)
async def unhandled_exception_handler(request, exc):
    logger.exception("Unhandled error on %s %s", request.method, request.url)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )


# ------------------------------------------------------------------ #
# Helpers                                                              #
# ------------------------------------------------------------------ #

def _validate_credit_id(credit_id: int) -> None:
    if credit_id < 0:
        raise HTTPException(status_code=422, detail="credit_id must be >= 0")


def _contract_error_to_http(e: ContractError) -> HTTPException:
    msg = str(e).lower()
    if "not found" in msg or "credit not found" in msg:
        return HTTPException(status_code=404, detail=str(e))
    if "not owner" in msg:
        return HTTPException(status_code=403, detail=str(e))
    if "already retired" in msg:
        return HTTPException(status_code=409, detail=str(e))
    if "not verified" in msg:
        return HTTPException(status_code=409, detail=str(e))
    if "paused" in msg:
        return HTTPException(status_code=503, detail="Contract is paused")
    return HTTPException(status_code=400, detail=str(e))


# ------------------------------------------------------------------ #
# Routes                                                               #
# ------------------------------------------------------------------ #

@app.get("/")
def root():
    return {"message": "Arbourex Carbon API", "version": "2.0.0"}


@app.get("/health")
def health():
    connected = is_connected()
    block = get_latest_block() if connected else None
    return {
        "blockchain_connected": connected,
        "latest_block": block,
        "status": "ok" if connected else "degraded",
    }


# NOTE: /credits/next-id MUST be registered before /credits/{credit_id}
# to prevent FastAPI routing "next-id" as a path parameter.
@app.get("/credits/next-id")
def next_id():
    return {"next_credit_id": get_next_credit_id()}


@app.get("/credits")
def list_credits():
    try:
        return get_all_credits()
    except ContractError as e:
        raise _contract_error_to_http(e)


@app.get("/credits/{credit_id}")
def get_credit_endpoint(
    credit_id: int = Path(..., ge=0, description="Credit ID (>= 0)")
):
    try:
        return get_credit(credit_id)
    except ContractError as e:
        raise _contract_error_to_http(e)


@app.post("/credits", status_code=201)
def create_credit_endpoint(body: CreateCreditRequest):
    try:
        tx_hash = create_credit(body.project, body.country, body.vintage_year)
        return {"status": "success", "tx_hash": tx_hash}
    except ContractError as e:
        raise _contract_error_to_http(e)


@app.post("/credits/{credit_id}/verify")
def verify_credit_endpoint(
    credit_id: int = Path(..., ge=0)
):
    try:
        tx_hash = verify_credit(credit_id)
        return {"status": "success", "tx_hash": tx_hash}
    except ContractError as e:
        raise _contract_error_to_http(e)


@app.post("/credits/{credit_id}/retire")
def retire_credit_endpoint(
    credit_id: int = Path(..., ge=0)
):
    try:
        tx_hash = retire_credit(credit_id)
        return {"status": "success", "tx_hash": tx_hash}
    except ContractError as e:
        raise _contract_error_to_http(e)


@app.post("/credits/{credit_id}/transfer")
def transfer_credit_endpoint(
    credit_id: int = Path(..., ge=0),
    body: TransferCreditRequest = ...,
):
    try:
        tx_hash = transfer_credit(credit_id, body.new_owner)
        return {"status": "success", "tx_hash": tx_hash}
    except ContractError as e:
        raise _contract_error_to_http(e)