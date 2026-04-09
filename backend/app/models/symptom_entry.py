from datetime import datetime, timezone
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, Text, Time
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class SymptomEntry(Base):
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user.id"), nullable=False, index=True)

    fatigue = Column(Boolean, default=False, nullable=False)
    cravings = Column(Boolean, default=False, nullable=False)
    bloating = Column(Boolean, default=False, nullable=False)
    mood_change = Column(Boolean, default=False, nullable=False)

    notes = Column(Text, nullable=True)
    symptom_time = Column(Time, nullable=True)

    created_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
        index=True,
    )

    user = relationship("User")
