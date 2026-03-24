from fastapi import APIRouter

from app.api.routes import auth, dashboard, habits, logs, notifications, profile, recommendations


api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(profile.router)
api_router.include_router(logs.router)
api_router.include_router(recommendations.router)
api_router.include_router(dashboard.router)
api_router.include_router(habits.router)
api_router.include_router(notifications.router)

