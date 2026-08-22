"""Run one indexing pass: python -m app.cli index"""
import argparse
import json

from app.config import get_settings
from app.database import SessionLocal
from app.blockchain.indexer import sync_once


def main() -> None:
    parser = argparse.ArgumentParser(description="Endeavour backend CLI")
    parser.add_argument("command", choices=["index"])
    args = parser.parse_args()
    if args.command == "index":
        settings = get_settings()
        if not settings.contract_address:
            raise SystemExit("CONTRACT_ADDRESS is not configured")
        with SessionLocal() as session:
            print(json.dumps(sync_once(session), indent=2))


if __name__ == "__main__":
    main()
