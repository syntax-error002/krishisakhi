"""High-level farm intelligence and advisory endpoints."""

from fastapi import APIRouter, status
import logging

from app.models.schemas import (
    WeatherRequest,
    WeatherSummaryResponse,
    CropRotationRequest,
    CropRotationResponse,
    SchemeRecommendationRequest,
    SchemeRecommendationResponse,
    MentorRecommendationRequest,
    MentorRecommendationResponse,
    MarketMatchRequest,
    MarketMatchResponse,
    ChatMessageRequest,
    ChatMessageResponse,
)
from app.services import (
    WeatherService,
    RotationService,
    SchemeService,
    MentorService,
    MarketService,
    ChatService,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/intelligence", tags=["Farm Intelligence"])


@router.post(
    "/weather",
    response_model=WeatherSummaryResponse,
    status_code=status.HTTP_200_OK,
    summary="Weather snapshot with actionable advice",
)
async def get_weather_summary(request: WeatherRequest) -> WeatherSummaryResponse:
    """Return real-time weather data with intelligent farming advisory."""
    logger.info("Weather summary requested for location=%s", request.location)
    return await WeatherService.get_weather_summary(request)


@router.post(
    "/crop-rotation",
    response_model=CropRotationResponse,
    status_code=status.HTTP_200_OK,
    summary="AI-style crop rotation & soil health plan",
)
async def get_crop_rotation_plan(request: CropRotationRequest) -> CropRotationResponse:
    """Compute a 2‑season rotation plan and soil health narrative."""
    logger.info(
        "Crop rotation requested for location=%s, farmSize=%.2f",
        request.location,
        request.farmSize,
    )
    return RotationService.get_rotation_plan(request)


@router.post(
    "/schemes",
    response_model=SchemeRecommendationResponse,
    status_code=status.HTTP_200_OK,
    summary="Government scheme radar",
)
async def recommend_schemes(
    request: SchemeRecommendationRequest,
) -> SchemeRecommendationResponse:
    """Return a small set of targeted government schemes."""
    logger.info(
        "Scheme recommendations requested for location=%s, farmSize=%.2f",
        request.location,
        request.farmSize,
    )
    return SchemeService.recommend_schemes(request)


@router.post(
    "/mentors",
    response_model=MentorRecommendationResponse,
    status_code=status.HTTP_200_OK,
    summary="Nearby mentor recommendations",
)
async def recommend_mentors(
    request: MentorRecommendationRequest,
) -> MentorRecommendationResponse:
    """Return curated mentors for the mentorship screen."""
    logger.info(
        "Mentor recommendations requested for location=%s, crop=%s",
        request.location,
        request.mainCrop,
    )
    return MentorService.recommend_mentors(request)


@router.post(
    "/market",
    response_model=MarketMatchResponse,
    status_code=status.HTTP_200_OK,
    summary="Mandi prices and buyer matches",
)
async def get_market_matches(request: MarketMatchRequest) -> MarketMatchResponse:
    """Return mandi prices plus direct buyer listings."""
    logger.info(
        "Market matches requested for crop=%s at location=%s",
        request.crop,
        request.location,
    )
    return MarketService.get_market_matches(request)


@router.post(
    "/chat",
    response_model=ChatMessageResponse,
    status_code=status.HTTP_200_OK,
    summary="Single-turn farming chatbot",
)
async def ask_chatbot(request: ChatMessageRequest) -> ChatMessageResponse:
    """Lightweight Q&A endpoint backing the Krishi AI chat screen."""
    logger.info("Chatbot question received")
    return ChatService.answer(request)


