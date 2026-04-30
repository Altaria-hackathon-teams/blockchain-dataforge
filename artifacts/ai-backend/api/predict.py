from fastapi import APIRouter
from pydantic import BaseModel
import hashlib

router = APIRouter()

class HealthData(BaseModel):
    region_code: str
    flu_cases_reported: int
    antibiotic_resistance_level: float
    historical_avg_cases: int

class PredictionResult(BaseModel):
    demand_score: int
    suggested_route_hash: str
    priority_flag: str

@router.post("/predict", response_model=PredictionResult)
def predict_demand(data: HealthData):
    # Mock AI predictive logic based on the user's prompt
    spike_percentage = 0
    if data.historical_avg_cases > 0:
        spike_percentage = ((data.flu_cases_reported - data.historical_avg_cases) / data.historical_avg_cases) * 100
    
    priority_flag = "Normal"
    # "If a specific zip code shows a 20% spike in cases, the AI flags that route as 'High Priority'"
    if spike_percentage >= 20.0 or data.antibiotic_resistance_level > 0.8:
        priority_flag = "High Priority"
    
    # Calculate a mock score (0-100)
    base_score = 50
    demand_score = min(100, int(base_score + spike_percentage))
    
    # Generate a suggested route hash (mocked)
    route_string = f"ROUTE_TO_{data.region_code}_VIA_MAIN_HUB_{priority_flag}"
    route_hash = hashlib.sha256(route_string.encode('utf-8')).hexdigest()
    
    return PredictionResult(
        demand_score=demand_score,
        suggested_route_hash=route_hash,
        priority_flag=priority_flag
    )
