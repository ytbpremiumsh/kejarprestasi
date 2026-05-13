import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function TokenBadge({ token, className, size = "sm" }: { token?: string | null; className?: string; size?: "sm" | "md" }) {
  const [copied, setCopied] = useState(false);
  if (!token) return <span className="text-xs text-muted-foreground italic">—</span>;

  const onCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(token);
      setCopied(true);
      toast.success("Token disalin");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Gagal menyalin");
    }
  };

  return (
    <button
      type="button"
      onClick={onCopy}
      title="Klik untuk salin"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border border-primary/30 bg-primary/5 font-mono font-semibold text-primary hover:bg-primary/10 transition-colors",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm",
        className,
      )}
    >
      <span className="tracking-wider">{token}</span>
      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3 opacity-60" />}
    </button>
  );
}
