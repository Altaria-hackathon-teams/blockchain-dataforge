import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  StoreContext,
  buildInitialState,
  type AppState,
  type Alert,
  type Batch,
  type User,
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
  getDocs,
  writeBatch
} from "firebase/firestore";

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState | null>(null);

  useEffect(() => {
    let cancelled = false;

    // Seed database if empty, then start listening
    (async () => {
      try {
        const batchesSnap = await getDocs(collection(db, "batches"));
        
        if (batchesSnap.empty) {
          console.log("Database is empty. Seeding with initial state...");
          const fresh = await buildInitialState();
          
          // Use a Firestore Batch to write all seed data safely
          const firestoreBatch = writeBatch(db);
          
          fresh.batches.forEach(b => {
            firestoreBatch.set(doc(db, "batches", b.id), b);
          });
          
          Object.entries(fresh.chains).forEach(([batchId, chain]) => {
            firestoreBatch.set(doc(db, "chains", batchId), { blocks: chain });
          });
          
          fresh.alerts.forEach(a => {
            firestoreBatch.set(doc(db, "alerts", a.id), a);
          });

          await firestoreBatch.commit();
          console.log("Database seeded successfully.");
        }
      } catch (err) {
        console.error("Firebase Seeding Error (check Firestore Rules!):", err);
      }

      // Start Real-time Listeners after ensuring data exists
      if (cancelled) return;

      // Initialize base state immediately so UI doesn't hang
      setState(s => s || {
        batches: [],
        chains: {},
        alerts: [],
        knownCounterfeitId: "CTRF-9981",
        currentUser: null
      });

      const unsubBatches = onSnapshot(collection(db, "batches"), (snap) => {
        const batches = snap.docs.map(d => d.data() as Batch);
        setState(s => s ? { ...s, batches } : null);
      }, (err) => {
        console.error("Batches Listener Error:", err);
      });

      const unsubAlerts = onSnapshot(query(collection(db, "alerts"), orderBy("timestamp", "desc"), limit(20)), (snap) => {
        const alerts = snap.docs.map(d => ({ ...d.data(), id: d.id } as Alert));
        setState(s => s ? { ...s, alerts } : null);
      }, (err) => {
        console.error("Alerts Listener Error:", err);
      });

      const unsubChains = onSnapshot(collection(db, "chains"), (snap) => {
        const chains: Record<string, Block[]> = {};
        snap.docs.forEach(d => {
          chains[d.id] = d.data().blocks as Block[];
        });
        setState(s => s ? { ...s, chains, knownCounterfeitId: "CTRF-9981", currentUser: s.currentUser } : null);
      }, (err) => {
        console.error("Chains Listener Error:", err);
      });

      return () => {
        unsubBatches();
        unsubAlerts();
        unsubChains();
      };
    })();

    return () => {
      cancelled = true;
    };
  }, []);

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
        
        // Write to Firebase (non-blocking to prevent UI freeze on slow networks)
        setDoc(doc(db, "batches", input.id), newBatch).catch(e => toast.error("Firebase Batch Error: " + e.message));
        setDoc(doc(db, "chains", input.id), { blocks: chain }).catch(e => toast.error("Firebase Chain Error: " + e.message));
        addDoc(collection(db, "alerts"), {
          level: "info",
          title: "New batch committed to ledger",
          message: `${input.drugName} (${input.id}) registered by ${input.manufacturer}.`,
          timestamp: ts,
        }).catch(e => toast.error("Firebase Alert Error: " + e.message));

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

        let alertTitle = "";
        let alertMessage = "";
        
        if (stop.event === "SHIPPED_TO_DISTRIBUTOR") {
          alertTitle = "Shipment En Route to Distributor";
          alertMessage = `Manufacturer has dispatched batch ${batchId}. Expected soon at Regional Distributor.`;
        } else if (stop.event === "SHIPPED_TO_PHARMACY") {
          alertTitle = "Shipment En Route to Pharmacy";
          alertMessage = `Distributor has dispatched batch ${batchId} to Local Pharmacy.`;
        }

        if (alertTitle) {
          addDoc(collection(db, "alerts"), {
            level: "info",
            title: alertTitle,
            message: alertMessage,
            timestamp: ts,
          }).catch(e => console.error("Firebase Alert Error: " + e.message));
        }

        return next;
      },
      resetDemo: async () => {
        clearPersistedState();
        const fresh = await buildInitialState();
        setState(fresh);
      },
      pushAlert: async (a: Omit<Alert, "id" | "timestamp">) => {
        addDoc(collection(db, "alerts"), {
          ...a,
          timestamp: new Date().toISOString(),
        }).catch(e => toast.error("Firebase Alert Error: " + e.message));
      },
      login: (user: User) => {
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
