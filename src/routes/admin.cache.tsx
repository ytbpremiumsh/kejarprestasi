import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Database, Globe, Loader2, CheckCircle2, AlertTriangle, Zap } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/cache")({
  component: AdminCache,
});

function AdminCache() {
  const [clearing, setClearing] = useState(false);
  const [lastCleared, setLastCleared] = useState<string | null>(null);

  async function clearAllCaches() {
    setClearing(true);
    const summary: string[] = [];

    try {
      // 1. Clear Cache Storage API (service worker caches, etc.)
      if (typeof caches !== "undefined") {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
        summary.push(`${keys.length} cache storage`);
      }

      // 2. Unregister service workers
      if ("serviceWorker" in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((r) => r.unregister()));
        if (regs.length > 0) summary.push(`${regs.length} service worker`);
      }

      // 3. Clear sessionStorage
      try {
        const count = sessionStorage.length;
        sessionStorage.clear();
        if (count > 0) summary.push(`${count} session storage`);
      } catch {}

      // 4. Clear localStorage (preserve Supabase auth so admin tidak logout)
      try {
        const preserve: Record<string, string> = {};
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (!key) continue;
          if (key.startsWith("sb-") || key.includes("supabase")) {
            preserve[key] = localStorage.getItem(key) ?? "";
          }
        }
        const totalBefore = localStorage.length;
        localStorage.clear();
        for (const [k, v] of Object.entries(preserve)) localStorage.setItem(k, v);
        const cleared = totalBefore - Object.keys(preserve).length;
        if (cleared > 0) summary.push(`${cleared} local storage`);
      } catch {}

      // 5. Refresh Supabase auth session (clear stale token cache)
      try {
        await supabase.auth.refreshSession();
      } catch {}

      setLastCleared(new Date().toLocaleString("id-ID"));
      toast.success(`Cache dibersihkan: ${summary.length ? summary.join(", ") : "tidak ada cache aktif"}`);
    } catch (e) {
      toast.error(`Gagal: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setClearing(false);
    }
  }

  async function hardReload() {
    await clearAllCaches();
    setTimeout(() => {
      window.location.reload();
    }, 600);
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Zap className="h-6 w-6 text-amber-500" /> Bersihkan Cache
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Bersihkan cache browser agar pengunjung selalu mendapatkan versi terbaru, dan
          kurangi beban permintaan ke server.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="rounded-2xl p-5 shadow-soft bg-gradient-to-br from-primary/10 to-primary/5">
          <div className="flex items-start gap-3">
            <div className="h-11 w-11 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
              <Trash2 className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground">Cache Browser</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Hapus service worker, cache storage, session storage, dan local storage
                (sesi login admin tetap aman).
              </p>
              <div className="flex gap-2 mt-3">
                <Button onClick={clearAllCaches} disabled={clearing} size="sm">
                  {clearing ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Trash2 className="h-4 w-4 mr-1" />}
                  Bersihkan
                </Button>
                <Button onClick={hardReload} disabled={clearing} size="sm" variant="outline">
                  <Globe className="h-4 w-4 mr-1" />
                  Bersihkan & Muat Ulang
                </Button>
              </div>
            </div>
          </div>
        </Card>

        <Card className="rounded-2xl p-5 shadow-soft bg-gradient-to-br from-emerald-500/10 to-emerald-500/5">
          <div className="flex items-start gap-3">
            <div className="h-11 w-11 rounded-xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground">Status Terakhir</h3>
              <p className="text-xs text-muted-foreground mt-1">
                {lastCleared
                  ? `Cache terakhir dibersihkan pada ${lastCleared}.`
                  : "Belum ada pembersihan cache pada sesi ini."}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Tip: jalankan ini setelah update besar agar pengunjung tidak melihat
                versi lama.
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="rounded-2xl p-5 shadow-soft border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-transparent">
        <div className="flex items-start gap-3">
          <div className="h-11 w-11 rounded-xl bg-amber-500/15 text-amber-600 flex items-center justify-center shrink-0">
            <Database className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              Database Berat / Antri?
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Database antri biasanya <strong>bukan masalah cache</strong>. Penyebab umum
              dan solusinya:
            </p>
            <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground list-disc list-inside">
              <li>
                <strong className="text-foreground">Trafik tinggi</strong> — upgrade ukuran
                instance di <em>Lovable Cloud → Advanced Settings → Upgrade Instance</em>.
              </li>
              <li>
                <strong className="text-foreground">Data terlalu banyak per query</strong>{" "}
                — gunakan pagination/limit (default sudah dibatasi 1000 baris).
              </li>
              <li>
                <strong className="text-foreground">Webhook menumpuk</strong> — cek log
                edge function dan tabel <code className="text-xs bg-muted px-1 rounded">wa_chat_messages</code>{" "}
                lalu hapus log lama secara berkala.
              </li>
              <li>
                <strong className="text-foreground">Index hilang</strong> — minta saya
                tambahkan index untuk query yang sering dipakai.
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
