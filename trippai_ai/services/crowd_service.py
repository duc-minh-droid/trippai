"""Service for fetching crowd data using Google Trends as a proxy."""

import pandas as pd
from datetime import datetime, timedelta
from typing import List, Optional, Dict
from pytrends.request import TrendReq


class CrowdService:
    """Fetch crowd/tourist demand data using Google Trends."""
    
    def __init__(self):
        """Initialize PyTrends client."""
        self.pytrends = TrendReq(hl='en-US', tz=360)
    
    def get_search_interest(
        self, 
        destination: str, 
        start_date: datetime, 
        end_date: datetime,
        event_multiplier: float = 1.0
    ) -> pd.DataFrame:
        """
        Get Google Trends data for a destination as a proxy for tourist demand.
        
        Args:
            destination: Destination name
            start_date: Start date for trends data
            end_date: End date for trends data
            event_multiplier: Multiplier to adjust crowd levels for events (default: 1.0)
        
        Returns:
            DataFrame with date and crowd_level columns
        """
        try:
            # Google Trends only works with historical data (can't predict future)
            # Limit end_date to today if it's in the future
            today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
            if end_date > today:
                print(f"⚠️  Adjusting crowd data end date from {end_date.date()} to {today.date()} (Trends API limitation)")
                end_date = today
            
            if start_date > end_date:
                print(f"⚠️  Start date is after adjusted end date, using fallback crowd data")
                return self._generate_fallback_data(start_date, end_date, event_multiplier)
            
            # Check if date range is reasonable (pytrends works best with ranges > 1 week)
            date_diff = (end_date - start_date).days
            if date_diff < 7:
                print(f"⚠️  Date range too short for Trends API ({date_diff} days), using fallback data")
                return self._generate_fallback_data(start_date, end_date, event_multiplier)
            
            # Build the search query
            keywords = [f"{destination} travel", f"visit {destination}"]
            
            # Format timeframe for pytrends
            timeframe = f"{start_date.strftime('%Y-%m-%d')} {end_date.strftime('%Y-%m-%d')}"
            
            print(f"Fetching Google Trends data for {destination} ({timeframe})...")
            
            # Build payload
            self.pytrends.build_payload(
                keywords, 
                cat=0, 
                timeframe=timeframe, 
                geo='',  # Worldwide
                gprop=''
            )
            
            # Get interest over time
            df = self.pytrends.interest_over_time()
            
            if df.empty:
                print(f"⚠️  No Google Trends data found for '{destination}', using fallback data")
                return self._generate_fallback_data(start_date, end_date, event_multiplier)
            
            # Reset index to get date as a column
            df = df.reset_index()
            
            # Average the interest across all keywords
            keyword_cols = [col for col in df.columns if col not in ['date', 'isPartial']]
            df["crowd_level"] = df[keyword_cols].mean(axis=1)
            
            # Apply event multiplier to adjust for major events/festivals
            if event_multiplier != 1.0:
                df["crowd_level"] = df["crowd_level"] * event_multiplier
                print(f"✓ Applied event multiplier: {event_multiplier}x (adjusting for major events)")
            
            # Keep only date and crowd_level
            df = df[["date", "crowd_level"]].copy()
            
            # Ensure date is datetime
            df["date"] = pd.to_datetime(df["date"])
            
            print(f"✓ Retrieved {len(df)} days of crowd data from Google Trends")
            
            return df
            
        except Exception as e:
            print(f"⚠️  Error fetching Google Trends data: {e}")
            return self._generate_fallback_data(start_date, end_date, event_multiplier)
    
    def _generate_fallback_data(
        self, 
        start_date: datetime, 
        end_date: datetime,
        event_multiplier: float = 1.0
    ) -> pd.DataFrame:
        """
        Generate synthetic crowd data as fallback when Google Trends fails.
        
        Args:
            start_date: Start date
            end_date: End date
            event_multiplier: Multiplier to adjust for events
        """
        import numpy as np
        
        date_rng = pd.date_range(start_date, end_date, freq="D")
        
        # Generate synthetic pattern with seasonal variations
        day_of_year = date_rng.dayofyear
        
        # Peak crowds in summer and winter holidays
        seasonal = 50 + 30 * np.sin(2 * np.pi * day_of_year / 365)
        holiday_boost = 20 * np.exp(-((day_of_year - 360) ** 2) / 200)
        summer_boost = 15 * np.exp(-((day_of_year - 180) ** 2) / 300)
        
        crowd_level = seasonal + holiday_boost + summer_boost
        
        # Apply event multiplier
        crowd_level = crowd_level * event_multiplier
        
        crowd_level = np.clip(crowd_level, 0, 100)
        
        df = pd.DataFrame({
            "date": date_rng,
            "crowd_level": crowd_level
        })
        
        return df
    
    def get_weekly_average_crowd(self, crowd_df: pd.DataFrame) -> pd.DataFrame:
        """
        Calculate weekly average crowd levels from daily data.
        
        Args:
            crowd_df: DataFrame with date and crowd_level columns
        
        Returns:
            DataFrame with week_start and weekly_avg_crowd columns
        """
        df = crowd_df.copy()
        df["week_start"] = df["date"] - pd.to_timedelta(df["date"].dt.dayofweek, unit="d")
        
        weekly_df = df.groupby("week_start").agg({
            "crowd_level": "mean"
        }).reset_index()
        
        weekly_df.columns = ["week_start", "weekly_avg_crowd"]
        
        return weekly_df
    
    def normalize_crowd_score(
        self, 
        crowd_df: pd.DataFrame, 
        crowd_column: str = "crowd_level"
    ) -> pd.DataFrame:
        """
        Normalize crowd levels to a 0-100 score where lower crowd = higher score.
        
        Args:
            crowd_df: DataFrame with crowd data
            crowd_column: Name of the column containing crowd levels
        
        Returns:
            DataFrame with added crowd_score column
        """
        df = crowd_df.copy()
        
        min_crowd = df[crowd_column].min()
        max_crowd = df[crowd_column].max()
        
        # Avoid division by zero
        if max_crowd == min_crowd:
            df["crowd_score"] = 50.0
        else:
            # Invert normalization: lower crowd = higher score
            df["crowd_score"] = 100 * (1 - (df[crowd_column] - min_crowd) / (max_crowd - min_crowd))
        
        return df
