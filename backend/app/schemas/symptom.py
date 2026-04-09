from datetime import datetime, time
from pydantic import BaseModel, ConfigDict


class SymptomEntryCreate(BaseModel):
    fatigue: bool = False
    cravings: bool = False
    bloating: bool = False
    mood_change: bool = False
    notes: str | None = None
    symptom_time: time | None = None


class SymptomEntryRead(BaseModel):
    id: int
    user_id: int
    fatigue: bool
    cravings: bool
    bloating: bool
    mood_change: bool
    notes: str | None = None
    symptom_time: time | None = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
