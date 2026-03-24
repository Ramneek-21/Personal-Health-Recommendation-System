from fastapi import APIRouter, Depends
from sqlalchemy import desc, select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.health import DailyLog, User
from app.schemas.dashboard import WeeklyInsights
from app.schemas.health import DailyLogCreate, DailyLogResponse
from app.services.recommendation_engine import summarize_logs


router = APIRouter(prefix="/logs", tags=["logs"])


@router.post("", response_model=DailyLogResponse)
def create_log(
    payload: DailyLogCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> DailyLogResponse:
    log = db.scalar(
        select(DailyLog).where(DailyLog.user_id == current_user.id, DailyLog.logged_at == payload.logged_at)
    )
    if log is None:
        log = DailyLog(user_id=current_user.id, **payload.model_dump())
        db.add(log)
    else:
        for field, value in payload.model_dump().items():
            setattr(log, field, value)
    db.commit()
    db.refresh(log)
    return DailyLogResponse.model_validate(log)


@router.get("", response_model=list[DailyLogResponse])
def list_logs(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> list[DailyLogResponse]:
    logs = db.scalars(
        select(DailyLog).where(DailyLog.user_id == current_user.id).order_by(desc(DailyLog.logged_at)).limit(30)
    ).all()
    return [DailyLogResponse.model_validate(log) for log in logs]


@router.get("/weekly", response_model=WeeklyInsights)
def weekly_insights(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> WeeklyInsights:
    logs = db.scalars(
        select(DailyLog).where(DailyLog.user_id == current_user.id).order_by(DailyLog.logged_at)
    ).all()
    return WeeklyInsights(**summarize_logs(logs))
