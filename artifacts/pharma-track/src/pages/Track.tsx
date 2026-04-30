import { useMemo, useState } from "react";
import { ChainTimeline } from "@/components/ChainTimeline";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { GitBranch, PackageCheck, Truck, Warehouse } from "lucide-react";
import { toast } from "sonner";
import type { EventType } from "@/lib/blockchain";
import { motion } from "framer-motion";

const NEXT_STEP: Partial<Record<EventType, { event: EventType; label: string; location: string; handler: string; allowedRole: string }>> = {
  MANUFACTURED: {
    event: "SHIPPED_TO_DISTRIBUTOR",
    label: "Ship to Distributor",
    location: "Outbound Logistics",
    handler: "Dispatch",
    allowedRole: "MANUFACTURER",
  },
  SHIPPED_TO_DISTRIBUTOR: {
    event: "RECEIVED_DISTRIBUTOR",
    label: "Receive at Distributor",
    location: "Regional Distributor",
    handler: "Warehouse Mgr",
    allowedRole: "SUPPLIER",
  },
  RECEIVED_DISTRIBUTOR: {
    event: "SHIPPED_TO_PHARMACY",
    label: "Ship to Pharmacy",
    location: "Last-mile Logistics",
    handler: "Carrier",
    allowedRole: "SUPPLIER",
  },
  SHIPPED_TO_PHARMACY: {
    event: "RECEIVED_PHARMACY",
    label: "Receive at Pharmacy",
    location: "Retail Pharmacy",
    handler: "Pharmacist",
    allowedRole: "LOCAL_SHOP",
  },
};

function statusTone(status: string) {
  if (status === "DELIVERED") return "border-emerald-400/30 text-emerald-400 bg-emerald-400/5";
  if (status === "IN_TRANSIT") return "border-amber-400/30 text-amber-400 bg-amber-400/5";
  if (status === "FLAGGED") return "border-destructive/40 text-destructive bg-destructive/5";
  return "border-primary/30 text-primary bg-primary/5";
}

export function Track() {
  const { state, advanceBatch, pushAlert } = useStore();
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(state.batches[0]?.id ?? null);
  const user = state.currentUser;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return state.batches;
    return state.batches.filter(
      (b) =>
        b.id.toLowerCase().includes(q) ||
        b.drugName.toLowerCase().includes(q) ||
        b.manufacturer.toLowerCase().includes(q) ||
        b.region.toLowerCase().includes(q)
    );
  }, [state.batches, query]);

  const selected = state.batches.find((b) => b.id === selectedId) ?? state.batches[0] ?? null;
  const chain = selected ? state.chains[selected.id] ?? [] : [];
  const last = chain[chain.length - 1];
  const nextStep = last ? NEXT_STEP[last.event] : null;

  async function handleAdvance() {
    if (!selected || !nextStep) return;
    const next = await advanceBatch(selected.id, {
      event: nextStep.event,
      location: `${nextStep.location} • ${selected.region}`,
      handler: nextStep.handler,
    });
    if (next) {
      const newHash = next[next.length - 1].hash;
      toast.success(`Block #${next.length - 1} committed`, {
        description: `0x${newHash.slice(0, 8)}…`,
      });
    }
  }

  function handleSendCodeToLocalShop() {
    if (!selected) return;
    pushAlert({
      level: "info",
      title: `Dispatch Code for ${selected.drugName}`,
      message: `Supplier has dispatched Batch ${selected.id} to your location. The access code to verify delivery is: ${selected.dispatchPin}`,
    });
    toast.success("Dispatch code sent to Local Shop");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Supply Chain Tracking</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manufacturer → Distributor → Pharmacy. Every handoff committed as a hash-linked block.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6">
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="p-4 border-b border-border">
            <Input
              type="search"
              placeholder="Search batch / drug / manufacturer"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              data-testid="input-search-batches"
            />
          </div>
          <div className="max-h-[640px] overflow-y-auto">
            {filtered.map((b) => {
              const active = selected?.id === b.id;
              return (
                <button
                  key={b.id}
                  onClick={() => setSelectedId(b.id)}
                  className={`w-full text-left px-4 py-3 border-b border-border/60 last:border-0 transition-colors hover-elevate ${
                    active ? "bg-accent/40" : ""
                  }`}
                  data-testid={`row-batch-${b.id}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-sm font-medium leading-tight">{b.drugName}</div>
                      <div className="text-[11px] font-mono text-muted-foreground mt-0.5">{b.id}</div>
                    </div>
                    <Badge className={`shrink-0 border ${statusTone(b.status)}`} variant="outline">
                      {b.status.replace("_", " ").toLowerCase()}
                    </Badge>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>{b.manufacturer}</span>
                    <span>{b.region}</span>
                  </div>
                </button>
              );
            })}
            {filtered.length === 0 && (
              <div className="p-6 text-sm text-muted-foreground text-center">
                No batches match that search.
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {selected ? (
            <>
              <motion.div
                key={selected.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-border bg-card p-5"
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                      Batch detail
                    </div>
                    <h2 className="mt-1 text-xl font-semibold tracking-tight">
                      {selected.drugName}
                    </h2>
                    <div className="mt-1 text-xs text-muted-foreground font-mono">
                      {selected.id} · {selected.manufacturer} · {selected.region}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`border ${statusTone(selected.status)}`} variant="outline">
                      {selected.status.replace("_", " ").toLowerCase()}
                    </Badge>
                    {user?.role === "SUPPLIER" && selected.dispatchPin && nextStep && nextStep.event.includes("PHARMACY") && (
                      <Button variant="secondary" onClick={handleSendCodeToLocalShop}>
                        Alert Local Shop (Send Code)
                      </Button>
                    )}
                    {nextStep && user?.role === nextStep.allowedRole && (
                      <Button onClick={handleAdvance} data-testid="button-advance">
                        {nextStep.event.includes("SHIPPED") ? (
                          <Truck className="h-4 w-4 mr-2" />
                        ) : nextStep.event.includes("PHARMACY") ? (
                          <PackageCheck className="h-4 w-4 mr-2" />
                        ) : (
                          <Warehouse className="h-4 w-4 mr-2" />
                        )}
                        {nextStep.label}
                      </Button>
                    )}
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Quantity</div>
                    <div className="mt-0.5 text-foreground/90">{selected.quantity.toLocaleString()} units</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Mfg date</div>
                    <div className="mt-0.5 text-foreground/90 font-mono text-xs">{selected.manufactureDate}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Expiry</div>
                    <div className="mt-0.5 text-foreground/90 font-mono text-xs">{selected.expiryDate}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Blocks</div>
                    <div className="mt-0.5 text-primary font-mono">{chain.length}</div>
                  </div>
                </div>
              </motion.div>

              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center gap-2 mb-4 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  <GitBranch className="h-3.5 w-3.5" /> Provenance chain
                </div>
                <ChainTimeline chain={chain} />
              </div>
            </>
          ) : (
            <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground">
              No batches yet. Register one from the Add Batch screen.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
