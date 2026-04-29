export interface DemandPrediction {
  percentChange: number;
  daysOut: number;
  confidence: number;
  data: { date: string; value: number; forecast?: number; lower?: number; upper?: number }[];
}

export function generateHistoricalDemand(drugName: string): number[] {
  const data = [];
  const now = new Date();
  
  // Create a somewhat stable deterministic seed based on drug name
  const seed = drugName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  for (let i = 30; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    // Base demand + sine wave + noise
    const base = 1000 + (seed % 500);
    const wave = Math.sin((30 - i) / 5) * 200;
    const noise = (Math.random() - 0.5) * 100;
    data.push(Math.round(base + wave + noise));
  }
  
  return data;
}

export function predictSurge(drugName: string, historical: number[]): DemandPrediction {
  const isSurge = drugName.toLowerCase().includes("paracetamol");
  const data = [];
  const now = new Date();
  
  // Historical part
  for (let i = 0; i < historical.length; i++) {
    const d = new Date(now.getTime() - (historical.length - 1 - i) * 24 * 60 * 60 * 1000);
    data.push({
      date: d.toISOString().split('T')[0],
      value: historical[i],
    });
  }
  
  // Forecast part (14 days)
  const lastValue = historical[historical.length - 1];
  let forecastAcc = lastValue;
  
  for (let i = 1; i <= 14; i++) {
    const d = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
    let change = (Math.random() - 0.5) * 50;
    
    if (isSurge && i <= 5) {
      change += 150; // Dramatic rise
    }
    
    forecastAcc += change;
    
    data.push({
      date: d.toISOString().split('T')[0],
      value: null as any,
      forecast: Math.round(forecastAcc),
      lower: Math.round(forecastAcc * 0.85),
      upper: Math.round(forecastAcc * 1.15),
    });
  }
  
  return {
    percentChange: isSurge ? 52 : Math.round((Math.random() - 0.5) * 10),
    daysOut: 5,
    confidence: isSurge ? 94 : 85,
    data
  };
}
