# Krishi Mitra Backend API

Backend services for the Krishi Mitra AI farming application. This FastAPI-based backend provides climate simulation and crop recommendation services.

## Features

- 🌾 Climate impact simulation on crop yields
- 📊 Income calculation and forecasting
- 🌱 Alternative crop recommendations
- 🔍 Health check endpoints
- 📝 Comprehensive API documentation
- 🛡️ Input validation and error handling
- 📋 Structured logging

## Project Structure

```
krishi-backend/
├── app/
│   ├── __init__.py
│   ├── config.py              # Configuration management
│   ├── main.py                # Application entry point
│   ├── core/
│   │   └── logging_config.py  # Logging setup
│   ├── models/
│   │   ├── __init__.py
│   │   └── schemas.py         # Pydantic models
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── climate.py        # Climate simulation routes
│   │   └── health.py          # Health check routes
│   ├── services/
│   │   ├── __init__.py
│   │   ├── crop_service.py   # Crop data management
│   │   └── simulation_service.py  # Simulation logic
│   └── middleware/
│       ├── __init__.py
│       └── error_handler.py   # Error handling middleware
├── requirements.txt
├── .env.example
└── README.md
```

## Installation

1. **Create a virtual environment:**
```bash
python -m venv venv
```

2. **Activate the virtual environment:**
   - Windows:
     ```bash
     venv\Scripts\activate
     ```
   - Linux/Mac:
     ```bash
     source venv/bin/activate
     ```

3. **Install dependencies:**
```bash
pip install -r requirements.txt
```

4. **Set up environment variables:**
```bash
cp .env.example .env
# Edit .env with your configuration
```

## Running the Application

### Development Mode
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Production Mode
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

The API will be available at `http://localhost:8000`

## API Documentation

Once the server is running, you can access:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/openapi.json

## API Endpoints

### Health Check
- `GET /health` - Check API health status
- `GET /` - Root endpoint with API information

### Climate Simulation
- `POST /api/climate/simulate` - Simulate climate impact on crops

#### Example Request:
```json
{
  "landSize": 5.0,
  "currentCrop": "wheat",
  "scenario": "-30% Rainfall (Drought)"
}
```

#### Example Response:
```json
{
  "originalExpectedIncome": 187500.0,
  "revisedYieldPercent": 55.0,
  "revisedIncome": 103125.0,
  "alternativeCrops": [
    {
      "name": "Pearl Millet (Bajra)",
      "profitMargin": 35000.0,
      "resistance": "High Drought Resistance",
      "reason": "Requires 50% less water than Wheat and thrives in arid soil."
    }
  ]
}
```

## Supported Crops

- wheat
- rice
- soybean
- sugarcane

## Supported Scenarios

- `-30% Rainfall (Drought)` - Simulates drought conditions
- `+40% Rainfall (Flood Risk)` - Simulates flood conditions

## Configuration

Configuration is managed through environment variables. See `.env.example` for available options.

### Key Settings:

- `APP_NAME`: Application name
- `APP_VERSION`: Application version
- `DEBUG`: Enable debug mode (true/false)
- `HOST`: Server host address
- `PORT`: Server port
- `CORS_ORIGINS`: Allowed CORS origins (comma-separated)
- `LOG_LEVEL`: Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)

## Error Handling

The API provides structured error responses:

```json
{
  "error": "Error message",
  "detail": "Detailed error information",
  "timestamp": "2024-01-01T00:00:00"
}
```

## Logging

Logs are output to stdout with the following format:
```
TIMESTAMP - LOGGER_NAME - LEVEL - MESSAGE
```

Log levels can be configured via the `LOG_LEVEL` environment variable.

## Development

### Code Structure

- **Models**: Pydantic schemas for request/response validation
- **Services**: Business logic and calculations
- **Routers**: API endpoint definitions
- **Middleware**: Error handling and request processing
- **Config**: Application configuration management

### Adding New Features

1. Add new models in `app/models/schemas.py`
2. Implement business logic in `app/services/`
3. Create routes in `app/routers/`
4. Update this README with new endpoints

## Testing

Example test request using curl:

```bash
curl -X POST "http://localhost:8000/api/climate/simulate" \
  -H "Content-Type: application/json" \
  -d '{
    "landSize": 5.0,
    "currentCrop": "wheat",
    "scenario": "-30% Rainfall (Drought)"
  }'
```

## License

This project is part of the Krishi Mitra application.

