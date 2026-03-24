from __future__ import annotations

import re
from datetime import date, timedelta
from typing import Optional

from sqlalchemy import desc, select
from sqlalchemy.orm import Session

from app.models.health import DailyLog, HabitCheck, HealthProfile, Notification, Recommendation
from app.services.recommendation_engine import DEFAULT_CHECKLIST, generate_recommendation


def _streak_days(habit_checks: list[HabitCheck], today: Optional[date] = None) -> int:
    if not habit_checks:
        return 0
    completed_days = {item.date for item in habit_checks if item.completed}
    if not completed_days:
        return 0
    cursor = today or date.today()
    streak = 0
    while cursor in completed_days:
        streak += 1
        cursor -= timedelta(days=1)
    return streak


def generate_and_store_recommendation(db: Session, user_id: int) -> Recommendation:
    profile = db.scalar(select(HealthProfile).where(HealthProfile.user_id == user_id))
    if profile is None:
        raise ValueError("Profile is required")

    logs = db.scalars(select(DailyLog).where(DailyLog.user_id == user_id).order_by(DailyLog.logged_at)).all()
    habits = db.scalars(select(HabitCheck).where(HabitCheck.user_id == user_id)).all()
    payload = generate_recommendation(profile, logs, habits)

    recommendation = Recommendation(
        user_id=user_id,
        week_start=payload["week_start"],
        health_score=payload["health_score"],
        risk_level=payload["risk_level"],
        exercise_plan=payload["exercise_plan"],
        diet_suggestions=payload["diet_suggestions"],
        sleep_guidance=payload["sleep_guidance"],
        lifestyle_guidance=payload["lifestyle_guidance"],
        risk_warnings=payload["risk_warnings"],
        daily_checklist=payload["daily_checklist"],
        summary=payload["summary"],
    )
    db.add(recommendation)

    if recommendation.risk_level in {"moderate", "high"}:
        db.add(
            Notification(
                user_id=user_id,
                title="Weekly health alert",
                message=" ".join(recommendation.risk_warnings[:2]),
                type="health_alert",
            )
        )

    db.commit()
    db.refresh(recommendation)
    return recommendation


def get_latest_recommendation(db: Session, user_id: int) -> Optional[Recommendation]:
    return db.scalar(
        select(Recommendation).where(Recommendation.user_id == user_id).order_by(desc(Recommendation.created_at))
    )


def ensure_latest_recommendation(db: Session, user_id: int) -> Optional[Recommendation]:
    recommendation = get_latest_recommendation(db, user_id)
    if recommendation is not None:
        return recommendation
    profile = db.scalar(select(HealthProfile).where(HealthProfile.user_id == user_id))
    if profile is None:
        return None
    return generate_and_store_recommendation(db, user_id)


def build_habit_items(
    recommendation: Optional[Recommendation], habit_checks: list[HabitCheck], target_date: Optional[date] = None
) -> list[dict[str, object]]:
    current_date = target_date or date.today()
    completed_map = {
        item.habit_key: item.completed for item in habit_checks if item.date == current_date
    }
    checklist = recommendation.daily_checklist if recommendation else DEFAULT_CHECKLIST
    items: list[dict[str, object]] = []
    for label in checklist:
        habit_key = re.sub(r"[^a-z0-9]+", "-", label.lower()).strip("-")
        items.append({"habit_key": habit_key, "label": label, "completed": completed_map.get(habit_key, False)})
    return items


def get_streak_days(habit_checks: list[HabitCheck]) -> int:
    return _streak_days(habit_checks)
