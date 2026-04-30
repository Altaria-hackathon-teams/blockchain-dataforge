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
import { db } from "./firebase";
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  addDoc, 
  query, 
  orderBy, 
  limit,
  writeBatch
} from "firebase/firestore";

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState | null>(null);

  useEffect(() => {
    let cancelled = false;
    
    // Initialize base state
    (async () => {
      const persisted = loadPersistedState();
      if (persisted) {
        if (!cancelled) setState(persisted);
      } else {
        const fresh = await buildInitialState();
        if (!cancelled) setState(fresh);
      }
    })();

    // Listen to Firebase Collections for real-time updates
    const unsubBatches = onSnapshot(collection(db, "batches"), (snap) => {
      const batches = snap.docs.map(d => d.data() as Batch);
      setState(s => s ? { ...s, batches } : s);
    });

    const unsubAlerts = onSnapshot(query(collection(db, "alerts"), orderBy("timestamp", "desc"), limit(20)), (snap) => {
      const alerts = snap.docs.map(d => ({ ...d.data(), id: d.id } as Alert));
      setState(s => s ? { ...s, alerts } : s);
    });

    const unsubChains = onSnapshot(collection(db, "chains"), (snap) => {
      const chains: Record<string, Block[]> = {};
      snap.docs.forEach(d => {
        chains[d.id] = d.data().blocks as Block[];
      });
      setState(s => s ? { ...s, chains } : s);
    });

    return () => {
      cancelled = true;
      unsubBatches();
      unsubAlerts();
      unsubChains();
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
        
        // Write to Firebase
        await setDoc(doc(db, "batches", input.id), newBatch);
        await setDoc(doc(db, "chains", input.id), { blocks: chain });
        await addDoc(collection(db, "alerts"), {
          level: "info",
          title: "New batch committed to ledger",
          message: `${input.drugName} (${input.id}) registered by ${input.manufacturer}.`,
          timestamp: ts,
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
        
        // Write to Firebase
        await setDoc(doc(db, "chains", batchId), { blocks: next });
        const batchRef = doc(db, "batches", batchId);
        await setDoc(batchRef, { status: newStatus }, { merge: true });

        return next;
      },
      resetDemo: async () => {
        clearPersistedState();
        const fresh = await buildInitialState();
        setState(fresh);
      },
      pushAlert: async (a: Omit<Alert, "id" | "timestamp">) => {
        await addDoc(collection(db, "alerts"), {
          ...a,
          timestamp: new Date().toISOString(),
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
