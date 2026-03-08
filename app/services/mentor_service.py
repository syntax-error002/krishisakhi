"""Service for mentor recommendations."""

from __future__ import annotations

import logging

from app.models.schemas import (
    MentorRecommendationRequest,
    MentorRecommendationResponse,
    Mentor,
)

logger = logging.getLogger(__name__)


class MentorService:
    """Return a small curated mentor list for the UI."""

    @classmethod
    def recommend_mentors(cls, req: MentorRecommendationRequest) -> MentorRecommendationResponse:
        crop = req.mainCrop.title()

        mentors = [
            Mentor(
                name="Suresh Patil",
                distanceKm=4.0,
                expertise=f"High-density {crop} + intercropping",
                record="Top 5% yield in district for last 3 years",
                phone="+91-9876543210",
                nextAvailableVisit="Saturday evening, 4–6 PM",
            ),
            Mentor(
                name="Meena Devi",
                distanceKm=11.5,
                expertise="Integrated Pest Management and drip irrigation",
                record="Highest net profit/acre in 2024 cluster program",
                phone="+91-9123456780",
                nextAvailableVisit="Tuesday morning, 9–11 AM",
            ),
            Mentor(
                name="Anand Rao",
                distanceKm=18.2,
                expertise="Organic soil building and residue management",
                record="Reduced chemical input cost by 40% while keeping yield stable",
                phone="+91-9988776655",
                nextAvailableVisit="By appointment via KVK",
            ),
        ]

        headline = (
            f"Matched {len(mentors)} nearby mentors within 20 km of {req.location} "
            f"who specialise in {crop} systems."
        )

        logger.info(
            "Recommended %d mentors for crop=%s at location=%s",
            len(mentors),
            req.mainCrop,
            req.location,
        )

        return MentorRecommendationResponse(headline=headline, mentors=mentors)


