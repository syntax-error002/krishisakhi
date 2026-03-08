"""
Crop Rotation AI Engine
=======================
A scientifically-grounded algorithm for recommending optimal crop rotation sequences
based on soil nutrient dynamics, disease pressure, crop family taxonomy, seasonal
suitability, and profitability scoring.

Algorithm Overview:
1.  Parse crop history to build a soil state model (N, P, K scores + disease pressure)
2.  Score each candidate crop against the current soil state using multiple weighted factors
3.  Apply hard exclusion rules (same family consecutive, repeated crops)
4.  Return the top-ranked 2-year rotation plan with explanations
"""

from typing import List, Optional, Dict, Tuple

# =============================================================================
# CROP KNOWLEDGE BASE
# Each crop entry contains:
#   family      : Botanical/agronomic family (used for disease pressure checks)
#   season      : Which Indian seasons it fits (kharif, rabi, zaid)
#   nitrogen_use: N impact on soil (-ve = depletes, +ve = fixes)
#   phosphorus_use: P impact on soil (-ve = depletes, 0 neutral, +ve = adds)
#   potassium_use : K impact on soil
#   water_need   : low | medium | high
#   yield_per_acre: typical kg/acre
#   price_per_kg : typical farmgate price INR
#   disease_families: list of crop families that cause disease pressure if followed by this
#   drought_tolerant: bool
#   flood_tolerant  : bool
# =============================================================================

