from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.health import Recommendation, User
from app.schemas.health import RecommendationResponse
from app.services.health_service import ensure_latest_recommendation, generate_and_store_recommendation


router = APIRouter(prefix="/recommendations", tags=["recommendations"])


@router.post("/generate", response_model=RecommendationResponse)
def generate(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> RecommendationResponse:
    try:
        recommendation = generate_and_store_recommendation(db, current_user.id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    return RecommendationResponse.model_validate(recommendation)


@router.get("/latest", response_model=RecommendationResponse)
def latest(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> RecommendationResponse:
    recommendation = ensure_latest_recommendation(db, current_user.id)
    if recommendation is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recommendation not found")
    return RecommendationResponse.model_validate(recommendation)

