"""Utility functions for data merging and aggregation."""

import pandas as pd


def merge_travel_data(
    weather_df: pd.DataFrame, 
    price_df: pd.DataFrame, 
    crowd_df: pd.DataFrame
) -> pd.DataFrame:
    """
    Merge weather, price, and crowd data on date.
    
    Args:
        weather_df: DataFrame with weather data
        price_df: DataFrame with price data
        crowd_df: DataFrame with crowd data
    
    Returns:
        Merged DataFrame with all travel data
    
    Raises:
        ValueError: If weather_df is empty
    """
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


def aggregate_to_weekly(daily_df: pd.DataFrame) -> pd.DataFrame:
    """
    Aggregate daily data to weekly averages.
    
    Args:
        daily_df: DataFrame with daily data
    
    Returns:
        DataFrame aggregated by week
    """
    df = daily_df.copy()
    
    # Add week_start column (Monday of each week)
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
