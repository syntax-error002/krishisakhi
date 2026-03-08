"""Service for direct market + mandi intelligence."""

from __future__ import annotations

import logging

from app.models.schemas import (
    MarketMatchRequest,
    MarketMatchResponse,
    MandiPrice,
    BuyerListing,
)

logger = logging.getLogger(__name__)


class MarketService:
    """Generate mandi prices and buyer cards for the market screen."""

    @classmethod
    def get_market_matches(cls, req: MarketMatchRequest) -> MarketMatchResponse:
        crop_title = req.crop.title()
        quantity_label = (
            f"{req.quantity:.0f} {req.unit}" if req.unit == "kg" else f"{req.quantity:.1f} tons"
        )

        mandi_prices = [
            MandiPrice(
                mandiName=f"{req.location} Main Mandi",
                minPrice=28.0,
                maxPrice=32.0,
                msp=27.0,
                trend="up",
            ),
            MandiPrice(
                mandiName="Regional APMC Hub",
                minPrice=27.0,
                maxPrice=30.5,
                msp=27.0,
                trend="stable",
            ),
        ]

        buyers = [
            BuyerListing(
                name="Green Leaf Cloud Kitchen",
                location=f"{req.location} city",
                distanceKm=12.0,
                rating=4.8,
                lookingFor=[f"{crop_title} (Grade A)", "Onions", "Weekly contract"],
                priceBand="₹28 – ₹32 / kg",
                notes="Prefers sorted and graded produce with weekly pickups.",
            ),
            BuyerListing(
                name="Sunshine Mid-day Meals",
                location="School district cluster",
                distanceKm=8.0,
                rating=4.9,
                lookingFor=[crop_title, "Rice", "Long-term supply"],
                priceBand="Govt MSP + 5%",
                notes="Payment within 7 days via bank transfer.",
            ),
        ]

        headline = (
            f"For {quantity_label} of {crop_title}, we found {len(mandi_prices)} mandi price "
            f"bands and {len(buyers)} direct buyers around {req.location}."
        )

        logger.info(
            "Generated market matches for crop=%s, quantity=%s%s at %s",
            req.crop,
            req.quantity,
            req.unit,
            req.location,
        )

        return MarketMatchResponse(
            headline=headline,
            mandiPrices=mandi_prices,
            buyers=buyers,
        )


