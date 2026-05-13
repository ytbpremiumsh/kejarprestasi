import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Bot, Save, Plus, Pencil, Trash2, Search, Sparkles, Loader2, BookOpen, MessageCircle, Copy, RefreshCw, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/ai-balasan")({
  component: AdminAiBalasan,
});

type Behavior = {
  id?: string;
  persona_name: string;
  tone: string;
  language: string;
  system_prompt: string;
  model: string;
  temperature: number;
  max_tokens: number;
  enabled: boolean;
  fallback_message: string;
  wa_auto_reply: boolean;
  wa_webhook_token: string | null;
};

type WaMsg = {
  id: string;
  phone: string;
  contact_name: string | null;
  direction: "in" | "out";
  message: string;
  ai_used: boolean;
  status: string;
  created_at: string;
};

type KbItem = {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  enabled: boolean;
  sort_order: number;
};

const TONES = [
  { v: "ramah", l: "Ramah & Hangat" },
  { v: "profesional", l: "Profesional & Formal" },
  { v: "santai", l: "Santai & Akrab" },
  { v: "informatif", l: "Informatif & Singkat" },
  { v: "empatik", l: "Empatik & Mendukung" },
];

const MODELS = [
  { v: "google/gemini-2.5-flash", l: "Gemini 2.5 Flash (cepat & murah)" },
  { v: "google/gemini-2.5-pro", l: "Gemini 2.5 Pro (paling akurat)" },
  { v: "google/gemini-2.5-flash-lite", l: "Gemini 2.5 Flash Lite (paling hemat)" },
  { v: "openai/gpt-5-mini", l: "GPT-5 Mini (seimbang)" },
];

