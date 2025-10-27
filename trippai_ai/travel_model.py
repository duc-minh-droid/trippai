"""Main TripAI model for predicting optimal travel times."""

import json
import os
import requests
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, Optional

from weather_service import WeatherService
from price_service import PriceService
from crowd_service import CrowdService
from forecast_model import ForecastModel
from config import TRAVEL_SCORE_WEIGHTS, OLLAMA_MODEL, OLLAMA_API_URL, CITY_COORDINATES


class TravelModel:
    """
    Main model for predicting optimal travel times.
    
    Given a destination and time range, predicts for each week:
    - Average flight/hotel price
    - Weather comfort
    - Crowd level
    
    Then computes a TravelScore and picks the best week for travel.
    """
    
    def __init__(self):
        """Initialize all services."""
        self.weather_service = WeatherService()
        self.price_service = PriceService()
        self.crowd_service = CrowdService()
    
    def predict(
        self, 
        destination: str, 
        start_date: datetime, 
        end_date: datetime,
        granularity: str = "weekly"
    ) -> pd.DataFrame:
        """
        Predict optimal travel times for a destination.
        
        Args:
            destination: Destination name (e.g., "Paris", "Tokyo")
            start_date: Start of the date range
            end_date: End of the date range
            granularity: "daily" or "weekly" predictions
        
        Returns:
            DataFrame with predictions and TravelScore for each period
        """
        print(f"Analyzing travel to {destination} from {start_date.date()} to {end_date.date()}...")
        
        # Fetch weather data
        print("Fetching weather data...")
        weather_df = self.weather_service.get_weather_for_destination(
            destination, start_date, end_date
        )
        
        # Generate price data
        print("Generating price data...")
        price_df = self.price_service.generate_price_data(start_date, end_date)
        price_df = self.price_service.normalize_price_score(price_df)
        
        # Fetch crowd data
        print("Fetching crowd data...")
        crowd_df = self.crowd_service.get_search_interest(destination, start_date, end_date)
        crowd_df = self.crowd_service.normalize_crowd_score(crowd_df)
        
        # Merge all data
        df = self._merge_data(weather_df, price_df, crowd_df)
        
        # Aggregate by granularity
        if granularity == "weekly":
            df = self._aggregate_weekly(df)
        
        # Calculate TravelScore
        df = self._calculate_travel_score(df)
        
        # Sort by TravelScore (best first)
        df = df.sort_values("travel_score", ascending=False).reset_index(drop=True)
        
        return df
    
    def _merge_data(
        self, 
        weather_df: pd.DataFrame, 
        price_df: pd.DataFrame, 
        crowd_df: pd.DataFrame
    ) -> pd.DataFrame:
        """Merge weather, price, and crowd data on date."""
        # Check if weather_df is empty
        if weather_df.empty:
            raise ValueError("Weather data is empty. Cannot proceed with prediction.")
        
        # Start with weather data
        df = weather_df[["date", "temp_avg", "precipitation", "weather_comfort"]].copy()
        
        # Merge price data
        df = df.merge(
            price_df[["date", "avg_price", "price_score"]], 
            on="date", 
            how="left"
        )
        
        # Merge crowd data
        df = df.merge(
            crowd_df[["date", "crowd_level", "crowd_score"]], 
            on="date", 
            how="left"
        )
        
        # Fill any missing values with forward fill then backward fill
        df = df.ffill().bfill()
        
        return df
    
    def _aggregate_weekly(self, daily_df: pd.DataFrame) -> pd.DataFrame:
        """Aggregate daily data to weekly averages."""
        df = daily_df.copy()
        
        # Add week_start column
        df["week_start"] = df["date"] - pd.to_timedelta(df["date"].dt.dayofweek, unit="d")
        
        # Aggregate by week
        weekly_df = df.groupby("week_start").agg({
            "temp_avg": "mean",
            "precipitation": "sum",
            "weather_comfort": "mean",
            "avg_price": "mean",
            "price_score": "mean",
            "crowd_level": "mean",
            "crowd_score": "mean"
        }).reset_index()
        
        # Rename week_start to date for consistency
        weekly_df = weekly_df.rename(columns={"week_start": "date"})
        
        return weekly_df
    
    def _calculate_travel_score(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Calculate overall TravelScore based on weather, price, and crowd scores.
        
        TravelScore is a weighted average where:
        - Higher weather comfort = better
        - Lower price = better (already inverted in price_score)
        - Lower crowd = better (already inverted in crowd_score)
        """
        result_df = df.copy()
        
        weights = TRAVEL_SCORE_WEIGHTS
        
        result_df["travel_score"] = (
            weights["weather"] * result_df["weather_comfort"] +
            weights["price"] * result_df["price_score"] +
            weights["crowd"] * result_df["crowd_score"]
        )
        
        return result_df
    
    def get_best_travel_week(
        self, 
        destination: str, 
        start_date: datetime, 
        end_date: datetime
    ) -> Dict:
        """
        Find the single best week to travel to a destination.
        
        Returns:
            Dictionary with the best week's information
        """
        predictions = self.predict(destination, start_date, end_date, granularity="weekly")
        
        if predictions.empty:
            return {
                "error": "No data available for the specified date range"
            }
        
        best_week = predictions.iloc[0]
        
        return {
            "destination": destination,
            "best_week_start": best_week["date"],
            "travel_score": round(best_week["travel_score"], 2),
            "weather_comfort": round(best_week["weather_comfort"], 2),
            "avg_temperature": round(best_week["temp_avg"], 1),
            "avg_price": round(best_week["avg_price"], 2),
            "price_score": round(best_week["price_score"], 2),
            "crowd_level": round(best_week["crowd_level"], 2),
            "crowd_score": round(best_week["crowd_score"], 2)
        }
    
    def get_top_n_weeks(
        self, 
        destination: str, 
        start_date: datetime, 
        end_date: datetime,
        n: int = 5
    ) -> pd.DataFrame:
        """
        Get the top N best weeks to travel.
        
        Args:
            destination: Destination name
            start_date: Start of date range
            end_date: End of date range
            n: Number of top weeks to return
        
        Returns:
            DataFrame with top N weeks sorted by TravelScore
        """
        predictions = self.predict(destination, start_date, end_date, granularity="weekly")
        
        return predictions.head(n)


class TripTimeAI:
    """
    High-level interface for travel time prediction with AI explanations.
    
    This class wraps the ForecastModel to provide:
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
        
        # Try to get coordinates from city database if not provided
        if lat is None or lon is None:
            coords = self._lookup_coordinates(destination)
            self.lat = coords["lat"]
            self.lon = coords["lon"]
        else:
            self.lat = lat
            self.lon = lon
        
        # Initialize forecast model
        self.forecast_model = ForecastModel()
        
        # Check if Ollama is available
        self.ollama_available = self._check_ollama_available()
        
        print(f"✓ TripTimeAI initialized for {destination} ({self.lat}, {self.lon})")
        if self.ollama_available:
            print(f"✓ Ollama is available - using {OLLAMA_MODEL} for AI explanations")
        else:
            print(f"⚠️  Ollama not available - using template-based explanations")
    
    def _check_ollama_available(self) -> bool:
        """Check if Ollama is running and available."""
        try:
            response = requests.post(
                OLLAMA_API_URL,
                json={"model": OLLAMA_MODEL, "prompt": "test", "stream": False},
                timeout=5
            )
            return response.status_code == 200
        except Exception:
            return False
        
        print(f"✓ TripTimeAI initialized for {destination} ({self.lat}, {self.lon})")
    
    def _lookup_coordinates(self, destination: str) -> Dict[str, float]:
        """Look up coordinates from the city database."""
        city_key = destination.lower()
        if city_key in CITY_COORDINATES:
            return CITY_COORDINATES[city_key]
        else:
            raise ValueError(
                f"Coordinates not found for '{destination}'. "
                f"Please provide lat/lon manually or add to CITY_COORDINATES in config.py"
            )
    
    def predict_best_time(
        self,
        start_date: str = None,
        end_date: str = None,
        trip_days: int = 7,
        forecast_weeks: int = 52,
        save_output: bool = True,
        output_dir: str = "models"
    ) -> Dict:
        """
        Predict the best time to travel to the destination.
        
        Args:
            start_date: Start of historical data period (YYYY-MM-DD).
                       Defaults to 1 year ago.
            end_date: End of historical data period (YYYY-MM-DD).
                     Defaults to today.
            trip_days: Length of trip in days (default: 7)
            forecast_weeks: Number of weeks to forecast ahead (default: 52)
            save_output: Whether to save output as JSON (default: True)
            output_dir: Directory to save output JSON (default: "models")
        
        Returns:
            Dictionary with structured prediction results including AI explanation
        """
        # Set default dates if not provided
        # For historical training data, we need actual past data
        # End date should be "today" (or a few days ago to allow for API data availability)
        # Start date should be 1 year before that
        today = datetime.now()
        
        if end_date is None:
            # Use a few days ago as the end of historical data to ensure data is available
            # This accounts for API data lag (Archive API needs ~5 days, Trends needs ~2 days)
            end_date_dt = today - timedelta(days=3)
        else:
            end_date_dt = datetime.strptime(end_date, "%Y-%m-%d")
        
        if start_date is None:
            # Default to 1 year of historical data before end_date
            start_date_dt = end_date_dt - timedelta(days=365)
        else:
            start_date_dt = datetime.strptime(start_date, "%Y-%m-%d")
        
        # Validate that we're not requesting future dates for historical data
        # The historical period should end at most "today"
        if end_date_dt > today:
            print(f"⚠️  Warning: Historical end date ({end_date_dt.date()}) is in the future.")
            print(f"   Adjusting to 3 days ago ({(today - timedelta(days=3)).date()}) for reliable data collection.")
            end_date_dt = today - timedelta(days=3)
            # Adjust start date if needed
            if start_date is None:
                start_date_dt = end_date_dt - timedelta(days=365)
        
        print(f"\n🔮 Predicting best travel time for {self.destination}...")
        print(f"   Historical period: {start_date_dt.date()} to {end_date_dt.date()}")
        print(f"   Forecasting {forecast_weeks} weeks ahead")
        print(f"   Trip duration: {trip_days} days\n")
        
        # Run the forecasting pipeline
        predictions_df, best_window = self.forecast_model.predict_optimal_travel_time(
            destination=self.destination,
            historical_start=start_date_dt,
            historical_end=end_date_dt,
            forecast_weeks=forecast_weeks,
            trip_days=trip_days
        )
        
        # Calculate confidence score based on variance
        confidence = self._calculate_confidence(predictions_df, best_window)
        
        # Generate AI explanation
        ai_explanation = self._generate_ai_explanation(best_window, confidence)
        
        # Calculate start and end dates for the trip
        best_date = pd.to_datetime(best_window["best_week"])
        trip_start = best_date
        trip_end = best_date + timedelta(days=trip_days)
        
        # Validate and bound the prediction values
        validated_window = self._validate_predictions(best_window)
        
        # Structure the output
        output = {
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
            "generated_at": datetime.now().isoformat(),
            "trip_days": trip_days
        }
        
        # Save to JSON if requested
        if save_output:
            self._save_output(output, output_dir)
        
        # Print summary
        self._print_summary(output)
        
        return output
    
    def _validate_predictions(self, best_window: Dict) -> Dict:
        """
        Validate and apply bounds to prediction values.
        
        Ensures all predicted values are within realistic ranges.
        
        Args:
            best_window: Dictionary with prediction values
            
        Returns:
            Dictionary with validated values
        """
        validated = best_window.copy()
        
        # Price validation (USD)
        # Reasonable flight/hotel prices: $150 - $1500
        if validated["price"] < 150:
            validated["price"] = 150
            print("⚠️  Warning: Price prediction was below minimum, adjusted to $150")
        elif validated["price"] > 1500:
            validated["price"] = 1500
            print("⚠️  Warning: Price prediction was above maximum, adjusted to $1500")
        
        # Temperature validation (Celsius)
        # Reasonable travel temperatures: -10°C to 45°C
        if validated["temperature"] < -10:
            validated["temperature"] = -10
            print("⚠️  Warning: Temperature prediction was too low, adjusted to -10°C")
        elif validated["temperature"] > 45:
            validated["temperature"] = 45
            print("⚠️  Warning: Temperature prediction was too high, adjusted to 45°C")
        
        # Precipitation validation (mm per week)
        # Reasonable weekly precipitation: 0mm to 150mm
        if validated["precipitation"] < 0:
            validated["precipitation"] = 0
            print("⚠️  Warning: Precipitation prediction was negative, adjusted to 0mm")
        elif validated["precipitation"] > 150:
            original_precip = validated["precipitation"]
            validated["precipitation"] = 150
            print(f"⚠️  Warning: Precipitation prediction was {original_precip:.1f}mm (too high), adjusted to 150mm")
        
        # Crowd level validation (0-100 scale)
        if validated["crowd_level"] < 0:
            validated["crowd_level"] = 0
            print("⚠️  Warning: Crowd level was negative, adjusted to 0")
        elif validated["crowd_level"] > 100:
            validated["crowd_level"] = 100
            print("⚠️  Warning: Crowd level was above 100, adjusted to 100")
        
        # Travel score validation (0-100 scale)
        if validated["travel_score"] < 0:
            validated["travel_score"] = 0
        elif validated["travel_score"] > 100:
            validated["travel_score"] = 100
        
        # Individual score validation (0-100 scale)
        for score_key in ["price_score", "weather_score", "crowd_score"]:
            if validated[score_key] < 0:
                validated[score_key] = 0
            elif validated[score_key] > 100:
                validated[score_key] = 100
        
        return validated
    
    def _calculate_confidence(
        self,
        predictions_df: pd.DataFrame,
        best_window: Dict
    ) -> float:
        """
        Calculate confidence score based on how much better the best window is
        compared to alternatives.
        
        Higher confidence = best window is significantly better than others
        Lower confidence = many weeks have similar scores
        """
        # Check if there was an error
        if "error" in best_window:
            return 0.3
        
        if len(predictions_df) < 2:
            return 0.5
        
        best_score = best_window.get("travel_score", 50.0)
        all_scores = predictions_df["rolling_score"].dropna()
        
        if len(all_scores) == 0:
            # Try using travel_score if rolling_score is empty
            all_scores = predictions_df["travel_score"].dropna()
        
        if len(all_scores) == 0:
            return 0.5
        
        # Calculate how many standard deviations above mean
        mean_score = all_scores.mean()
        std_score = all_scores.std()
        
        if std_score == 0:
            return 0.5
        
        z_score = (best_score - mean_score) / std_score
        
        # Convert z-score to confidence (0-1 scale)
        # z_score of 2+ means very confident, 0 means not confident
        confidence = min(0.5 + (z_score * 0.2), 1.0)
        confidence = max(confidence, 0.3)  # Minimum 30% confidence
        
        return confidence
    
    def _generate_ai_explanation(
        self,
        best_window: Dict,
        confidence: float
    ) -> str:
        """
        Generate an AI explanation for why this week is the best time to go.
        
        Uses Ollama (llama3:latest) if available, otherwise generates a template-based explanation.
        """
        if not self.ollama_available:
            return self._generate_template_explanation(best_window)
        
        try:
            # Prepare prompt for Ollama
            best_date = pd.to_datetime(best_window["best_week"])
            month_name = best_date.strftime("%B")
            
            # Calculate price comparison
            price = best_window["price"]
            avg_price = 350  # Approximate average
            price_diff_pct = ((avg_price - price) / avg_price) * 100
            
            prompt = f"""You are a travel advisor.

Destination: {self.destination}.
Best week: {best_date.strftime('%B %d, %Y')} ({month_name}).
Predicted price: ${round(price, 2)} USD.
Weather: {round(best_window['temperature'], 1)}°C, {round(best_window['precipitation'], 1)}mm precipitation.
Crowd level: {round(best_window['crowd_level'], 1)} / 100.
Travel score: {round(best_window['travel_score'], 1)} / 100.
Confidence: {round(confidence * 100, 0)}%.

Explain in 2-3 sentences why this week is the best time to go. 
Focus on the balance of price, weather, and crowd levels.
Be specific and mention actual numbers when relevant."""

            response = requests.post(
                OLLAMA_API_URL,
                json={
                    "model": OLLAMA_MODEL,
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.7,
                        "num_predict": 150
                    }
                },
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                return result.get("response", "").strip()
            else:
                raise Exception(f"Ollama returned status code {response.status_code}")
        
        except Exception as e:
            print(f"⚠️  Warning: Could not generate AI explanation with Ollama: {e}")
            return self._generate_template_explanation(best_window)
    
    def _generate_template_explanation(self, best_window: Dict) -> str:
        """Generate a template-based explanation if OpenAI is not available."""
        best_date = pd.to_datetime(best_window["best_week"])
        month_name = best_date.strftime("%B")
        
        temp = best_window["temperature"]
        price = best_window["price"]
        crowd = best_window["crowd_level"]
        
        # Determine temperature quality
        if 18 <= temp <= 26:
            temp_desc = "comfortable"
        elif temp < 18:
            temp_desc = "mild"
        else:
            temp_desc = "warm"
        
        # Determine crowd level
        if crowd < 40:
            crowd_desc = "light tourist crowds"
        elif crowd < 70:
            crowd_desc = "moderate tourist levels"
        else:
            crowd_desc = "peak season activity"
        
        explanation = (
            f"{month_name} offers excellent value for {self.destination} — "
            f"flight prices around ${round(price, 0)}, {temp_desc} temperatures near {round(temp, 1)}°C, "
            f"and {crowd_desc}. This week provides an optimal balance across all factors."
        )
        
        return explanation
    
    def _save_output(self, output: Dict, output_dir: str):
        """Save the output to a JSON file."""
        # Create output directory if it doesn't exist
        os.makedirs(output_dir, exist_ok=True)
        
        # Generate filename
        dest_clean = self.destination.lower().replace(" ", "_")
        filename = f"output_{dest_clean}.json"
        filepath = os.path.join(output_dir, filename)
        
        # Save to JSON
        with open(filepath, "w") as f:
            json.dump(output, f, indent=2)
        
        print(f"\n💾 Output saved to: {filepath}")
    
    def _print_summary(self, output: Dict):
        """Print a formatted summary of the prediction."""
        print("\n" + "=" * 80)
        print("🎯 PREDICTION SUMMARY")
        print("=" * 80)
        print(f"📍 Destination:      {output['destination']}")
        print(f"📅 Best Travel Date: {output['best_start_date']} to {output['best_end_date']}")
        print(f"💰 Predicted Price:  ${output['predicted_price']}")
        print(f"🌡️  Temperature:       {output['predicted_temp']}°C")
        print(f"🌧️  Precipitation:    {output['predicted_precipitation']}mm")
        print(f"👥 Crowd Level:      {output['predicted_crowd']}/100")
        print(f"⭐ Travel Score:     {output['travel_score']}/100")
        print(f"🎲 Confidence:       {output['confidence'] * 100:.0f}%")
        print("\n💡 AI Explanation:")
        print(f"   {output['ai_explanation']}")
        print("=" * 80)

