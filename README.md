# Krishi Mitra — Crop Rotation AI Backend

A focused FastAPI microservice that uses a scientifically-grounded algorithm to recommend optimal crop rotation sequences.

## Algorithm

The AI engine (`rotation_engine.py`) works in 4 steps:

1. **Soil State Modelling** — Simulates N, P, K nutrient scores and disease pressure after each past crop using agronomic data.
2. **Candidate Scoring** — Scores every candidate crop against the current soil state using 5 weighted factors:
   - Nitrogen benefit/penalty
   - Disease pressure (same botanical family = penalty)
   - Climate scenario (drought/flood tolerance)
   - Profitability estimate
   - Biodiversity bonus (new family introduced)
3. **Hard Exclusion Rules** — Prevents recommending the same family two seasons in a row and penalises repetition.
4. **2-Year Plan** — Picks the top Kharif and top Rabi recommendations, updating soil state between picks.

## Crops Supported (17)

| Crop | Family | Season |
|---|---|---|
| Wheat, Rice, Maize, Sorghum, Pearl Millet, Barley | Cereal | Kharif / Rabi |
| Soybean, Chickpea, Lentil, Pigeon Pea, Groundnut | Legume | Kharif / Rabi |
| Mustard | Crucifer | Rabi |
| Tomato, Potato | Solanaceae | Rabi |
| Cotton | Malvaceae | Kharif |
| Onion | Allium | Rabi |
| Sugarcane, Turmeric | — | Kharif |

## API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/` | Health check |
| POST | `/api/rotation/recommend` | **Main AI recommendation** |
| GET | `/api/crops` | List all supported crops |

### Request Body

```json
{
  "recentSeasons": ["rice", "wheat", "cotton"],
  "farmSize": 2.5,
  "location": "Pune, MH",
  "scenario": "drought"
}
```

## Deployment

Deployed on Render. Uses `render.yaml` for auto-deploy on push to `backend` branch.

```bash
pip install -r requirements.txt
uvicorn main:app --reload
```
