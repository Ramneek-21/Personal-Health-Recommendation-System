from datetime import date, datetime, timezone
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, field_serializer


class HealthProfileBase(BaseModel):
    age: int = Field(ge=13, le=120)
    gender: str
    height_cm: float = Field(gt=50, le=250)
    weight_kg: float = Field(gt=20, le=400)
    medical_conditions: list[str] = Field(default_factory=list)
    diet_type: str
    activity_level: str
    sleep_hours: float = Field(ge=0, le=24)
    water_intake_liters: float = Field(ge=0, le=10)
    stress_level: int = Field(ge=1, le=10)
    goal: str


class HealthProfileUpsert(HealthProfileBase):
    pass


class HealthProfileResponse(HealthProfileBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    bmi: float
    updated_at: datetime


class DailyLogCreate(BaseModel):
    logged_at: date
    weight_kg: Optional[float] = Field(default=None, gt=20, le=400)
    sleep_hours: Optional[float] = Field(default=None, ge=0, le=24)
    water_intake_liters: Optional[float] = Field(default=None, ge=0, le=10)
    activity_minutes: Optional[int] = Field(default=None, ge=0, le=1440)
    stress_level: Optional[int] = Field(default=None, ge=1, le=10)
    steps: Optional[int] = Field(default=None, ge=0, le=100000)
    notes: Optional[str] = Field(default=None, max_length=500)


class DailyLogResponse(DailyLogCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime


class RecommendationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    week_start: date
    health_score: float
    risk_level: str
    exercise_plan: list[str]
    diet_suggestions: list[str]
    sleep_guidance: list[str]
    lifestyle_guidance: list[str]
    risk_warnings: list[str]
    daily_checklist: list[str]
    summary: str
    created_at: datetime


class NotificationCreate(BaseModel):
    title: str = Field(min_length=2, max_length=120)
    message: str = Field(min_length=4, max_length=500)
    type: str = Field(default="reminder", max_length=32)
    scheduled_for: Optional[datetime] = None


class NotificationResponse(NotificationCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int
    is_read: bool
    created_at: datetime

    @field_serializer("scheduled_for", "created_at", when_used="json")
    def serialize_datetime(self, value: Optional[datetime]) -> Optional[str]:
        if value is None:
            return None
        if value.tzinfo is None:
            value = value.replace(tzinfo=timezone.utc)
        return value.isoformat()


class HabitCheckRequest(BaseModel):
    habit_key: str = Field(min_length=2, max_length=128)
    label: str = Field(min_length=2, max_length=255)
    completed: bool
    date: date


class HabitItem(BaseModel):
    habit_key: str
    label: str
    completed: bool


class HabitSummary(BaseModel):
    streak_days: int
    items: list[HabitItem]
