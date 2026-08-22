from pydantic import BaseModel, field_validator, model_validator
from typing import Optional
import re

ETH_ADDRESS_RE = re.compile(r"^0x[a-fA-F0-9]{40}$")

CURRENT_YEAR = 2026   # bump each year or derive dynamically


class CreateCreditRequest(BaseModel):
    project: str
    country: str
    vintage_year: int

    @field_validator("project")
    @classmethod
    def project_not_empty(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("project name is required")
        if len(v) < 5:
            raise ValueError("project name must be at least 5 characters")
        if len(v) > 120:
            raise ValueError("project name must be 120 characters or less")
        return v

    @field_validator("country")
    @classmethod
    def country_not_empty(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("country is required")
        if len(v) > 60:
            raise ValueError("country name must be 60 characters or less")
        return v

    @field_validator("vintage_year")
    @classmethod
    def vintage_year_valid(cls, v: int) -> int:
        if v < 1990 or v > CURRENT_YEAR:
            raise ValueError(
                f"vintage_year must be between 1990 and {CURRENT_YEAR}"
            )
        return v


class TransferCreditRequest(BaseModel):
    new_owner: str

    @field_validator("new_owner")
    @classmethod
    def valid_eth_address(cls, v: str) -> str:
        v = v.strip()
        if not ETH_ADDRESS_RE.match(v):
            raise ValueError(
                "new_owner must be a valid Ethereum address (0x + 40 hex chars)"
            )
        return v


class RetireCreditRequest(BaseModel):
    """
    Body is currently empty but typed so we can add a
    'reason' or 'beneficiary' field later without breaking callers.
    """
    pass