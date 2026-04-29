import { createContext, useContext } from "react";
import type { Block } from "./blockchain";
import { addBlock } from "./blockchain";

export interface Batch {
  id: string;
  drugName: string;
  manufacturer: string;
  quantity: number;
  manufactureDate: string;
  expiryDate: string;
  status: "MANUFACTURED" | "IN_TRANSIT" | "DELIVERED" | "FLAGGED";
  region: string;
}

export interface Alert {
  id: string;
  level: "info" | "warning" | "critical";
  title: string;
  message: string;
  timestamp: string;
}

export interface AppState {
  batches: Batch[];
  chains: Record<string, Block[]>;
  alerts: Alert[];
  knownCounterfeitId: string;
}

const STORAGE_KEY = "pharma-track-state-v1";

const MANUFACTURERS = ["Sun Pharma", "Cipla", "Dr. Reddy's", "Lupin", "Aurobindo Pharma", "Zydus Lifesciences"];
const REGIONS = ["Maharashtra", "Karnataka", "Delhi NCR", "Tamil Nadu", "Gujarat", "Telangana", "West Bengal"];

const SEED_BATCHES: Omit<Batch, "status">[] = [
  { id: "BATCH-PCM-2410", drugName: "Paracetamol 500mg", manufacturer: "Sun Pharma", quantity: 50000, manufactureDate: "2026-04-02", expiryDate: "2028-04-02", region: "Maharashtra" },
  { id: "BATCH-AMX-1187", drugName: "Amoxicillin 250mg", manufacturer: "Cipla", quantity: 24000, manufactureDate: "2026-04-08", expiryDate: "2028-04-08", region: "Karnataka" },
  { id: "BATCH-INS-7732", drugName: "Insulin Glargine", manufacturer: "Dr. Reddy's", quantity: 8000, manufactureDate: "2026-04-12", expiryDate: "2027-04-12", region: "Telangana" },
  { id: "BATCH-MET-9043", drugName: "Metformin 500mg", manufacturer: "Lupin", quantity: 60000, manufactureDate: "2026-04-15", expiryDate: "2028-10-15", region: "Gujarat" },
  { id: "BATCH-ATV-3318", drugName: "Atorvastatin 20mg", manufacturer: "Zydus Lifesciences", quantity: 32000, manufactureDate: "2026-04-18", expiryDate: "2028-04-18", region: "Delhi NCR" },
  { id: "BATCH-AZM-5521", drugName: "Azithromycin 500mg", manufacturer: "Aurobindo Pharma", quantity: 18000, manufactureDate: "2026-04-20", expiryDate: "2028-04-20", region: "Tamil Nadu" },
  { id: "BATCH-SAL-6610", drugName: "Salbutamol Inhaler", manufacturer: "Cipla", quantity: 12000, manufactureDate: "2026-04-22", expiryDate: "2028-04-22", region: "Karnataka" },
  { id: "BATCH-HCQ-2204", drugName: "Hydroxychloroquine 200mg", manufacturer: "Sun Pharma", quantity: 14500, manufactureDate: "2026-04-24", expiryDate: "2028-04-24", region: "Maharashtra" },
];

interface JourneyStop {
  event: Block["event"];
  location: string;
  handler: string;
  hoursAgo: number;
}

const FULL_JOURNEY: JourneyStop[] = [
  { event: "MANUFACTURED", location: "Manufacturing Facility", handler: "QA Lead", hoursAgo: 96 },
  { event: "SHIPPED_TO_DISTRIBUTOR", location: "Outbound Logistics", handler: "Dispatch", hoursAgo: 84 },
  { event: "RECEIVED_DISTRIBUTOR", location: "Regional Distributor", handler: "Warehouse Mgr", hoursAgo: 60 },
  { event: "SHIPPED_TO_PHARMACY", location: "Last-mile Logistics", handler: "Carrier", hoursAgo: 36 },
  { event: "RECEIVED_PHARMACY", location: "Retail Pharmacy", handler: "Pharmacist", hoursAgo: 12 },
];

const PARTIAL_JOURNEY: JourneyStop[] = FULL_JOURNEY.slice(0, 3);

async function buildSeedChains(): Promise<{ batches: Batch[]; chains: Record<string, Block[]> }> {
  const batches: Batch[] = [];
  const chains: Record<string, Block[]> = {};

  for (let i = 0; i < SEED_BATCHES.length; i++) {
    const seed = SEED_BATCHES[i];
    const journey = i % 3 === 2 ? PARTIAL_JOURNEY : FULL_JOURNEY;
    let chain: Block[] = [];
    for (const stop of journey) {
      const ts = new Date(Date.now() - stop.hoursAgo * 60 * 60 * 1000).toISOString();
      chain = await addBlock(chain, {
        timestamp: ts,
        batchId: seed.id,
        event: stop.event,
        location: `${stop.location} • ${seed.region}`,
        handler: stop.handler,
      });
    }

    const status: Batch["status"] =
      journey === FULL_JOURNEY ? "DELIVERED" : "IN_TRANSIT";

    batches.push({ ...seed, status });
    chains[seed.id] = chain;
  }

  return { batches, chains };
}

export async function buildInitialState(): Promise<AppState> {
  const { batches, chains } = await buildSeedChains();
  return {
    batches,
    chains,
    knownCounterfeitId: "CTRF-9981",
    alerts: [
      {
        id: "alert-1",
        level: "critical",
        title: "Counterfeit suspected in field",
        message: "Batch ID CTRF-9981 surfaced at retail in Pune but does not exist on chain. Recommend immediate quarantine.",
        timestamp: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
      },
      {
        id: "alert-2",
        level: "warning",
        title: "Demand surge predicted: Paracetamol 500mg",
        message: "Forecast model indicates +52% demand over next 5 days across Maharashtra & Gujarat. Pre-position inventory.",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "alert-3",
        level: "info",
        title: "Cold-chain integrity confirmed",
        message: "Insulin Glargine batch BATCH-INS-7732 maintained 2-8°C across all 5 ledger checkpoints.",
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      },
    ],
  };
}

export function persistState(state: AppState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export function loadPersistedState(): AppState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AppState;
    if (!parsed.batches || !parsed.chains) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearPersistedState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export const StoreContext = createContext<{
  state: AppState;
  registerBatch: (input: Omit<Batch, "status">) => Promise<Block[]>;
  advanceBatch: (batchId: string, stop: { event: Block["event"]; location: string; handler: string }) => Promise<Block[] | null>;
  resetDemo: () => Promise<void>;
  pushAlert: (a: Omit<Alert, "id" | "timestamp">) => void;
} | null>(null);

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

export const SAMPLE_DRUG_NAMES = [
  "Paracetamol 500mg",
  "Amoxicillin 250mg",
  "Insulin Glargine",
  "Metformin 500mg",
  "Atorvastatin 20mg",
  "Azithromycin 500mg",
  "Salbutamol Inhaler",
  "Hydroxychloroquine 200mg",
  "Pantoprazole 40mg",
  "Levothyroxine 50mcg",
];

export { MANUFACTURERS, REGIONS };
