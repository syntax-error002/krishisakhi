"""Service for crop data management."""
from typing import Dict, Any
import logging

logger = logging.getLogger(__name__)


class CropService:
    """Service for managing crop data and alternatives."""
    
    # Crop baseline data
    CROP_DATA: Dict[str, Dict[str, Any]] = {
        "wheat": {
            "base_yield_per_acre_kg": 1500,
            "price_per_kg": 25,
            "drought_tolerance": "low",
            "flood_tolerance": "medium"
        },
        "rice": {
            "base_yield_per_acre_kg": 2000,
            "price_per_kg": 20,
            "drought_tolerance": "very_low",
            "flood_tolerance": "high"
        },
        "soybean": {
            "base_yield_per_acre_kg": 1000,
            "price_per_kg": 40,
            "drought_tolerance": "medium",
            "flood_tolerance": "medium"
        },
        "sugarcane": {
            "base_yield_per_acre_kg": 30000,
            "price_per_kg": 3,
            "drought_tolerance": "low",
            "flood_tolerance": "high"
        },
    }
    
    # Alternative crops by scenario
    ALTERNATIVES: Dict[str, list] = {
        "-30% Rainfall (Drought)": [
            {
                "name": "Pearl Millet (Bajra)",
                "profitMargin": 35000,
                "resistance": "High Drought Resistance",
                "reason": "Requires 50% less water than Wheat and thrives in arid soil."
            },
            {
                "name": "Sorghum (Jowar)",
                "profitMargin": 42000,
                "resistance": "High Drought Resistance",
                "reason": "Deep root system helps survive extended dry spells. Great market demand."
            },
            {
                "name": "Chickpea (Chana)",
                "profitMargin": 38000,
                "resistance": "Medium Drought Resistance",
                "reason": "Fixes soil nitrogen and requires minimal irrigation post-germination."
            }
        ],
        "+40% Rainfall (Flood Risk)": [
            {
                "name": "Jute",
                "profitMargin": 45000,
                "resistance": "High Flood Resistance",
                "reason": "Thrives in standing water and prevents topsoil erosion."
            },
            {
                "name": "Watermelon",
                "profitMargin": 60000,
                "resistance": "Medium Flood Resistance",
                "reason": "Fast-grower if planted post-peak monsoon, capitalizes on high soil moisture."
            }
        ]
    }
    
    @classmethod
    def get_crop_data(cls, crop_name: str) -> Dict[str, Any]:
        """
        Get crop data by name.
        
        Args:
            crop_name: Normalized crop name (lowercase, stripped)
            
        Returns:
            Dictionary containing crop data or default fallback data
        """
        crop_key = crop_name.strip().lower()
        
        if crop_key not in cls.CROP_DATA:
            logger.warning(
                f"Unknown crop '{crop_name}', using default baseline data"
            )
            return {
                "base_yield_per_acre_kg": 1200,
                "price_per_kg": 30,
                "drought_tolerance": "unknown",
                "flood_tolerance": "unknown"
            }
        
        return cls.CROP_DATA[crop_key]
    
    @classmethod
    def get_alternatives(cls, scenario: str) -> list:
        """
        Get alternative crops for a given scenario.
        
        Args:
            scenario: Climate scenario string
            
        Returns:
            List of alternative crop dictionaries
        """
        alternatives = cls.ALTERNATIVES.get(scenario)
        
        if not alternatives:
            logger.warning(
                f"Unknown scenario '{scenario}', defaulting to drought alternatives"
            )
            alternatives = cls.ALTERNATIVES["-30% Rainfall (Drought)"]
        
        return alternatives
    
    @classmethod
    def get_available_crops(cls) -> list[str]:
        """Get list of available crop names."""
        return list(cls.CROP_DATA.keys())
    
    @classmethod
    def get_available_scenarios(cls) -> list[str]:
        """Get list of available climate scenarios."""
        return list(cls.ALTERNATIVES.keys())

