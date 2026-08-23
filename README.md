Endeavour

Climate token infrastructure for a transparent, auditable environmental asset registry.

Endeavour brings carbon credits, biodiversity pools, and green bonds into a single registry where ownership, lifecycle events, and environmental assets can be tracked through blockchain-backed records.

The future is not inherited. We borrow it from our children.

Live Demo · GitHub

The idea

Environmental assets are only useful at scale when people can trust the records behind them.

Endeavour addresses that infrastructure problem by combining an Ethereum smart contract with an indexed database and a web application. The blockchain provides an immutable record for critical asset events; the backend makes that state queryable; the frontend turns it into something people can actually use.

Traceability. Transparency. Accountability.

Architecture

flowchart LR
    U[User / Wallet] --> F[React + TypeScript Frontend]
    F -->|REST / HTTPS| B[FastAPI Backend]
    B --> S[Credit Services]
    B --> R[Repository Layer]
    B --> W[Web3 Client]
    R --> DB[(PostgreSQL)]
    W -->|RPC| C[CarbonRegistry / Ethereum Sepolia]
    C -->|Events| I[Blockchain Indexer]
    I -->|Upsert / Update| DB
    I -->|Track indexed block| DB

Data flow

User
  |
  v
Frontend
  |
  +-------------- REST ----------------> FastAPI
                                          |
                                          +--> PostgreSQL
                                          |
                                          +--> Web3
                                               |
                                               v
                                        CarbonRegistry
                                          (Sepolia)
                                               |
                                            Events
                                               |
                                               v
                                      Blockchain Indexer
                                               |
                                               v
                                          PostgreSQL

What the platform does

Registry

Browse environmental credits with project, country, vintage, ownership, verification, and retirement state.

Portfolio

Manage on-chain holdings and initiate supported lifecycle operations.

Transfer

Transfer ownership of a credit to another Ethereum address through the CarbonRegistry contract.

Retirement

Permanently retire a credit. The retirement is recorded on-chain and reflected in the indexed registry.

Analytics

Surface registry-level statistics across supported environmental asset pools.

Blockchain indexing

Listen for contract events and synchronize confirmed blockchain state into PostgreSQL so the application can query it efficiently.

Credit lifecycle

stateDiagram-v2
    [*] --> Created
    Created --> Verified
    Verified --> Active
    Active --> Transferred
    Transferred --> Active
    Active --> Retired
    Retired --> [*]

The database is an indexed representation of blockchain state, not a replacement for it.

Smart contract

The core contract is CarbonRegistry.

Network: Ethereum Sepolia

Contract address

0x6c6Cd9cF0e0214d787350089C8f5B8b93144A447

Core lifecycle functions:

retireCredit(uint256 id)
transferCredit(uint256 id, address newOwner)

Lifecycle events:

CreditCreated
CreditVerified
CreditTransferred
CreditRetired

Stack

Layer

Technology

Frontend

React, TypeScript, Vite, Tailwind CSS

API

FastAPI, Pydantic

Database

PostgreSQL, SQLAlchemy

Blockchain

Solidity, Ethereum Sepolia

Web3

Web3.py, viem

Contract tooling

Hardhat 3, Ignition

Deployment

Render

Repository structure

Endeavour/
├── contracts/
│   └── CarbonRegistry.sol
├── ignition/
│   └── modules/
├── test/
├── backend/
│   └── app/
│       ├── blockchain/
│       ├── models/
│       ├── repositories/
│       ├── routers/
│       ├── schemas/
│       └── services/
├── frontend/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── hooks/
│       └── api.ts
└── README.md

API

GET  /health
GET  /ready
GET  /config

GET  /credits
GET  /credits/{credit_id}
GET  /credits/stats

POST /transactions
GET  /transactions/{tx_hash}

POST /index/sync

FastAPI provides interactive API documentation at /docs.

Getting started

Clone

git clone https://github.com/rdsxdev/Endeavour.git
cd Endeavour

Backend

cd backend
python -m venv ../venv
source ../venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload

Configure the required RPC and database environment variables before starting the service.

Frontend

cd ../frontend
npm install
npm run dev

Production build:

npm run build

Contracts

cd ..
npm install
npx hardhat compile
npx hardhat test

Sepolia deployment requires a funded deployment account and configured deployment credentials.

Design decisions

Blockchain for ownership and lifecycle.
Transfers and retirement are represented by contract state and events.

PostgreSQL for querying.
The relational index makes filtering, pagination, statistics, and application reads practical.

Event-driven synchronization.
The indexer processes confirmed contract events and tracks the last indexed block.

Wallet-first interaction.
The frontend uses Ethereum wallet interaction without requiring users to surrender private keys.

Security

Never commit:

Private keys
RPC credentials
Database passwords
Production environment files

Use environment variables or the Hardhat keystore for deployment credentials.

Current scope

Endeavour currently focuses on a single environmental asset registry on Ethereum Sepolia, with carbon credits, biodiversity pools, and green-bond-oriented registry views.

The architecture is modular enough to support additional chains, asset classes, verification systems, and environmental data sources.

Roadmap

Multi-chain registry support

Stronger project verification workflows

Environmental data integrations

Institutional portfolio tooling

Retirement certificates

Cross-registry interoperability

Expanded biodiversity asset models

The question

If environmental assets are going to become part of the global financial system, shouldn't their ownership and impact be as transparent as the assets themselves?

That is the problem Endeavour is trying to solve.

License

MIT
