from web3 import Web3
from dotenv import load_dotenv
import json
import os
from eth_account import Account

load_dotenv()

RPC_URL = os.getenv("RPC_URL")
CONTRACT_ADDRESS = os.getenv("CONTRACT_ADDRESS")
PRIVATE_KEY = os.getenv("PRIVATE_KEY")

account = Account.from_key(PRIVATE_KEY)

w3 = Web3(Web3.HTTPProvider(RPC_URL))

with open("../artifacts/contracts/CarbonRegistry.sol/CarbonRegistry.json") as f:
    artifact = json.load(f)

abi = artifact["abi"]

contract = w3.eth.contract(
    address=Web3.to_checksum_address(CONTRACT_ADDRESS),
    abi=abi
)


def is_connected():
    return w3.is_connected()


def get_latest_block():
    return w3.eth.block_number


def get_next_credit_id():
    return contract.functions.nextCreditId().call()


def get_credit(credit_id):
    return contract.functions.getCredit(credit_id).call()

def create_credit(project, country, vintage_year):
    nonce = w3.eth.get_transaction_count(
        account.address
    )

    tx = contract.functions.createCredit(
        project,
        country,
        vintage_year
    ).build_transaction(
        {
            "from": account.address,
            "nonce": nonce,
            "gas": 300000,
            "gasPrice": w3.eth.gas_price
        }
    )

    signed_tx = w3.eth.account.sign_transaction(
        tx,
        PRIVATE_KEY
    )

    tx_hash = w3.eth.send_raw_transaction(
        signed_tx.raw_transaction
    )

    receipt = w3.eth.wait_for_transaction_receipt(
        tx_hash
    )

    return receipt.transactionHash.hex()

def retire_credit(credit_id):
    nonce = w3.eth.get_transaction_count(
        account.address
    )

    tx = contract.functions.retireCredit(
        credit_id
    ).build_transaction(
        {
            "from": account.address,
            "nonce": nonce,
            "gas": 300000,
            "gasPrice": w3.eth.gas_price
        }
    )

    signed_tx = w3.eth.account.sign_transaction(
        tx,
        PRIVATE_KEY
    )

    tx_hash = w3.eth.send_raw_transaction(
        signed_tx.raw_transaction
    )

    receipt = w3.eth.wait_for_transaction_receipt(
        tx_hash
    )

    return receipt.transactionHash.hex()

def transfer_credit(
    credit_id,
    new_owner
):
    nonce = w3.eth.get_transaction_count(
        account.address
    )

    tx = contract.functions.transferCredit(
        credit_id,
        Web3.to_checksum_address(new_owner)
    ).build_transaction(
        {
            "from": account.address,
            "nonce": nonce,
            "gas": 300000,
            "gasPrice": w3.eth.gas_price
        }
    )

    signed_tx = w3.eth.account.sign_transaction(
        tx,
        PRIVATE_KEY
    )

    tx_hash = w3.eth.send_raw_transaction(
        signed_tx.raw_transaction
    )

    receipt = w3.eth.wait_for_transaction_receipt(
        tx_hash
    )

    return receipt.transactionHash.hex()

def get_all_credits():
    next_id = contract.functions.nextCreditId().call()

    credits = []

    for i in range(next_id):
        credit = contract.functions.getCredit(i).call()

        credits.append({
            "id": int(credit[0]),
            "project": credit[1],
            "country": credit[2],
            "vintage_year": int(credit[3]),
            "owner": credit[4],
            "verified": credit[5],
            "retired": credit[6],
            "created_at": int(credit[7])
        })

    return credits