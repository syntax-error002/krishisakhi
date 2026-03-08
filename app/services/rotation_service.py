"""Service for crop rotation and soil health reasoning."""

from __future__ import annotations

import logging
from typing import List

from app.models.schemas import (
    CropRotationRequest,
    CropRotationResponse,
    RotationPlanItem,
)

logger = logging.getLogger(__name__)


class RotationService:
    """Rule-based crop-rotation advisor."""

    # Very small rule set keyed by dominant crop type
    _LEGUMES = {"chickpea", "chana", "lentil", "pigeon pea", "tur", "soybean"}
    _HEAVY_FEEDERS = {"wheat", "rice", "sugarcane", "maize", "cotton"}

    @classmethod
    def _infer_soil_scores(cls, recent_crops: List[str]) -> tuple[int, int, int]:
        """Return (nitrogen, phosphorus, diseasePressure) scores 0–100."""
        heavy_count = sum(1 for c in recent_crops if c in cls._HEAVY_FEEDERS)
        legume_count = sum(1 for c in recent_crops if c in cls._LEGUMES)

        # Start from neutral and adjust
        nitrogen = 70 - heavy_count * 15 + legume_count * 10
        phosphorus = 70 - heavy_count * 10 + legume_count * 5
        disease = 40 + heavy_count * 12 - legume_count * 8

        nitrogen = max(10, min(100, nitrogen))
        phosphorus = max(10, min(100, phosphorus))
        disease = max(10, min(100, disease))

        return nitrogen, phosphorus, disease

    @classmethod
    def _build_rotation_plan(
        cls,
        req: CropRotationRequest,
        nitrogen: int,
        disease: int,
    ) -> List[RotationPlanItem]:
        """Create a simple 2-season rotation."""
        last_crop = req.recentSeasons[0].crop.lower()

        # Default suggestions
        first_season_crop = "Chickpea (Chana)"
        second_season_crop = "Pearl Millet (Bajra)"

        if last_crop in {"rice", "paddy"}:
            second_season_crop = "Maize + Cowpea Intercrop"
        elif last_crop in {"cotton"}:
            first_season_crop = "Green Gram"

        soil_low_n = nitrogen < 60
        disease_high = disease > 60

        reasons_first: list[str] = []
        soil_impact_first: list[str] = []

        if soil_low_n:
            reasons_first.append("Repairs nitrogen depletion after cereal-heavy rotation.")
            soil_impact_first.append("Adds 25–35 kg/ha of nitrogen back into soil.")
        if disease_high:
            reasons_first.append("Breaks disease cycle from repeated mono‑cropping.")
            soil_impact_first.append("Reduces soil‑borne pathogen load.")

        if not reasons_first:
            reasons_first.append("Balances income with soil recovery in low-risk seasons.")
            soil_impact_first.append("Supports soil organic matter build‑up.")

        plan = [
            RotationPlanItem(
                seasonName="Next Rabi Season",
                crop=first_season_crop,
                reason=" ".join(reasons_first),
                expectedProfitChangePercent=18.0,
                soilImpact=" ".join(soil_impact_first),
            ),
            RotationPlanItem(
                seasonName="Following Kharif Season",
                crop=second_season_crop,
                reason=(
                    "Provides a drought-resilient option that still matches local demand, "
                    "while continuing to diversify away from current pattern."
                ),
                expectedProfitChangePercent=12.0,
                soilImpact=(
                    "Improves root depth profile and reduces waterlogging stress compared "
                    "to continuous rice cultivation."
                ),
            ),
        ]

        return plan

    @classmethod
    def get_rotation_plan(cls, req: CropRotationRequest) -> CropRotationResponse:
        """Main entrypoint to build a `CropRotationResponse`."""
        recent_crops = [s.crop.lower() for s in req.recentSeasons]
        nitrogen, phosphorus, disease = cls._infer_soil_scores(recent_crops)

        if req.soilConcern:
            logger.info(
                "Received explicit soil concern '%s' for location=%s",
                req.soilConcern,
                req.location,
            )

        soil_summary_parts: list[str] = []

        if nitrogen < 60:
            soil_summary_parts.append(
                "Nitrogen levels look stressed after repeated cereal crops."
            )
        else:
            soil_summary_parts.append("Nitrogen availability is acceptable for this season.")

        if phosphorus < 60:
            soil_summary_parts.append(
                "Phosphorus is trending lower — avoid over‑reliance on high‑analysis urea only."
            )
        else:
            soil_summary_parts.append("Phosphorus levels are within a safe working band.")

        if disease > 60:
            soil_summary_parts.append(
                "Disease pressure is high: strongly avoid planting the same crop again."
            )
        else:
            soil_summary_parts.append("Disease pressure is under control with current pattern.")

        soil_summary = " ".join(soil_summary_parts)
        plan = cls._build_rotation_plan(req, nitrogen, disease)

        logger.info(
            "Generated rotation plan for location=%s, farmSize=%s acres",
            req.location,
            req.farmSize,
        )

        return CropRotationResponse(
            soilSummary=soil_summary,
            nitrogenScore=nitrogen,
            phosphorusScore=phosphorus,
            diseasePressureScore=disease,
            rotationPlan=plan,
        )