CROP_DB: Dict[str, Dict] = {
    # ── Cereals ──────────────────────────────────────────────────────────────
    "wheat": {
        "family": "cereal", "season": ["rabi"],
        "nitrogen_use": -35, "phosphorus_use": -20, "potassium_use": -25,
        "water_need": "medium", "yield_per_acre": 1500, "price_per_kg": 25,
        "disease_families": ["cereal"],
        "drought_tolerant": False, "flood_tolerant": False,
        "description": "Major rabi cereal, staple food crop of North/Central India."
    },
    "rice": {
        "family": "cereal", "season": ["kharif"],
        "nitrogen_use": -40, "phosphorus_use": -15, "potassium_use": -30,
        "water_need": "high", "yield_per_acre": 2200, "price_per_kg": 22,
        "disease_families": ["cereal"],
        "drought_tolerant": False, "flood_tolerant": True,
        "description": "Major kharif cereal, requires high water input."
    },
    "maize": {
        "family": "cereal", "season": ["kharif", "rabi"],
        "nitrogen_use": -30, "phosphorus_use": -18, "potassium_use": -20,
        "water_need": "medium", "yield_per_acre": 1800, "price_per_kg": 20,
        "disease_families": ["cereal"],
        "drought_tolerant": True, "flood_tolerant": False,
        "description": "Versatile cereal grown in both seasons."
    },
    "sorghum": {
        "family": "cereal", "season": ["kharif", "rabi"],
        "nitrogen_use": -20, "phosphorus_use": -10, "potassium_use": -15,
        "water_need": "low", "yield_per_acre": 900, "price_per_kg": 22,
        "disease_families": ["cereal"],
        "drought_tolerant": True, "flood_tolerant": False,
        "description": "Highly drought-resistant cereal. Great for dryland farming."
    },
    "pearl_millet": {
        "family": "cereal", "season": ["kharif"],
        "nitrogen_use": -15, "phosphorus_use": -8, "potassium_use": -10,
        "water_need": "low", "yield_per_acre": 800, "price_per_kg": 22,
        "disease_families": ["cereal"],
        "drought_tolerant": True, "flood_tolerant": False,
        "description": "Super drought-tolerant, requires 60% less water than rice."
    },
    "barley": {
        "family": "cereal", "season": ["rabi"],
        "nitrogen_use": -25, "phosphorus_use": -15, "potassium_use": -20,
        "water_need": "low", "yield_per_acre": 1200, "price_per_kg": 20,
        "disease_families": ["cereal"],
        "drought_tolerant": True, "flood_tolerant": False,
        "description": "Rabi cereal, very hardy in dry/cold conditions."
    },

    # ── Legumes (Nitrogen Fixers) ─────────────────────────────────────────────
    "soybean": {
        "family": "legume", "season": ["kharif"],
        "nitrogen_use": +50, "phosphorus_use": -10, "potassium_use": -15,
        "water_need": "medium", "yield_per_acre": 1000, "price_per_kg": 45,
        "disease_families": ["legume"],
        "drought_tolerant": False, "flood_tolerant": False,
        "description": "High-value legume that fixes substantial nitrogen into soil."
    },
    "chickpea": {
        "family": "legume", "season": ["rabi"],
        "nitrogen_use": +40, "phosphorus_use": -5, "potassium_use": -8,
        "water_need": "low", "yield_per_acre": 700, "price_per_kg": 55,
        "disease_families": ["legume"],
        "drought_tolerant": True, "flood_tolerant": False,
        "description": "Rabi legume, excellent nitrogen fixer for dryland soils."
    },
    "lentil": {
        "family": "legume", "season": ["rabi"],
        "nitrogen_use": +30, "phosphorus_use": -5, "potassium_use": -5,
        "water_need": "low", "yield_per_acre": 600, "price_per_kg": 60,
        "disease_families": ["legume"],
        "drought_tolerant": True, "flood_tolerant": False,
        "description": "Protein-rich legume, ideal to follow cereals."
    },
    "pigeon_pea": {
        "family": "legume", "season": ["kharif"],
        "nitrogen_use": +45, "phosphorus_use": -8, "potassium_use": -10,
        "water_need": "low", "yield_per_acre": 800, "price_per_kg": 58,
        "disease_families": ["legume"],
        "drought_tolerant": True, "flood_tolerant": False,
        "description": "Deep-rooted legume, improves soil structure and fertility."
    },
    "groundnut": {
        "family": "legume", "season": ["kharif", "rabi"],
        "nitrogen_use": +35, "phosphorus_use": -12, "potassium_use": -18,
        "water_need": "medium", "yield_per_acre": 1000, "price_per_kg": 55,
        "disease_families": ["legume"],
        "drought_tolerant": True, "flood_tolerant": False,
        "description": "Nitrogen-fixing oilseed crop, high market value."
    },
    "mustard": {
        "family": "crucifer", "season": ["rabi"],
        "nitrogen_use": -15, "phosphorus_use": -12, "potassium_use": -15,
        "water_need": "low", "yield_per_acre": 700, "price_per_kg": 50,
        "disease_families": ["crucifer"],
        "drought_tolerant": True, "flood_tolerant": False,
        "description": "Oilseed rabi crop. Breaks cereal and legume disease cycles."
    },

    # ── Vegetables / Cash Crops ───────────────────────────────────────────────
    "tomato": {
        "family": "solanaceae", "season": ["kharif", "rabi"],
        "nitrogen_use": -40, "phosphorus_use": -25, "potassium_use": -30,
        "water_need": "high", "yield_per_acre": 6000, "price_per_kg": 18,
        "disease_families": ["solanaceae"],
        "drought_tolerant": False, "flood_tolerant": False,
        "description": "High-value vegetable but heavy feeder."
    },
    "potato": {
        "family": "solanaceae", "season": ["rabi"],
        "nitrogen_use": -35, "phosphorus_use": -20, "potassium_use": -40,
        "water_need": "medium", "yield_per_acre": 8000, "price_per_kg": 12,
        "disease_families": ["solanaceae"],
        "drought_tolerant": False, "flood_tolerant": False,
        "description": "High-yield cash root crop, heavy K consumer."
    },
    "onion": {
        "family": "allium", "season": ["rabi"],
        "nitrogen_use": -25, "phosphorus_use": -15, "potassium_use": -20,
        "water_need": "medium", "yield_per_acre": 5000, "price_per_kg": 20,
        "disease_families": ["allium"],
        "drought_tolerant": False, "flood_tolerant": False,
        "description": "High-value crop. Unique allium family, rarely repeated."
    },
    "cotton": {
        "family": "malvaceae", "season": ["kharif"],
        "nitrogen_use": -40, "phosphorus_use": -20, "potassium_use": -30,
        "water_need": "medium", "yield_per_acre": 600, "price_per_kg": 65,
        "disease_families": ["malvaceae"],
        "drought_tolerant": False, "flood_tolerant": False,
        "description": "High-value fiber crop. Should not be repeated consecutively."
    },
    "sugarcane": {
        "family": "cereal", "season": ["kharif", "rabi"],
        "nitrogen_use": -50, "phosphorus_use": -30, "potassium_use": -45,
        "water_need": "high", "yield_per_acre": 30000, "price_per_kg": 3.5,
        "disease_families": ["cereal"],
        "drought_tolerant": False, "flood_tolerant": True,
        "description": "Long-duration crop, very heavy feeder. Needs break every 2 years."
    },
    "turmeric": {
        "family": "zingiberaceae", "season": ["kharif"],
        "nitrogen_use": -30, "phosphorus_use": -20, "potassium_use": -25,
        "water_need": "high", "yield_per_acre": 3000, "price_per_kg": 70,
        "disease_families": ["zingiberaceae"],
        "drought_tolerant": False, "flood_tolerant": False,
        "description": "High-value spice crop with good market price."
    },
}

