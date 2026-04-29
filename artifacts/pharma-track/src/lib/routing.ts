export interface Hub {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

export const HUBS: Hub[] = [
  { id: "H1", name: "Mumbai", lat: 19.0760, lng: 72.8777 },
  { id: "H2", name: "Delhi", lat: 28.7041, lng: 77.1025 },
  { id: "H3", name: "Bangalore", lat: 12.9716, lng: 77.5946 },
  { id: "H4", name: "Hyderabad", lat: 17.3850, lng: 78.4867 },
  { id: "H5", name: "Chennai", lat: 13.0827, lng: 80.2707 },
  { id: "H6", name: "Kolkata", lat: 22.5726, lng: 88.3639 },
  { id: "H7", name: "Pune", lat: 18.5204, lng: 73.8567 },
  { id: "H8", name: "Ahmedabad", lat: 23.0225, lng: 72.5714 },
];

export interface RouteSuggestion {
  origin: string;
  destination: string;
  baselineEtaHours: number;
  optimizedEtaHours: number;
  improvementPercent: number;
  reason: string;
  drugFocus: string;
}

export function suggestRoutes(): RouteSuggestion[] {
  return [
    {
      origin: "Mumbai",
      destination: "Delhi",
      baselineEtaHours: 48,
      optimizedEtaHours: 32,
      improvementPercent: 33,
      reason: "Bypassing NH48 due to heavy traffic; re-routing via NH52. High priority for Paracetamol.",
      drugFocus: "Paracetamol 500mg"
    },
    {
      origin: "Bangalore",
      destination: "Hyderabad",
      baselineEtaHours: 12,
      optimizedEtaHours: 8,
      improvementPercent: 33,
      reason: "Direct dedicated freight corridor allocation.",
      drugFocus: "Insulin Glargine"
    },
    {
      origin: "Ahmedabad",
      destination: "Pune",
      baselineEtaHours: 18,
      optimizedEtaHours: 14,
      improvementPercent: 22,
      reason: "Predictive pre-positioning based on localized demand spike.",
      drugFocus: "Amoxicillin 250mg"
    }
  ];
}
