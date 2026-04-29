import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";
import { StoreProvider } from "@/lib/StoreProvider";
import { AppShell } from "@/components/AppShell";
import { Overview } from "@/pages/Overview";
import { Manufacturer } from "@/pages/Manufacturer";
import { Track } from "@/pages/Track";
import { Verify } from "@/pages/Verify";
import { Insights } from "@/pages/Insights";
import { Routing } from "@/pages/Routing";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function AppRouter() {
  return (
    <Switch>
      <Route path="/" component={Overview} />
      <Route path="/manufacturer" component={Manufacturer} />
      <Route path="/track" component={Track} />
      <Route path="/verify" component={Verify} />
      <Route path="/insights" component={Insights} />
      <Route path="/routing" component={Routing} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <StoreProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <AppShell>
              <AppRouter />
            </AppShell>
          </WouterRouter>
          <Toaster
            theme="dark"
            position="top-right"
            toastOptions={{
              style: {
                background: "hsl(222 45% 9%)",
                border: "1px solid hsl(217 33% 17%)",
                color: "hsl(210 40% 96%)",
              },
            }}
          />
        </StoreProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
