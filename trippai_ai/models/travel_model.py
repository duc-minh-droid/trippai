"""Travel prediction model for optimal travel time analysis."""

from datetime import datetime
from typing import Dict
import pandas as pd

from services.weather_service import WeatherService
from services.price_service import PriceService
from services.crowd_service import CrowdService
from utils.data_aggregator import merge_travel_data, aggregate_to_weekly
from utils.score_calculator import calculate_travel_score


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
        """Initialize all required services."""
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
        
        # Fetch all data sources
        print("Fetching weather data...")
        weather_df = self.weather_service.get_weather_for_destination(
            destination, start_date, end_date
        )
        
        print("Generating price data...")
        price_df = self.price_service.generate_price_data(start_date, end_date)
        price_df = self.price_service.normalize_price_score(price_df)
        
        print("Fetching crowd data...")
        crowd_df = self.crowd_service.get_search_interest(destination, start_date, end_date)
        crowd_df = self.crowd_service.normalize_crowd_score(crowd_df)
        
        # Merge all data sources
        df = merge_travel_data(weather_df, price_df, crowd_df)
        
        # Aggregate by granularity
        if granularity == "weekly":
            df = aggregate_to_weekly(df)
        
        # Calculate TravelScore for each period
        df = self._apply_travel_score(df)
        
        # Sort by TravelScore (best first)
        df = df.sort_values("travel_score", ascending=False).reset_index(drop=True)
        
        return df
    
    def _apply_travel_score(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Apply TravelScore calculation to each row in the DataFrame.
        
        Args:
            df: DataFrame with weather_comfort, price_score, and crowd_score columns
        
        Returns:
            DataFrame with added travel_score column
        """
        result_df = df.copy()
        
        result_df["travel_score"] = result_df.apply(
            lambda row: calculate_travel_score(
                row["weather_comfort"],
                row["price_score"],
                row["crowd_score"]
            ),
            axis=1
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
        
        Args:
            destination: Destination name
            start_date: Start of date range
            end_date: End of date range
        
        Returns:
            Dictionary with the best week's information
        """
        predictions = self.predict(destination, start_date, end_date, granularity="weekly")
        
        if predictions.empty:
            return {"error": "No data available for the specified date range"}
        
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
