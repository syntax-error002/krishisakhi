"""Health check and status API routes."""
from fastapi import APIRouter
from app.models.schemas import HealthResponse
from app.config import get_settings

router = APIRouter(tags=["Health"])


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Health check endpoint",
    description="Check if the API is running and healthy"
)
async def health_check() -> HealthResponse:
    """
    Health check endpoint.
    
    Returns:
        HealthResponse with service status and version
    """
    settings = get_settings()
    return HealthResponse(
        status="healthy",
        version=settings.app_version
    )


@router.get(
    "/",
    response_model=dict,
    summary="Root endpoint",
    description="API root endpoint with basic information"
)
async def root() -> dict:
    """
    Root endpoint.
    
    Returns:
        Dictionary with API status and information
    """
    settings = get_settings()
    return {
        "status": "Krishi Mitra Intelligence Engine is Running 🚜",
        "version": settings.app_version,
        "docs": "/docs",
        "health": "/health"
    }

