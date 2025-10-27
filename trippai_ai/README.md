# TripAI API# TripAI - Optimal Travel Time Predictor

AI-powered travel time prediction service using FastAPI.A machine learning model that predicts the best time to travel to a destination based on weather, price, and crowd levels using advanced time-series forecasting with AI-powered explanations.

## Installation## Features

Install dependencies:- **Weather Analysis**: Uses Open-Meteo API to fetch real weather data and calculate comfort scores

````bash- **Price Prediction**: Generates synthetic flight/hotel prices with realistic seasonal patterns

pip install -r requirements.txt- **Crowd Estimation**: Uses Google Trends as a proxy for tourist demand

```- **TravelScore**: Combines all factors into a single score to identify optimal travel times

- **Prophet Forecasting**: Uses Facebook Prophet for advanced time-series forecasting up to 1 year ahead

## Running the API- **AI Explanations**: Generates natural language explanations using OpenAI GPT-4o-mini

- **Structured JSON Output**: Outputs predictions in a structured format ready for backend integration

Start the FastAPI server:- **Confidence Scoring**: Provides confidence metrics for predictions

```bash

python main.py## Installation

````

````bash

Or use uvicorn directly:pip install -r requirements.txt

```bash```

uvicorn main:app --reload --host 0.0.0.0 --port 8000

```### Setup OpenAI API (Optional but Recommended)



The API will be available at `http://localhost:8000`1. Copy `.env.example` to `.env`:



## API Endpoints   ```bash

   cp .env.example .env

### GET /   ```

Welcome message and API information

2. Add your OpenAI API key to `.env`:

### GET /health

Health check endpoint   ```

   OPENAI_API_KEY=your_openai_api_key_here

### POST /api/predict   ```

Predict the best time to travel to a destination

   Get your API key from: https://platform.openai.com/api-keys

**Request Body:**

```json**Note**: If you don't provide an OpenAI API key, the model will still work but will use template-based explanations instead of AI-generated ones.

{

  "destination": "Paris",## Quick Start

  "lat": 48.8566,

  "lon": 2.3522,### Using TripTimeAI (Recommended - New!)

  "start_date": "2024-01-01",

  "end_date": "2024-12-31",The `TripTimeAI` class provides the easiest way to get predictions with AI explanations:

  "trip_days": 7,

  "forecast_weeks": 52```python

}from travel_model import TripTimeAI

````

# Initialize for a destination (coordinates looked up automatically)

**Response:**model = TripTimeAI("Paris")

````json