function AdminAiBalasan() {
  const [behavior, setBehavior] = useState<Behavior | null>(null);
  const [savingBhv, setSavingBhv] = useState(false);
  const [loading, setLoading] = useState(true);

  const [kb, setKb] = useState<KbItem[]>([]);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<KbItem | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [waMsgs, setWaMsgs] = useState<WaMsg[]>([]);
  const [loadingWa, setLoadingWa] = useState(false);
  const [regenToken, setRegenToken] = useState(false);

  const loadWaMsgs = async () => {
    setLoadingWa(true);
    const { data } = await supabase
      .from("wa_chat_messages")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    setWaMsgs((data ?? []) as WaMsg[]);
    setLoadingWa(false);
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [{ data: bhv }, { data: kbRows }] = await Promise.all([
        supabase.from("ai_behavior").select("*").limit(1).maybeSingle(),
        supabase.from("ai_knowledge_base").select("*").order("sort_order").order("created_at", { ascending: false }),
      ]);
      if (bhv) setBehavior(bhv as Behavior);
      if (kbRows) setKb(kbRows as KbItem[]);
      setLoading(false);
      loadWaMsgs();
    })();
  }, []);

  const webhookUrl = behavior?.wa_webhook_token
    ? `https://zmlwicrlcuqgxfaskxic.functions.supabase.co/wa-webhook?token=${behavior.wa_webhook_token}`
    : "";

  async function regenerateToken() {
    if (!behavior?.id) return;
    if (!confirm("Buat ulang token webhook? URL lama akan langsung non-aktif.")) return;
    setRegenToken(true);
    const newToken = crypto.randomUUID().replace(/-/g, "");
    const { error } = await supabase.from("ai_behavior").update({ wa_webhook_token: newToken }).eq("id", behavior.id);
    setRegenToken(false);
    if (error) return toast.error(error.message);
    setBehavior({ ...behavior, wa_webhook_token: newToken });
    toast.success("Token webhook diperbarui");
  }

  function copyText(t: string, label = "Disalin") {
    navigator.clipboard.writeText(t).then(() => toast.success(label));
  }

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return kb;
    return kb.filter(
      (k) =>
        k.question.toLowerCase().includes(t) ||
        k.answer.toLowerCase().includes(t) ||
        (k.category ?? "").toLowerCase().includes(t),
    );
  }, [q, kb]);

  async function saveBehavior() {
    if (!behavior) return;
    setSavingBhv(true);
    const { id, ...rest } = behavior;
    const { error } = id
      ? await supabase.from("ai_behavior").update(rest).eq("id", id)
      : await supabase.from("ai_behavior").insert(rest);
    setSavingBhv(false);
    if (error) toast.error("Gagal menyimpan: " + error.message);
    else toast.success("Perilaku AI tersimpan");
  }

  async function saveKb(item: Partial<KbItem>) {
    if (!item.question?.trim() || !item.answer?.trim()) {
      toast.error("Pertanyaan & jawaban wajib diisi");
      return;
    }
    const payload = {
      question: item.question.trim(),
      answer: item.answer.trim(),
      category: item.category?.trim() || null,
      enabled: item.enabled ?? true,
      sort_order: item.sort_order ?? 0,
    };
    if (item.id) {
      const { data, error } = await supabase.from("ai_knowledge_base").update(payload).eq("id", item.id).select().single();
      if (error) return toast.error(error.message);
      setKb((prev) => prev.map((k) => (k.id === item.id ? (data as KbItem) : k)));
    } else {
      const { data, error } = await supabase.from("ai_knowledge_base").insert(payload).select().single();
      if (error) return toast.error(error.message);
      setKb((prev) => [data as KbItem, ...prev]);
    }
    toast.success("Knowledge tersimpan");
    setShowForm(false);
    setEditing(null);
  }

  async function toggleKb(k: KbItem) {
    const { error } = await supabase.from("ai_knowledge_base").update({ enabled: !k.enabled }).eq("id", k.id);
    if (error) return toast.error(error.message);
    setKb((prev) => prev.map((x) => (x.id === k.id ? { ...x, enabled: !x.enabled } : x)));
  }

  async function deleteKb(id: string) {
    const { error } = await supabase.from("ai_knowledge_base").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setKb((prev) => prev.filter((k) => k.id !== id));
    toast.success("Dihapus");
    setDeleteId(null);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-lg shadow-primary/30">
          <Bot className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Balasan AI</h1>
          <p className="text-sm text-muted-foreground">
            Atur perilaku AI dan basis pengetahuan FAQ untuk membalas chat otomatis.
          </p>
        </div>
      </div>

      <Tabs defaultValue="behavior" className="space-y-4">
        <TabsList>
          <TabsTrigger value="behavior" className="gap-2">
            <Sparkles className="h-4 w-4" /> AI Behavior
          </TabsTrigger>
          <TabsTrigger value="knowledge" className="gap-2">
            <BookOpen className="h-4 w-4" /> AI Knowledge
            <Badge variant="secondary" className="ml-1">{kb.length}</Badge>
          </TabsTrigger>
        </TabsList>

        {/* BEHAVIOR */}
        <TabsContent value="behavior">
          {behavior && (
            <Card className="p-6 space-y-6">
              <div className="flex items-center justify-between rounded-lg border border-border bg-muted/40 p-4">
                <div>
                  <p className="font-semibold">Aktifkan Balasan AI</p>
                  <p className="text-xs text-muted-foreground">
                    Jika nonaktif, AI tidak akan membalas chat masuk secara otomatis.
                  </p>
                </div>
                <Switch
                  checked={behavior.enabled}
                  onCheckedChange={(v) => setBehavior({ ...behavior, enabled: v })}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Nama Persona</Label>
                  <Input
                    value={behavior.persona_name}
                    onChange={(e) => setBehavior({ ...behavior, persona_name: e.target.value })}
                    placeholder="Asisten Kejar Prestasi"
                  />
                </div>
                <div>
                  <Label>Gaya Bahasa</Label>
                  <Select value={behavior.tone} onValueChange={(v) => setBehavior({ ...behavior, tone: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {TONES.map((t) => <SelectItem key={t.v} value={t.v}>{t.l}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Bahasa</Label>
                  <Select value={behavior.language} onValueChange={(v) => setBehavior({ ...behavior, language: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="id">Indonesia</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="auto">Otomatis (ikuti pengguna)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Model AI</Label>
                  <Select value={behavior.model} onValueChange={(v) => setBehavior({ ...behavior, model: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {MODELS.map((m) => <SelectItem key={m.v} value={m.v}>{m.l}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center justify-between">
                    <Label>Kreativitas (temperature)</Label>
                    <span className="text-sm font-mono text-muted-foreground">{behavior.temperature.toFixed(2)}</span>
                  </div>
                  <Slider
                    value={[behavior.temperature]}
                    onValueChange={([v]) => setBehavior({ ...behavior, temperature: v })}
                    min={0} max={1} step={0.05}
                    className="mt-3"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Rendah = lebih konsisten. Tinggi = lebih variatif.</p>
                </div>
                <div>
                  <Label>Panjang Maksimal Balasan (token)</Label>
                  <Input
                    type="number"
                    min={100} max={2000}
                    value={behavior.max_tokens}
                    onChange={(e) => setBehavior({ ...behavior, max_tokens: parseInt(e.target.value) || 600 })}
                  />
                  <p className="text-xs text-muted-foreground mt-1">~600 token ≈ 450 kata.</p>
                </div>
              </div>

              <div>
                <Label>Instruksi Sistem (System Prompt)</Label>
                <Textarea
                  rows={8}
                  value={behavior.system_prompt}
                  onChange={(e) => setBehavior({ ...behavior, system_prompt: e.target.value })}
                  placeholder="Anda adalah asisten resmi..."
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Tuliskan kepribadian, batasan, dan aturan jawaban AI di sini.
                </p>
              </div>

              <div>
                <Label>Pesan Fallback</Label>
                <Textarea
                  rows={3}
                  value={behavior.fallback_message}
                  onChange={(e) => setBehavior({ ...behavior, fallback_message: e.target.value })}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Dipakai bila AI tidak tahu jawaban dari basis pengetahuan.
                </p>
              </div>

              <div className="flex justify-end">
                <Button onClick={saveBehavior} disabled={savingBhv} className="gap-2">
                  {savingBhv ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Simpan Perilaku
                </Button>
              </div>
            </Card>
          )}
        </TabsContent>

        {/* KNOWLEDGE */}
        <TabsContent value="knowledge">
          <Card className="p-6">
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between mb-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari pertanyaan / jawaban..." className="pl-9" />
              </div>
              <Button onClick={() => { setEditing({ id: "", question: "", answer: "", category: "", enabled: true, sort_order: 0 }); setShowForm(true); }} className="gap-2">
                <Plus className="h-4 w-4" /> Tambah Knowledge
              </Button>
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-40" />
                <p>{kb.length === 0 ? "Belum ada knowledge. Tambahkan FAQ pertama Anda." : "Tidak ada hasil."}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((k) => (
                  <div key={k.id} className={`rounded-xl border p-4 transition ${k.enabled ? "bg-card border-border" : "bg-muted/40 border-border opacity-70"}`}>
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {k.category && <Badge variant="outline" className="text-xs">{k.category}</Badge>}
                          {!k.enabled && <Badge variant="secondary" className="text-xs">Nonaktif</Badge>}
                        </div>
                        <p className="text-sm font-semibold text-primary">Q: {k.question}</p>
                        <p className="text-sm text-foreground/80 mt-1.5 whitespace-pre-wrap line-clamp-3">A: {k.answer}</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Switch checked={k.enabled} onCheckedChange={() => toggleKb(k)} />
                        <Button variant="ghost" size="icon" onClick={() => { setEditing(k); setShowForm(true); }}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteId(k.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={(o) => { setShowForm(o); if (!o) setEditing(null); }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit Knowledge" : "Tambah Knowledge"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div>
                <Label>Pertanyaan</Label>
                <Textarea
                  rows={2}
                  value={editing.question}
                  onChange={(e) => setEditing({ ...editing, question: e.target.value })}
                  placeholder="Contoh: Bagaimana cara mendaftar?"
                />
              </div>
              <div>
                <Label>Jawaban</Label>
                <Textarea
                  rows={6}
                  value={editing.answer}
                  onChange={(e) => setEditing({ ...editing, answer: e.target.value })}
                  placeholder="Tulis jawaban lengkap..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Kategori (opsional)</Label>
                  <Input
                    value={editing.category ?? ""}
                    onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                    placeholder="Pendaftaran, Berkas, Token..."
                  />
                </div>
                <div>
                  <Label>Urutan</Label>
                  <Input
                    type="number"
                    value={editing.sort_order}
                    onChange={(e) => setEditing({ ...editing, sort_order: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={editing.enabled} onCheckedChange={(v) => setEditing({ ...editing, enabled: v })} />
                <Label className="cursor-pointer">Aktifkan knowledge ini</Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowForm(false); setEditing(null); }}>Batal</Button>
            <Button onClick={() => editing && saveKb(editing)}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus knowledge?</AlertDialogTitle>
            <AlertDialogDescription>Tindakan ini tidak bisa dibatalkan.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && deleteKb(deleteId)}>Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
