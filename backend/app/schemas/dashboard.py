from datetime import date
from typing import Optional

from pydantic import BaseModel

from app.schemas.health import HabitItem, NotificationResponse, RecommendationResponse


class WeeklyInsights(BaseModel):
    avg_sleep_hours: float
    avg_water_intake_liters: float
    avg_activity_minutes: float
    weight_change_kg: float
    avg_stress_level: float


class DashboardSummary(BaseModel):
    full_name: str
    bmi: Optional[float]
    health_score: Optional[float]
    risk_level: Optional[str]
    streak_days: int
    latest_recommendation: Optional[RecommendationResponse]
    weekly_insights: WeeklyInsights
    checklist: list[HabitItem]
    notifications: list[NotificationResponse]


class TrendPoint(BaseModel):
    date: date
    value: float


class TrendsResponse(BaseModel):
    weight: list[TrendPoint]
    sleep: list[TrendPoint]
    activity: list[TrendPoint]
