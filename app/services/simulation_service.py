"""Service for climate simulation calculations."""
from typing import Dict, Any
import logging
from app.services.crop_service import CropService
from app.models.schemas import AlternativeCrop

logger = logging.getLogger(__name__)


class SimulationService:
    """Service for climate impact simulation."""
    
    # Yield impact percentages by scenario and crop
    YIELD_IMPACTS: Dict[str, Dict[str, float]] = {
        "-30% Rainfall (Drought)": {
            "rice": 30.0,
            "sugarcane": 30.0,
            "wheat": 55.0,
            "default": 70.0
        },
        "+40% Rainfall (Flood Risk)": {
            "soybean": 40.0,
            "wheat": 60.0,
            "default": 85.0
        }
    }
    
    @classmethod
    def calculate_baseline_income(
        cls,
        crop_data: Dict[str, Any],
        land_size: float
    ) -> tuple[float, float]:
        """
        Calculate baseline yield and income.
        
        Args:
            crop_data: Crop data dictionary
            land_size: Land size in acres
            
        Returns:
            Tuple of (yield_kg, income)
        """
        yield_per_acre = crop_data["base_yield_per_acre_kg"]
        price_per_kg = crop_data["price_per_kg"]
        
        total_yield_kg = yield_per_acre * land_size
        total_income = total_yield_kg * price_per_kg
        
        logger.debug(
            f"Baseline calculation: {yield_per_acre} kg/acre × {land_size} acres "
            f"× {price_per_kg} INR/kg = {total_income} INR"
        )
        
        return total_yield_kg, total_income
    
    @classmethod
    def calculate_revised_yield_percent(
        cls,
        scenario: str,
        crop_name: str
    ) -> float:
        """
        Calculate revised yield percentage based on scenario and crop.
        
        Args:
            scenario: Climate scenario
            crop_name: Normalized crop name
            
        Returns:
            Revised yield percentage (0-100)
        """
        scenario_impacts = cls.YIELD_IMPACTS.get(scenario, {})
        
        # Check for crop-specific impact
        yield_percent = scenario_impacts.get(crop_name)
        
        # Fallback to default if crop-specific not found
        if yield_percent is None:
            yield_percent = scenario_impacts.get("default", 100.0)
        
        logger.debug(
            f"Yield impact for {crop_name} in {scenario}: {yield_percent}%"
        )
        
        return yield_percent
    
    @classmethod
    def simulate_climate_impact(
        cls,
        land_size: float,
        crop_name: str,
        scenario: str
    ) -> Dict[str, Any]:
        """
        Simulate climate impact on crop yield and income.
        
        Args:
            land_size: Land size in acres
            crop_name: Current crop name
            scenario: Climate scenario
            
        Returns:
            Dictionary containing simulation results
        """
        # Normalize crop name
        crop_key = crop_name.strip().lower()
        
        # Get crop data
        crop_data = CropService.get_crop_data(crop_name)
        
        # Calculate baseline
        _, original_income = cls.calculate_baseline_income(
            crop_data,
            land_size
        )
        
        # Calculate revised yield percentage
        revised_yield_percent = cls.calculate_revised_yield_percent(
            scenario,
            crop_key
        )
        
        # Calculate revised income
        revised_income = original_income * (revised_yield_percent / 100.0)
        
        # Get alternative crops
        alternatives_data = CropService.get_alternatives(scenario)
        alternative_crops = [
            AlternativeCrop(**alt) for alt in alternatives_data
        ]
        
        logger.info(
            f"Simulation completed: {crop_name} ({land_size} acres) "
            f"in {scenario} scenario. Income impact: "
            f"{original_income:.2f} → {revised_income:.2f} INR "
            f"({revised_yield_percent}% yield)"
        )
        
        return {
            "originalExpectedIncome": round(original_income, 2),
            "revisedYieldPercent": round(revised_yield_percent, 2),
            "revisedIncome": round(revised_income, 2),
            "alternativeCrops": alternative_crops
        }

