import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2, Save, Code2, Gauge, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/kode-kustom")({
  component: AdminCustomCode,
});

type CustomCode = { head: string; body: string };
type Performance = { lite_mode: boolean; disable_ads: boolean; disable_animations: boolean };

function AdminCustomCode() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [code, setCode] = useState<CustomCode>({ head: "", body: "" });
  const [perf, setPerf] = useState<Performance>({
    lite_mode: false,
    disable_ads: false,
    disable_animations: false,
  });

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("key,value")
        .in("key", ["custom_code", "performance"]);
      const cc = data?.find((d) => d.key === "custom_code")?.value as CustomCode | undefined;
      const pf = data?.find((d) => d.key === "performance")?.value as Performance | undefined;
      if (cc) setCode({ head: cc.head ?? "", body: cc.body ?? "" });
      if (pf) setPerf({ ...perf, ...pf });
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const { error: e1 } = await supabase
        .from("site_settings")
        .upsert({ key: "custom_code", value: code }, { onConflict: "key" });
      if (e1) throw e1;
      const { error: e2 } = await supabase
        .from("site_settings")
        .upsert({ key: "performance", value: perf }, { onConflict: "key" });
      if (e2) throw e2;
      toast.success("Pengaturan berhasil disimpan");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Gagal menyimpan";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Code2 className="h-6 w-6 text-primary" /> Kode Kustom &amp; Performa
          </h1>
          <p className="text-sm text-muted-foreground">
            Sisipkan HTML/JavaScript pada Head &amp; Footer (analytics, pixel, verifikasi),
            lalu aktifkan Mode Ringan agar website tetap cepat saat trafik tinggi.
          </p>
        </div>
        <Button onClick={save} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          Simpan Perubahan
        </Button>
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-amber-300/50 bg-amber-50 p-4 text-sm text-amber-900">
        <AlertTriangle className="h-5 w-5 mt-0.5 shrink-0" />
        <div>
          <p className="font-semibold">Hati-hati saat menempel kode.</p>
          <p>
            Kode yang salah dapat merusak tampilan situs. Tempel hanya skrip dari sumber tepercaya
            (Google Analytics, Meta Pixel, Search Console, dsb). Perubahan tersimpan langsung
            tampil di situs publik.
          </p>
        </div>
      </div>

      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Kode Head (sebelum &lt;/head&gt;)</h2>
        <p className="text-xs text-muted-foreground">
          Cocok untuk: Google Analytics (gtag), Search Console verification, Meta Pixel,
          preconnect / preload, JSON-LD, dsb.
        </p>
        <Label className="text-xs">HTML / JavaScript</Label>
        <Textarea
          rows={10}
          spellCheck={false}
          value={code.head}
          onChange={(e) => setCode({ ...code, head: e.target.value })}
          placeholder={`<!-- Contoh Google Analytics -->\n<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXX"></script>\n<script>\n  window.dataLayer = window.dataLayer || [];\n  function gtag(){dataLayer.push(arguments);}\n  gtag('js', new Date());\n  gtag('config', 'G-XXXXXX');\n</script>`}
          className="font-mono text-xs"
        />
      </Card>

      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Kode Footer (sebelum &lt;/body&gt;)</h2>
        <p className="text-xs text-muted-foreground">
          Cocok untuk: chat widget, livechat, tracking pixel, skrip pihak ketiga yang
          tidak harus dimuat lebih awal.
        </p>
        <Label className="text-xs">HTML / JavaScript</Label>
        <Textarea
          rows={10}
          spellCheck={false}
          value={code.body}
          onChange={(e) => setCode({ ...code, body: e.target.value })}
          placeholder={`<!-- Contoh widget chat -->\n<script>(function(d,s){var a=d.createElement(s);a.async=1;a.src='https://cdn.example.com/chat.js';d.body.appendChild(a);})(document,'script');</script>`}
          className="font-mono text-xs"
        />
      </Card>

      <Card className="p-6 space-y-5">
        <div className="flex items-center gap-2">
          <Gauge className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Mode Performa</h2>
        </div>
        <p className="text-xs text-muted-foreground -mt-2">
          Aktifkan saat trafik tinggi atau saat pengumuman membuat website lambat.
          Pengaturan ini langsung berlaku untuk semua pengunjung.
        </p>

        <PerfRow
          title="Mode Ringan (Lite Mode)"
          desc="Mematikan animasi & transisi berat, mengaktifkan content-visibility untuk gambar, dan memprioritaskan konten utama."
          checked={perf.lite_mode}
          onChange={(v) => setPerf({ ...perf, lite_mode: v })}
        />
        <PerfRow
          title="Nonaktifkan Animasi"
          desc="Hilangkan seluruh animasi & transisi tanpa mengaktifkan lite mode penuh. Cocok untuk perangkat lemah."
          checked={perf.disable_animations}
          onChange={(v) => setPerf({ ...perf, disable_animations: v })}
        />
        <PerfRow
          title="Sembunyikan Iklan (AdSense)"
          desc="Sembunyikan slot iklan untuk mengurangi beban request pihak ketiga saat trafik melonjak."
          checked={perf.disable_ads}
          onChange={(v) => setPerf({ ...perf, disable_ads: v })}
        />
      </Card>
    </div>
  );
}

function PerfRow({
  title,
  desc,
  checked,
  onChange,
}: {
  title: string;
  desc: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-border p-4">
      <div className="space-y-1">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
