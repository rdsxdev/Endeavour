from pydantic import BaseModel


class CreateCreditRequest(BaseModel):
    project: str
    country: str
    vintage_year: int

class TransferCreditRequest(BaseModel):
    new_owner: str