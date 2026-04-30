import { useState } from "react";
import { motion } from "framer-motion";
import { Boxes, Hash, Loader2, ShieldCheck, Sparkles, Printer } from "lucide-react";
import { useStore, MANUFACTURERS, REGIONS, SAMPLE_DRUG_NAMES } from "@/lib/store";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { QRCodeSVG } from "qrcode.react";
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
  const { registerBatch, pushAlert } = useStore();
  const [drugName, setDrugName] = useState(SAMPLE_DRUG_NAMES[0]);
  const [manufacturer, setManufacturer] = useState(MANUFACTURERS[0]);
  const [region, setRegion] = useState(REGIONS[0]);
  const [dosage, setDosage] = useState("500mg");
  const [batchId, setBatchId] = useState(() => genBatchId(SAMPLE_DRUG_NAMES[0]));
  const [manufactureDate, setManufactureDate] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [expiryDate, setExpiryDate] = useState(() =>
    new Date(Date.now() + 730 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );
  const [supplierEmail, setSupplierEmail] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [lastBlockHash, setLastBlockHash] = useState<string | null>(null);
  const [lastBatchId, setLastBatchId] = useState<string | null>(null);
  const [lastDispatchPin, setLastDispatchPin] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setLastBlockHash(null);
    setLastBatchId(null);
    setLastDispatchPin(null);
    try {
      // Simulate ledger commit latency for visual drama
      await new Promise((r) => setTimeout(r, 700));
      
      const payload = {
        medicineName: drugName,
        dosage,
        expiryDate,
        destination: region,
      };

      const response = await fetch("http://localhost:3001/api/shipments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error("Failed to register batch on blockchain");
      }

      const data = await response.json();
      const { batchId: newBatchId, dispatchPin, blockchainHash } = data.shipment;

      setLastBlockHash(blockchainHash);
      setLastBatchId(newBatchId);
      setLastDispatchPin(dispatchPin);
      
      toast.success("Block committed to ledger", {
        description: `Block #0 · 0x${blockchainHash.slice(0, 8)}…`,
        icon: <ShieldCheck className="h-4 w-4 text-primary" />,
      });
      
      // Simulate SMS/Email notification to the supply chain network
      pushAlert({
        level: "warning",
        title: "New Dispatch Ready",
        message: `Batch ${newBatchId} (${drugName}) has been packed by ${manufacturer}. Ready for logistics pickup. Access PIN: ${dispatchPin}`,
      });

      // Actual Email Integration via Firebase
      if (supplierEmail) {
        try {
          await addDoc(collection(db, "mail"), {
            to: supplierEmail,
            message: {
              subject: `PharmaTrace: New Batch Ready for Pickup (${newBatchId})`,
              html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
                  <h2 style="color: #2563eb;">New Batch Ready for Pickup</h2>
                  <p>Hello,</p>
                  <p>A new batch of <strong>${drugName}</strong> has been securely packed by <strong>${manufacturer}</strong> and is ready for your logistics pickup.</p>
                  <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <ul style="list-style: none; padding: 0; margin: 0; line-height: 1.8;">
                      <li><strong>📦 Batch ID:</strong> <span style="font-family: monospace;">${newBatchId}</span></li>
                      <li><strong>📍 Origin:</strong> ${region}</li>
                      <li><strong>🔑 Access PIN:</strong> <span style="font-size: 1.2em; font-weight: bold; font-family: monospace; color: #2563eb; background: #dbeafe; padding: 2px 6px; border-radius: 4px;">${dispatchPin}</span></li>
                    </ul>
                  </div>
                  <p>Please enter this secure PIN in the PharmaTrace portal to verify and take ownership of the batch on the blockchain ledger.</p>
                  <br/>
                  <p style="font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 10px;">
                    PharmaTrace Provenance Console &bull; Tamper-proof. Predictive. Optimized.
                  </p>
                </div>
              `
            }
          });
          toast.success("Email Sent to Provider", { description: `Notification successfully queued for ${supplierEmail}` });
        } catch (e: any) {
          console.error("Error queueing email:", e);
          toast.error("Email failed", { description: "Failed to queue email in Firebase." });
        }
      }

      setBatchId(genBatchId(drugName));
    } catch (err: any) {
      toast.error("Registration Failed", { description: err.message });
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
              <Label htmlFor="dosage">Dosage</Label>
              <Input
                id="dosage"
                type="text"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                data-testid="input-dosage"
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

            <div className="space-y-1.5 sm:col-span-1">
              <Label htmlFor="expiryDate">Expiry date</Label>
              <Input
                id="expiryDate"
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                data-testid="input-exp-date"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-1">
              <Label htmlFor="supplierEmail">Supplier / Dealer Email</Label>
              <Input
                id="supplierEmail"
                type="email"
                placeholder="supplier@example.com"
                value={supplierEmail}
                onChange={(e) => setSupplierEmail(e.target.value)}
                required
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

          {lastBlockHash && lastBatchId && lastDispatchPin && (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-xl border border-primary/40 bg-primary/5 p-6 glow-teal space-y-4"
            >
              <div className="flex items-center gap-2 text-primary text-sm font-medium">
                <ShieldCheck className="h-4 w-4" /> Batch Successfully Registered
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="text-xs text-muted-foreground">Genesis block hash:</div>
                  <HashChip hash={lastBlockHash} className="text-primary border-primary/40 w-full justify-start" />
                  
                  <div className="pt-2">
                    <div className="text-xs text-muted-foreground mb-1">Dispatch Access PIN:</div>
                    <div className="text-2xl font-mono font-bold tracking-widest text-foreground bg-background border border-border rounded-lg px-4 py-2 inline-block">
                      {lastDispatchPin}
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Send this PIN to the supplier securely. They will need it to verify this batch.
                  </p>
                </div>

                <div className="flex flex-col items-center justify-center bg-white p-4 rounded-xl shadow-inner ml-auto w-max border border-slate-200">
                  <QRCodeSVG 
                    value={`${window.location.origin}/verify?batchId=${lastBatchId}`}
                    size={100}
                    level="Q"
                    className="mb-2"
                  />
                  <div className="text-[9px] uppercase tracking-widest font-mono text-slate-500 font-semibold text-center w-full mt-2">
                    {lastBatchId}
                  </div>
                  <Button 
                    variant="default" 
                    size="default" 
                    className="w-full mt-3 font-bold bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => window.print()}
                  >
                    <Printer className="w-4 h-4 mr-2" />
                    Print QR Code
                  </Button>
                </div>
              </div>

              <div className="border-t border-primary/20 pt-3 mt-4 text-xs text-muted-foreground flex items-center justify-between">
                <span>Print and attach this QR Code to the physical dispatch box.</span>
                <span className="text-amber-500/80 font-mono text-[10px] bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20">
                  Simulated SMS Notification: PIN sent to destination node.
                </span>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
