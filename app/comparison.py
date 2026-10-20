from pydantic import BaseModel

class ComparisonRequest(BaseModel):
    category: str
