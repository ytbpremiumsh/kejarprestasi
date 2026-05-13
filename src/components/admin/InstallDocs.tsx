import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Copy, Server, Globe, Terminal, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function CodeBlock({ code, lang = "bash" }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success("Disalin");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Gagal menyalin");
    }
  };
  return (
    <div className="relative group">
      <pre className="overflow-x-auto rounded-lg border bg-muted/40 p-4 text-xs leading-relaxed font-mono text-foreground">
        <code>{code}</code>
      </pre>
      <Button
        size="sm"
        variant="secondary"
        onClick={copy}
        className="absolute right-2 top-2 h-7 gap-1 px-2 text-xs opacity-0 transition group-hover:opacity-100"
      >
        {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
        <span className="sr-only">{lang}</span>
      </Button>
    </div>
  );
}

export function Step({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative pl-12">
      <span className="absolute left-0 top-0 flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary ring-4 ring-background">
        {n}
      </span>
      <h3 className="mb-2 text-base font-semibold text-foreground">{title}</h3>
      <div className="space-y-3 text-sm text-muted-foreground">{children}</div>
    </div>
  );
}

export function PageHeader({
  icon: Icon,
  title,
  desc,
  badge,
  tone = "primary",
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  badge: string;
  tone?: "primary" | "gold";
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border p-6 md:p-8",
        tone === "primary"
          ? "bg-gradient-to-br from-primary/10 via-primary/5 to-transparent"
          : "bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent",
      )}
    >
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-xl shadow-lg",
            tone === "primary"
              ? "bg-primary text-primary-foreground shadow-primary/30"
              : "bg-amber-500 text-white shadow-amber-500/30",
          )}
        >
          <Icon className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <Badge variant="secondary" className="mb-2">
            {badge}
          </Badge>
          <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            {title}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
        </div>
      </div>
    </div>
  );
}

export function UpdateSection() {
  return (
    <Card className="rounded-2xl p-6">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
          <RefreshCcw className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground">Auto Update via update.sh</h2>
          <p className="text-xs text-muted-foreground">
            Jalankan satu perintah untuk mengambil versi terbaru, build, & restart service.
          </p>
        </div>
      </div>

      <div className="space-y-4 text-sm">
        <div>
          <p className="mb-2 font-medium text-foreground">Instalasi pertama (sekali saja):</p>
          <CodeBlock
            code={`curl -fsSL https://<DOMAIN-ANDA>/update.sh -o update.sh
chmod +x update.sh`}
          />
        </div>

        <div>
          <p className="mb-2 font-medium text-foreground">Update setiap ada pembaruan:</p>
          <CodeBlock code={`./update.sh`} />
        </div>

        <div>
          <p className="mb-2 font-medium text-foreground">Atau langsung tanpa download:</p>
          <CodeBlock
            code={`bash <(curl -fsSL https://<DOMAIN-ANDA>/update.sh)`}
          />
        </div>

        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 text-xs text-foreground">
          <p className="font-medium">Yang dilakukan script:</p>
          <ul className="mt-1 list-disc space-y-0.5 pl-5 text-muted-foreground">
            <li>Backup otomatis file <code className="rounded bg-muted px-1">.env</code></li>
            <li>Tarik commit terbaru dari Git (branch <code className="rounded bg-muted px-1">main</code>)</li>
            <li>Install dependensi (bun / pnpm / npm)</li>
            <li>Build production</li>
            <li>Restart PM2 atau systemd service otomatis</li>
          </ul>
        </div>

        <div>
          <p className="mb-2 font-medium text-foreground">Opsional — jadwalkan auto-update tiap malam (cron):</p>
          <CodeBlock
            code={`crontab -e
# Tambahkan baris berikut:
0 3 * * * cd /var/www/kejar-prestasi && ./update.sh >> update.log 2>&1`}
          />
        </div>
      </div>
    </Card>
  );
}

export const Icons = { Server, Globe, Terminal };
