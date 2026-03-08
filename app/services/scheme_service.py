"""Service for government scheme recommendations."""

from __future__ import annotations

import logging
from typing import List

from app.models.schemas import (
    SchemeRecommendationRequest,
    SchemeRecommendationResponse,
    GovScheme,
)

logger = logging.getLogger(__name__)


class SchemeService:
    """Simple rule-based scheme recommendation engine."""

    @staticmethod
    def _profile_summary(req: SchemeRecommendationRequest) -> str:
        size_band = "small/marginal" if req.isSmallOrMarginal else "medium/large"
        crops = ", ".join(req.mainCrops)
        return (
            f"You are registered as a {size_band} farmer in {req.location} "
            f"cultivating {crops}. Based on this, the following schemes look high impact."
        )

    @staticmethod
    def _base_schemes(req: SchemeRecommendationRequest) -> List[GovScheme]:
        """Return a hand-curated list but adjust tags and benefits."""
        small_bonus = 1.2 if req.isSmallOrMarginal else 1.0

        schemes: List[GovScheme] = [
            GovScheme(
                name="PM-Kisan Samman Nidhi",
                description="Direct income support of ₹6,000/year credited in three instalments.",
                tag="Verified • Auto‑credited",
                status="eligible",
                estimatedBenefitPerYear=6000.0 * small_bonus,
                priorityRank=1,
                link="https://pmkisan.gov.in/",
                requiredDocuments=["Aadhaar card", "Bank passbook", "Land records"],
            ),
            GovScheme(
                name="Pradhan Mantri Fasal Bima Yojana",
                description="Subsidised crop insurance against droughts, floods and pest attacks.",
                tag="Apply before sowing",
                status="pending",
                estimatedBenefitPerYear=18000.0 * small_bonus,
                priorityRank=2,
                link="https://pmfby.gov.in/",
                requiredDocuments=["Land records", "Sowing certificate", "Bank passbook"],
            ),
            GovScheme(
                name="Kisan Credit Card (KCC)",
                description="Low-interest working capital limit to cover seasonal input costs.",
                tag="Action Required",
                status="warning",
                estimatedBenefitPerYear=12000.0 * small_bonus,
                priorityRank=3,
                link=None,
                requiredDocuments=["Aadhaar card", "Land records", "Existing bank account"],
            ),
        ]

        # If pulses or oilseeds present, bump insurance benefit slightly
        if any(crop.lower() in {"soybean", "groundnut", "mustard"} for crop in req.mainCrops):
            for scheme in schemes:
                if "Fasal Bima" in scheme.name:
                    scheme.estimatedBenefitPerYear *= 1.15

        return schemes

    @classmethod
    def recommend_schemes(cls, req: SchemeRecommendationRequest) -> SchemeRecommendationResponse:
        """Build a sorted list of schemes for the given farmer profile."""
        profile_text = cls._profile_summary(req)
        schemes = sorted(cls._base_schemes(req), key=lambda s: s.priorityRank)

        logger.info(
            "Generated %d scheme recommendations for %s (size=%.2f acres)",
            len(schemes),
            req.location,
            req.farmSize,
        )

        return SchemeRecommendationResponse(
            profileSummary=profile_text,
            totalEligibleSchemes=len(schemes),
            topSchemes=schemes,
        )