# =============================================================================
# SOIL STATE MODEL
# =============================================================================

INITIAL_SOIL = {"nitrogen": 70, "phosphorus": 70, "potassium": 70, "disease_pressure": 20}

def _clamp(val: float, lo=0.0, hi=100.0) -> float:
    return max(lo, min(hi, val))

def apply_crop_to_soil(soil: dict, crop_name: str) -> dict:
    """Compute the soil state after growing a given crop."""
    crop = CROP_DB.get(crop_name.lower().replace(" ", "_"))
    if not crop:
        return soil  # unknown crop, no change
    return {
        "nitrogen":   _clamp(soil["nitrogen"]   + crop["nitrogen_use"]),
        "phosphorus": _clamp(soil["phosphorus"] + crop["phosphorus_use"]),
        "potassium":  _clamp(soil["potassium"]  + crop["potassium_use"]),
        "disease_pressure": _clamp(soil["disease_pressure"] + 15),  # grows each season
    }

def assess_soil_from_history(history: List[str]) -> dict:
    """Simulate soil state given a list of past crops (oldest first)."""
    soil = dict(INITIAL_SOIL)
    for crop_name in history:
        soil = apply_crop_to_soil(soil, crop_name)
    return soil

# =============================================================================
# SCORING ENGINE
# =============================================================================

def score_candidate(
    candidate: str,
    soil: dict,
    prev_crop: Optional[str],
    history_crops: List[str],
    scenario: Optional[str]
) -> Tuple[float, List[str]]:
    """
    Score a candidate crop (0-100 scale) against the current soil state.
    Returns (score, list of reasons).
    """
    crop_data = CROP_DB.get(candidate)
    if not crop_data:
        return 0.0, []

    score = 50.0  # baseline
    reasons: List[str] = []

    # ── 1. Nitrogen Benefit ───────────────────────────────────────────────────
    if soil["nitrogen"] < 40 and crop_data["nitrogen_use"] > 0:
        score += 20
        reasons.append(f"Soil is nitrogen-depleted; {candidate} fixes +{crop_data['nitrogen_use']} units of N.")
    elif soil["nitrogen"] < 40 and crop_data["nitrogen_use"] < -20:
        score -= 15
        reasons.append(f"Soil nitrogen low; avoid heavy feeders like {candidate}.")
    elif soil["nitrogen"] > 70 and crop_data["nitrogen_use"] < 0:
        score += 8
        reasons.append(f"Good nitrogen levels support {candidate}.")

    # ── 2. Disease Pressure Penalty ───────────────────────────────────────────
    if prev_crop:
        prev_data = CROP_DB.get(prev_crop)
        if prev_data and prev_data["family"] == crop_data["family"]:
            score -= 30
            reasons.append(f"AVOID: Same family ({crop_data['family']}) as previous crop. High disease risk.")

    # Penalise if crop already grown recently
    recent = [c for c in history_crops[-3:] if c == candidate]
    if len(recent) >= 2:
        score -= 25
        reasons.append(f"Crop repeated too recently — raises soil-borne disease risk.")
    elif len(recent) == 1:
        score -= 10
        reasons.append(f"Crop was grown recently — mild repetition risk.")

    if soil["disease_pressure"] > 60:
        score -= 10
        reasons.append(f"High disease pressure in soil — diversify family.")

    # ── 3. Climate / Scenario Adjustment ─────────────────────────────────────
    if scenario == "drought":
        if crop_data["drought_tolerant"]:
            score += 20
            reasons.append(f"{candidate} is drought-tolerant — ideal for dry conditions.")
        elif crop_data["water_need"] == "high":
            score -= 25
            reasons.append(f"{candidate} needs high water — poor match for drought scenario.")

    if scenario == "flood":
        if crop_data["flood_tolerant"]:
            score += 20
            reasons.append(f"{candidate} handles waterlogging well.")
        elif crop_data["water_need"] == "low":
            score -= 20
            reasons.append(f"{candidate} is susceptible to waterlogging.")

    # ── 4. Profitability Factor ───────────────────────────────────────────────
    profit_per_acre = crop_data["yield_per_acre"] * crop_data["price_per_kg"]
    if profit_per_acre > 40000:
        score += 12
        reasons.append(f"High profitability: ~₹{profit_per_acre:,}/acre.")
    elif profit_per_acre < 20000:
        score -= 5
        reasons.append(f"Lower profitability: ~₹{profit_per_acre:,}/acre.")
    else:
        score += 5
        reasons.append(f"Moderate profitability: ~₹{profit_per_acre:,}/acre.")

    # ── 5. Soil Diversity Bonus ───────────────────────────────────────────────
    families_grown = set(
        CROP_DB[c]["family"]
        for c in history_crops
        if c in CROP_DB
    )
    if crop_data["family"] not in families_grown:
        score += 8
        reasons.append(f"Introduces a new crop family — excellent for biodiversity.")

    return _clamp(score, 0.0, 100.0), reasons


