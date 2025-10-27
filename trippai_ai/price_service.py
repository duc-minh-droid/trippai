"""Service for generating synthetic flight/hotel price data."""

import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Optional


class PriceService:
    """Generate synthetic price data with seasonal patterns."""
    
    def __init__(self, seed: Optional[int] = 42):
        """Initialize with optional random seed for reproducibility."""
        if seed is not None:
            np.random.seed(seed)
    
    def generate_price_data(
        self, 
        start_date: datetime, 
        end_date: datetime,
        base_price: float = 300,
        seasonal_amplitude: float = 50,
        noise_std: float = 10
    ) -> pd.DataFrame:
        """
        Generate synthetic flight/hotel prices with seasonal patterns.
        
        Args:
            start_date: Start date for price generation
            end_date: End date for price generation
            base_price: Base price around which prices fluctuate
            seasonal_amplitude: Amplitude of seasonal variation
            noise_std: Standard deviation of random noise
        
        Returns:
            DataFrame with date and avg_price columns
        """
        # Generate date range
        date_rng = pd.date_range(start_date, end_date, freq="D")
        
        # Generate seasonal pattern using sine wave
        # Peak prices in summer (day 180) and winter holidays (day 355)
        day_of_year = date_rng.dayofyear
        
        # Primary seasonal pattern (annual)
        seasonal_pattern = seasonal_amplitude * np.sin(2 * np.pi * day_of_year / 365)
        
        # Add secondary pattern for holiday spikes
        # Peak around Christmas/New Year (days 355-365) and summer (days 150-200)
        holiday_boost = 30 * np.exp(-((day_of_year - 360) ** 2) / 200)
        summer_boost = 20 * np.exp(-((day_of_year - 180) ** 2) / 300)
        
        # Weekend boost (Fridays and Saturdays are more expensive)
        weekend_boost = np.where(date_rng.dayofweek.isin([4, 5]), 15, 0)
        
        # Random noise
        noise = np.random.normal(0, noise_std, len(date_rng))
        
        # Combine all factors
        price = base_price + seasonal_pattern + holiday_boost + summer_boost + weekend_boost + noise
        
        # Ensure prices don't go below a minimum
        price = np.maximum(price, base_price * 0.5)
        
        df_price = pd.DataFrame({
            "date": date_rng,
            "avg_price": price
        })
        
        return df_price
    
    def get_weekly_average_price(self, price_df: pd.DataFrame) -> pd.DataFrame:
        """
        Calculate weekly average prices from daily data.
        
        Args:
            price_df: DataFrame with date and avg_price columns
        
        Returns:
            DataFrame with week_start and weekly_avg_price columns
        """
        df = price_df.copy()
        df["week_start"] = df["date"] - pd.to_timedelta(df["date"].dt.dayofweek, unit="d")
        
        weekly_df = df.groupby("week_start").agg({
            "avg_price": "mean"
        }).reset_index()
        
        weekly_df.columns = ["week_start", "weekly_avg_price"]
        
        return weekly_df
    
    def normalize_price_score(
        self, 
        price_df: pd.DataFrame, 
        price_column: str = "avg_price"
    ) -> pd.DataFrame:
        """
        Normalize prices to a 0-100 score where lower price = higher score.
        
        Args:
            price_df: DataFrame with price data
            price_column: Name of the column containing prices
        
        Returns:
            DataFrame with added price_score column
        """
        df = price_df.copy()
        
        min_price = df[price_column].min()
        max_price = df[price_column].max()
        
        # Invert normalization: lower price = higher score
        df["price_score"] = 100 * (1 - (df[price_column] - min_price) / (max_price - min_price))
        
        return df
