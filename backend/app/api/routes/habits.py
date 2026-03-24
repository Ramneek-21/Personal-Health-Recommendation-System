from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.health import HabitCheck, User
from app.schemas.health import HabitCheckRequest, HabitItem, HabitSummary
from app.services.health_service import build_habit_items, ensure_latest_recommendation, get_streak_days


router = APIRouter(prefix="/habits", tags=["habits"])


@router.get("", response_model=HabitSummary)
def list_habits(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> HabitSummary:
    recommendation = ensure_latest_recommendation(db, current_user.id)
    habit_checks = db.scalars(select(HabitCheck).where(HabitCheck.user_id == current_user.id)).all()
    items = [HabitItem(**item) for item in build_habit_items(recommendation, habit_checks)]
    return HabitSummary(streak_days=get_streak_days(habit_checks), items=items)


@router.post("/check", response_model=HabitSummary)
def check_habit(
    payload: HabitCheckRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> HabitSummary:
    habit = db.scalar(
        select(HabitCheck).where(
            HabitCheck.user_id == current_user.id,
            HabitCheck.date == payload.date,
            HabitCheck.habit_key == payload.habit_key,
        )
    )
    if habit is None:
        habit = HabitCheck(user_id=current_user.id, **payload.model_dump())
        db.add(habit)
    else:
        habit.label = payload.label
        habit.completed = payload.completed
    db.commit()

    recommendation = ensure_latest_recommendation(db, current_user.id)
    habit_checks = db.scalars(select(HabitCheck).where(HabitCheck.user_id == current_user.id)).all()
    items = [HabitItem(**item) for item in build_habit_items(recommendation, habit_checks)]
    return HabitSummary(streak_days=get_streak_days(habit_checks), items=items)

