import { useEffect, useState } from "react";
import { Heart, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type DonationConfig = {
  enabled?: boolean;
  title?: string;
  subtitle?: string;
  description?: string;
  presets?: number[];
  min_amount?: number;
  max_amount?: number;
};

const DEFAULTS: Required<Omit<DonationConfig, "enabled">> & { enabled: boolean } = {
  enabled: false,
  title: "Dukung Program Ini",
  subtitle: "Opsional. Tidak memengaruhi seleksi.",
  description:
    "Program Beasiswa Kejar Prestasi berjalan berkat dukungan banyak orang baik. Donasi sekecil apapun sangat berarti.",
  presets: [10000, 25000, 50000, 100000],
  min_amount: 10000,
  max_amount: 10000000,
};

function formatRp(n: number) {
  return "Rp" + n.toLocaleString("id-ID");
}

export function DonationCard({
  defaultName = "",
  defaultEmail = "",
  defaultWhatsapp = "",
  registrationId = null,
}: {
  defaultName?: string;
  defaultEmail?: string;
  defaultWhatsapp?: string;
  registrationId?: string | null;
}) {
  const [cfg, setCfg] = useState<typeof DEFAULTS>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState<number>(0);
  const [name, setName] = useState(defaultName);
  const [email, setEmail] = useState(defaultEmail);
  const [whatsapp, setWhatsapp] = useState(defaultWhatsapp);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    supabase
      .from("site_settings")
      .select("value")
      .eq("key", "donation")
      .maybeSingle()
      .then(({ data }) => {
        const v = (data?.value ?? {}) as DonationConfig;
        setCfg({ ...DEFAULTS, ...v, presets: v.presets?.length ? v.presets : DEFAULTS.presets });
        setAmount((v.presets?.[1] ?? DEFAULTS.presets[1]) || 25000);
        setLoading(false);
      });
  }, []);

  if (loading) return null;
  if (!cfg.enabled) return null;

  const submit = async () => {
    if (!name.trim()) return toast.error("Nama wajib diisi");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return toast.error("Email tidak valid");
    if (!amount || amount < cfg.min_amount) return toast.error(`Minimal donasi ${formatRp(cfg.min_amount)}`);
    if (amount > cfg.max_amount) return toast.error(`Maksimal donasi ${formatRp(cfg.max_amount)}`);

    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-donation", {
        body: { name, email, whatsapp, amount, registration_id: registrationId },
      });
      if (error) throw error;
      const r = data as { ok?: boolean; link?: string; error?: string };
      if (!r.ok || !r.link) throw new Error(r.error || "Gagal membuat invoice");
      window.location.href = r.link;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal memproses donasi");
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-3xl border border-border bg-card p-6 md:p-8 shadow-card">
      <div className="flex items-center gap-3">
        <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-soft text-primary">
          <Heart size={20} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-foreground">{cfg.title}</h3>
          <p className="text-xs text-muted-foreground">{cfg.subtitle}</p>
        </div>
      </div>

      <p className="mt-4 text-sm text-foreground/80 leading-relaxed">{cfg.description}</p>

      <div className="mt-5">
        <span className="text-xs font-medium text-foreground/80">Pilih nominal</span>
        <div className="mt-2 flex flex-wrap gap-2">
          {cfg.presets.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setAmount(p)}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                amount === p
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-foreground/80 hover:border-primary/50"
              }`}
            >
              {formatRp(p)}
            </button>
          ))}
        </div>
        <label className="mt-3 block">
          <span className="text-xs font-medium text-foreground/80">Atau masukkan jumlah sendiri</span>
          <div className="mt-1.5 flex items-center rounded-xl border border-border bg-background px-3.5 py-2.5">
            <span className="text-sm text-muted-foreground mr-2">Rp</span>
            <input
              type="number"
              inputMode="numeric"
              min={cfg.min_amount}
              max={cfg.max_amount}
              value={amount || ""}
              onChange={(e) => setAmount(Math.floor(Number(e.target.value) || 0))}
              className="w-full bg-transparent text-sm text-foreground outline-none"
              placeholder={String(cfg.min_amount)}
            />
          </div>
          <span className="mt-1 block text-[11px] text-muted-foreground">
            Minimal {formatRp(cfg.min_amount)}
          </span>
        </label>
      </div>

      <div className="mt-5 grid sm:grid-cols-2 gap-3">
        <label className="block">
          <span className="text-xs font-medium text-foreground/80">Nama</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30"
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-foreground/80">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30"
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="text-xs font-medium text-foreground/80">WhatsApp (opsional)</span>
          <input
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="08xxxxxxxxxx"
            className="mt-1.5 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30"
          />
        </label>
      </div>

      <button
        type="button"
        disabled={submitting}
        onClick={submit}
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-soft hover:opacity-95 transition disabled:opacity-60"
      >
        {submitting ? (
          <><Loader2 size={16} className="animate-spin" /> Memproses…</>
        ) : (
          <><Heart size={16} /> Donasi {amount ? formatRp(amount) : ""}</>
        )}
      </button>

      <p className="mt-3 text-[11px] text-center text-muted-foreground">
        Pembayaran aman diproses oleh Mayar. Donasimu tidak memengaruhi proses seleksi.
      </p>
    </div>
  );
}
