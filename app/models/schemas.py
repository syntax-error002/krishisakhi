"""Pydantic schemas for API requests and responses."""
from datetime import datetime, timezone
from typing import List, Literal, Optional

from pydantic import BaseModel, Field, field_validator


# ---------------------------------------------------------------------------
# Core & shared models
# ---------------------------------------------------------------------------

class SimulationRequest(BaseModel):
    """Request model for climate simulation."""

    landSize: float = Field(
        gt=0,
        le=10000,
        description="Land size in acres",
        examples=[5.0],
    )
    currentCrop: str = Field(
        min_length=1,
        max_length=100,
        description="Current crop name",
        examples=["wheat"],
    )
    scenario: str = Field(
        min_length=1,
        max_length=200,
        description="Climate scenario",
        examples=["-30% Rainfall (Drought)"],
    )

    @field_validator("currentCrop")
    @classmethod
    def validate_crop(cls, v: str) -> str:
        """Validate and normalize crop name."""
        if not v or not v.strip():
            raise ValueError("Crop name cannot be empty")
        return v.strip()

    @field_validator("scenario")
    @classmethod
    def validate_scenario(cls, v: str) -> str:
        """Validate scenario."""
        valid_scenarios = [
            "-30% Rainfall (Drought)",
            "+40% Rainfall (Flood Risk)",
        ]
        if v not in valid_scenarios:
            raise ValueError(
                f"Invalid scenario. Must be one of: {', '.join(valid_scenarios)}"
            )
        return v


class AlternativeCrop(BaseModel):
    """Model for alternative crop recommendations."""

    name: str = Field(description="Crop name", examples=["Pearl Millet (Bajra)"])
    profitMargin: float = Field(
        description="Expected profit margin in INR",
        examples=[35000.0],
    )
    resistance: str = Field(
        description="Climate resistance level",
        examples=["High Drought Resistance"],
    )
    reason: str = Field(
        description="Reason for recommendation",
        examples=["Requires 50% less water than Wheat"],
    )


class SimulationResponse(BaseModel):
    """Response model for climate simulation."""

    originalExpectedIncome: float = Field(
        description="Original expected income in INR",
        examples=[187500.0],
    )
    revisedYieldPercent: float = Field(
        ge=0,
        le=100,
        description="Revised yield percentage",
        examples=[55.0],
    )
    revisedIncome: float = Field(
        description="Revised income after climate impact in INR",
        examples=[103125.0],
    )
    alternativeCrops: List[AlternativeCrop] = Field(
        description="List of recommended alternative crops",
    )


class HealthResponse(BaseModel):
    """Health check response model."""

    status: str = Field(description="Service status", examples=["healthy"])
    version: str = Field(description="API version", examples=["1.0.0"])
    timestamp: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="Current server timestamp",
    )


class ErrorResponse(BaseModel):
    """Error response model."""

    error: str = Field(description="Error message")
    detail: str | None = Field(
        default=None,
        description="Detailed error information",
    )
    timestamp: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="Error timestamp",
    )


# ---------------------------------------------------------------------------
# Weather & farm intelligence
# ---------------------------------------------------------------------------

class WeatherRequest(BaseModel):
    """Request weather insights for a farmer."""

    location: str = Field(
        min_length=2,
        max_length=120,
        description="District / village name",
        examples=["Pune, MH"],
    )
    farmSize: Optional[float] = Field(
        default=None,
        gt=0,
        le=10000,
        description="Optional farm size in acres to contextualize advice",
    )
    mainCrop: Optional[str] = Field(
        default=None,
        description="Primary crop currently grown",
        examples=["soybean"],
    )


class DailyForecast(BaseModel):
    """Single-day forecast for the next few days."""

    day: str = Field(description="Human friendly day label", examples=["Tomorrow"])
    minTemp: float = Field(description="Minimum temperature (°C)")
    maxTemp: float = Field(description="Maximum temperature (°C)")
    rainChancePercent: int = Field(
        ge=0,
        le=100,
        description="Probability of rain (%)",
    )
    advisory: str = Field(
        description="Short actionable guidance for that day",
    )


