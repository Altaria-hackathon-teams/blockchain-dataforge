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
  Sun,
  Moon,
  LogOut,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { useTheme } from "@/lib/ThemeContext";
import { toast } from "sonner";
import type { ReactNode } from "react";
import { motion } from "framer-motion";

const NAV = [
  { path: "/dashboard", label: "Overview", icon: Activity, roles: ["MANUFACTURER", "SUPPLIER", "LOCAL_SHOP"] },
  { path: "/blockchain", label: "Web3 Hub", icon: GitBranch, roles: ["MANUFACTURER", "SUPPLIER", "LOCAL_SHOP"] },
  { path: "/manufacturer", label: "Add Batch", icon: Boxes, roles: ["MANUFACTURER"] },
  { path: "/track", label: "Track", icon: GitBranch, roles: ["MANUFACTURER", "SUPPLIER"] },
  { path: "/verify", label: "Verify", icon: ShieldCheck, roles: ["SUPPLIER", "LOCAL_SHOP"] },
  { path: "/insights", label: "AI Insights", icon: TrendingUp, roles: ["MANUFACTURER"] },
  { path: "/routing", label: "Smart Routing", icon: RouteIcon, roles: ["MANUFACTURER", "SUPPLIER"] },
];

function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className={cn(
        "relative flex items-center w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none border",
        isDark
          ? "bg-slate-700 border-slate-600"
          : "bg-blue-100 border-blue-200"
      )}
    >
      {/* Icons */}
      <Sun className={cn(
        "absolute left-1 h-3.5 w-3.5 transition-all duration-300",
        isDark ? "opacity-30 text-slate-400" : "opacity-100 text-amber-500"
      )} />
      <Moon className={cn(
        "absolute right-1 h-3.5 w-3.5 transition-all duration-300",
        isDark ? "opacity-100 text-blue-300" : "opacity-30 text-slate-400"
      )} />
      {/* Thumb */}
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className={cn(
          "absolute h-4.5 w-4.5 rounded-full shadow-md",
          isDark ? "bg-blue-400 left-6" : "bg-white left-0.5"
        )}
        style={{ width: 18, height: 18 }}
      />
    </button>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { state, resetDemo, logout } = useStore();
  const { theme } = useTheme();

  const activeAlerts = state.alerts.filter((a) => a.level !== "info").length;
  const isDark = theme === "dark";
  const user = state.currentUser;
  
  // Filter navigation links by user role
  const filteredNav = NAV.filter(item => !user || item.roles.includes(user.role));

  return (
    <div className={cn(
      "min-h-screen w-full grid grid-cols-[260px_1fr]",
      isDark ? "bg-background text-foreground" : "bg-slate-50 text-slate-900"
    )}>
      {/* ── SIDEBAR ─────────────────────────────────────────────────────────── */}
      <aside className={cn(
        "border-r flex flex-col",
        isDark
          ? "border-sidebar-border bg-sidebar text-sidebar-foreground"
          : "border-slate-200 bg-white text-slate-700 shadow-sm"
      )}>
        <div className={cn("p-6 border-b", isDark ? "border-sidebar-border" : "border-slate-100")}>
          <div className="flex items-center gap-3">
            <div className={cn(
              "h-10 w-10 rounded-lg flex items-center justify-center",
              isDark
                ? "bg-primary/15 border border-primary/30 text-primary glow-teal"
                : "bg-blue-600 text-white shadow-md"
            )}>
              <Pill className="h-5 w-5" />
            </div>
            <div>
              <div className={cn("text-sm font-semibold tracking-tight", isDark ? "text-foreground" : "text-slate-900")}>
                PharmaTrace
              </div>
              <div className={cn("text-[10px] uppercase tracking-[0.18em]", isDark ? "text-muted-foreground" : "text-slate-400")}>
                Provenance Console
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {filteredNav.map((item) => {
            const Icon = item.icon;
            const active = location === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={cn(
                  "group flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors hover-elevate",
                  active
                    ? isDark
                      ? "bg-sidebar-accent text-sidebar-accent-foreground border border-sidebar-border"
                      : "bg-blue-50 text-blue-700 border border-blue-100"
                    : isDark
                      ? "text-sidebar-foreground/80 hover:text-foreground hover:bg-sidebar-accent/60"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                )}
                data-testid={`nav-${item.path.replace("/", "") || "home"}`}
              >
                <Icon className={cn(
                  "h-4 w-4 shrink-0 transition-colors",
                  active
                    ? isDark ? "text-primary" : "text-blue-600"
                    : isDark ? "text-muted-foreground group-hover:text-foreground" : "text-slate-400 group-hover:text-slate-600"
                )} />
                <span className={cn(active && (isDark ? "text-foreground font-medium" : "text-blue-700 font-semibold"))}>
                  {item.label}
                </span>
                {item.path === "/dashboard" && activeAlerts > 0 && (
                  <span className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-[10px] font-semibold text-destructive-foreground">
                    {activeAlerts}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom panel */}
        <div className={cn("p-4 border-t space-y-3", isDark ? "border-sidebar-border" : "border-slate-100")}>
          {/* Ledger status */}
          <div className={cn(
            "rounded-md border p-3",
            isDark ? "border-sidebar-border bg-sidebar-accent/40" : "border-slate-100 bg-slate-50"
          )}>
            <div className={cn("text-[10px] uppercase tracking-widest mb-1", isDark ? "text-muted-foreground" : "text-slate-400")}>
              Ledger Status
            </div>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-60", isDark ? "bg-primary" : "bg-blue-500")} />
                <span className={cn("relative inline-flex rounded-full h-2 w-2", isDark ? "bg-primary" : "bg-blue-500")} />
              </span>
              <span className={cn("text-xs font-mono", isDark ? "text-foreground" : "text-slate-600")}>
                SYNCED · {state.batches.length} BATCHES
              </span>
            </div>
          </div>

          {/* Theme toggle row */}
          <div className={cn(
            "flex items-center justify-between px-1 py-2 rounded-md",
            isDark ? "text-muted-foreground" : "text-slate-500"
          )}>
            <span className="text-xs font-medium">{isDark ? "Dark mode" : "Light mode"}</span>
            <ThemeToggle />
          </div>

          {/* Current User */}
          {user && (
            <div className={cn(
              "flex items-center gap-3 px-2 py-2 rounded-md",
              isDark ? "bg-sidebar-accent/30 border border-sidebar-border" : "bg-slate-50 border border-slate-100"
            )}>
              <div className={cn("p-1.5 rounded-full", isDark ? "bg-primary/20 text-primary" : "bg-blue-100 text-blue-600")}>
                <User className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className={cn("text-xs font-semibold truncate", isDark ? "text-foreground" : "text-slate-900")}>{user.name}</div>
                <div className={cn("text-[10px] capitalize", isDark ? "text-muted-foreground" : "text-slate-500")}>
                  {user.role.replace("_", " ").toLowerCase()}
                </div>
              </div>
            </div>
          )}

          {/* Logout / Reset button group */}
          <div className="flex gap-2">
            {user ? (
              <button
                onClick={() => {
                  logout();
                  toast("Logged out", { description: "You have been securely signed out." });
                }}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-xs border hover-elevate transition-colors",
                  isDark
                    ? "text-muted-foreground hover:text-rose-400 border-sidebar-border hover:border-rose-400/50"
                    : "text-slate-500 hover:text-rose-600 border-slate-200 hover:bg-rose-50"
                )}
              >
                <LogOut className="h-3.5 w-3.5" />
                Logout
              </button>
            ) : null}
            <button
              onClick={async () => {
                await resetDemo();
                toast.success("Demo data reseeded", {
                  description: "All batches and chains restored to baseline.",
                });
              }}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-xs border hover-elevate transition-colors",
                isDark
                  ? "text-muted-foreground hover:text-foreground border-sidebar-border"
                  : "text-slate-500 hover:text-slate-800 border-slate-200 hover:bg-slate-100"
              )}
              title="Reset Demo Data"
              data-testid="button-reset-demo"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              {user ? "Reset" : "Reset demo data"}
            </button>
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT ─────────────────────────────────────────────────────── */}
      <main className="min-h-screen overflow-x-hidden">
        {/* Top bar */}
        <div className={cn(
          "border-b backdrop-blur sticky top-0 z-20",
          isDark ? "border-border/60 bg-background/40" : "border-slate-200/80 bg-white/80"
        )}>
          <div className="px-8 py-4 flex items-center justify-between">
            <div>
              <div className={cn("text-[10px] uppercase tracking-[0.2em]", isDark ? "text-muted-foreground" : "text-slate-400")}>
                Predictive Pharmaceutical Tracking & Provenance
              </div>
              <div className={cn("text-lg font-semibold tracking-tight", isDark ? "" : "text-slate-900")}>
                Tamper-proof. Predictive. Optimized.
              </div>
            </div>
            <div className={cn("flex items-center gap-6 text-xs font-mono", isDark ? "text-muted-foreground" : "text-slate-400")}>
              <div>
                <span className={isDark ? "text-primary" : "text-blue-500"}>●</span> {state.batches.length} batches
              </div>
              <div>
                <span className="text-amber-400">●</span>{" "}
                {state.batches.filter((b) => b.status === "IN_TRANSIT").length} in transit
              </div>
              <div>
                <span className={isDark ? "text-destructive" : "text-red-500"}>●</span> {activeAlerts} alerts
              </div>
            </div>
          </div>
        </div>
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
