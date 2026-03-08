"""Real Weather API integration with intelligent farming insights."""

from __future__ import annotations

import logging
from typing import Dict, List
import httpx
from datetime import datetime, timedelta

from app.config import get_settings
from app.models.schemas import WeatherRequest, WeatherSummaryResponse, DailyForecast
from app.core.cache import cached

logger = logging.getLogger(__name__)


class WeatherService:
    """Real weather data integration with farming-specific insights."""

    @staticmethod
    async def _fetch_weather_api(location: str) -> Dict:
        """Fetch real weather data from WeatherAPI.com."""
        settings = get_settings()
        
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                # Try current weather + forecast
                url = f"{settings.weather_api_base}/forecast.json"
                params = {
                    "key": settings.weather_api_key,
                    "q": location,
                    "days": 3,
                    "aqi": "no",
                    "alerts": "yes"
                }
                
                response = await client.get(url, params=params)
                response.raise_for_status()
                data = response.json()
                
                logger.info(f"Weather API call successful for {location}")
                return data
                
        except httpx.HTTPStatusError as e:
            logger.error(f"Weather API HTTP error: {e.response.status_code}")
            raise
        except httpx.TimeoutException:
            logger.error("Weather API timeout")
            raise
        except Exception as e:
            logger.error(f"Weather API error: {str(e)}")
            raise

    @staticmethod
    def _extract_location_name(data: Dict) -> str:
        """Extract formatted location name from API response."""
        location = data.get("location", {})
        name = location.get("name", "Unknown")
        region = location.get("region", "")
        country = location.get("country", "")
        
        if region and region != name:
            return f"{name}, {region}"
        return f"{name}, {country}"

    @staticmethod
    def _generate_farming_advisory(
        main_crop: str | None,
        current: Dict,
        forecast: Dict,
        alerts: List[Dict] | None
    ) -> str:
        """Generate intelligent farming advisory based on weather conditions."""
        crop = (main_crop or "your crop").lower()
        
        temp_c = current.get("temp_c", 25)
        humidity = current.get("humidity", 50)
        precip_mm = current.get("precip_mm", 0)
        condition_text = current.get("condition", {}).get("text", "").lower()
        
        # Check for alerts
        if alerts:
            alert_headline = alerts[0].get("headline", "")
            if "rain" in alert_headline.lower() or "storm" in alert_headline.lower():
                return (
                    f"⚠️ WEATHER ALERT: {alert_headline}. "
                    f"Postpone field operations for {crop}. Secure equipment and ensure proper drainage."
                )
        
        # High precipitation advisory
        if precip_mm > 20:
            return (
                f"Heavy rainfall expected ({precip_mm:.1f}mm). "
                f"Avoid irrigation for {crop}, create drainage channels, and delay fertilizer application."
            )
        
        # Drought conditions
        if temp_c > 35 and humidity < 40:
            return (
                f"Hot and dry conditions (>{temp_c}°C, {humidity}% humidity). "
                f"Increase irrigation frequency for {crop}, apply mulch to retain soil moisture, "
                f"and consider shade nets for sensitive crops."
            )
        
        # High humidity fungal risk
        if humidity > 80:
            return (
                f"High humidity ({humidity}%) detected. "
                f"Monitor {crop} closely for fungal diseases. Avoid overhead irrigation, "
                f"ensure good air circulation, and consider preventive fungicide application."
            )
        
        # Optimal conditions
        if 20 <= temp_c <= 30 and 50 <= humidity <= 70:
            return (
                f"Optimal weather conditions for {crop}. "
                f"Good window for fertilizer application, weeding, and general field maintenance."
            )
        
        # Cold stress
        if temp_c < 15:
            return (
                f"Cool temperatures ({temp_c}°C). "
                f"Protect {crop} from cold stress with row covers if needed. "
                f"Delay planting of heat-sensitive crops."
            )
        
        # Default
        return (
            f"Weather conditions are moderate. "
            f"Continue regular monitoring and maintenance for {crop}."
        )

    @staticmethod
    def _parse_forecast_days(data: Dict) -> List[DailyForecast]:
        """Parse forecast days from API response."""
        forecast_days = []
        forecast_data = data.get("forecast", {}).get("forecastday", [])
        
        for idx, day_data in enumerate(forecast_data[:3]):
            date_obj = datetime.strptime(day_data["date"], "%Y-%m-%d")
            day_name = date_obj.strftime("%A")
            
            day_info = day_data.get("day", {})
            condition = day_info.get("condition", {}).get("text", "Unknown")
            
            forecast_days.append(
                DailyForecast(
                    day=day_name if idx == 0 else f"{day_name} ({date_obj.strftime('%b %d')})",
                    minTemp=day_info.get("mintemp_c", 20),
                    maxTemp=day_info.get("maxtemp_c", 30),
                    rainChancePercent=int(day_info.get("daily_chance_of_rain", 0)),
                    advisory=condition
                )
            )
        
        return forecast_days

    @classmethod
    @cached(ttl=300)  # Cache for 5 minutes
    async def get_weather_summary(cls, req: WeatherRequest) -> WeatherSummaryResponse:
        """Fetch real weather data and generate farming insights."""
        try:
            # Fetch real weather data
            weather_data = await cls._fetch_weather_api(req.location)
            
            current = weather_data.get("current", {})
            location_name = cls._extract_location_name(weather_data)
            alerts = weather_data.get("alerts", {}).get("alert", [])
            
            # Extract current conditions
            temp_c = current.get("temp_c", 25)
            condition_text = current.get("condition", {}).get("text", "Clear")
            humidity = current.get("humidity", 50)
            precip_mm = current.get("precip_mm", 0)
            rain_chance = current.get("cloud", 0)  # Use cloud cover as proxy if no direct rain chance
            
            # Get forecast for next 3 days
            forecast_days = cls._parse_forecast_days(weather_data)
            
            # Generate intelligent advisory
            recommendation = cls._generate_farming_advisory(
                req.mainCrop,
                current,
                weather_data.get("forecast", {}),
                alerts if alerts else None
            )
            
            logger.info(
                f"Weather summary generated for {location_name}: "
                f"{temp_c}°C, {condition_text}, {humidity}% humidity"
            )
            
            return WeatherSummaryResponse(
                location=location_name,
                temperature=round(temp_c, 1),
                condition=condition_text,
                humidityPercent=humidity,
                rainChancePercent=int(rain_chance) if rain_chance else forecast_days[0].rainChancePercent if forecast_days else 0,
                recommendation=recommendation,
                next3Days=forecast_days
            )
            
        except Exception as e:
            logger.error(f"Error fetching weather: {str(e)}")
            # Fallback to basic data if API fails
            return WeatherSummaryResponse(
                location=req.location,
                temperature=28.0,
                condition="Data unavailable",
                humidityPercent=65,
                rainChancePercent=20,
                recommendation=f"Unable to fetch real-time weather. Please check local conditions for {req.mainCrop or 'your crops'}.",
                next3Days=[
                    DailyForecast(
                        day="Tomorrow",
                        minTemp=22.0,
                        maxTemp=30.0,
                        rainChancePercent=20,
                        advisory="Check local forecast"
                    )
                ]
            )
