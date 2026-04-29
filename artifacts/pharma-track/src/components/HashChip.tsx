import { cn } from "@/lib/utils";

export function HashChip({ hash, className }: { hash: string; className?: string }) {
  if (!hash) return null;
  const display = hash.length > 16 ? `0x${hash.slice(0, 6)}…${hash.slice(-6)}` : hash;
  return (
    <span
      className={cn(
        "inline-flex items-center font-mono text-[11px] px-2 py-0.5 rounded border border-border bg-muted/40 text-muted-foreground",
        className
      )}
      title={hash}
    >
      {display}
    </span>
  );
}
