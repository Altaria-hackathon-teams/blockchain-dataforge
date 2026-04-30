import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  StoreContext,
  buildInitialState,
  loadPersistedState,
  persistState,
  clearPersistedState,
  type AppState,
  type Alert,
  type Batch,
} from "./store";
import { addBlock, type Block } from "./blockchain";

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const persisted = loadPersistedState();
      if (persisted) {
        if (!cancelled) setState(persisted);
        return;
      }
      const fresh = await buildInitialState();
      if (!cancelled) {
        setState(fresh);
        persistState(fresh);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (state) persistState(state);
  }, [state]);

  const value = useMemo(() => {
    if (!state) return null;

    return {
      state,
      registerBatch: async (input: Omit<Batch, "status" | "dispatchPin">) => {
        const ts = new Date().toISOString();
        const chain = await addBlock([], {
          timestamp: ts,
          batchId: input.id,
          event: "MANUFACTURED",
          location: `Manufacturing Facility • ${input.region}`,
          handler: input.manufacturer,
        });
        const pin = Math.floor(100000 + Math.random() * 900000).toString();
        const newBatch: Batch = { ...input, status: "MANUFACTURED", dispatchPin: pin };
        setState((s) => {
          if (!s) return s;
          return {
            ...s,
            batches: [newBatch, ...s.batches],
            chains: { ...s.chains, [input.id]: chain },
            alerts: [
              {
                id: `alert-${Date.now()}`,
                level: "info",
                title: "New batch committed to ledger",
                message: `${input.drugName} (${input.id}) registered by ${input.manufacturer}.`,
                timestamp: ts,
              },
              ...s.alerts,
            ],
          };
        });
        return { chain, pin };
      },
      advanceBatch: async (
        batchId: string,
        stop: { event: Block["event"]; location: string; handler: string }
      ) => {
        const current = state.chains[batchId];
        if (!current) return null;
        const ts = new Date().toISOString();
        const next = await addBlock(current, {
          timestamp: ts,
          batchId,
          event: stop.event,
          location: stop.location,
          handler: stop.handler,
        });
        const newStatus: Batch["status"] =
          stop.event === "RECEIVED_PHARMACY" ? "DELIVERED" : "IN_TRANSIT";
        setState((s) => {
          if (!s) return s;
          return {
            ...s,
            chains: { ...s.chains, [batchId]: next },
            batches: s.batches.map((b) =>
              b.id === batchId ? { ...b, status: newStatus } : b
            ),
          };
        });
        return next;
      },
      resetDemo: async () => {
        clearPersistedState();
        const fresh = await buildInitialState();
        setState(fresh);
      },
      pushAlert: (a: Omit<Alert, "id" | "timestamp">) => {
        setState((s) => {
          if (!s) return s;
          return {
            ...s,
            alerts: [
              {
                ...a,
                id: `alert-${Date.now()}`,
                timestamp: new Date().toISOString(),
              },
              ...s.alerts,
            ],
          };
        });
      },
      login: (user) => {
        setState((s) => s ? { ...s, currentUser: user } : null);
      },
      logout: () => {
        setState((s) => s ? { ...s, currentUser: null } : null);
      },
    };
  }, [state]);

  if (!state || !value) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background">
        <div className="text-muted-foreground text-sm font-mono tracking-widest">
          INITIALIZING LEDGER…
        </div>
      </div>
    );
  }

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}
