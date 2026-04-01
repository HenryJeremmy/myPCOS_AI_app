from datetime import datetime
from pydantic import BaseModel, ConfigDict


class MealEntryCreate(BaseModel):
    meal_type: str
    foods_text: str
    image_url: str | None = None
    notes: str | None = None


class MealEntryRead(BaseModel):
    id: int
    user_id: int
    meal_type: str
    foods_text: str
    image_url: str | None = None
    notes: str | None = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)