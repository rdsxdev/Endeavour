from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from contract import (
    is_connected,
    get_latest_block,
    get_next_credit_id,
    get_credit,
    create_credit,
    retire_credit,
    transfer_credit,
    get_all_credits
)

from models import (
    CreateCreditRequest,
    TransferCreditRequest
)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",

        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "message": "Carbon Market API"
    }


@app.get("/health")
def health():
    return {
        "blockchain_connected": is_connected(),
        "latest_block": get_latest_block()
    }

from contract import (
    is_connected,
    get_latest_block,
    get_next_credit_id,
    get_credit
)

@app.get("/credits/next-id")
def next_id():
    return {
        "next_credit_id": get_next_credit_id()
    }


@app.get("/credits/{credit_id}")
def credit(credit_id: int):
    data = get_credit(credit_id)

    return {
        "id": data[0],
        "project": data[1],
        "country": data[2],
        "vintage_year": data[3],
        "owner": data[4],
        "verified": data[5],
        "retired": data[6],
        "created_at": data[7]
    }

@app.post("/credits")
def create_credit_endpoint(
    credit: CreateCreditRequest
):
    tx_hash = create_credit(
        credit.project,
        credit.country,
        credit.vintage_year
    )

    return {
        "status": "success",
        "tx_hash": tx_hash
    }

@app.post("/credits/{credit_id}/retire")
def retire_credit_endpoint(
    credit_id: int
):
    tx_hash = retire_credit(
        credit_id
    )

    return {
        "status": "success",
        "tx_hash": tx_hash
    }

@app.post("/credits/{credit_id}/transfer")
def transfer_credit_endpoint(
    credit_id: int,
    data: TransferCreditRequest
):
    tx_hash = transfer_credit(
        credit_id,
        data.new_owner
    )

    return {
        "status": "success",
        "tx_hash": tx_hash
    }

@app.get("/credits")
def credits():
    return get_all_credits()