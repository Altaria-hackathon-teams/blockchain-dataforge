import { suggestRoutes, HUBS } from "@/lib/routing";
import { ArrowRight, Gauge, Route as RouteIcon, Truck, Zap } from "lucide-react";
import { motion } from "framer-motion";

function HubMap() {
  // Compute SVG bounds based on lat/lng
  const lats = HUBS.map((h) => h.lat);
  const lngs = HUBS.map((h) => h.lng);
  const minLat = Math.min(...lats) - 1;
  const maxLat = Math.max(...lats) + 1;
  const minLng = Math.min(...lngs) - 1;
  const maxLng = Math.max(...lngs) + 1;

  const W = 600;
  const H = 360;

  function project(lat: number, lng: number) {
    const x = ((lng - minLng) / (maxLng - minLng)) * W;
    const y = H - ((lat - minLat) / (maxLat - minLat)) * H;
    return { x, y };
  }

  const routes = suggestRoutes();
  const hubByName = Object.fromEntries(HUBS.map((h) => [h.name, h]));

  return (
    <div className="relative grid-bg rounded-md overflow-hidden border border-border bg-background/30">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-[360px]">
        <defs>
          <linearGradient id="route-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="hsl(174 80% 50%)" />
            <stop offset="100%" stopColor="hsl(330 80% 60%)" />
          </linearGradient>
        </defs>
        {routes.map((r, idx) => {
          const o = hubByName[r.origin];
          const d = hubByName[r.destination];
          if (!o || !d) return null;
          const a = project(o.lat, o.lng);
          const b = project(d.lat, d.lng);
          const cx = (a.x + b.x) / 2;
          const cy = (a.y + b.y) / 2 - 40;
          return (
            <g key={idx}>
              <path
                d={`M ${a.x} ${a.y} Q ${cx} ${cy} ${b.x} ${b.y}`}
                stroke="url(#route-grad)"
                strokeWidth="2"
                fill="none"
                strokeDasharray="4 4"
              />
            </g>
          );
        })}
        {HUBS.map((h) => {
          const { x, y } = project(h.lat, h.lng);
          const isOrigin = routes.some((r) => r.origin === h.name);
          const isDest = routes.some((r) => r.destination === h.name);
          const active = isOrigin || isDest;
          return (
            <g key={h.id}>
              <circle
                cx={x}
                cy={y}
                r={active ? 6 : 4}
                fill={active ? "hsl(174 80% 50%)" : "hsl(215 20% 65%)"}
                stroke="hsl(222 47% 6%)"
                strokeWidth="2"
              />
              {active && (
                <circle
                  cx={x}
                  cy={y}
                  r={12}
                  fill="none"
                  stroke="hsl(174 80% 50%)"
                  strokeWidth="1"
                  opacity={0.5}
                >
                  <animate attributeName="r" from="8" to="18" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" from="0.6" to="0" dur="2s" repeatCount="indefinite" />
                </circle>
              )}
              <text
                x={x + 10}
                y={y + 4}
                fill="hsl(215 20% 70%)"
                fontSize="11"
                fontFamily="ui-monospace, monospace"
              >
                {h.name}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function Routing() {
  const routes = suggestRoutes();
  const totalImprovement = Math.round(
    routes.reduce((s, r) => s + r.improvementPercent, 0) / routes.length
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Smart Routing</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Routes optimized against predicted demand, traffic, and freight-corridor availability.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-5">
          <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Average ETA reduction
          </div>
          <div className="mt-2 text-3xl font-semibold tracking-tight text-primary">
            −{totalImprovement}%
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            Across {routes.length} active corridors today
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Hubs in network
          </div>
          <div className="mt-2 text-3xl font-semibold tracking-tight">{HUBS.length}</div>
          <div className="mt-1 text-xs text-muted-foreground">
            Mapped distribution centers across the region
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Demand-weighted priority
          </div>
          <div className="mt-2 text-3xl font-semibold tracking-tight text-amber-400">
            High
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            Driven by Paracetamol + Insulin surge signals
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_1fr] gap-6">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3 flex items-center gap-2">
            <RouteIcon className="h-3.5 w-3.5" /> Network map
          </div>
          <HubMap />
          <div className="mt-3 flex items-center gap-4 text-[11px] text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Active hub
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" /> Standby hub
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-px w-4 bg-gradient-to-r from-primary to-pink-400" /> Optimized corridor
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {routes.map((r, idx) => (
            <motion.div
              key={`${r.origin}-${r.destination}`}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.08 }}
              className="rounded-xl border border-border bg-card p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-md border border-primary/30 bg-primary/10 flex items-center justify-center text-primary">
                    <Truck className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-sm font-medium">
                      {r.origin} <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" /> {r.destination}
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                      Priority cargo · <span className="text-foreground/80">{r.drugFocus}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-primary inline-flex items-center gap-1">
                    <Zap className="h-4 w-4" />−{r.improvementPercent}%
                  </div>
                  <div className="text-[11px] text-muted-foreground">delivery time</div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                    <Gauge className="h-3 w-3" /> Baseline
                  </div>
                  <div className="mt-1 font-mono">{r.baselineEtaHours}h</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                    <Zap className="h-3 w-3" /> Optimized
                  </div>
                  <div className="mt-1 font-mono text-primary">{r.optimizedEtaHours}h</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Saved</div>
                  <div className="mt-1 font-mono">
                    {r.baselineEtaHours - r.optimizedEtaHours}h
                  </div>
                </div>
              </div>

              <p className="mt-4 text-xs text-muted-foreground border-l-2 border-primary/40 pl-3">
                {r.reason}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
