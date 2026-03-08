from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

from rotation_engine import get_rotation_recommendation

app = FastAPI(
    title="Krishi Mitra — Crop Rotation AI",
    description="Scientifically-grounded crop rotation recommendations using soil nutrient modelling and multi-factor scoring.",
    version="2.0.0"
)

# Allow all origins for the mobile app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Request / Response Models ──────────────────────────────────────────────────

class RotationRequest(BaseModel):
    recentSeasons: List[str]           # Crop names, oldest first
    farmSize: Optional[float] = 2.0   # Acres
    location: Optional[str] = None    # e.g. "Pune, MH"
    scenario: Optional[str] = None    # "drought" | "flood" | None


# ── Routes ─────────────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"status": "ok", "service": "Krishi Mitra Crop Rotation AI", "version": "2.0.0"}


@app.get("/health")
def health():
    return {"status": "healthy"}


@app.post("/api/rotation/recommend")
def recommend_rotation(req: RotationRequest):
    """
    Run the Crop Rotation AI engine.
    
    Body:
    - recentSeasons: list of crop names grown in recent seasons, oldest first
    - farmSize: farm size in acres (default 2.0)
    - location: optional location string for context
    - scenario: optional "drought" or "flood" climate stress
    
    Returns a full rotation analysis with soil state, 2-season plan and alternatives.
    """
    if not req.recentSeasons:
        raise HTTPException(status_code=400, detail="recentSeasons cannot be empty.")
    
    result = get_rotation_recommendation(
        history=req.recentSeasons,
        farm_size_acres=req.farmSize or 2.0,
        scenario=req.scenario,
        location=req.location
    )
    return result


@app.get("/api/crops")
def list_crops():
    """Return the list of all crops supported by the AI engine."""
    from rotation_engine import CROP_DB
    return {
        "crops": [
            {
                "name": k.replace("_", " ").title(),
                "key": k,
                "family": v["family"],
                "season": v["season"],
                "yieldPerAcre": v["yield_per_acre"],
                "pricePerKg": v["price_per_kg"],
                "waterNeed": v["water_need"],
                "droughtTolerant": v["drought_tolerant"],
            }
            for k, v in CROP_DB.items()
        ]
    }
