from flask import Flask, request, jsonify
from flask_cors import CORS
import hashlib

app = Flask(__name__)
# Enable CORS for all routes so React can connect
CORS(app)

@app.route("/api/v1/predict", methods=["POST"])
def predict_demand():
    data = request.json
    region_code = data.get("region_code", "UNKNOWN")
    flu_cases_reported = data.get("flu_cases_reported", 0)
    historical_avg_cases = data.get("historical_avg_cases", 0)
    antibiotic_resistance_level = data.get("antibiotic_resistance_level", 0.0)

    spike_percentage = 0
    if historical_avg_cases > 0:
        spike_percentage = ((flu_cases_reported - historical_avg_cases) / historical_avg_cases) * 100
    
    priority_flag = "Normal"
    if spike_percentage >= 20.0 or antibiotic_resistance_level > 0.8:
        priority_flag = "High Priority"
    
    base_score = 50
    demand_score = min(100, int(base_score + spike_percentage))
    
    route_string = f"ROUTE_TO_{region_code}_VIA_MAIN_HUB_{priority_flag}"
    route_hash = hashlib.sha256(route_string.encode('utf-8')).hexdigest()
    
    return jsonify({
        "demand_score": demand_score,
        "suggested_route_hash": route_hash,
        "priority_flag": priority_flag
    })

if __name__ == "__main__":
    # Run on port 8000 to match the React frontend's expectation
    app.run(host="0.0.0.0", port=8000, debug=True)
