from datetime import datetime, timezone
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text, Time
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class MealEntry(Base):
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user.id"), nullable=False, index=True)

    meal_type = Column(String(50), nullable=False)
    foods_text = Column(Text, nullable=False)
    image_url = Column(String(255), nullable=True)
    notes = Column(Text, nullable=True)
    meal_time = Column(Time, nullable=True)
    glycaemic_band = Column(String(20), nullable=True)
    metabolic_summary = Column(Text, nullable=True)

    created_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
        index=True,
    )

    user = relationship("User")
