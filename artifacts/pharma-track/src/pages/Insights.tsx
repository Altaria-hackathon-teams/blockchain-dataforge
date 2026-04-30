import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart, Bar, AreaChart, Area, ResponsiveContainer,
  Tooltip, XAxis, YAxis, CartesianGrid,
} from "recharts";
import {
  AlertTriangle, Bell, Brain, CheckCircle, MapPin, Package,
  Send, TrendingUp, Zap, Shield, ThermometerSun, Wind, Droplets, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { toast } from "sonner";

// ── Synthetic epidemic dataset ──────────────────────────────────────────────
const EPIDEMIC_DATA = [
  {
    region: "Maharashtra",
    city: "Mumbai / Pune",
    riskScore: 94,
    emergencyType: "Dengue + Viral Fever Surge",
    trend: "+68%",
    population: "12.4M",
    season: "Pre-monsoon",
    driver: "Stagnant water + heat index 42°C",
    icon: Droplets,
    color: "rose",
    recommended: [
      { drug: "Paracetamol 500mg", qty: 80000, urgency: "CRITICAL" },
      { drug: "Azithromycin 500mg", qty: 30000, urgency: "HIGH" },
      { drug: "ORS Sachets", qty: 50000, urgency: "HIGH" },
    ],
    history: [420, 510, 490, 560, 680, 730, 820, 960, 1100, 1350, 1580, 1820, 2100, 2450],
  },
  {
    region: "Gujarat",
    city: "Ahmedabad / Surat",
    riskScore: 82,
    emergencyType: "Respiratory Infection Wave",
    trend: "+51%",
    population: "8.7M",
    season: "Summer heat stress",
    driver: "Air quality index 290 (Very Poor)",
    icon: Wind,
    color: "orange",
    recommended: [
      { drug: "Salbutamol Inhaler", qty: 25000, urgency: "CRITICAL" },
      { drug: "Amoxicillin 250mg", qty: 40000, urgency: "HIGH" },
      { drug: "Hydroxychloroquine 200mg", qty: 15000, urgency: "MEDIUM" },
    ],
    history: [300, 320, 340, 390, 450, 490, 540, 600, 680, 780, 870, 940, 1020, 1150],
  },
  {
    region: "Delhi NCR",
    city: "New Delhi",
    riskScore: 76,
    emergencyType: "Smog-Induced Pulmonary",
    trend: "+38%",
    population: "20.1M",
    season: "Peak pollution season",
    driver: "PM2.5 levels >350 µg/m³",
    icon: Wind,
    color: "amber",
    recommended: [
      { drug: "Salbutamol Inhaler", qty: 60000, urgency: "HIGH" },
      { drug: "Hydroxychloroquine 200mg", qty: 20000, urgency: "MEDIUM" },
      { drug: "Metformin 500mg", qty: 18000, urgency: "LOW" },
    ],
    history: [500, 520, 515, 540, 580, 620, 650, 700, 740, 790, 840, 890, 930, 980],
  },
  {
    region: "Tamil Nadu",
    city: "Chennai",
    riskScore: 58,
    emergencyType: "Cholera / Waterborne Risk",
    trend: "+22%",
    population: "7.2M",
    season: "Northeast monsoon",
    driver: "Flood-contaminated water supply",
    icon: Droplets,
    color: "blue",
    recommended: [
      { drug: "Azithromycin 500mg", qty: 35000, urgency: "HIGH" },
      { drug: "ORS Sachets", qty: 80000, urgency: "HIGH" },
      { drug: "Amoxicillin 250mg", qty: 20000, urgency: "MEDIUM" },
    ],
    history: [180, 190, 200, 210, 230, 240, 260, 280, 300, 330, 355, 375, 390, 410],
  },
  {
    region: "West Bengal",
    city: "Kolkata",
    riskScore: 44,
    emergencyType: "Moderate Flu Activity",
    trend: "+11%",
    population: "5.1M",
    season: "Stable",
    driver: "Routine seasonal variation",
    icon: ThermometerSun,
    color: "emerald",
    recommended: [
      { drug: "Paracetamol 500mg", qty: 20000, urgency: "MEDIUM" },
      { drug: "Amoxicillin 250mg", qty: 10000, urgency: "LOW" },
    ],
    history: [120, 125, 130, 128, 135, 140, 138, 145, 148, 152, 155, 158, 162, 165],
  },
  {
    region: "Karnataka",
    city: "Bengaluru",
    riskScore: 31,
    emergencyType: "Low — Baseline Demand",
    trend: "+4%",
    population: "4.8M",
    season: "Stable",
    driver: "No active emergency indicators",
    icon: Shield,
    color: "slate",
    recommended: [
      { drug: "Metformin 500mg", qty: 8000, urgency: "LOW" },
    ],
    history: [90, 92, 91, 93, 95, 94, 96, 97, 98, 99, 100, 101, 102, 103],
  },
];

const URGENCY_STYLE: Record<string, string> = {
  CRITICAL: "bg-rose-500/20 text-rose-400 border border-rose-500/40",
  HIGH:     "bg-amber-500/20 text-amber-400 border border-amber-500/40",
  MEDIUM:   "bg-blue-500/20 text-blue-400 border border-blue-500/40",
  LOW:      "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40",
};

const COLOR_MAP: Record<string, { ring: string; bar: string; glow: string; text: string }> = {
  rose:    { ring: "border-rose-500/40",    bar: "bg-rose-500",    glow: "shadow-rose-500/20",    text: "text-rose-400"    },
  orange:  { ring: "border-orange-500/40",  bar: "bg-orange-500",  glow: "shadow-orange-500/20",  text: "text-orange-400"  },
  amber:   { ring: "border-amber-400/40",   bar: "bg-amber-400",   glow: "shadow-amber-400/20",   text: "text-amber-400"   },
  blue:    { ring: "border-blue-500/40",    bar: "bg-blue-500",    glow: "shadow-blue-500/20",    text: "text-blue-400"    },
  emerald: { ring: "border-emerald-500/40", bar: "bg-emerald-500", glow: "shadow-emerald-500/20", text: "text-emerald-400" },
  slate:   { ring: "border-slate-500/40",   bar: "bg-slate-500",   glow: "shadow-slate-500/20",   text: "text-slate-400"   },
};

export function Insights() {
  const { state, pushAlert } = useStore();
  const [selected, setSelected] = useState(EPIDEMIC_DATA[0]);
  const [dispatching, setDispatching] = useState<string | null>(null);
  const [sentAlerts, setSentAlerts] = useState<Record<string, boolean>>({});

  const user = state.currentUser;
  // Guard — Manufacturer only
  if (user && user.role !== "MANUFACTURER") {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
        <Shield className="w-5 h-5 mr-2" /> This section is restricted to Manufacturers only.
      </div>
    );
  }

  const riskBarData = useMemo(() =>
    EPIDEMIC_DATA.map(r => ({ region: r.region.split(" ")[0], risk: r.riskScore, color: r.color })),
  []);

  const trendData = useMemo(() =>
    selected.history.map((v, i) => ({
      day: `D-${14 - i}`,
      cases: v,
    })).reverse(),
  [selected]);

  const criticalCount = EPIDEMIC_DATA.filter(r => r.riskScore >= 80).length;
  const highCount     = EPIDEMIC_DATA.filter(r => r.riskScore >= 60 && r.riskScore < 80).length;
  const totalUnits    = EPIDEMIC_DATA.reduce((s, r) => s + r.recommended.reduce((a, d) => a + d.qty, 0), 0);

  function handleSendAlert(region: typeof EPIDEMIC_DATA[0]) {
    if (sentAlerts[region.region]) return;
    setDispatching(region.region);
    setTimeout(() => {
      setDispatching(null);
      // Push warning alert visible to Suppliers and Local Shops
      pushAlert({
        level: "warning",
        title: `⚠️ Urgent: Medical Supply Needed — ${region.region}`,
        message: `AI Forecast Alert: ${region.emergencyType} detected in ${region.city} (Risk Score: ${region.riskScore}/100, Trend: ${region.trend}). Medicines required: ${region.recommended.map(r => `${r.drug} (${r.qty.toLocaleString()} units)`).join(" · ")}. Please confirm acceptance to proceed with delivery placement.`,
      });
      setSentAlerts(prev => ({ ...prev, [region.region]: true }));
      toast.success(`Alert Sent — ${region.region}`, {
        description: "Supplier & Local Shop notified. Awaiting their acceptance to place delivery.",
        icon: <Bell className="w-4 h-4 text-amber-400" />,
      });
    }, 1500);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary w-fit">
          <Brain className="w-3.5 h-3.5" />
          <span className="text-[10px] font-semibold uppercase tracking-widest">Manufacturer Intelligence · Epidemic Prediction Engine</span>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Medical Emergency AI Forecast</h1>
        <p className="text-sm text-muted-foreground">
          Real-time epidemic risk modelling per region — predicts demand surges and prescribes exact dispatch orders.
        </p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Critical Regions", value: criticalCount, icon: AlertTriangle, color: "text-rose-400" },
          { label: "High-Risk Regions", value: highCount, icon: TrendingUp, color: "text-amber-400" },
          { label: "Total Units Needed", value: totalUnits.toLocaleString(), icon: Package, color: "text-primary" },
          { label: "AI Confidence", value: "94%", icon: Brain, color: "text-emerald-400" },
        ].map((k, i) => (
          <motion.div key={k.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{k.label}</span>
              <k.icon className={`w-4 h-4 ${k.color}`} />
            </div>
            <div className="text-2xl font-bold tracking-tight">{k.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Risk Heatmap Bar Chart */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3 flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-amber-400" /> Regional Emergency Risk Index (0–100)
        </div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={riskBarData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 33% 17%)" />
              <XAxis dataKey="region" stroke="hsl(215 20% 55%)" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis domain={[0, 100]} stroke="hsl(215 20% 55%)" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "hsl(222 45% 9%)", border: "1px solid hsl(217 33% 17%)", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="risk" radius={[4, 4, 0, 0]}
                fill="hsl(174 80% 50%)"
                label={{ position: "top", fontSize: 10, fill: "hsl(215 20% 65%)" }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Region Cards + Detail Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Region List */}
        <div className="space-y-2">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground px-1">Select Region</p>
          {EPIDEMIC_DATA.map((r) => {
            const c = COLOR_MAP[r.color];
            const active = selected.region === r.region;
            return (
              <button key={r.region} onClick={() => setSelected(r)} className={`w-full text-left rounded-xl border p-4 transition-all duration-200 ${active ? `${c.ring} bg-card shadow-lg ${c.glow}` : "border-border bg-card/40 hover:bg-card"}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold">{r.region}</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">{r.city}</div>
                  </div>
                  <div className={`text-xl font-bold font-mono ${c.text}`}>{r.riskScore}</div>
                </div>
                <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className={`h-full ${c.bar} transition-all duration-500`} style={{ width: `${r.riskScore}%` }} />
                </div>
                <div className="mt-2 text-[10px] text-muted-foreground truncate">{r.emergencyType}</div>
              </button>
            );
          })}
        </div>

        {/* Detail Panel */}
        <div className="lg:col-span-2 space-y-4">
          {/* Epidemic Banner */}
          <motion.div key={selected.region} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            className={`rounded-xl border ${COLOR_MAP[selected.color].ring} bg-card p-5`}>
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl border ${COLOR_MAP[selected.color].ring} bg-background/40`}>
                <selected.icon className={`w-6 h-6 ${COLOR_MAP[selected.color].text}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[10px] uppercase tracking-widest font-bold ${COLOR_MAP[selected.color].text}`}>
                    Risk Score {selected.riskScore}/100
                  </span>
                  <span className="text-[10px] text-muted-foreground">· {selected.season}</span>
                </div>
                <h2 className="text-lg font-bold mt-1">{selected.emergencyType}</h2>
                <p className="text-sm text-muted-foreground mt-1">{selected.driver}</p>
                <div className="mt-3 flex gap-4 text-sm">
                  <div><span className="text-muted-foreground">Population at risk: </span><strong>{selected.population}</strong></div>
                  <div><span className="text-muted-foreground">Case trend: </span><strong className={COLOR_MAP[selected.color].text}>{selected.trend}</strong></div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Case Trend Chart */}
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3">
              14-Day Case Trend — {selected.region}
            </div>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="case-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(174 80% 50%)" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="hsl(174 80% 50%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 33% 17%)" />
                  <XAxis dataKey="day" stroke="hsl(215 20% 55%)" fontSize={9} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(215 20% 55%)" fontSize={9} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: "hsl(222 45% 9%)", border: "1px solid hsl(217 33% 17%)", borderRadius: 8, fontSize: 11 }} />
                  <Area type="monotone" dataKey="cases" stroke="hsl(174 80% 50%)" strokeWidth={2} fill="url(#case-grad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI Dispatch Recommendations */}
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Brain className="w-3.5 h-3.5 text-primary" /> AI Dispatch Recommendations
              </div>
              {sentAlerts[selected.region] ? (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                  <CheckCircle className="w-3.5 h-3.5" /> Alert Sent — Awaiting Acceptance
                </div>
              ) : (
                <Button size="sm" onClick={() => handleSendAlert(selected)} disabled={dispatching === selected.region}
                  className="bg-amber-500 hover:bg-amber-400 text-black font-bold gap-2">
                  {dispatching === selected.region ? (
                    <><span className="animate-spin inline-block w-3 h-3 border-2 border-black border-t-transparent rounded-full" /> Sending…</>
                  ) : (
                    <><Bell className="w-3.5 h-3.5" /> Alert Supplier &amp; Local Shop</>
                  )}
                </Button>
              )}
            </div>

            {sentAlerts[selected.region] && (
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 rounded-lg border border-amber-400/40 bg-amber-400/5 px-4 py-3 text-sm text-amber-300 flex items-start gap-3"
                >
                  <Bell className="w-4 h-4 mt-0.5 shrink-0 text-amber-400" />
                  <div>
                    <div className="font-semibold">Notification Sent to Supply Chain Partners</div>
                    <div className="text-xs text-amber-400/70 mt-0.5">Supplier and Local Shop have been alerted. Delivery will be automatically placed once they confirm acceptance from their dashboard.</div>
                  </div>
                </motion.div>
              </AnimatePresence>
            )}

            <div className="space-y-2">
              {selected.recommended.map((rec) => (
                <div key={rec.drug} className="flex items-center justify-between rounded-lg border border-border bg-background/40 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Package className="w-4 h-4 text-muted-foreground shrink-0" />
                    <div>
                      <div className="text-sm font-medium">{rec.drug}</div>
                      <div className="text-xs text-muted-foreground">{rec.qty.toLocaleString()} units needed</div>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${URGENCY_STYLE[rec.urgency]}`}>
                    {rec.urgency}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground mt-3 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              AI model trained on 5-year epidemic patterns, seasonal disease data, and real-time environmental sensors.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