{# Get prediction with AI explanation

  "destination": "Paris",result = model.predict_best_time(

  "coordinates": {"lat": 48.8566, "lon": 2.3522},    trip_days=7,

  "best_start_date": "2025-05-15",    forecast_weeks=52,

  "best_end_date": "2025-05-22",    save_output=True  # Saves JSON to models/output_paris.json

  "predicted_price": 450.00,)

  "predicted_temp": 18.5,

  "predicted_precipitation": 25.0,# Access results

  "predicted_crowd": 45.0,print(result["best_start_date"])  # "2025-03-24"

  "travel_score": 85.5,print(result["predicted_price"])  # 280.50

  "confidence": 0.82,print(result["travel_score"])     # 88.5

  "scores": {print(result["ai_explanation"])   # AI-generated explanation

    "price_score": 75.0,```

    "weather_score": 90.0,

    "crowd_score": 88.0### Example Output Structure

  },

  "ai_explanation": "May offers excellent value...",```json

  "generated_at": "2025-10-27T12:00:00",{

  "trip_days": 7  "destination": "Paris",

}  "coordinates": { "lat": 48.8566, "lon": 2.3522 },

```  "best_start_date": "2025-03-24",

  "best_end_date": "2025-03-31",

## API Documentation  "predicted_price": 280.5,

  "predicted_temp": 17.2,

Interactive API documentation is available at:  "predicted_precipitation": 3.5,

- Swagger UI: `http://localhost:8000/docs`  "predicted_crowd": 55.0,

- ReDoc: `http://localhost:8000/redoc`  "travel_score": 88.5,

  "confidence": 0.84,

## Example Usage  "scores": {

    "price_score": 85.3,

Using curl:    "weather_score": 78.5,

```bash    "crowd_score": 92.1

curl -X POST "http://localhost:8000/api/predict" \  },

  -H "Content-Type: application/json" \  "ai_explanation": "Late March offers a perfect balance — flight prices are about 20% below average, temperatures hover around 17°C, and tourist interest remains moderate before peak season. It's the ideal window for comfort and cost savings.",

  -d '{  "generated_at": "2025-10-27T10:30:00",

    "destination": "Barcelona",  "trip_days": 7

    "trip_days": 7,}

    "forecast_weeks": 52```

  }'

```### Custom Coordinates



Using Python requests:```python

```python# Provide custom coordinates

import requestsmodel = TripTimeAI("Barcelona", lat=41.3874, lon=2.1686)

result = model.predict_best_time(trip_days=10)

response = requests.post(```

    "http://localhost:8000/api/predict",

    json={## Usage

        "destination": "Barcelona",

        "trip_days": 7,### Basic Example

        "forecast_weeks": 52

    }```python

)from datetime import datetime, timedelta

from travel_model import TravelModel

result = response.json()

print(f"Best travel date: {result['best_start_date']}")# Initialize the model

print(f"Travel score: {result['travel_score']}")model = TravelModel()

````

# Find the best week to visit Paris in the next 6 months

start_date = datetime.now()
end_date = start_date + timedelta(days=180)

best_week = model.get_best_travel_week("Paris", start_date, end_date)
print(f"Best week: {best_week['best_week_start']}")
print(f"TravelScore: {best_week['travel_score']}/100")

````

### Get Top N Weeks

```python
# Get the top 5 best weeks to travel
top_weeks = model.get_top_n_weeks("Tokyo", start_date, end_date, n=5)
print(top_weeks)
````

### Detailed Predictions

```python
# Get detailed weekly predictions
predictions = model.predict("Barcelona", start_date, end_date, granularity="weekly")
print(predictions)
```

## How It Works

### 1. Weather Service (`weather_service.py`)

- Fetches real weather data from Open-Meteo API
- Calculates weather comfort score based on:
  - Temperature (ideal: 22°C)
  - Precipitation
  - Cloud cover
  - Wind speed

### 2. Price Service (`price_service.py`)

- Generates synthetic flight/hotel prices using:
  - Seasonal patterns (sine wave)
  - Holiday spikes (Christmas, New Year, Summer)
  - Weekend premiums
  - Random noise for realism

### 3. Crowd Service (`crowd_service.py`)

- Uses Google Trends API to get search interest as a proxy for tourist demand
- Falls back to synthetic data if API fails
- Normalizes crowd levels to 0-100 scale

### 4. Travel Model (`travel_model.py`)

- Combines all three factors into a TravelScore
- Default weights:
  - Price: 40%
  - Weather: 35%
  - Crowd: 25%
- Returns ranked list of best travel times

## TravelScore Calculation

```
TravelScore = 0.4 × PriceScore + 0.35 × WeatherComfort + 0.25 × CrowdScore
```

Where:

- **PriceScore**: Lower price = higher score (inverted normalization)
- **WeatherComfort**: Based on ideal conditions
- **CrowdScore**: Lower crowds = higher score (inverted normalization)

## Configuration

Edit `config.py` to customize:

- Weather comfort weights
- Ideal temperature preferences
- TravelScore weights
- API endpoints

## Supported Destinations

Currently supports major cities with predefined coordinates:

- Paris, Tokyo, New York, London, Barcelona
- Bali, Dubai, Sydney, Rome, Bangkok

Add more destinations by updating the `get_coordinates()` method in `weather_service.py`.

## Example Output

```
Best week to visit Paris:
  Week starting: 2025-05-12
  TravelScore: 78.5/100
  Weather Comfort: 85.2/100
  Average Temperature: 18.5°C
  Average Price: $325.50
  Price Score: 72.3/100 (higher = cheaper)
  Crowd Level: 45.2/100
  Crowd Score: 54.8/100 (higher = less crowded)
```

## Running Examples

### TripTimeAI Demo (New! - Recommended)

```bash
python trip_time_ai_demo.py
```

This demonstrates:

- Basic usage with automatic coordinate lookup
- Custom coordinates and date ranges
- AI-generated explanations
- Structured JSON output
- Multi-destination comparison

### Basic Model (Legacy)

```bash
python simple_test.py
```

### Prophet Forecasting Model (Advanced - Legacy)

```bash
python prophet_demo.py
```

This demonstrates the advanced forecasting pipeline using Facebook Prophet for 52-week predictions.

## Prophet Forecasting Model

The `forecast_model.py` implements an advanced time-series forecasting approach:

### Pipeline Steps

1. **Data Preparation & Merging**

   - Fetches weather, price, and crowd data
   - Aligns all data sources on date
   - Aggregates to weekly averages using pandas resample

2. **Prophet Model Training**

   - Trains separate Prophet models for:
     - Flight/hotel prices
     - Temperature
     - Precipitation
     - Crowd levels
   - Each model learns yearly seasonality patterns
   - Forecasts up to 52 weeks ahead

3. **Scoring Metrics**

   - Normalizes all predictions to 0-100 scale
   - Price score: Lower prices get higher scores
   - Weather score: Based on ideal temperature (22°C) with precipitation penalty
   - Crowd score: Lower crowds get higher scores

4. **Optimal Window Detection**
   - Computes TravelScore: `0.4×price + 0.3×weather + 0.3×crowd`
   - Uses rolling average to account for trip length
   - Identifies best week considering user's travel duration

### Usage Example

```python
from forecast_model import ForecastModel
from datetime import datetime

model = ForecastModel()

# Full pipeline
predictions, best_window = model.predict_optimal_travel_time(
    destination="Barcelona",
    historical_start=datetime(2025, 1, 1),
    historical_end=datetime(2025, 10, 27),
    forecast_weeks=52,
    trip_days=7
)

print(f"Best week: {best_window['best_week']}")
print(f"Score: {best_window['travel_score']}/100")
```

### Step-by-Step Access

You can also access individual pipeline steps:

```python
# Step 1: Prepare weekly data
df_weekly = model.prepare_data(destination, start_date, end_date)

# Step 2: Train models and forecast
forecast_df, models = model.train_forecast_models(df_weekly, forecast_weeks=52)

# Step 3: Calculate scores
scored_df = model.calculate_travel_scores(forecast_df)

# Step 4: Find best window
predictions, best_window = model.find_best_travel_window(scored_df, trip_days=7)
```

## Notes

- Weather data requires internet connection (Open-Meteo API)
- Google Trends data may have rate limits or require user authentication
- Price data is synthetic but follows realistic seasonal patterns
- Prophet requires historical data to train; minimum 2 months recommended
- For production use, replace synthetic prices with real API data from flight/hotel booking services

## AI Explanations (Step 7)

The `TripTimeAI` class uses OpenAI's GPT-4o-mini to generate natural language explanations for predictions:

```python
# AI generates contextual explanations like:
"Late March offers a perfect balance — flight prices are about 20%
below average, temperatures hover around 17°C, and tourist interest
remains moderate before peak season."
```

**How it works:**

1. Constructs a prompt with destination, dates, prices, weather, and crowd data
2. Sends to OpenAI API (gpt-4o-mini model)
3. Returns a 2-3 sentence explanation focused on the balance of factors
4. Falls back to template-based explanations if API is unavailable

## Structured JSON Output (Step 8)

All predictions are saved to `models/output_{destination}.json` with this structure:

```json
{
  "destination": "string",
  "coordinates": {"lat": float, "lon": float},
  "best_start_date": "YYYY-MM-DD",
  "best_end_date": "YYYY-MM-DD",
  "predicted_price": float,
  "predicted_temp": float,
  "predicted_precipitation": float,
  "predicted_crowd": float,
  "travel_score": float,
  "confidence": float,
  "scores": {
    "price_score": float,
    "weather_score": float,
    "crowd_score": float
  },
  "ai_explanation": "string",
  "generated_at": "ISO-8601 timestamp",
  "trip_days": int
}
```

This JSON format is ready for backend API integration.

## Backend Integration

To integrate with your backend (e.g., Next.js app):

1. **As a Python service:**

   ```python
   from travel_model import TripTimeAI

   def get_prediction(destination: str, trip_days: int):
       model = TripTimeAI(destination)
       return model.predict_best_time(trip_days=trip_days)
   ```

2. **As a REST API** (using Flask/FastAPI):

   ```python
   from flask import Flask, jsonify
   from travel_model import TripTimeAI

   app = Flask(__name__)

   @app.route('/predict/<destination>')
   def predict(destination):
       model = TripTimeAI(destination)
       result = model.predict_best_time(save_output=False)
       return jsonify(result)
   ```

3. **Pre-compute and serve JSON:**
   - Run predictions for common destinations
   - Save JSON files to `models/` directory
   - Serve static JSON files from your backend

## Adding New Destinations

Add destinations to `config.py`:

```python
CITY_COORDINATES = {
    "your_city": {"lat": 40.7128, "lon": -74.0060},
    # ... more cities
}
```

Or provide coordinates directly:

```python
model = TripTimeAI("Your City", lat=40.7128, lon=-74.0060)
```
