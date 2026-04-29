import { useMemo } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  Boxes,
  ShieldCheck,
  TrendingUp,
  ArrowUpRight,
  ShieldAlert,
  Truck,
  type LucideIcon,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { generateHistoricalDemand, predictSurge } from "@/lib/predictions";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  tone = "primary",
  index = 0,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  hint: string;
  tone?: "primary" | "amber" | "danger" | "emerald";
  index?: number;
}) {
  const toneClass =
    tone === "danger"
      ? "text-destructive border-destructive/40"
      : tone === "amber"
        ? "text-amber-400 border-amber-400/30"
        : tone === "emerald"
          ? "text-emerald-400 border-emerald-400/30"
          : "text-primary border-primary/30";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="rounded-xl border border-border bg-card p-5"
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            {label}
          </div>
          <div className="mt-2 text-3xl font-semibold tracking-tight">{value}</div>
        </div>
        <div className={`h-9 w-9 rounded-md border ${toneClass} bg-background/40 flex items-center justify-center`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="mt-3 text-xs text-muted-foreground">{hint}</div>
    </motion.div>
  );
}

export function Overview() {
  const { state } = useStore();
  const verifiedCount = state.batches.filter((b) => b.status === "DELIVERED").length;
  const inTransit = state.batches.filter((b) => b.status === "IN_TRANSIT").length;
  const criticalAlerts = state.alerts.filter((a) => a.level === "critical").length;

  const heroChart = useMemo(() => {
    const hist = generateHistoricalDemand("Paracetamol 500mg");
    const pred = predictSurge("Paracetamol 500mg", hist);
    return pred.data.map((d) => ({
      date: d.date.slice(5),
      actual: d.value,
      forecast: d.forecast,
      lower: d.lower,
      upper: d.upper,
    }));
  }, []);

  const recentBlocks = useMemo(() => {
    const all = Object.values(state.chains)
      .flat()
      .sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1))
      .slice(0, 6);
    return all;
  }, [state.chains]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Operations Overview</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Live snapshot of every batch on chain, every alert, every prediction.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Boxes}
          label="Batches on chain"
          value={state.batches.length.toString()}
          hint={`${state.batches.reduce((s, b) => s + b.quantity, 0).toLocaleString()} units tracked`}
          tone="primary"
          index={0}
        />
        <StatCard
          icon={ShieldCheck}
          label="Verified deliveries"
          value={verifiedCount.toString()}
          hint="All hashes intact across full chain"
          tone="emerald"
          index={1}
        />
        <StatCard
          icon={Truck}
          label="In transit"
          value={inTransit.toString()}
          hint="Awaiting next ledger checkpoint"
          tone="amber"
          index={2}
        />
        <StatCard
          icon={AlertTriangle}
          label="Critical alerts"
          value={criticalAlerts.toString()}
          hint="Counterfeit & cold-chain incidents"
          tone="danger"
          index={3}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Demand forecast — Paracetamol 500mg
              </div>
              <div className="mt-1 flex items-baseline gap-3">
                <span className="text-2xl font-semibold tracking-tight">+52%</span>
                <span className="text-xs text-amber-400 inline-flex items-center gap-1">
                  <TrendingUp className="h-3.5 w-3.5" />
                  surge predicted within 5 days · 94% confidence
                </span>
              </div>
            </div>
            <Link href="/insights" className="text-xs text-primary inline-flex items-center gap-1 hover:underline">
              Open insights <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="h-56 grid-bg rounded-md">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={heroChart} margin={{ top: 10, right: 16, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="g-actual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(174 80% 50%)" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="hsl(174 80% 50%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="g-forecast" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(38 95% 60%)" stopOpacity={0.45} />
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
                <Area
                  type="monotone"
                  dataKey="actual"
                  stroke="hsl(174 80% 50%)"
                  strokeWidth={2}
                  fill="url(#g-actual)"
                  isAnimationActive
                />
                <Area
                  type="monotone"
                  dataKey="forecast"
                  stroke="hsl(38 95% 60%)"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  fill="url(#g-forecast)"
                  isAnimationActive
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3 flex items-center gap-2">
            <Activity className="h-3.5 w-3.5" /> Active alerts
          </div>
          <div className="space-y-3">
            {state.alerts.slice(0, 4).map((a) => {
              const tone =
                a.level === "critical"
                  ? "border-destructive/40 bg-destructive/5"
                  : a.level === "warning"
                    ? "border-amber-400/30 bg-amber-400/5"
                    : "border-border bg-background/40";
              const Icon =
                a.level === "critical" ? ShieldAlert : a.level === "warning" ? TrendingUp : Activity;
              const iconTone =
                a.level === "critical"
                  ? "text-destructive"
                  : a.level === "warning"
                    ? "text-amber-400"
                    : "text-primary";
              return (
                <div key={a.id} className={`rounded-md border p-3 ${tone}`}>
                  <div className="flex items-start gap-2">
                    <Icon className={`h-4 w-4 mt-0.5 ${iconTone}`} />
                    <div className="flex-1">
                      <div className="text-sm font-medium leading-snug">{a.title}</div>
                      <div className="text-xs text-muted-foreground mt-1">{a.message}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Recent ledger activity
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Last six blocks committed across all batches
            </div>
          </div>
          <Link href="/track" className="text-xs text-primary inline-flex items-center gap-1 hover:underline">
            View full chain <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-widest text-muted-foreground border-b border-border">
                <th className="py-2 pr-4 font-medium">Block</th>
                <th className="py-2 pr-4 font-medium">Batch</th>
                <th className="py-2 pr-4 font-medium">Event</th>
                <th className="py-2 pr-4 font-medium">Location</th>
                <th className="py-2 pr-4 font-medium">Time</th>
                <th className="py-2 font-medium">Hash</th>
              </tr>
            </thead>
            <tbody>
              {recentBlocks.map((b) => (
                <tr key={b.hash} className="border-b border-border/50 last:border-0">
                  <td className="py-2.5 pr-4 font-mono text-xs text-muted-foreground">
                    #{b.index}
                  </td>
                  <td className="py-2.5 pr-4 font-mono text-xs">{b.batchId}</td>
                  <td className="py-2.5 pr-4 text-xs">{b.event.replace(/_/g, " ").toLowerCase()}</td>
                  <td className="py-2.5 pr-4 text-xs text-muted-foreground">{b.location}</td>
                  <td className="py-2.5 pr-4 text-xs font-mono text-muted-foreground">
                    {new Date(b.timestamp).toLocaleString(undefined, {
                      month: "short",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="py-2.5">
                    <span className="font-mono text-[11px] text-primary/90">
                      0x{b.hash.slice(0, 6)}…{b.hash.slice(-6)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
