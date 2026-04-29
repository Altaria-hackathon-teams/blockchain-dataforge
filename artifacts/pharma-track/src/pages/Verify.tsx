import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScanSearch, ShieldAlert, ShieldCheck, Loader2 } from "lucide-react";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChainTimeline } from "@/components/ChainTimeline";
import { verifyChain } from "@/lib/blockchain";
import { toast } from "sonner";

type Result =
  | null
  | { kind: "verified"; batchId: string }
  | { kind: "counterfeit"; batchId: string; reason: string };

export function Verify() {
  const { state } = useStore();
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result>(null);
  const [chainOk, setChainOk] = useState<boolean | null>(null);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    const id = query.trim();
    if (!id) return;
    setBusy(true);
    setResult(null);
    setChainOk(null);
    try {
      await new Promise((r) => setTimeout(r, 600));
      const chain = state.chains[id];
      if (chain && chain.length > 0) {
        const ok = await verifyChain(chain);
        setChainOk(ok);
        if (ok) {
          setResult({ kind: "verified", batchId: id });
          toast.success("Chain verified", {
            description: `${chain.length} blocks intact for ${id}`,
            icon: <ShieldCheck className="h-4 w-4 text-primary" />,
          });
        } else {
          setResult({
            kind: "counterfeit",
            batchId: id,
            reason: "Hash linkage broken — chain has been tampered with.",
          });
        }
      } else {
        setResult({
          kind: "counterfeit",
          batchId: id,
          reason: "Batch ID not found on ledger. No genesis block exists for this identifier.",
        });
        toast.error("Counterfeit detected", {
          description: `${id} does not exist on chain.`,
          icon: <ShieldAlert className="h-4 w-4" />,
        });
      }
    } finally {
      setBusy(false);
    }
  }

  const verifiedChain = result?.kind === "verified" ? state.chains[result.batchId] ?? [] : [];
  const verifiedBatch =
    result?.kind === "verified"
      ? state.batches.find((b) => b.id === result.batchId)
      : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Verify a Batch</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Paste any batch ID. If it's not on chain — or its hashes don't match — we'll surface it instantly.
        </p>
      </div>

      <form
        onSubmit={handleVerify}
        className="rounded-xl border border-border bg-card p-6"
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="e.g. BATCH-PCM-2410 or CTRF-9981"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="font-mono h-11"
              data-testid="input-verify"
            />
          </div>
          <Button type="submit" size="lg" disabled={busy} data-testid="button-verify">
            {busy ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Cross-checking ledger…
              </>
            ) : (
              <>
                <ScanSearch className="h-4 w-4 mr-2" />
                Verify on chain
              </>
            )}
          </Button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <span className="text-muted-foreground">Try:</span>
          {[state.batches[0]?.id, state.knownCounterfeitId, state.batches[2]?.id]
            .filter(Boolean)
            .map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setQuery(id as string)}
                className="font-mono text-[11px] px-2 py-0.5 rounded border border-border bg-muted/40 text-muted-foreground hover:text-foreground hover-elevate"
              >
                {id}
              </button>
            ))}
        </div>
      </form>

      <AnimatePresence mode="wait">
        {result?.kind === "counterfeit" && (
          <motion.div
            key="counterfeit"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="rounded-xl border border-destructive/50 bg-destructive/5 p-6 glow-red"
          >
            <div className="flex items-start gap-4">
              <div className="relative">
                <div className="h-12 w-12 rounded-lg border border-destructive/60 bg-destructive/10 flex items-center justify-center text-destructive animate-pulse-ring">
                  <ShieldAlert className="h-6 w-6" />
                </div>
              </div>
              <div className="flex-1">
                <div className="text-[10px] uppercase tracking-[0.25em] text-destructive font-medium">
                  Counterfeit detected
                </div>
                <div className="mt-1 text-xl font-semibold tracking-tight text-foreground">
                  Batch <span className="font-mono text-destructive">{result.batchId}</span> failed verification
                </div>
                <p className="mt-2 text-sm text-muted-foreground max-w-2xl">{result.reason}</p>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="rounded-md border border-destructive/30 bg-background/40 p-3">
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Recommendation</div>
                    <div className="mt-1 text-sm">Quarantine immediately</div>
                  </div>
                  <div className="rounded-md border border-destructive/30 bg-background/40 p-3">
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Notified</div>
                    <div className="mt-1 text-sm">Regulatory · Distributor · Manufacturer</div>
                  </div>
                  <div className="rounded-md border border-destructive/30 bg-background/40 p-3">
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Severity</div>
                    <div className="mt-1 text-sm font-mono">CRITICAL</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {result?.kind === "verified" && verifiedBatch && (
          <motion.div
            key="verified"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-4"
          >
            <div className="rounded-xl border border-primary/40 bg-primary/5 p-6 glow-teal">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-lg border border-primary/40 bg-primary/10 flex items-center justify-center text-primary">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <div className="text-[10px] uppercase tracking-[0.25em] text-primary font-medium">
                    Verified authentic
                  </div>
                  <div className="mt-1 text-xl font-semibold tracking-tight">
                    {verifiedBatch.drugName}
                  </div>
                  <div className="mt-1 text-xs font-mono text-muted-foreground">
                    {verifiedBatch.id} · {verifiedBatch.manufacturer} · {verifiedBatch.region}
                  </div>
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="rounded-md border border-primary/30 bg-background/40 p-3">
                      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Hash linkage</div>
                      <div className="mt-1 text-sm">{chainOk ? "Intact across all blocks" : "Mismatched"}</div>
                    </div>
                    <div className="rounded-md border border-primary/30 bg-background/40 p-3">
                      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Blocks recorded</div>
                      <div className="mt-1 text-sm font-mono">{verifiedChain.length}</div>
                    </div>
                    <div className="rounded-md border border-primary/30 bg-background/40 p-3">
                      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Status</div>
                      <div className="mt-1 text-sm">{verifiedBatch.status.replace("_", " ").toLowerCase()}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-5">
              <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-4">
                Verified provenance chain
              </div>
              <ChainTimeline chain={verifiedChain} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
