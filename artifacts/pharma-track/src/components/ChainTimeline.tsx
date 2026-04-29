import { motion } from "framer-motion";
import {
  Building2,
  Truck,
  Warehouse,
  PackageCheck,
  Pill,
  type LucideIcon,
} from "lucide-react";
import type { Block, EventType } from "@/lib/blockchain";
import { HashChip } from "./HashChip";

const EVENT_META: Record<EventType, { label: string; icon: LucideIcon; tone: string }> = {
  MANUFACTURED: { label: "Manufactured", icon: Building2, tone: "text-primary" },
  SHIPPED_TO_DISTRIBUTOR: { label: "Shipped to Distributor", icon: Truck, tone: "text-amber-400" },
  RECEIVED_DISTRIBUTOR: { label: "Received by Distributor", icon: Warehouse, tone: "text-amber-400" },
  SHIPPED_TO_PHARMACY: { label: "Shipped to Pharmacy", icon: Truck, tone: "text-sky-400" },
  RECEIVED_PHARMACY: { label: "Received by Pharmacy", icon: PackageCheck, tone: "text-emerald-400" },
};

function fmt(ts: string) {
  const d = new Date(ts);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ChainTimeline({ chain }: { chain: Block[] }) {
  if (!chain || chain.length === 0) {
    return (
      <div className="text-sm text-muted-foreground italic flex items-center gap-2">
        <Pill className="h-4 w-4" /> No ledger entries yet.
      </div>
    );
  }

  return (
    <ol className="relative">
      {chain.map((block, idx) => {
        const meta = EVENT_META[block.event];
        const Icon = meta.icon;
        const isLast = idx === chain.length - 1;
        return (
          <motion.li
            key={block.hash}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="relative pl-12 pb-6"
          >
            <span
              className="absolute left-4 top-2 h-9 w-9 -translate-x-1/2 rounded-md border border-border bg-card flex items-center justify-center"
              aria-hidden
            >
              <Icon className={`h-4 w-4 ${meta.tone}`} />
            </span>
            {!isLast && (
              <span
                className="absolute left-4 top-11 -translate-x-1/2 w-px h-[calc(100%-2.75rem)] bg-gradient-to-b from-primary/40 via-border to-transparent"
                aria-hidden
              />
            )}
            <div className="rounded-lg border border-border bg-card p-4 hover-elevate">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                    Block #{block.index}
                  </span>
                  <span className={`text-sm font-medium ${meta.tone}`}>{meta.label}</span>
                </div>
                <span className="text-xs font-mono text-muted-foreground">{fmt(block.timestamp)}</span>
              </div>
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div>
                  <span className="uppercase text-[10px] tracking-widest mr-2">Location</span>
                  <span className="text-foreground/90">{block.location}</span>
                </div>
                <div>
                  <span className="uppercase text-[10px] tracking-widest mr-2">Handler</span>
                  <span className="text-foreground/90">{block.handler}</span>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">prev</span>
                <HashChip hash={block.previousHash} />
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground ml-2">hash</span>
                <HashChip hash={block.hash} className="border-primary/30 text-primary/90" />
              </div>
            </div>
          </motion.li>
        );
      })}
    </ol>
  );
}
