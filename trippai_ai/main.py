"""FastAPI application for TripAI travel prediction service."""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime
import uvicorn
import os
import logging

from travel_model import TripTimeAI
from booking_service import BookingService
from config import DESTINATIONS
from multi_city_planner import MultiCityPlanner, CityStop

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="TripAI API",
    description="AI-powered travel time prediction service with real flight and hotel pricing",
    version="2.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class TravelPredictionRequest(BaseModel):
    """Request model for travel prediction."""
    destination: str = Field(..., description="Destination city name (e.g., 'Paris', 'Barcelona')")
    lat: Optional[float] = Field(None, description="Latitude of destination (optional)")
    lon: Optional[float] = Field(None, description="Longitude of destination (optional)")
    origin_city: Optional[str] = Field("London", description="Origin city for flights")
    start_date: Optional[str] = Field(None, description="Historical data start date (YYYY-MM-DD)")
    end_date: Optional[str] = Field(None, description="Historical data end date (YYYY-MM-DD)")
    trip_days: int = Field(7, description="Length of trip in days", ge=1, le=30)
    forecast_weeks: int = Field(52, description="Number of weeks to forecast ahead", ge=1, le=104)
    use_real_prices: bool = Field(False, description="Use real API prices (requires RAPIDAPI_KEY)")


class CityStopRequest(BaseModel):
    """Request model for a city stop in multi-city trip."""
    city: str = Field(..., description="City name")
    lat: Optional[float] = Field(None, description="Latitude (optional)")
    lon: Optional[float] = Field(None, description="Longitude (optional)")
    min_days: int = Field(2, description="Minimum days in this city", ge=1)
    max_days: int = Field(7, description="Maximum days in this city", ge=1)
    preferred_days: Optional[int] = Field(None, description="Preferred days (optional)")


class MultiCityTripRequest(BaseModel):
    """Request model for multi-city trip planning."""
    cities: List[CityStopRequest] = Field(..., description="List of cities to visit", min_items=2)
    total_days: int = Field(..., description="Total trip duration in days", ge=3, le=60)
    origin_city: str = Field("London", description="Starting city")
    start_date: Optional[str] = Field(None, description="Preferred start date (YYYY-MM-DD), None for optimal")
    optimize_route: bool = Field(True, description="Automatically optimize city order")
    forecast_weeks: int = Field(52, description="Weeks to forecast for date optimization", ge=1, le=104)
    use_real_prices: bool = Field(False, description="Use real API prices")


class MultiCityTripResponse(BaseModel):
    """Response model for multi-city trip planning."""
    origin_city: str
    cities: List[str]
    total_days: int
    start_date: str
    end_date: str
    route_optimized: bool
    itinerary: List[Dict[str, Any]]
    cost_breakdown: Dict[str, Any]
    overall_score: Dict[str, float]
    summary: str
    generated_at: str


class PriceBreakdown(BaseModel):
    """Price breakdown details."""
    hotel: float = Field(0, description="Hotel cost")
    flight: float = Field(0, description="Flight cost")
    total: float = Field(0, description="Total trip cost")
    per_person: float = Field(0, description="Cost per person")


class TravelPredictionResponse(BaseModel):
    """Response model for travel prediction."""
    destination: str
    coordinates: Dict[str, float]
    origin_city: Optional[str] = None
    best_start_date: str
    best_end_date: str
    predicted_price: float
    price_breakdown: Optional[PriceBreakdown] = None
    predicted_temp: float
    predicted_precipitation: float
    predicted_crowd: float
    travel_score: float
    confidence: float
    scores: Dict[str, float]
    ai_explanation: str
    generated_at: str
    trip_days: int
    data_source: str = Field(default="synthetic", description="'real_api' or 'synthetic'")


