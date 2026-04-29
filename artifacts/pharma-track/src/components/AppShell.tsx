import { Link, useLocation } from "wouter";
import {
  Activity,
  Boxes,
  GitBranch,
  ShieldCheck,
  TrendingUp,
  Route as RouteIcon,
  RotateCcw,
  Pill,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { toast } from "sonner";
import type { ReactNode } from "react";

const NAV = [
  { path: "/", label: "Overview", icon: Activity },
  { path: "/manufacturer", label: "Add Batch", icon: Boxes },
  { path: "/track", label: "Track", icon: GitBranch },
  { path: "/verify", label: "Verify", icon: ShieldCheck },
  { path: "/insights", label: "AI Insights", icon: TrendingUp },
  { path: "/routing", label: "Smart Routing", icon: RouteIcon },
];

export function AppShell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { state, resetDemo } = useStore();

  const activeAlerts = state.alerts.filter((a) => a.level !== "info").length;

  return (
    <div className="min-h-screen w-full grid grid-cols-[260px_1fr] bg-background text-foreground">
      <aside className="border-r border-sidebar-border bg-sidebar text-sidebar-foreground flex flex-col">
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center text-primary glow-teal">
              <Pill className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-semibold tracking-tight text-foreground">
                PharmaTrace
              </div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Provenance Console
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = location === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={cn(
                  "group flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors hover-elevate",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground border border-sidebar-border"
                    : "text-sidebar-foreground/80"
                )}
                data-testid={`nav-${item.path.replace("/", "") || "home"}`}
              >
                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0 transition-colors",
                    active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                  )}
                />
                <span className={cn(active && "text-foreground font-medium")}>
                  {item.label}
                </span>
                {item.path === "/" && activeAlerts > 0 && (
                  <span className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-[10px] font-semibold text-destructive-foreground">
                    {activeAlerts}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-sidebar-border space-y-3">
          <div className="rounded-md border border-sidebar-border bg-sidebar-accent/40 p-3">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
              Ledger Status
            </div>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              <span className="text-xs font-mono text-foreground">SYNCED · {state.batches.length} BATCHES</span>
            </div>
          </div>
          <button
            onClick={async () => {
              await resetDemo();
              toast.success("Demo data reseeded", {
                description: "All batches and chains restored to baseline.",
              });
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md text-xs text-muted-foreground hover:text-foreground border border-sidebar-border hover-elevate"
            data-testid="button-reset-demo"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset demo data
          </button>
        </div>
      </aside>

      <main className="min-h-screen overflow-x-hidden">
        <div className="border-b border-border/60 bg-background/40 backdrop-blur sticky top-0 z-20">
          <div className="px-8 py-4 flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Predictive Pharmaceutical Tracking & Provenance
              </div>
              <div className="text-lg font-semibold tracking-tight">
                Tamper-proof. Predictive. Optimized.
              </div>
            </div>
            <div className="flex items-center gap-6 text-xs font-mono text-muted-foreground">
              <div>
                <span className="text-primary">●</span> {state.batches.length} batches
              </div>
              <div>
                <span className="text-amber-400">●</span>{" "}
                {state.batches.filter((b) => b.status === "IN_TRANSIT").length} in transit
              </div>
              <div>
                <span className="text-destructive">●</span> {activeAlerts} alerts
              </div>
            </div>
          </div>
        </div>
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
