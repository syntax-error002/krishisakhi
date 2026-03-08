"""Service for lightweight rule-based chatbot replies.

This is intentionally simple and deterministic so that it works reliably
without external LLM dependencies, but still feels contextual for common
farming questions.
"""

from __future__ import annotations

import logging

from app.models.schemas import ChatMessageRequest, ChatMessageResponse

logger = logging.getLogger(__name__)


class ChatService:
    """Provide single-turn Q&A style responses."""

    @staticmethod
    def _lower(q: str) -> str:
        return q.lower()

    @classmethod
    def answer(cls, req: ChatMessageRequest) -> ChatMessageResponse:
        """Return a contextual but template-based answer."""
        q = cls._lower(req.question)
        crop = (req.crop or "your crop").lower()

        if "blossom end rot" in q or ("black" in q and "tomato" in q):
            answer = (
                "Those black, leathery patches at the bottom of tomatoes are usually Blossom End Rot, "
                "caused by calcium imbalance and irregular watering. The fruit is safe to eat after "
                "cutting off the damaged part, but future fruits can be protected."
            )
            quick_tips = [
                "Keep soil moisture even – avoid big dry–wet cycles.",
                "Do not over-use nitrogen fertiliser, it can reduce calcium uptake.",
                "Apply a calcium-rich foliar spray in the evening for 2–3 days.",
            ]
        elif "pest" in q or "insect" in q or "caterpillar" in q:
            answer = (
                "Pest pressure can be reduced with a mix of mechanical control, safe sprays and "
                "field hygiene. Start with the lowest-risk options and only move to chemicals if needed."
            )
            quick_tips = [
                "Hand-pick heavily infested leaves and destroy them outside the field.",
                "Use pheromone traps and yellow sticky traps to monitor adult populations.",
                "If infestation is high, consult your local KVK for the right molecule and dose.",
            ]
        elif "water" in q or "irrigation" in q or "rain" in q:
            answer = (
                "Smart irrigation depends on soil type and crop stage. As a thumb rule, shallow-rooted "
                f"crops like {crop} need more frequent light irrigations rather than heavy flooding."
            )
            quick_tips = [
                "Irrigate in the early morning or evening to reduce evaporation loss.",
                "Check soil moisture 5–7 cm below the surface before deciding to irrigate.",
                "Mulching with crop residue reduces water requirement by 20–30%.",
            ]
        else:
            answer = (
                "I have noted your question. Based on similar queries from farmers, start by checking "
                "soil moisture, leaf colour and presence of any insects or spots. Small corrections "
                "in water, nutrients and pests usually solve most problems early."
            )
            quick_tips = [
                "Walk the field in a zig‑zag pattern and compare healthy vs affected patches.",
                "Capture clear photos of leaves, stems and soil for expert review.",
                "Record what fertiliser or spray was last applied and when.",
            ]

        follow_ups = [
            "Would you like a step‑by‑step spray schedule for the next 7 days?",
            "Do you want to connect this query with a nearby mentor for a phone call?",
            "Should I create a checklist you can follow during your next field visit?",
        ]

        if req.language == "hi":
            # Very light localisation of the heading only, content remains simple English
            answer = "Namaste! " + answer

        logger.info("Chat question received for crop=%s", req.crop)

        return ChatMessageResponse(
            answer=answer,
            quickTips=quick_tips,
            followUpSuggestions=follow_ups,
        )


