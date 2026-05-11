import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, MessageCircle, QrCode, Send, Save } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/whatsapp")({
  component: AdminWhatsApp,
});

type WaConfig = {
  enabled: boolean;
  api_key: string;
  device: string;
  admin_number: string;
  send_endpoint: string;
  qr_endpoint: string;
  notify_user: boolean;
  notify_admin: boolean;
};

const DEFAULT: WaConfig = {
  enabled: false,
  api_key: "",
  device: "",
  admin_number: "",
  send_endpoint: "https://app.ayopintar.com/send-message",
  qr_endpoint: "https://app.ayopintar.com/generate-qr",
  notify_user: true,
  notify_admin: true,
};

function AdminWhatsApp() {
  const [cfg, setCfg] = useState<WaConfig>(DEFAULT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [qr, setQr] = useState<string | null>(null);
  const [qrMsg, setQrMsg] = useState<string>("");
  const [qrLoading, setQrLoading] = useState(false);
  const [testNumber, setTestNumber] = useState("");
  const [testMsg, setTestMsg] = useState("Halo, ini pesan tes dari Kejar Prestasi.");
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("site_settings").select("value").eq("key", "whatsapp").maybeSingle();
      if (data?.value) setCfg({ ...DEFAULT, ...(data.value as Partial<WaConfig>) });
      setLoading(false);
    })();
  }, []);

  const save = async () => {
    setSaving(true);
    const { error } = await supabase.from("site_settings").upsert({ key: "whatsapp", value: cfg as never });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Pengaturan WhatsApp tersimpan");
  };

  const generateQr = async () => {
    if (!cfg.api_key || !cfg.device) return toast.error("Isi API Key & Device dulu, lalu Simpan.");
    setQrLoading(true);
    setQr(null);
    setQrMsg("");
    try {
      const { data, error } = await supabase.functions.invoke("wa-generate-qr", {
        body: { api_key: cfg.api_key, device: cfg.device },
      });
      if (error) throw error;
      const r = data as { status?: boolean; qrcode?: string; msg?: string };
      if (r.qrcode) setQr(r.qrcode);
      setQrMsg(r.msg ?? (r.qrcode ? "Scan QR dengan WhatsApp Anda" : "Tidak ada respons"));
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Gagal generate QR");
    } finally {
      setQrLoading(false);
    }
  };

  const sendTest = async () => {
    if (!testNumber) return toast.error("Masukkan nomor tujuan");
    setTesting(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-whatsapp", {
        body: { type: "test", to: testNumber, message: testMsg },
      });
      if (error) throw error;
      const r = data as { ok?: boolean; results?: unknown; error?: string; skipped?: string };
      if (r.skipped === "wa_disabled") return toast.error("WA dinonaktifkan. Aktifkan dulu lalu simpan.");
      if (!r.ok) return toast.error(r.error || "Gagal kirim");
      toast.success("Pesan test terkirim (cek log device)");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Gagal kirim");
    } finally {
      setTesting(false);
    }
  };

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <MessageCircle className="h-6 w-6 text-primary" /> WhatsApp Notifikasi (MPWA)
        </h1>
        <p className="text-sm text-muted-foreground">Kirim notifikasi otomatis saat pendaftaran & pengiriman berkas via gateway app.ayopintar.com.</p>
      </div>

      <Card className="rounded-2xl p-6 shadow-soft space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-base font-semibold">Aktifkan Notifikasi WhatsApp</Label>
            <p className="text-xs text-muted-foreground">Saat OFF, semua pengiriman pesan dilewati.</p>
          </div>
          <Switch checked={cfg.enabled} onCheckedChange={(v) => setCfg({ ...cfg, enabled: v })} />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>API Key</Label>
            <Input type="password" value={cfg.api_key} onChange={(e) => setCfg({ ...cfg, api_key: e.target.value })} placeholder="API Key MPWA" />
          </div>
          <div>
            <Label>Device / Sender</Label>
            <Input value={cfg.device} onChange={(e) => setCfg({ ...cfg, device: e.target.value })} placeholder="Nomor device, mis. 6281234567890" />
          </div>
          <div>
            <Label>Nomor Admin (penerima notifikasi)</Label>
            <Input value={cfg.admin_number} onChange={(e) => setCfg({ ...cfg, admin_number: e.target.value })} placeholder="6281234567890" />
          </div>
          <div>
            <Label>Endpoint Send Message</Label>
            <Input value={cfg.send_endpoint} onChange={(e) => setCfg({ ...cfg, send_endpoint: e.target.value })} />
          </div>
          <div className="md:col-span-2">
            <Label>Endpoint Generate QR</Label>
            <Input value={cfg.qr_endpoint} onChange={(e) => setCfg({ ...cfg, qr_endpoint: e.target.value })} />
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 pt-2">
          <label className="flex items-center justify-between rounded-lg border p-3">
            <span className="text-sm">Kirim ke pendaftar</span>
            <Switch checked={cfg.notify_user} onCheckedChange={(v) => setCfg({ ...cfg, notify_user: v })} />
          </label>
          <label className="flex items-center justify-between rounded-lg border p-3">
            <span className="text-sm">Kirim ke admin</span>
            <Switch checked={cfg.notify_admin} onCheckedChange={(v) => setCfg({ ...cfg, notify_admin: v })} />
          </label>
        </div>

        <div className="flex justify-end pt-2">
          <Button onClick={save} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Simpan
          </Button>
        </div>
      </Card>

      <Card className="rounded-2xl p-6 shadow-soft space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2"><QrCode className="h-5 w-5 text-primary" />Hubungkan Device</h2>
            <p className="text-xs text-muted-foreground">Klik Generate QR lalu scan di WhatsApp → Perangkat Tertaut.</p>
          </div>
          <Button onClick={generateQr} disabled={qrLoading} variant="outline">
            {qrLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <QrCode className="h-4 w-4 mr-2" />}
            Generate QR
          </Button>
        </div>
        {qr && (
          <div className="flex flex-col items-center gap-2 rounded-xl bg-muted/30 p-4">
            <img src={qr} alt="QR WhatsApp" className="h-64 w-64 rounded-lg border bg-white p-2" />
            <p className="text-xs text-muted-foreground">{qrMsg}</p>
          </div>
        )}
        {!qr && qrMsg && <p className="text-sm text-center text-muted-foreground">{qrMsg}</p>}
      </Card>

      <Card className="rounded-2xl p-6 shadow-soft space-y-3">
        <h2 className="text-lg font-semibold flex items-center gap-2"><Send className="h-5 w-5 text-primary" />Tes Kirim Pesan</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <Label>Nomor Tujuan</Label>
            <Input value={testNumber} onChange={(e) => setTestNumber(e.target.value)} placeholder="6281234567890" />
          </div>
          <div>
            <Label>Pesan</Label>
            <Input value={testMsg} onChange={(e) => setTestMsg(e.target.value)} />
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={sendTest} disabled={testing}>
            {testing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
            Kirim Tes
          </Button>
        </div>
      </Card>
    </div>
  );
}
