import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";
import { StoreProvider } from "@/lib/StoreProvider";
import { ThemeProvider } from "@/lib/ThemeContext";
import { AppShell } from "@/components/AppShell";
import { Overview } from "@/pages/Overview";
import { Manufacturer } from "@/pages/Manufacturer";
import { BlockchainDashboard } from "@/pages/BlockchainDashboard";
import { Track } from "@/pages/Track";
import { Verify } from "@/pages/Verify";
import { Insights } from "@/pages/Insights";
import { Routing } from "@/pages/Routing";
import { Landing } from "@/pages/Landing";
import { Auth } from "@/pages/Auth";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function DashboardRouter() {
  return (
    <AppShell>
      <Switch>
        <Route path="/dashboard" component={Overview} />
        <Route path="/manufacturer" component={Manufacturer} />
        <Route path="/blockchain" component={BlockchainDashboard} />
        <Route path="/track" component={Track} />
        <Route path="/verify" component={Verify} />
        <Route path="/insights" component={Insights} />
        <Route path="/routing" component={Routing} />
        <Route component={NotFound} />
      </Switch>
    </AppShell>
  );
}

function MainRouter() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/login">
        <Auth />
      </Route>
      <Route path="/register">
        <Auth />
      </Route>
      {/* Any other route falls through to DashboardRouter, which has its own NotFound */}
      <Route component={DashboardRouter} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <StoreProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <MainRouter />
            </WouterRouter>
            <Toaster
              theme="system"
              position="top-right"
              toastOptions={{
                style: {
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  color: "hsl(var(--foreground))",
                },
              }}
            />
          </StoreProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
