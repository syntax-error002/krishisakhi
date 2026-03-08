"""Climate simulation API routes."""
from fastapi import APIRouter, HTTPException, status
from fastapi.responses import JSONResponse
import logging
from app.models.schemas import (
    SimulationRequest,
    SimulationResponse,
    ErrorResponse
)
from app.services.simulation_service import SimulationService

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/climate",
    tags=["Climate Simulation"]
)


@router.post(
    "/simulate",
    response_model=SimulationResponse,
    status_code=status.HTTP_200_OK,
    summary="Simulate climate impact on crop yield",
    description="""
    Simulate the impact of climate scenarios on crop yield and income.
    
    This endpoint calculates:
    - Original expected income based on crop and land size
    - Revised yield percentage after climate impact
    - Revised income after climate impact
    - Recommended alternative crops suitable for the scenario
    
    **Supported Scenarios:**
    - `-30% Rainfall (Drought)`: Simulates drought conditions
    - `+40% Rainfall (Flood Risk)`: Simulates flood conditions
    
    **Supported Crops:**
    - wheat
    - rice
    - soybean
    - sugarcane
    """,
    responses={
        200: {
            "description": "Simulation completed successfully",
            "model": SimulationResponse
        },
        400: {
            "description": "Invalid request parameters",
            "model": ErrorResponse
        },
        422: {
            "description": "Validation error",
            "model": ErrorResponse
        },
        500: {
            "description": "Internal server error",
            "model": ErrorResponse
        }
    }
)
async def simulate_climate_impact(request: SimulationRequest) -> SimulationResponse:
    """
    Simulate climate impact on crop production.
    
    Args:
        request: Simulation request containing land size, crop, and scenario
        
    Returns:
        SimulationResponse with calculated impacts and alternatives
        
    Raises:
        HTTPException: If simulation fails
    """
    try:
        logger.info(
            f"Simulation request received: crop={request.currentCrop}, "
            f"land_size={request.landSize}, scenario={request.scenario}"
        )
        
        # Perform simulation
        result = SimulationService.simulate_climate_impact(
            land_size=request.landSize,
            crop_name=request.currentCrop,
            scenario=request.scenario
        )
        
        return SimulationResponse(**result)
        
    except ValueError as e:
        logger.error(f"Validation error in simulation: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.exception(f"Unexpected error during simulation: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred during simulation"
        )

