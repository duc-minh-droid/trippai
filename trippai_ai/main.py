"""FastAPI application for TripAI travel prediction service."""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List, AsyncGenerator
from datetime import datetime
import uvicorn
import os
import logging
import json
import asyncio

from models.trip_time_ai import TripTimeAI
from services.booking_service import BookingService
from config import DESTINATIONS, EVENTBRITE_API_KEY
from multi_city_planner import MultiCityPlanner, CityStop
from services.event_service import EventService

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
    max_budget: Optional[float] = Field(None, description="Maximum budget - only return periods where predicted cost is within budget", gt=0)


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
    max_budget: Optional[float] = Field(None, description="Maximum budget - only return periods where total trip cost is within budget", gt=0)


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
    ai_travel_tip: Optional[str] = None
    generated_at: str
    trip_days: int
    data_source: str = Field(default="synthetic", description="'real_api' or 'synthetic'")
    events: Optional[List[Dict[str, Any]]] = Field(default=None, description="Major events happening during trip")
    event_warning: Optional[str] = Field(default=None, description="Warning about events affecting prices/crowds")
    event_suggestions: Optional[List[str]] = Field(default=None, description="Suggested events to attend")


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
            max_budget=request.max_budget,
            save_output=False  # Don't save output for API calls
        )
        
        # Add data source info
        result["data_source"] = "real_api" if request.use_real_prices else "synthetic"
        result["origin_city"] = request.origin_city
        
        # Fetch events for the predicted trip dates
        event_service = EventService(api_key=EVENTBRITE_API_KEY)
        event_data = event_service.get_events_for_trip(
            city=request.destination,
            start_date=result["best_start_date"],
            end_date=result["best_end_date"],
            lat=request.lat,
            lon=request.lon
        )
        
        # Add event data to result
        result["events"] = event_data.get("events", [])
        result["event_warning"] = event_data.get("warning")
        result["event_suggestions"] = event_data.get("suggestions", [])
        
        logger.info(f"Found {len(result['events'])} events during trip dates")
        if result["event_warning"]:
            logger.info(f"Event warning: {result['event_warning']}")
        
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
                
                # Update predicted_price to match real total cost
                result["predicted_price"] = trip_cost["total_cost"]
                result["price_breakdown"] = {
                    "hotel": trip_cost["hotel_cost"],
                    "flight": trip_cost["flight_cost"],
                    "total": trip_cost["total_cost"],
                    "per_person": trip_cost["per_person_cost"]
                }
                result["data_source"] = "real_api"
                logger.info(f"Real price fetched - Hotel: ${trip_cost['hotel_cost']:.2f}, Flight: ${trip_cost['flight_cost']:.2f}, Total: ${trip_cost['total_cost']:.2f}")
                logger.info(f"Updated predicted_price to: ${result['predicted_price']:.2f}")
            except Exception as e:
                logger.error(f"Failed to fetch real prices: {e}")
                result["data_source"] = "synthetic"
        
        logger.info(f"Prediction completed: {result['travel_score']:.1f}/100")
        logger.info(f"Final response - predicted_price: ${result['predicted_price']:.2f}, data_source: {result['data_source']}")
        if "price_breakdown" in result:
            logger.info(f"Price breakdown - hotel: ${result['price_breakdown']['hotel']:.2f}, flight: ${result['price_breakdown']['flight']:.2f}, total: ${result['price_breakdown']['total']:.2f}")
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
            forecast_weeks=request.forecast_weeks,
            max_budget=request.max_budget
        )
        
        logger.info(f"Multi-city trip planned: {result['overall_score']['overall']:.1f}/100 score")
        return result
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Multi-city planning failed: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Planning failed: {str(e)}")