class WeatherSummaryResponse(BaseModel):
    """High level weather plus actionable advice."""

    location: str
    temperature: float = Field(description="Current temperature in °C")
    condition: str = Field(
        description="Short label of current condition",
        examples=["Sunny with light clouds"],
    )
    humidityPercent: int = Field(ge=0, le=100)
    rainChancePercent: int = Field(ge=0, le=100)
    recommendation: str = Field(
        description="One key recommendation tailored to crop/farm",
    )
    next3Days: List[DailyForecast] = Field(
        description="Compact three-day forecast with advisories",
    )


# ---------------------------------------------------------------------------
# Crop rotation & soil health
# ---------------------------------------------------------------------------

class SeasonHistory(BaseModel):
    """What was grown in each of the last seasons."""

    seasonName: str = Field(
        description="Season label",
        examples=["Kharif 2024"],
    )
    crop: str = Field(
        min_length=1,
        max_length=100,
        description="Crop grown in that season",
    )


class CropRotationRequest(BaseModel):
    """Request optimized rotation for the next 2–3 seasons."""

    location: str = Field(
        description="Farmer location for contextual advice",
        examples=["Pune, MH"],
    )
    farmSize: float = Field(
        gt=0,
        le=10000,
        description="Total farm size in acres",
    )
    recentSeasons: List[SeasonHistory] = Field(
        min_length=1,
        max_length=5,
        description="Last seasons and crops grown",
    )
    soilConcern: Optional[str] = Field(
        default=None,
        description="Optional dominant soil concern (e.g. 'low nitrogen')",
    )


class RotationPlanItem(BaseModel):
    """Recommended crop for a future season."""

    seasonName: str
    crop: str
    reason: str
    expectedProfitChangePercent: float = Field(
        description="Expected profit change vs current pattern",
        examples=[12.5],
    )
    soilImpact: str = Field(
        description="How this crop affects soil health",
    )


class CropRotationResponse(BaseModel):
    """Response containing soil analysis and multi-season plan."""

    soilSummary: str = Field(
        description="Narrative summary of soil health and risk",
    )
    nitrogenScore: int = Field(ge=0, le=100)
    phosphorusScore: int = Field(ge=0, le=100)
    diseasePressureScore: int = Field(ge=0, le=100)
    rotationPlan: List[RotationPlanItem]


# ---------------------------------------------------------------------------
# Government schemes & benefits
# ---------------------------------------------------------------------------

class SchemeRecommendationRequest(BaseModel):
    """Profile-based scheme recommendation request."""

    location: str = Field(
        description="District / state",
        examples=["Pune, MH"],
    )
    farmSize: float = Field(
        gt=0,
        le=10000,
        description="Total farm size (acres)",
    )
    mainCrops: List[str] = Field(
        min_length=1,
        description="Main crops grown by farmer",
    )
    isSmallOrMarginal: bool = Field(
        description="Whether the farmer is small/marginal (<=2 hectares)",
    )


class SchemeStatus(str):
    """Just a string wrapper type for status labels."""


class GovScheme(BaseModel):
    """Single government scheme recommendation."""

    name: str
    description: str
    tag: str = Field(
        description="Short CTA label such as 'Apply Now' or 'Verified'",
    )
    status: Literal["eligible", "pending", "warning"] = Field(
        description="Eligibility status bucket",
    )
    estimatedBenefitPerYear: float = Field(
        description="Estimated benefit in INR per year",
    )
    priorityRank: int = Field(
        ge=1,
        description="1 = highest priority scheme to act on",
    )
    link: Optional[str] = Field(
        default=None,
        description="Optional external link to official portal",
    )
    requiredDocuments: List[str] = Field(
        description="Short list of key documents required",
    )


class SchemeRecommendationResponse(BaseModel):
    """List of schemes tailored to farmer profile."""

    profileSummary: str
    totalEligibleSchemes: int
    topSchemes: List[GovScheme]


# ---------------------------------------------------------------------------
# Mentorship network
# ---------------------------------------------------------------------------

class MentorRecommendationRequest(BaseModel):
    """Request nearby mentor recommendations."""

    location: str = Field(
        description="Village / district",
    )
    mainCrop: str = Field(
        description="Primary crop for which mentorship is needed",
    )


