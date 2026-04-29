import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { TrendingUp, AlertTriangle, MapPin } from "lucide-react";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { generateHistoricalDemand, predictSurge } from "@/lib/predictions";
import { SAMPLE_DRUG_NAMES } from "@/lib/store";

const REGION_RISK = [
  { region: "Maharashtra", risk: 92, demand: "+58%", driver: "Seasonal flu surge" },
  { region: "Gujarat", risk: 81, demand: "+44%", driver: "Pre-monsoon respiratory uptick" },
  { region: "Delhi NCR", risk: 74, demand: "+31%", driver: "Air quality advisory" },
  { region: "Karnataka", risk: 53, demand: "+12%", driver: "Stable baseline" },
  { region: "Tamil Nadu", risk: 47, demand: "+9%", driver: "Stable baseline" },
  { region: "West Bengal", risk: 39, demand: "+5%", driver: "Stable baseline" },
];

function riskTone(score: number) {
  if (score >= 80) return { ring: "border-destructive/40", text: "text-destructive", bar: "bg-destructive" };
  if (score >= 60) return { ring: "border-amber-400/30", text: "text-amber-400", bar: "bg-amber-400" };
  return { ring: "border-emerald-400/30", text: "text-emerald-400", bar: "bg-emerald-400" };
}

export function Insights() {
  const [drug, setDrug] = useState<string>(SAMPLE_DRUG_NAMES[0]);

  const { chartData, prediction } = useMemo(() => {
    const hist = generateHistoricalDemand(drug);
    const pred = predictSurge(drug, hist);
    const data = pred.data.map((d) => ({
      date: d.date.slice(5),
      actual: d.value,
      forecast: d.forecast,
      lower: d.lower,
      upper: d.upper,
    }));
    return { chartData: data, prediction: pred };
  }, [drug]);

  const surgePositive = prediction.percentChange > 0;

  const drugComparison = useMemo(() => {
    return SAMPLE_DRUG_NAMES.slice(0, 6).map((d) => {
      const h = generateHistoricalDemand(d);
      const p = predictSurge(d, h);
      return {
        drug: d.split(" ")[0],
        change: p.percentChange,
      };
    });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">AI Demand Insights</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Trend-based forecasting on historical movement plus regional risk scoring.
          </p>
        </div>
        <Tabs value={drug} onValueChange={setDrug}>
          <TabsList>
            {SAMPLE_DRUG_NAMES.slice(0, 4).map((d) => (
              <TabsTrigger key={d} value={d} data-testid={`tab-drug-${d}`}>
                {d.split(" ")[0]}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className={`rounded-xl border p-5 ${surgePositive && prediction.percentChange > 30 ? "border-amber-400/40 bg-amber-400/5" : "border-border bg-card"}`}>
        <div className="flex items-start gap-4">
          <div className={`h-12 w-12 rounded-lg border ${surgePositive && prediction.percentChange > 30 ? "border-amber-400/50 text-amber-400" : "border-primary/30 text-primary"} bg-background/40 flex items-center justify-center`}>
            <TrendingUp className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
              Forecast headline · {drug}
            </div>
            <div className="mt-1 text-2xl font-semibold tracking-tight">
              {surgePositive ? "+" : ""}
              {prediction.percentChange}% demand change predicted within {prediction.daysOut} days
            </div>
            <div className="mt-1 text-sm text-muted-foreground">
              Model confidence {prediction.confidence}% · derived from 30-day rolling average + trend slope
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3">
          Demand history · 30 days, with 14-day forecast envelope
        </div>
        <div className="h-72 grid-bg rounded-md">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 16, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="i-actual" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(174 80% 50%)" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="hsl(174 80% 50%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="i-band" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(38 95% 60%)" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="hsl(38 95% 60%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 33% 17%)" />
              <XAxis dataKey="date" stroke="hsl(215 20% 55%)" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(215 20% 55%)" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  background: "hsl(222 45% 9%)",
                  border: "1px solid hsl(217 33% 17%)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 11, color: "hsl(215 20% 65%)" }} />
              <Area
                name="Confidence band"
                type="monotone"
                dataKey="upper"
                stroke="transparent"
                fill="url(#i-band)"
                isAnimationActive
              />
              <Area
                name="Historical demand"
                type="monotone"
                dataKey="actual"
                stroke="hsl(174 80% 50%)"
                strokeWidth={2}
                fill="url(#i-actual)"
                isAnimationActive
              />
              <Area
                name="Forecast"
                type="monotone"
                dataKey="forecast"
                stroke="hsl(38 95% 60%)"
                strokeWidth={2}
                strokeDasharray="4 4"
                fill="transparent"
                isAnimationActive
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3 flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5" /> Regional risk scoreboard
          </div>
          <div className="space-y-3">
            {REGION_RISK.map((r) => {
              const tone = riskTone(r.risk);
              return (
                <div
                  key={r.region}
                  className={`rounded-md border ${tone.ring} bg-background/40 p-3`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <div className="text-sm font-medium">{r.region}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">{r.driver}</div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-mono font-semibold ${tone.text}`}>{r.risk}</div>
                      <div className="text-[11px] text-muted-foreground">demand {r.demand}</div>
                    </div>
                  </div>
                  <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full ${tone.bar}`}
                      style={{ width: `${r.risk}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3 flex items-center gap-2">
            <LineChartIcon /> Forecast change by drug · next 5 days
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={drugComparison} margin={{ top: 10, right: 16, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 33% 17%)" />
                <XAxis dataKey="drug" stroke="hsl(215 20% 55%)" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(215 20% 55%)" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(222 45% 9%)",
                    border: "1px solid hsl(217 33% 17%)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="change" fill="hsl(174 80% 50%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 text-xs text-muted-foreground flex items-center gap-2">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
            Paracetamol is the strongest predicted mover — pre-position inventory in surge regions.
          </div>
        </div>
      </div>
    </div>
  );
}

function LineChartIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18" />
      <path d="m19 9-5 5-4-4-3 3" />
    </svg>
  );
}

// Suppress unused import warning for LineChart, Line — kept for future expansion
void LineChart;
void Line;