# =============================================================================
# PUBLIC API
# =============================================================================

def get_rotation_recommendation(
    history: List[str],
    farm_size_acres: float = 2.0,
    scenario: Optional[str] = None,
    location: Optional[str] = None,
) -> dict:
    """
    Main algorithm entry point.
    
    Args:
        history: List of past crops, oldest first. e.g. ["rice", "wheat", "cotton"]
        farm_size_acres: Size of farm in acres
        scenario: Optional climate scenario: "drought" | "flood" | None
        location: Optional location string (used for context in response)

    Returns:
        Full rotation analysis dict with soil state, ranked recommendations, and 2-year plan
    """
    # Normalize input
    history_norm = [h.lower().strip().replace(" ", "_") for h in history if h.strip()]
    history_norm = [h for h in history_norm if h in CROP_DB]

    # Compute current soil state
    soil = assess_soil_from_history(history_norm)
    prev_crop = history_norm[-1] if history_norm else None

    # Determine which candidates to score
    candidates = [c for c in CROP_DB.keys() if c != prev_crop]

    # Score all candidates
    scored: List[Tuple[float, str, List[str]]] = []
    for candidate in candidates:
        score, reasons = score_candidate(
            candidate, soil, prev_crop, history_norm, scenario
        )
        scored.append((score, candidate, reasons))

    # Sort by score descending
    scored.sort(key=lambda x: x[0], reverse=True)

    # Build rotation plan: pick top Kharif and top Rabi picks separately
    kharif_picks = [(s, c, r) for (s, c, r) in scored if "kharif" in CROP_DB[c]["season"]]
    rabi_picks =   [(s, c, r) for (s, c, r) in scored if "rabi"   in CROP_DB[c]["season"]]

    rotation_plan = []
    soil_after = dict(soil)

    # Season 1: best kharif recommendation
    if kharif_picks:
        s1_score, s1_crop, s1_reasons = kharif_picks[0]
        s1_data = CROP_DB[s1_crop]
        profit1 = s1_data["yield_per_acre"] * s1_data["price_per_kg"] * farm_size_acres
        old_profit = (prev_crop and CROP_DB.get(prev_crop) or {}).get("yield_per_acre", 1500) * \
                     (prev_crop and CROP_DB.get(prev_crop) or {}).get("price_per_kg", 25) * farm_size_acres
        profit_change = ((profit1 - old_profit) / old_profit * 100) if old_profit else 0
        
        rotation_plan.append({
            "seasonName": "Next Kharif",
            "crop": s1_crop.replace("_", " ").title(),
            "reason": s1_reasons[0] if s1_reasons else s1_data["description"],
            "fullReasons": s1_reasons[:3],
            "expectedProfitChangePercent": round(profit_change, 1),
            "estimatedIncomePerAcre": round(s1_data["yield_per_acre"] * s1_data["price_per_kg"]),
            "soilImpact": f"N: {'+' if s1_data['nitrogen_use'] >= 0 else ''}{s1_data['nitrogen_use']}, "
                          f"P: {'+' if s1_data['phosphorus_use'] >= 0 else ''}{s1_data['phosphorus_use']}, "
                          f"K: {'+' if s1_data['potassium_use'] >= 0 else ''}{s1_data['potassium_use']}",
            "waterNeed": s1_data["water_need"],
            "score": round(s1_score, 1)
        })

        # Update soil after planting season 1 pick for next scoring
        soil_after = apply_crop_to_soil(soil_after, s1_crop)
        # Re-score rabi picks with updated soil
        rabi_picks = []
        for c in CROP_DB:
            if "rabi" in CROP_DB[c]["season"] and c != s1_crop:
                score2, reasons2 = score_candidate(c, soil_after, s1_crop, history_norm + [s1_crop], scenario)
                rabi_picks.append((score2, c, reasons2))
        rabi_picks.sort(key=lambda x: x[0], reverse=True)

    # Season 2: best rabi recommendation
    if rabi_picks:
        s2_score, s2_crop, s2_reasons = rabi_picks[0]
        s2_data = CROP_DB[s2_crop]
        profit2 = s2_data["yield_per_acre"] * s2_data["price_per_kg"] * farm_size_acres
        old_profit = (prev_crop and CROP_DB.get(prev_crop) or {}).get("yield_per_acre", 1500) * \
                     (prev_crop and CROP_DB.get(prev_crop) or {}).get("price_per_kg", 25) * farm_size_acres
        profit_change2 = ((profit2 - old_profit) / old_profit * 100) if old_profit else 0

        rotation_plan.append({
            "seasonName": "Next Rabi",
            "crop": s2_crop.replace("_", " ").title(),
            "reason": s2_reasons[0] if s2_reasons else s2_data["description"],
            "fullReasons": s2_reasons[:3],
            "expectedProfitChangePercent": round(profit_change2, 1),
            "estimatedIncomePerAcre": round(s2_data["yield_per_acre"] * s2_data["price_per_kg"]),
            "soilImpact": f"N: {'+' if s2_data['nitrogen_use'] >= 0 else ''}{s2_data['nitrogen_use']}, "
                          f"P: {'+' if s2_data['phosphorus_use'] >= 0 else ''}{s2_data['phosphorus_use']}, "
                          f"K: {'+' if s2_data['potassium_use'] >= 0 else ''}{s2_data['potassium_use']}",
            "waterNeed": s2_data["water_need"],
            "score": round(s2_score, 1)
        })

    # Soil summary labels
    def label(v, low=40, high=70):
        if v < low:
            return "Critical"
        if v < high:
            return "Moderate"
        return "Good"

    soil_summary = (
        f"After {len(history_norm)} season(s) of {', '.join(h.replace('_', ' ').title() for h in history_norm[-2:])} "
        f"— Nitrogen is {label(soil['nitrogen'])} ({int(soil['nitrogen'])}%), "
        f"Phosphorus {label(soil['phosphorus'])} ({int(soil['phosphorus'])}%), "
        f"and disease pressure is {'High' if soil['disease_pressure'] > 60 else 'Moderate' if soil['disease_pressure'] > 40 else 'Low'}."
    )

    return {
        "soilSummary": soil_summary,
        "nitrogenScore": int(soil["nitrogen"]),
        "phosphorusScore": int(soil["phosphorus"]),
        "potassiumScore": int(soil["potassium"]),
        "diseasePressureScore": int(soil["disease_pressure"]),
        "rotationPlan": rotation_plan,
        "topAlternatives": [
            {
                "crop": c.replace("_", " ").title(),
                "score": round(s, 1),
                "season": CROP_DB[c]["season"],
                "primaryReason": r[0] if r else ""
            }
            for (s, c, r) in scored[1:6]
        ]
    }
