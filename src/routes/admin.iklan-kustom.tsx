import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2, Save, Megaphone, Pin } from "lucide-react";
import { toast } from "sonner";
import type { CustomAds } from "@/components/ads/CustomAdInjector";

export const Route = createFileRoute("/admin/iklan-kustom")({
  component: AdminIklanKustom,
});

const DEFAULT: CustomAds = {
  enabled: true,
  default_code: "",
  header_html: "",
  footer_html: "",
};

function AdminIklanKustom() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cfg, setCfg] = useState<CustomAds>(DEFAULT);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "custom_ads")
        .maybeSingle();
      if (data?.value) setCfg({ ...DEFAULT, ...(data.value as CustomAds) });
      setLoading(false);
    })();
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("site_settings")
        .upsert({ key: "custom_ads", value: cfg }, { onConflict: "key" });
      if (error) throw error;
      toast.success("Pengaturan iklan disimpan");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Gagal menyimpan");
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
            <Megaphone className="h-6 w-6 text-primary" /> Iklan Kustom (HTML)
          </h1>
          <p className="text-sm text-muted-foreground">
            Tempel kode iklan apa pun (AdSense, MGID, banner sendiri) dan tampilkan otomatis di seluruh halaman publik.
          </p>
        </div>
        <Button onClick={save} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          Simpan Pengaturan Iklan
        </Button>
      </div>

      <Card className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Google AdSense &amp; Iklan</h2>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="custom-ads-enabled" className="text-sm">Aktif</Label>
            <Switch
              id="custom-ads-enabled"
              checked={cfg.enabled}
              onCheckedChange={(v) => setCfg({ ...cfg, enabled: v })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="font-semibold">Kode Script AdSense (Auto Ads / Default)</Label>
          <Textarea
            rows={8}
            className="font-mono text-xs"
            placeholder={`<ins class="adsbygoogle"\n     style="display:block"\n     data-ad-client="ca-pub-XXXXXXXXXXXX"\n     data-ad-slot="XXXXXXXXXX"\n     data-ad-format="auto"\n     data-full-width-responsive="true"></ins>\n<script>\n  (adsbygoogle = window.adsbygoogle || []).push({});\n</script>`}
            value={cfg.default_code}
            onChange={(e) => setCfg({ ...cfg, default_code: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">
            Kode script default AdSense untuk halaman konten umum.
          </p>
        </div>

        <div className="border-t border-border pt-6 space-y-6">
          <div className="flex items-center gap-2">
            <Pin className="h-5 w-5 text-primary" />
            <h3 className="text-base font-semibold">Iklan Manual (Header &amp; Footer)</h3>
          </div>

          <div className="space-y-2">
            <Label className="font-semibold">
              HTML Iklan Header (Semua Halaman: Utama, Quiz, Hasil, Artikel)
            </Label>
            <Textarea
              rows={8}
              className="font-mono text-xs"
              placeholder={`<!-- Paste kode iklan untuk ditampilkan di bagian atas halaman -->\n<ins class="adsbygoogle"\n     style="display:block"\n     data-ad-client="ca-pub-XXXXX"\n     data-ad-slot="HEADER_SLOT"\n     data-ad-format="horizontal"\n     data-full-width-responsive="true"></ins>`}
              value={cfg.header_html}
              onChange={(e) => setCfg({ ...cfg, header_html: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              Iklan ini akan muncul di bagian atas (setelah header) pada halaman utama, quiz, hasil, dan artikel.
            </p>
          </div>

          <div className="space-y-2">
            <Label className="font-semibold">
              HTML Iklan Footer (Semua Halaman: Utama, Quiz, Hasil, Artikel)
            </Label>
            <Textarea
              rows={8}
              className="font-mono text-xs"
              placeholder={`<div class='sticky-ads' id='sticky-ads'>\n  <!-- iklan sticky di sini -->\n</div>`}
              value={cfg.footer_html}
              onChange={(e) => setCfg({ ...cfg, footer_html: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              Iklan ini akan muncul di bagian bawah (sebelum footer) pada semua halaman.
            </p>
          </div>
        </div>

        <div>
          <Button onClick={save} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Simpan Pengaturan Iklan
          </Button>
        </div>
      </Card>
    </div>
  );
}
