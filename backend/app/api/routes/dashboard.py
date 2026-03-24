from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.health import DailyLog, HabitCheck, HealthProfile, Notification, User
from app.schemas.dashboard import DashboardSummary, TrendPoint, TrendsResponse, WeeklyInsights
from app.schemas.health import HabitItem, NotificationResponse, RecommendationResponse
from app.services.health_service import build_habit_items, ensure_latest_recommendation, get_streak_days
from app.services.recommendation_engine import summarize_logs


router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/summary", response_model=DashboardSummary)
def summary(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> DashboardSummary:
    profile = db.scalar(select(HealthProfile).where(HealthProfile.user_id == current_user.id))
    logs = db.scalars(select(DailyLog).where(DailyLog.user_id == current_user.id).order_by(DailyLog.logged_at)).all()
    habit_checks = db.scalars(select(HabitCheck).where(HabitCheck.user_id == current_user.id)).all()
    recommendation = ensure_latest_recommendation(db, current_user.id)
    notifications = db.scalars(
        select(Notification).where(Notification.user_id == current_user.id).order_by(Notification.created_at.desc()).limit(6)
    ).all()

    return DashboardSummary(
        full_name=current_user.full_name,
        bmi=profile.bmi if profile else None,
        health_score=recommendation.health_score if recommendation else None,
        risk_level=recommendation.risk_level if recommendation else None,
        streak_days=get_streak_days(habit_checks),
        latest_recommendation=RecommendationResponse.model_validate(recommendation) if recommendation else None,
        weekly_insights=WeeklyInsights(**summarize_logs(logs)),
        checklist=[HabitItem(**item) for item in build_habit_items(recommendation, habit_checks)],
        notifications=[NotificationResponse.model_validate(item) for item in notifications],
    )


@router.get("/trends", response_model=TrendsResponse)
def trends(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> TrendsResponse:
    logs = db.scalars(
        select(DailyLog).where(DailyLog.user_id == current_user.id).order_by(DailyLog.logged_at)
    ).all()

    def to_points(field: str) -> list[TrendPoint]:
        points: list[TrendPoint] = []
        for log in logs:
            value = getattr(log, field)
            if value is not None:
                points.append(TrendPoint(date=log.logged_at, value=float(value)))
        return points

    return TrendsResponse(
        weight=to_points("weight_kg"),
        sleep=to_points("sleep_hours"),
        activity=to_points("activity_minutes"),
    )
