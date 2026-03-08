"""Advanced analytics and insights endpoints for hackathon demo."""

from fastapi import APIRouter, status
import logging
from typing import List
from datetime import datetime, timedelta

from app.models.schemas import (
    AnalyticsRequest,
    AnalyticsResponse,
    ProfitabilityAnalysisRequest,
    ProfitabilityAnalysisResponse,
    RiskAssessmentRequest,
    RiskAssessmentResponse,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/analytics", tags=["Analytics & Insights"])


@router.post(
    "/dashboard",
    response_model=AnalyticsResponse,
    status_code=status.HTTP_200_OK,
    summary="Comprehensive farm analytics dashboard",
    description="""
    Returns a complete analytics overview including:
    - Profitability trends
    - Risk scores
    - Market opportunities
    - Weather impact predictions
    - Actionable insights
    """
)
async def get_analytics_dashboard(request: AnalyticsRequest) -> AnalyticsResponse:
    """Generate comprehensive farm analytics."""
    logger.info(f"Analytics dashboard requested for location={request.location}")
    
    # Calculate key metrics
    total_acreage = request.farmSize
    crop_count = len(request.mainCrops) if request.mainCrops else 1
    
    # Simulate advanced calculations
    avg_profitability = 75.5 + (hash(str(request.location)) % 20)
    risk_score = 30.0 + (hash(str(request.location)) % 25)
    market_opportunity_score = 65.0 + (hash(str(request.location)) % 30)
    
    # Generate insights
    insights = [
        f"Your {total_acreage}-acre farm shows {avg_profitability:.1f}% profitability potential",
        f"Market prices for {request.mainCrops[0] if request.mainCrops else 'your crops'} are trending upward",
        f"Risk assessment: {risk_score:.1f}/100 (Lower is better)",
        "Consider diversifying with 1-2 additional crops to reduce market risk"
    ]
    
    return AnalyticsResponse(
        totalAcreage=total_acreage,
        activeCrops=crop_count,
        avgProfitabilityPercent=round(avg_profitability, 1),
        riskScore=round(risk_score, 1),
        marketOpportunityScore=round(market_opportunity_score, 1),
        insights=insights,
        lastUpdated=datetime.now()
    )


@router.post(
    "/profitability",
    response_model=ProfitabilityAnalysisResponse,
    status_code=status.HTTP_200_OK,
    summary="Deep profitability analysis",
    description="Analyzes profitability across crops, seasons, and market conditions"
)
async def analyze_profitability(
    request: ProfitabilityAnalysisRequest
) -> ProfitabilityAnalysisResponse:
    """Perform profitability analysis."""
    logger.info(f"Profitability analysis for crop={request.crop}")
    
    # Simulate advanced profitability calculations
    base_profit = 45000.0
    market_multiplier = 1.15
    efficiency_bonus = 0.08
    
    estimated_profit = base_profit * market_multiplier * (1 + efficiency_bonus)
    roi_percent = (estimated_profit / (request.landSize * 15000)) * 100
    
    return ProfitabilityAnalysisResponse(
        crop=request.crop,
        landSize=request.landSize,
        estimatedProfit=round(estimated_profit, 2),
        roiPercent=round(roi_percent, 1),
        breakEvenPrice=round(estimated_profit / (request.landSize * 1000), 2),
        recommendations=[
            "Optimize fertilizer usage to reduce input costs by 15%",
            "Consider contract farming for price stability",
            "Implement precision agriculture for better yield"
        ]
    )


@router.post(
    "/risk-assessment",
    response_model=RiskAssessmentResponse,
    status_code=status.HTTP_200_OK,
    summary="Comprehensive risk assessment",
    description="Evaluates climate, market, and operational risks"
)
async def assess_risks(request: RiskAssessmentRequest) -> RiskAssessmentResponse:
    """Perform comprehensive risk assessment."""
    logger.info(f"Risk assessment for location={request.location}")
    
    # Calculate risk scores
    climate_risk = 35.0
    market_risk = 28.0
    operational_risk = 22.0
    overall_risk = (climate_risk + market_risk + operational_risk) / 3
    
    mitigation_strategies = [
        "Diversify crops to reduce market dependency",
        "Invest in crop insurance (PMFBY recommended)",
        "Build water storage capacity for drought resilience",
        "Establish direct buyer relationships to reduce price volatility"
    ]
    
    return RiskAssessmentResponse(
        location=request.location,
        overallRiskScore=round(overall_risk, 1),
        climateRiskScore=round(climate_risk, 1),
        marketRiskScore=round(market_risk, 1),
        operationalRiskScore=round(operational_risk, 1),
        mitigationStrategies=mitigation_strategies,
        riskLevel="Moderate" if overall_risk < 40 else "High"
    )

