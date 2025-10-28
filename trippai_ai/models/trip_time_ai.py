"""High-level interface for travel time prediction with AI explanations."""

import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, Optional

from services.forecast_service import ForecastService
from services.travel_tip_service import TravelTipService
from utils.city_lookup import lookup_city_coordinates
from utils.ai_generator import check_ollama_available, generate_ai_explanation
from utils.score_calculator import calculate_confidence, validate_predictions
from utils.output_formatter import (
    save_prediction_output,
    print_prediction_summary,
    format_date_range_message
)
from config import OLLAMA_MODEL


class TripTimeAI:
    """
    High-level interface for travel time prediction with AI explanations.
    
    This class wraps the ForecastService to provide:
    - Easy-to-use API for any destination
    - Structured JSON output
    - AI-generated explanations
    - Confidence scoring
    
    Usage:
        model = TripTimeAI("Paris", lat=48.8566, lon=2.3522)
        result = model.predict_best_time(
            start_date="2025-01-01",
            end_date="2025-12-31",
            trip_days=7
        )
        print(result["ai_explanation"])
    """
    
    def __init__(
        self,
        destination: str,
        lat: Optional[float] = None,
        lon: Optional[float] = None
    ):
        """
        Initialize the TripTimeAI model for a specific destination.
        
        Args:
            destination: Name of the destination (e.g., "Paris", "Barcelona")
            lat: Latitude of destination (optional, will look up if not provided)
            lon: Longitude of destination (optional, will look up if not provided)
        """
        self.destination = destination
        
        # Get coordinates
        if lat is None or lon is None:
            coords = lookup_city_coordinates(destination)
            self.lat = coords["lat"]
            self.lon = coords["lon"]
        else:
            self.lat = lat
            self.lon = lon
        
        # Initialize services
        self.forecast_service = ForecastService()
        self.travel_tip_service = TravelTipService()
        
        # Check Ollama availability
        self.ollama_available = check_ollama_available()
        
        # Print initialization message
        print(f"✓ TripTimeAI initialized for {destination} ({self.lat}, {self.lon})")
        if self.ollama_available:
            print(f"✓ Ollama is available - using {OLLAMA_MODEL} for AI explanations")
        else:
            print(f"⚠️  Ollama not available - using template-based explanations")
    
    def predict_best_time(
        self,
        start_date: str = None,
        end_date: str = None,
        trip_days: int = 7,
        forecast_weeks: int = 52,
        max_budget: Optional[float] = None,
        save_output: bool = True,
        output_dir: str = "models"
    ) -> Dict:
        """
        Predict the best time to travel to the destination.
        
        Args:
            start_date: Start of historical data period (YYYY-MM-DD).
                       Defaults to 1 year ago.
            end_date: End of historical data period (YYYY-MM-DD).
                     Defaults to 3 days ago.
            trip_days: Length of trip in days (default: 7)
            forecast_weeks: Number of weeks to forecast ahead (default: 52)
            max_budget: Maximum budget constraint - only return periods within budget (optional)
            save_output: Whether to save output as JSON (default: True)
            output_dir: Directory to save output JSON (default: "models")
        
        Returns:
            Dictionary with structured prediction results including AI explanation
        """
        # Parse and validate dates
        start_date_dt, end_date_dt = self._parse_dates(start_date, end_date)
        
        # Print prediction info
        print(f"\n🔮 Predicting best travel time for {self.destination}...")
        format_date_range_message(start_date_dt, end_date_dt, trip_days, max_budget)
        print(f"   Forecasting {forecast_weeks} weeks ahead\n")
        
        # Run forecasting pipeline
        predictions_df, best_window = self.forecast_service.predict_optimal_travel_time(
            destination=self.destination,
            historical_start=start_date_dt,
            historical_end=end_date_dt,
            forecast_weeks=forecast_weeks,
            trip_days=trip_days,
            max_budget=max_budget
        )
        
        # Handle errors (e.g., no periods within budget)
        if "error" in best_window:
            error_msg = best_window["error"]
            if "min_price" in best_window and best_window["min_price"] is not None:
                error_msg += f". Minimum predicted price: ${best_window['min_price']:.2f}"
            raise ValueError(error_msg)
        
        # Calculate confidence and validate predictions
        confidence = calculate_confidence(predictions_df, best_window)
        validated_window = validate_predictions(best_window)
        
        # Generate AI explanations
        ai_explanation = generate_ai_explanation(
            self.destination,
            validated_window,
            confidence,
            self.ollama_available
        )
        
        # Calculate trip dates
        best_date = pd.to_datetime(validated_window["best_week"])
        trip_start = best_date
        trip_end = best_date + timedelta(days=trip_days)
        
        # Generate AI travel tip
        ai_travel_tip = self.travel_tip_service.generate_travel_tip(
            destination=self.destination,
            start_date=trip_start.strftime("%Y-%m-%d"),
            temperature=validated_window["temperature"],
            precipitation=validated_window["precipitation"],
            crowd_level=validated_window["crowd_level"],
            price=validated_window["price"],
            trip_days=trip_days
        )
        
        # Structure output
        output = self._structure_output(
            validated_window,
            trip_start,
            trip_end,
            confidence,
            ai_explanation,
            ai_travel_tip,
            trip_days
        )
        
        # Save and print results
        if save_output:
            save_prediction_output(output, self.destination, output_dir)
        
        print_prediction_summary(output)
        
        return output
    
    def _parse_dates(
        self,
        start_date: Optional[str],
        end_date: Optional[str]
    ) -> tuple[datetime, datetime]:
        """
        Parse and validate date parameters.
        
        Args:
            start_date: Start date string (YYYY-MM-DD) or None
            end_date: End date string (YYYY-MM-DD) or None
        
        Returns:
            Tuple of (start_date_dt, end_date_dt)
        """
        today = datetime.now()
        
        if end_date is None:
            # Use 3 days ago to ensure data availability
            end_date_dt = today - timedelta(days=3)
        else:
            end_date_dt = datetime.strptime(end_date, "%Y-%m-%d")
        
        if start_date is None:
            # Default to 1 year of historical data
            start_date_dt = end_date_dt - timedelta(days=365)
        else:
            start_date_dt = datetime.strptime(start_date, "%Y-%m-%d")
        
        # Validate that historical period doesn't extend into the future
        if end_date_dt > today:
            print(f"⚠️  Warning: Historical end date ({end_date_dt.date()}) is in the future.")
            print(f"   Adjusting to 3 days ago ({(today - timedelta(days=3)).date()}) for reliable data collection.")
            end_date_dt = today - timedelta(days=3)
            if start_date is None:
                start_date_dt = end_date_dt - timedelta(days=365)
        
        return start_date_dt, end_date_dt
    
    def _structure_output(
        self,
        validated_window: Dict,
        trip_start: datetime,
        trip_end: datetime,
        confidence: float,
        ai_explanation: str,
        ai_travel_tip: str,
        trip_days: int
    ) -> Dict:
        """
        Structure the prediction output into a standardized dictionary.
        
        Args:
            validated_window: Validated prediction window
            trip_start: Trip start date
            trip_end: Trip end date
            confidence: Confidence score
            ai_explanation: AI-generated explanation
            ai_travel_tip: AI-generated travel tip
            trip_days: Trip duration in days
        
        Returns:
            Structured output dictionary
        """
        return {
            "destination": self.destination,
            "coordinates": {
                "lat": self.lat,
                "lon": self.lon
            },
            "best_start_date": trip_start.strftime("%Y-%m-%d"),
            "best_end_date": trip_end.strftime("%Y-%m-%d"),
            "predicted_price": round(validated_window["price"], 2),
            "predicted_temp": round(validated_window["temperature"], 1),
            "predicted_precipitation": round(validated_window["precipitation"], 1),
            "predicted_crowd": round(validated_window["crowd_level"], 1),
            "travel_score": round(validated_window["travel_score"], 2),
            "confidence": round(confidence, 2),
            "scores": {
                "price_score": round(validated_window["price_score"], 1),
                "weather_score": round(validated_window["weather_score"], 1),
                "crowd_score": round(validated_window["crowd_score"], 1)
            },
            "ai_explanation": ai_explanation,
            "ai_travel_tip": ai_travel_tip,
            "generated_at": datetime.now().isoformat(),
            "trip_days": trip_days
        }
