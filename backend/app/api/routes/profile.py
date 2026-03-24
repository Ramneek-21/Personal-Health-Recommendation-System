from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.health import HealthProfile, User
from app.schemas.health import HealthProfileResponse, HealthProfileUpsert
from app.services.recommendation_engine import calculate_bmi


router = APIRouter(prefix="/profile", tags=["profile"])


@router.get("", response_model=HealthProfileResponse)
def get_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> HealthProfileResponse:
    profile = db.scalar(select(HealthProfile).where(HealthProfile.user_id == current_user.id))
    if profile is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")
    return HealthProfileResponse.model_validate(profile)


@router.put("", response_model=HealthProfileResponse)
def upsert_profile(
    payload: HealthProfileUpsert,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> HealthProfileResponse:
    profile = db.scalar(select(HealthProfile).where(HealthProfile.user_id == current_user.id))
    profile_data = payload.model_dump()
    profile_data["bmi"] = calculate_bmi(payload.height_cm, payload.weight_kg)

    if profile is None:
        profile = HealthProfile(user_id=current_user.id, **profile_data)
        db.add(profile)
    else:
        for field, value in profile_data.items():
            setattr(profile, field, value)

    db.commit()
    db.refresh(profile)
    return HealthProfileResponse.model_validate(profile)

