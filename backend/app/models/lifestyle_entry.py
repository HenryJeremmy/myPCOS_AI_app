from datetime import datetime, timezone
from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String, Text, Time
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class LifestyleEntry(Base):
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user.id"), nullable=False, index=True)

    sleep_hours = Column(Float, nullable=True)
    exercise_minutes = Column(Integer, nullable=True)
    water_litres = Column(Float, nullable=True)
    stress_level = Column(String(20), nullable=True)
    mood = Column(String(50), nullable=True)
    activity_notes = Column(Text, nullable=True)
    lifestyle_time = Column(Time, nullable=True)

    created_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
        index=True,
    )

    user = relationship("User")
