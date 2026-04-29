import { useState } from "react";
import { motion } from "framer-motion";
import { Boxes, Hash, Loader2, ShieldCheck, Sparkles } from "lucide-react";
import { useStore, MANUFACTURERS, REGIONS, SAMPLE_DRUG_NAMES } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HashChip } from "@/components/HashChip";
import { toast } from "sonner";

function genBatchId(drugName: string) {
  const code = drugName.replace(/[^A-Z]/gi, "").slice(0, 3).toUpperCase() || "RX";
  const num = Math.floor(1000 + Math.random() * 9000);
  return `BATCH-${code}-${num}`;
}

export function Manufacturer() {
  const { registerBatch } = useStore();
  const [drugName, setDrugName] = useState(SAMPLE_DRUG_NAMES[0]);
  const [manufacturer, setManufacturer] = useState(MANUFACTURERS[0]);
  const [region, setRegion] = useState(REGIONS[0]);
  const [quantity, setQuantity] = useState("10000");
  const [batchId, setBatchId] = useState(() => genBatchId(SAMPLE_DRUG_NAMES[0]));
  const [manufactureDate, setManufactureDate] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [expiryDate, setExpiryDate] = useState(() =>
    new Date(Date.now() + 730 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );

  const [submitting, setSubmitting] = useState(false);
  const [lastBlockHash, setLastBlockHash] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setLastBlockHash(null);
    try {
      // Simulate ledger commit latency for visual drama
      await new Promise((r) => setTimeout(r, 700));
      const chain = await registerBatch({
        id: batchId,
        drugName,
        manufacturer,
        region,
        quantity: Number(quantity) || 0,
        manufactureDate,
        expiryDate,
      });
      const hash = chain[chain.length - 1].hash;
      setLastBlockHash(hash);
      toast.success("Block committed to ledger", {
        description: `Block #0 · 0x${hash.slice(0, 8)}…`,
        icon: <ShieldCheck className="h-4 w-4 text-primary" />,
      });
      setBatchId(genBatchId(drugName));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Register a New Batch</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manufacturer module — commit a new drug batch to the tamper-proof ledger as Block #0.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6">
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-border bg-card p-6 space-y-5"
        >
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            <Boxes className="h-3.5 w-3.5" /> Batch metadata
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="drugName">Drug name</Label>
              <Select
                value={drugName}
                onValueChange={(v) => {
                  setDrugName(v);
                  setBatchId(genBatchId(v));
                }}
              >
                <SelectTrigger id="drugName" data-testid="select-drug">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SAMPLE_DRUG_NAMES.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="batchId">Batch ID</Label>
              <Input
                id="batchId"
                value={batchId}
                onChange={(e) => setBatchId(e.target.value)}
                className="font-mono"
                data-testid="input-batch-id"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="manufacturer">Manufacturer</Label>
              <Select value={manufacturer} onValueChange={setManufacturer}>
                <SelectTrigger id="manufacturer" data-testid="select-manufacturer">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MANUFACTURERS.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="region">Region of origin</Label>
              <Select value={region} onValueChange={setRegion}>
                <SelectTrigger id="region" data-testid="select-region">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REGIONS.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="quantity">Quantity (units)</Label>
              <Input
                id="quantity"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                data-testid="input-quantity"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="manufactureDate">Manufacture date</Label>
              <Input
                id="manufactureDate"
                type="date"
                value={manufactureDate}
                onChange={(e) => setManufactureDate(e.target.value)}
                data-testid="input-mfg-date"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="expiryDate">Expiry date</Label>
              <Input
                id="expiryDate"
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                data-testid="input-exp-date"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <Button
              type="submit"
              size="lg"
              className="font-semibold"
              disabled={submitting}
              data-testid="button-register"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Computing SHA-256…
                </>
              ) : (
                <>
                  <Hash className="h-4 w-4 mr-2" />
                  Register on Blockchain
                </>
              )}
            </Button>
            <span className="text-xs text-muted-foreground">
              Each registration computes a SHA-256 hash linked to the previous block.
            </span>
          </div>
        </form>

        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5" /> How registration works
            </div>
            <ol className="mt-3 space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="text-primary font-mono">01</span>
                <span>
                  Batch metadata is normalized and timestamped at the moment of capture.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary font-mono">02</span>
                <span>
                  A SHA-256 digest is computed over <span className="font-mono text-foreground/90">index + ts + batchId + event + location + handler + prevHash</span>.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary font-mono">03</span>
                <span>
                  Block is appended to the chain. Any future tampering breaks the linkage and the chain fails verification.
                </span>
              </li>
            </ol>
          </div>

          {lastBlockHash && (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-xl border border-primary/40 bg-primary/5 p-6 glow-teal"
            >
              <div className="flex items-center gap-2 text-primary text-sm font-medium">
                <ShieldCheck className="h-4 w-4" /> Block committed
              </div>
              <div className="mt-3 text-xs text-muted-foreground">
                Genesis block hash for this batch:
              </div>
              <div className="mt-2">
                <HashChip hash={lastBlockHash} className="text-primary border-primary/40" />
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Open the <span className="text-foreground">Track</span> tab to advance this batch through distributor and pharmacy checkpoints.
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
