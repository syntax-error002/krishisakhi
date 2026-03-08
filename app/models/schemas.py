"""Pydantic schemas for API requests and responses."""
from pydantic import BaseModel, Field, field_validator
from typing import List
from datetime import datetime, timezone


class SimulationRequest(BaseModel):
    """Request model for climate simulation."""
    
    landSize: float = Field(
        gt=0,
        le=10000,
        description="Land size in acres",
        examples=[5.0]
    )
    currentCrop: str = Field(
        min_length=1,
        max_length=100,
        description="Current crop name",
        examples=["wheat"]
    )
    scenario: str = Field(
        min_length=1,
        max_length=200,
        description="Climate scenario",
        examples=["-30% Rainfall (Drought)"]
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
            "+40% Rainfall (Flood Risk)"
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
        examples=[35000.0]
    )
    resistance: str = Field(
        description="Climate resistance level",
        examples=["High Drought Resistance"]
    )
    reason: str = Field(
        description="Reason for recommendation",
        examples=["Requires 50% less water than Wheat"]
    )


class SimulationResponse(BaseModel):
    """Response model for climate simulation."""
    
    originalExpectedIncome: float = Field(
        description="Original expected income in INR",
        examples=[187500.0]
    )
    revisedYieldPercent: float = Field(
        ge=0,
        le=100,
        description="Revised yield percentage",
        examples=[55.0]
    )
    revisedIncome: float = Field(
        description="Revised income after climate impact in INR",
        examples=[103125.0]
    )
    alternativeCrops: List[AlternativeCrop] = Field(
        description="List of recommended alternative crops"
    )


class HealthResponse(BaseModel):
    """Health check response model."""
    
    status: str = Field(description="Service status", examples=["healthy"])
    version: str = Field(description="API version", examples=["1.0.0"])
    timestamp: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="Current server timestamp"
    )


class ErrorResponse(BaseModel):
    """Error response model."""
    
    error: str = Field(description="Error message")
    detail: str | None = Field(
        default=None,
        description="Detailed error information"
    )
    timestamp: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="Error timestamp"
    )