@app.post("/api/multi-city/plan-stream")
async def plan_multi_city_trip_stream(request: MultiCityTripRequest):
    """
    Plan a multi-city trip with real-time streaming updates.
    
    This endpoint streams progress updates as Server-Sent Events (SSE) while
    planning the trip, providing better UX for long-running operations.
    
    Returns:
        StreamingResponse with SSE updates and final result
    """
    async def generate_updates() -> AsyncGenerator[str, None]:
        try:
            logger.info(f"Multi-city trip streaming request: {[c.city for c in request.cities]}")
            
            # Send initial status
            yield f"data: {json.dumps({'type': 'status', 'message': 'Starting trip planning...', 'progress': 0})}\n\n"
            await asyncio.sleep(0.1)
            
            # Convert request cities to CityStop objects
            yield f"data: {json.dumps({'type': 'status', 'message': f'Processing {len(request.cities)} cities...', 'progress': 5})}\n\n"
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
            await asyncio.sleep(0.1)
            
            # Initialize planner
            yield f"data: {json.dumps({'type': 'status', 'message': 'Initializing planner...', 'progress': 10})}\n\n"
            planner = MultiCityPlanner(
                origin_city=request.origin_city,
                use_real_prices=request.use_real_prices
            )
            await asyncio.sleep(0.1)
            
            # Parse start date if provided
            start_date = None
            if request.start_date:
                try:
                    start_date = datetime.strptime(request.start_date, "%Y-%m-%d")
                except ValueError:
                    yield f"data: {json.dumps({'type': 'error', 'message': 'Invalid date format'})}\n\n"
                    return
            
            # Optimize route
            if request.optimize_route and len(city_stops) > 2:
                yield f"data: {json.dumps({'type': 'status', 'message': 'Optimizing route...', 'progress': 15})}\n\n"
                await asyncio.sleep(0.1)
            
            # Validate inputs
            min_total_days = sum(c.min_days for c in city_stops)
            if request.total_days < min_total_days:
                yield f"data: {json.dumps({'type': 'error', 'message': f'Total days ({request.total_days}) less than minimum required ({min_total_days})'})}\n\n"
                return
            
            # Plan with progress updates
            yield f"data: {json.dumps({'type': 'status', 'message': 'Allocating days to each city...', 'progress': 20})}\n\n"
            await asyncio.sleep(0.2)
            
            # Find optimal dates
            if start_date is None:
                yield f"data: {json.dumps({'type': 'status', 'message': 'Finding optimal travel dates...', 'progress': 25})}\n\n"
                await asyncio.sleep(0.2)
            
            # Get predictions for each city
            progress_per_city = 50 / len(city_stops)
            for i, city_stop in enumerate(city_stops):
                progress = 30 + int((i + 1) * progress_per_city)
                yield f"data: {json.dumps({'type': 'status', 'message': f'Analyzing {city_stop.city}...', 'progress': progress, 'current_city': city_stop.city})}\n\n"
                await asyncio.sleep(0.3)
            
            # Calculate costs
            yield f"data: {json.dumps({'type': 'status', 'message': 'Calculating trip costs...', 'progress': 85})}\n\n"
            await asyncio.sleep(0.2)
            
            # Generate final result
            yield f"data: {json.dumps({'type': 'status', 'message': 'Finalizing itinerary...', 'progress': 90})}\n\n"
            await asyncio.sleep(0.1)
            
            # Actually plan the trip (this is the heavy operation)
            result = planner.plan_trip(
                cities=city_stops,
                total_days=request.total_days,
                start_date=start_date,
                optimize_route=request.optimize_route,
                forecast_weeks=request.forecast_weeks,
                max_budget=request.max_budget
            )
            
            # Send complete result
            yield f"data: {json.dumps({'type': 'complete', 'message': 'Trip planning complete!', 'progress': 100, 'result': result})}\n\n"
            
            logger.info(f"Multi-city trip planned (streamed): {result['overall_score']['overall']:.1f}/100 score")
            
        except ValueError as e:
            yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"
        except Exception as e:
            logger.error(f"Multi-city planning failed: {str(e)}", exc_info=True)
            yield f"data: {json.dumps({'type': 'error', 'message': f'Planning failed: {str(e)}'})}\n\n"
    
    return StreamingResponse(
        generate_updates(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )


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
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