@app.get("/")
async def root():
    """Root endpoint with API information."""
    rapidapi_key = os.getenv("RAPIDAPI_KEY")
    
    return {
        "message": "Welcome to TripAI API v2.0",
        "description": "AI-powered travel predictions with real pricing data",
        "version": "2.0.0",
        "real_prices_available": bool(rapidapi_key),
        "endpoints": {
            "predict": "/api/predict",
            "destinations": "/api/destinations",
            "prices": "/api/destination/{name}/prices",
            "multi_city_plan": "/api/multi-city/plan",
            "multi_city_example": "/api/multi-city/example",
            "health": "/health",
            "docs": "/docs"
        },
        "features": {
            "single_city": "Predict optimal travel time for one destination",
            "multi_city": "Plan complex trips across multiple cities with route optimization",
            "real_pricing": "Get real-time hotel and flight prices (with API key)"
        }
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    rapidapi_key = os.getenv("RAPIDAPI_KEY")
    
    return {
        "status": "healthy",
        "version": "2.0.0",
        "rapidapi_configured": bool(rapidapi_key),
        "timestamp": datetime.now().isoformat()
    }


@app.get("/api/destinations")
async def get_destinations():
    """Get list of supported destinations."""
    return {
        "destinations": DESTINATIONS,
        "count": len(DESTINATIONS)
    }


@app.post("/api/predict", response_model=TravelPredictionResponse)
async def predict_best_travel_time(request: TravelPredictionRequest):
    """
    Predict the best time to travel to a destination.
    
    This endpoint uses AI and historical data to predict optimal travel times
    based on weather, price, and crowd factors.
    
    Supports both synthetic and real pricing data from Booking.com API.
    Set use_real_prices=true and configure RAPIDAPI_KEY for real prices.
    
    Args:
        request: TravelPredictionRequest with destination and parameters
    
    Returns:
        TravelPredictionResponse with prediction results
    
    Raises:
        HTTPException: If prediction fails or destination is invalid
    """
    try:
        logger.info(f"Prediction request for {request.destination} (real_prices={request.use_real_prices})")
        
        # Check if real prices requested but API key not configured
        if request.use_real_prices and not os.getenv("RAPIDAPI_KEY"):
            logger.warning("Real prices requested but RAPIDAPI_KEY not configured, using synthetic data")
            request.use_real_prices = False
        
        # Initialize the model
        model = TripTimeAI(
            destination=request.destination,
            lat=request.lat,
            lon=request.lon
        )
        
        # Make prediction
        result = model.predict_best_time(
            start_date=request.start_date,
            end_date=request.end_date,
            trip_days=request.trip_days,
            forecast_weeks=request.forecast_weeks,
            save_output=False  # Don't save output for API calls
        )
        
        # Add data source info
        result["data_source"] = "real_api" if request.use_real_prices else "synthetic"
        result["origin_city"] = request.origin_city
        
        # If real prices requested, try to get actual price breakdown
        if request.use_real_prices:
            try:
                booking_service = BookingService()
                trip_cost = booking_service.get_total_trip_cost(
                    destination=request.destination,
                    origin_city=request.origin_city,
                    check_in=result["best_start_date"],
                    check_out=result["best_end_date"],
                    adults=2
                )
                
                result["predicted_price"] = trip_cost["total_cost"]
                result["price_breakdown"] = {
                    "hotel": trip_cost["hotel_cost"],
                    "flight": trip_cost["flight_cost"],
                    "total": trip_cost["total_cost"],
                    "per_person": trip_cost["per_person_cost"]
                }
                result["data_source"] = "real_api"
                logger.info(f"Real price fetched: ${trip_cost['total_cost']:.2f}")
            except Exception as e:
                logger.error(f"Failed to fetch real prices: {e}")
                result["data_source"] = "synthetic"
        
        logger.info(f"Prediction completed: {result['travel_score']:.1f}/100")
        return result
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Prediction failed: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


@app.get("/api/destination/{destination_name}/prices")
async def get_destination_prices(
    destination_name: str,
    check_in: str,
    check_out: str,
    origin_city: str = "London"
):
    """
    Get current hotel and flight prices for specific dates.
    Useful for real-time price checking.
    
    Requires RAPIDAPI_KEY to be configured.
    """
    try:
        if not os.getenv("RAPIDAPI_KEY"):
            raise HTTPException(
                status_code=503,
                detail="Real pricing requires RAPIDAPI_KEY to be configured"
            )
        
        booking_service = BookingService()
        
        trip_cost = booking_service.get_total_trip_cost(
            destination=destination_name,
            origin_city=origin_city,
            check_in=check_in,
            check_out=check_out,
            adults=2
        )
        
        return {
            "destination": destination_name,
            "origin": origin_city,
            "check_in": check_in,
            "check_out": check_out,
            "pricing": trip_cost,
            "timestamp": datetime.now().isoformat()
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Price lookup failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/multi-city/plan", response_model=MultiCityTripResponse)
async def plan_multi_city_trip(request: MultiCityTripRequest):
    """
    Plan a complex multi-city trip with optimal routing and timing.
    
    This endpoint allows planning trips across multiple cities with:
    - Automatic route optimization to minimize travel distance
    - Flexible day allocation per city based on preferences
    - Optimal start date detection using AI predictions
    - Complete cost breakdown including inter-city travel
    - Overall trip scoring
    
    Args:
        request: MultiCityTripRequest with cities, dates, and preferences
    
    Returns:
        MultiCityTripResponse with complete itinerary and recommendations
    
    Raises:
        HTTPException: If planning fails or input is invalid
    """
    try:
        logger.info(f"Multi-city trip request: {[c.city for c in request.cities]}")
        
        # Convert request cities to CityStop objects
        city_stops = []
        for city_req in request.cities:
            stop = CityStop(
                city=city_req.city,
                lat=city_req.lat,
                lon=city_req.lon,
                min_days=city_req.min_days,
                max_days=city_req.max_days,
                preferred_days=city_req.preferred_days
            )
            city_stops.append(stop)
        
        # Initialize planner
        planner = MultiCityPlanner(
            origin_city=request.origin_city,
            use_real_prices=request.use_real_prices
        )
        
        # Parse start date if provided
        start_date = None
        if request.start_date:
            try:
                start_date = datetime.strptime(request.start_date, "%Y-%m-%d")
            except ValueError:
                raise HTTPException(
                    status_code=400,
                    detail="Invalid start_date format. Use YYYY-MM-DD"
                )
        
        # Plan the trip
        result = planner.plan_trip(
            cities=city_stops,
            total_days=request.total_days,
            start_date=start_date,
            optimize_route=request.optimize_route,
            forecast_weeks=request.forecast_weeks
        )
        
        logger.info(f"Multi-city trip planned: {result['overall_score']['overall']:.1f}/100 score")
        return result
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Multi-city planning failed: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Planning failed: {str(e)}")


@app.get("/api/multi-city/example")
async def get_multi_city_example():
    """
    Get an example multi-city trip request for testing.
    """
    return {
        "description": "Example multi-city trip through Europe",
        "example_request": {
            "cities": [
                {
                    "city": "Paris",
                    "min_days": 3,
                    "max_days": 5,
                    "preferred_days": 4
                },
                {
                    "city": "Barcelona",
                    "min_days": 3,
                    "max_days": 6,
                    "preferred_days": 4
                },
                {
                    "city": "Rome",
                    "min_days": 2,
                    "max_days": 5,
                    "preferred_days": 3
                }
            ],
            "total_days": 12,
            "origin_city": "London",
            "start_date": None,
            "optimize_route": True,
            "forecast_weeks": 52,
            "use_real_prices": False
        }
    }


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
