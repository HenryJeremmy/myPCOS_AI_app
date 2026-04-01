from datetime import datetime
from pydantic import BaseModel, ConfigDict


class LifestyleEntryCreate(BaseModel):
    sleep_hours: float | None = None
    exercise_minutes: int | None = None
    water_litres: float | None = None
    stress_level: str | None = None
    mood: str | None = None
    activity_notes: str | None = None


class LifestyleEntryRead(BaseModel):
    id: int
    user_id: int
    sleep_hours: float | None = None
    exercise_minutes: int | None = None
    water_litres: float | None = None
    stress_level: str | None = None
    mood: str | None = None
    activity_notes: str | None = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)