class Mentor(BaseModel):
    """Single mentor card."""

    name: str
    distanceKm: float
    expertise: str
    record: str
    phone: str
    nextAvailableVisit: str


class MentorRecommendationResponse(BaseModel):
    """Response containing recommended mentors."""

    headline: str
    mentors: List[Mentor]


# ---------------------------------------------------------------------------
# Market intelligence & buyers
# ---------------------------------------------------------------------------

class MarketMatchRequest(BaseModel):
    """Find buyers and mandi prices for given crops."""

    location: str = Field(
        description="Farmer location for matchmaking",
        examples=["Pune City"],
    )
    crop: str = Field(
        description="Primary crop to sell",
        examples=["tomato"],
    )
    quantity: float = Field(
        gt=0,
        description="Total quantity available",
        examples=[500.0],
    )
    unit: Literal["kg", "ton"] = Field(
        description="Unit for quantity",
    )


class MandiPrice(BaseModel):
    """Mandi price band for a crop."""

    mandiName: str
    minPrice: float
    maxPrice: float
    msp: Optional[float] = Field(
        default=None,
        description="Government MSP if available",
    )
    trend: Literal["up", "down", "stable"]


class BuyerListing(BaseModel):
    """Direct buyer listing model."""

    name: str
    location: str
    distanceKm: float
    rating: float
    lookingFor: List[str]
    priceBand: str
    notes: str


class MarketMatchResponse(BaseModel):
    """Combined mandi + buyer intelligence."""

    headline: str
    mandiPrices: List[MandiPrice]
    buyers: List[BuyerListing]


# ---------------------------------------------------------------------------
# Chatbot
# ---------------------------------------------------------------------------

class ChatMessageRequest(BaseModel):
    """Lightweight farming Q&A endpoint request."""

    question: str = Field(
        min_length=4,
        max_length=500,
        description="Farmer's question in natural language",
    )
    crop: Optional[str] = Field(
        default=None,
        description="Optional crop context for better advice",
    )
    language: Literal["en", "hi"] = Field(
        default="en",
        description="Preferred language for response",
    )


class ChatMessageResponse(BaseModel):
    """Single-turn chatbot style response."""

    answer: str
    quickTips: List[str]
    followUpSuggestions: List[str]


# ---------------------------------------------------------------------------
# Analytics & Advanced Insights
# ---------------------------------------------------------------------------

class AnalyticsRequest(BaseModel):
    """Request for comprehensive farm analytics."""

    location: str = Field(description="Farm location", examples=["Pune, MH"])
    farmSize: float = Field(gt=0, description="Farm size in acres")
    mainCrops: List[str] = Field(min_length=1, description="Main crops grown")


class AnalyticsResponse(BaseModel):
    """Comprehensive analytics dashboard data."""

    totalAcreage: float
    activeCrops: int
    avgProfitabilityPercent: float
    riskScore: float
    marketOpportunityScore: float
    insights: List[str]
    lastUpdated: datetime


class ProfitabilityAnalysisRequest(BaseModel):
    """Request for profitability analysis."""

    crop: str = Field(description="Crop to analyze")
    landSize: float = Field(gt=0, description="Land size in acres")
    location: str = Field(description="Location", examples=["Pune, MH"])


class ProfitabilityAnalysisResponse(BaseModel):
    """Profitability analysis results."""

    crop: str
    landSize: float
    estimatedProfit: float
    roiPercent: float
    breakEvenPrice: float
    recommendations: List[str]


class RiskAssessmentRequest(BaseModel):
    """Request for risk assessment."""

    location: str = Field(description="Farm location")
    farmSize: float = Field(gt=0, description="Farm size in acres")
    mainCrops: List[str] = Field(min_length=1, description="Main crops")


class RiskAssessmentResponse(BaseModel):
    """Comprehensive risk assessment results."""

    location: str
    overallRiskScore: float
    climateRiskScore: float
    marketRiskScore: float
    operationalRiskScore: float
    mitigationStrategies: List[str]
    riskLevel: str
