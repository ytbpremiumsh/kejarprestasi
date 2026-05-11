import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus, Trash2, Save, Megaphone } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/adsense")({
  component: AdminAdsense,
});

type AdSenseConfig = { enabled: boolean; publisher_id: string; ads_txt: string };
type AdSlot = {
  id: string;
  name: string;
  slot_id: string;
  placement: string;
  format: "auto" | "horizontal" | "rectangle" | "vertical";
  enabled: boolean;
};

const PLACEMENTS = [
  { value: "header_top", label: "Global — Bawah Header (semua halaman)" },
  { value: "footer_top", label: "Global — Atas Footer (semua halaman)" },
  { value: "after_hero", label: "Beranda — Setelah Hero" },
  { value: "after_categories", label: "Beranda — Setelah Kategori" },
  { value: "after_benefits", label: "Beranda — Setelah Benefit" },
  { value: "after_alumni", label: "Beranda — Setelah Peraih Beasiswa" },
  { value: "after_faq", label: "Beranda — Setelah FAQ" },
  { value: "category_middle", label: "Halaman Kategori — Tengah" },
  { value: "category_bottom", label: "Halaman Kategori — Bawah" },
  { value: "article_list_top", label: "Daftar Artikel — Atas" },
  { value: "article_list_bottom", label: "Daftar Artikel — Bawah" },
  { value: "in_article_top", label: "Detail Artikel — Atas (high CPC)" },
  { value: "in_article_middle", label: "Detail Artikel — Tengah (high CPC)" },
  { value: "in_article_bottom", label: "Detail Artikel — Bawah" },
  { value: "form_top", label: "Form Pendaftaran — Atas" },
  { value: "form_bottom", label: "Form Pendaftaran — Bawah" },
  { value: "berkas_top", label: "Halaman Berkas — Atas" },
  { value: "berkas_bottom", label: "Halaman Berkas — Bawah" },
  { value: "share_top", label: "Bagikan Poster — Atas" },
  { value: "share_bottom", label: "Bagikan Poster — Bawah" },
  { value: "tentang_middle", label: "Tentang — Tengah" },
];

const FORMATS = [
  { value: "auto", label: "Responsif (auto)" },
  { value: "horizontal", label: "Horizontal (728x90)" },
  { value: "rectangle", label: "Rectangle (336x280)" },
  { value: "vertical", label: "Vertical (160x600)" },
];

function newSlot(): AdSlot {
  return {
    id: crypto.randomUUID(),
    name: "Slot Baru",
    slot_id: "",
    placement: "after_hero",
    format: "auto",
    enabled: true,
  };
}

function AdminAdsense() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [adsense, setAdsense] = useState<AdSenseConfig>({
    enabled: false,
    publisher_id: "",
    ads_txt: "",
  });
  const [slots, setSlots] = useState<AdSlot[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("key,value")
        .in("key", ["adsense", "ad_slots"]);
      const a = data?.find((d) => d.key === "adsense")?.value as AdSenseConfig | undefined;
      const s = data?.find((d) => d.key === "ad_slots")?.value as AdSlot[] | undefined;
      if (a) setAdsense(a);
      if (Array.isArray(s)) setSlots(s.map((x) => ({ ...x, id: x.id || crypto.randomUUID() })));
      setLoading(false);
    };
    load();
  }, []);

  const updateSlot = (i: number, patch: Partial<AdSlot>) =>
    setSlots((arr) => arr.map((x, idx) => (idx === i ? { ...x, ...patch } : x)));

  const removeSlot = (i: number) => setSlots((arr) => arr.filter((_, idx) => idx !== i));

  const save = async () => {
    setSaving(true);
    try {
      const pid = adsense.publisher_id.trim();
      if (adsense.enabled && pid && !pid.startsWith("ca-pub-")) {
        toast.error("Publisher ID harus berformat ca-pub-XXXXXXXXXXXXXXXX");
        setSaving(false);
        return;
      }
      const { error: e1 } = await supabase
        .from("site_settings")
        .upsert(
          { key: "adsense", value: { ...adsense, publisher_id: pid } },
          { onConflict: "key" }
        );
      if (e1) throw e1;
      const { error: e2 } = await supabase
        .from("site_settings")
        .upsert({ key: "ad_slots", value: slots }, { onConflict: "key" });
      if (e2) throw e2;
      toast.success("Pengaturan AdSense disimpan");
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
            <Megaphone className="h-6 w-6 text-primary" /> Quick AdSense
          </h1>
          <p className="text-sm text-muted-foreground">
            Aktifkan Google AdSense, kelola publisher ID, ads.txt, dan slot iklan tanpa coding.
          </p>
        </div>
        <Button onClick={save} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          Simpan
        </Button>
      </div>

      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Konfigurasi AdSense</h2>
            <p className="text-xs text-muted-foreground">
              Skrip AdSense hanya dimuat jika status Aktif &amp; Publisher ID terisi.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="ads-enabled" className="text-sm">Aktif</Label>
            <Switch
              id="ads-enabled"
              checked={adsense.enabled}
              onCheckedChange={(v) => setAdsense({ ...adsense, enabled: v })}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Publisher ID (Client ID)</Label>
          <Input
            placeholder="ca-pub-XXXXXXXXXXXXXXXX"
            value={adsense.publisher_id}
            onChange={(e) => setAdsense({ ...adsense, publisher_id: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Konten ads.txt (akan disajikan di /ads.txt)</Label>
          <Textarea
            rows={4}
            placeholder="google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0"
            value={adsense.ads_txt}
            onChange={(e) => setAdsense({ ...adsense, ads_txt: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">
            Salin baris yang Google AdSense berikan. URL publik:&nbsp;
            <code className="rounded bg-muted px-1 py-0.5">/ads.txt</code>
          </p>
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Slot Iklan</h2>
            <p className="text-xs text-muted-foreground">
              Tambahkan unit iklan dan tentukan posisinya. Slot yang nonaktif tidak ditampilkan.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setSlots((s) => [...s, newSlot()])}>
            <Plus className="h-4 w-4 mr-1" /> Tambah Slot
          </Button>
        </div>

        {slots.length === 0 && (
          <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Belum ada slot iklan. Klik <span className="font-medium">Tambah Slot</span> untuk membuat.
          </div>
        )}

        <div className="space-y-4">
          {slots.map((s, i) => (
            <div key={s.id} className="rounded-xl border border-border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">Slot {i + 1}</span>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`en-${s.id}`} className="text-xs">Aktif</Label>
                    <Switch
                      id={`en-${s.id}`}
                      checked={s.enabled}
                      onCheckedChange={(v) => updateSlot(i, { enabled: v })}
                    />
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => removeSlot(i)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Nama (untuk admin)</Label>
                  <Input value={s.name} onChange={(e) => updateSlot(i, { name: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Slot ID (data-ad-slot)</Label>
                  <Input
                    placeholder="1234567890"
                    value={s.slot_id}
                    onChange={(e) => updateSlot(i, { slot_id: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Penempatan</Label>
                  <Select value={s.placement} onValueChange={(v) => updateSlot(i, { placement: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PLACEMENTS.map((p) => (
                        <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Format</Label>
                  <Select
                    value={s.format}
                    onValueChange={(v) => updateSlot(i, { format: v as AdSlot["format"] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FORMATS.map((f) => (
                        <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
