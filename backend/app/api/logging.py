from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends, status

from app.api.auth import get_db, get_current_user
from app.services.metabolic_classifier import classify_meal
from app.models.user import User
from app.models.meal_entry import MealEntry
from app.models.symptom_entry import SymptomEntry
from app.models.lifestyle_entry import LifestyleEntry
from app.schemas.meal import MealEntryCreate, MealEntryRead
from app.schemas.symptom import SymptomEntryCreate, SymptomEntryRead
from app.schemas.lifestyle import LifestyleEntryCreate, LifestyleEntryRead

router = APIRouter(prefix="/logs", tags=["logging"])


@router.post("/meals", response_model=MealEntryRead, status_code=status.HTTP_201_CREATED)
def create_meal_entry(
    payload: MealEntryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    metabolic_classification = classify_meal(payload.foods_text)

    entry = MealEntry(
        user_id=current_user.id,
        meal_type=payload.meal_type,
        foods_text=payload.foods_text,
        image_url=payload.image_url,
        notes=payload.notes,
        meal_time=payload.meal_time,
        glycaemic_band=metabolic_classification["glycaemic_band"],
        metabolic_summary=metabolic_classification["metabolic_summary"],
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@router.post("/symptoms", response_model=SymptomEntryRead, status_code=status.HTTP_201_CREATED)
def create_symptom_entry(
    payload: SymptomEntryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    entry = SymptomEntry(
        user_id=current_user.id,
        fatigue=payload.fatigue,
        cravings=payload.cravings,
        bloating=payload.bloating,
        mood_change=payload.mood_change,
        notes=payload.notes,
        symptom_time=payload.symptom_time,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@router.post("/lifestyle", response_model=LifestyleEntryRead, status_code=status.HTTP_201_CREATED)
def create_lifestyle_entry(
    payload: LifestyleEntryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    entry = LifestyleEntry(
        user_id=current_user.id,
        sleep_hours=payload.sleep_hours,
        exercise_minutes=payload.exercise_minutes,
        water_litres=payload.water_litres,
        stress_level=payload.stress_level,
        mood=payload.mood,
        activity_notes=payload.activity_notes,
        lifestyle_time=payload.lifestyle_time,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry

@router.get("/meals", response_model=list[MealEntryRead])
def list_meal_entries(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return (
        db.query(MealEntry)
        .filter(MealEntry.user_id == current_user.id)
        .order_by(MealEntry.created_at.desc())
        .all()
    )


@router.get("/symptoms", response_model=list[SymptomEntryRead])
def list_symptom_entries(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return (
        db.query(SymptomEntry)
        .filter(SymptomEntry.user_id == current_user.id)
        .order_by(SymptomEntry.created_at.desc())
        .all()
    )


@router.get("/lifestyle", response_model=list[LifestyleEntryRead])
def list_lifestyle_entries(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return (
        db.query(LifestyleEntry)
        .filter(LifestyleEntry.user_id == current_user.id)
        .order_by(LifestyleEntry.created_at.desc())
        .all()
    )
