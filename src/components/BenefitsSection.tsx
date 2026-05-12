import { Wallet, Award, Gift, FileCheck2, BookOpen, ShieldCheck, CheckCircle2, PlayCircle, Sparkles, GraduationCap, Users, Lock } from "lucide-react";

/* =========================================================
   MOCKUPS — masing-masing benefit punya mockup unik
   Branding: "Kejar Prestasi"
   ========================================================= */

function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mx-auto w-full max-w-[280px] rounded-[2rem] border border-border bg-card p-3 shadow-card">
      <div className="absolute left-1/2 top-2 h-1.5 w-16 -translate-x-1/2 rounded-full bg-muted" />
      <div className="rounded-[1.5rem] bg-background p-4 pt-7 min-h-[360px]">
        {children}
      </div>
    </div>
  );
}

function BrandTag() {
  return (
    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-primary">
      <GraduationCap size={12} /> Kejar Prestasi
    </div>
  );
}

/* 1. Beasiswa Tunai — mockup kartu transfer */
function MockupTunai() {
  return (
    <PhoneFrame>
      <BrandTag />
      <h4 className="mt-2 text-base font-extrabold text-foreground">Beasiswa Tunai</h4>
      <p className="text-xs text-muted-foreground">Transfer langsung ke penerima</p>

      <div className="mt-4 rounded-2xl bg-gradient-to-br from-primary to-[oklch(0.45_0.18_270)] p-4 text-primary-foreground shadow-soft">
        <div className="flex items-center justify-between text-[10px] uppercase tracking-wider opacity-80">
          <span>Saldo Beasiswa</span>
          <Wallet size={14} />
        </div>
        <div className="mt-2 text-2xl font-extrabold">Rp23.000.000</div>
        <div className="text-[10px] opacity-80">per semester</div>
        <div className="mt-3 flex items-center justify-between text-[10px]">
          <span className="opacity-80">•••• 2024</span>
          <span className="font-semibold">KEJAR PRESTASI</span>
        </div>
      </div>

      <div className="mt-3 space-y-2">
        {[
          { l: "Pencairan Tahap 1", v: "Berhasil" },
          { l: "Verifikasi Bank", v: "Aman" },
        ].map((r) => (
          <div key={r.l} className="flex items-center justify-between rounded-xl border border-border bg-card px-3 py-2 text-xs">
            <span className="text-muted-foreground">{r.l}</span>
            <span className="font-semibold text-primary">{r.v}</span>
          </div>
        ))}
      </div>
    </PhoneFrame>
  );
}

/* 2. Sertifikat Resmi — mockup sertifikat */
function MockupSertifikat() {
  return (
    <PhoneFrame>
      <BrandTag />
      <h4 className="mt-2 text-base font-extrabold text-foreground">Sertifikat Resmi</h4>
      <p className="text-xs text-muted-foreground">Bermaterai & terverifikasi</p>

      <div className="mt-4 rounded-2xl border-2 border-[oklch(0.85_0.16_85)] bg-[oklch(0.98_0.04_85)] p-4 text-center shadow-card">
        <div className="mx-auto inline-flex h-10 w-10 items-center justify-center rounded-full bg-[oklch(0.92_0.14_85)] text-[oklch(0.45_0.16_75)]">
          <Award size={20} />
        </div>
        <div className="mt-2 text-[9px] font-bold uppercase tracking-widest text-[oklch(0.55_0.16_75)]">
          Certificate of Achievement
        </div>
        <div className="mt-1 text-sm font-extrabold text-foreground">Kejar Prestasi</div>
        <div className="mt-2 text-[10px] text-muted-foreground">Diberikan kepada penerima beasiswa</div>
        <div className="mt-3 border-t border-dashed border-[oklch(0.85_0.16_85)] pt-2 text-[9px] text-muted-foreground">
          No. KP/2026/0001 — Bermaterai Resmi
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 rounded-xl bg-primary-soft px-3 py-2 text-xs text-primary">
        <ShieldCheck size={14} /> Tervalidasi sistem nasional
      </div>
    </PhoneFrame>
  );
}

/* 3. Merchandise Eksklusif — mockup grid produk */
function MockupMerch() {
  const items = ["Plakat", "Kaos", "Block Note", "Goodie Bag"];
  return (
    <PhoneFrame>
      <BrandTag />
      <h4 className="mt-2 text-base font-extrabold text-foreground">Merchandise Eksklusif</h4>
      <p className="text-xs text-muted-foreground">Paket bingkisan penerima</p>

      <div className="mt-4 rounded-2xl bg-gradient-to-br from-primary to-[oklch(0.45_0.18_270)] p-4 text-primary-foreground">
        <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest">
          <Gift size={12} /> Bingkisan Edisi #3
        </div>
        <div className="mt-2 text-sm font-bold">Paket Penerima Kejar Prestasi</div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        {items.map((it) => (
          <div key={it} className="rounded-xl border border-border bg-card p-3 text-center">
            <div className="mx-auto h-8 w-8 rounded-lg bg-primary-soft" />
            <div className="mt-1.5 text-[11px] font-semibold text-foreground">{it}</div>
          </div>
        ))}
      </div>
    </PhoneFrame>
  );
}

/* 4. Proses Transparan — mockup timeline status */
function MockupTransparan() {
  const steps = [
    { l: "Pendaftaran", s: "done" },
    { l: "Seleksi Berkas", s: "done" },
    { l: "Wawancara", s: "active" },
    { l: "Pengumuman", s: "todo" },
  ];
  return (
    <PhoneFrame>
      <BrandTag />
      <h4 className="mt-2 text-base font-extrabold text-foreground">Proses Transparan</h4>
      <p className="text-xs text-muted-foreground">Pantau setiap tahapan</p>

      <div className="mt-4 rounded-2xl border border-border bg-card p-4">
        <div className="mb-3 flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          <span>Status Seleksi</span>
          <span className="text-primary">2 / 4</span>
        </div>
        <div className="space-y-3">
          {steps.map((s, i) => (
            <div key={s.l} className="flex items-center gap-3">
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ${
                  s.s === "done"
                    ? "bg-primary text-primary-foreground"
                    : s.s === "active"
                    ? "bg-[oklch(0.92_0.14_85)] text-[oklch(0.45_0.16_75)] ring-2 ring-[oklch(0.85_0.16_85)]"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {s.s === "done" ? <CheckCircle2 size={14} /> : i + 1}
              </div>
              <div className="flex-1">
                <div className={`text-xs font-semibold ${s.s === "todo" ? "text-muted-foreground" : "text-foreground"}`}>
                  {s.l}
                </div>
                <div className="h-1 mt-1 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full ${s.s === "done" ? "bg-primary w-full" : s.s === "active" ? "bg-[oklch(0.85_0.16_85)] w-1/2" : "w-0"}`}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PhoneFrame>
  );
}

/* 5. Mentoring & Pembinaan — mockup video/kelas */
function MockupMentoring() {
  return (
    <PhoneFrame>
      <BrandTag />
      <h4 className="mt-2 text-base font-extrabold text-foreground">Mentoring & Pembinaan</h4>
      <p className="text-xs text-muted-foreground">Akses kelas inspiratif</p>

      <div className="mt-4 rounded-2xl bg-gradient-to-br from-primary to-[oklch(0.45_0.18_270)] p-4 text-primary-foreground">
        <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest">
          <PlayCircle size={12} /> Sesi Live
        </div>
        <div className="mt-2 text-sm font-bold leading-snug">
          "Strategi Belajar Efektif untuk Pelajar Indonesia"
        </div>
        <div className="mt-3 flex items-center gap-2 text-[10px] opacity-90">
          <Users size={12} /> 1.240 peserta
        </div>
      </div>

      <div className="mt-3 space-y-2">
        {[
          { l: "Kelas Pengembangan Diri", t: "12 modul" },
          { l: "Mentor 1-on-1", t: "Setiap bulan" },
          { l: "Komunitas Penerima", t: "Aktif 24/7" },
        ].map((m) => (
          <div key={m.l} className="flex items-center justify-between rounded-xl border border-border bg-card px-3 py-2">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-primary-soft text-primary inline-flex items-center justify-center">
                <BookOpen size={14} />
              </div>
              <span className="text-xs font-semibold text-foreground">{m.l}</span>
            </div>
            <span className="text-[10px] text-muted-foreground">{m.t}</span>
          </div>
        ))}
      </div>
    </PhoneFrame>
  );
}

/* 6. Bebas Biaya — mockup invoice nol rupiah */
function MockupBebasBiaya() {
  return (
    <PhoneFrame>
      <BrandTag />
      <h4 className="mt-2 text-base font-extrabold text-foreground">100% Bebas Biaya</h4>
      <p className="text-xs text-muted-foreground">Tanpa potongan apa pun</p>

      <div className="mt-4 rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          <span>Rincian Biaya</span>
          <Lock size={12} />
        </div>
        <div className="mt-3 space-y-2 text-xs">
          {[
            ["Biaya Pendaftaran", "Rp 0"],
            ["Biaya Administrasi", "Rp 0"],
            ["Potongan Beasiswa", "Rp 0"],
          ].map(([l, v]) => (
            <div key={l} className="flex items-center justify-between">
              <span className="text-muted-foreground">{l}</span>
              <span className="font-semibold text-foreground line-through opacity-60">{v}</span>
            </div>
          ))}
          <div className="border-t border-border pt-2 flex items-center justify-between">
            <span className="font-bold text-foreground">Total Dibayar</span>
            <span className="font-extrabold text-primary text-base">Rp 0</span>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 rounded-xl bg-primary-soft px-3 py-2 text-xs text-primary">
        <ShieldCheck size={14} /> Dijamin gratis oleh Kejar Prestasi
      </div>
    </PhoneFrame>
  );
}

const benefits = [
  {
    icon: Wallet,
    title: "Beasiswa Tunai",
    desc: "Dana pendidikan hingga Rp23.000.000 per semester langsung ke penerima.",
    Mockup: MockupTunai,
  },
  {
    icon: Award,
    title: "Sertifikat Resmi",
    desc: "Sertifikat penerima beasiswa bermaterai resmi dari Kejar Prestasi.",
    Mockup: MockupSertifikat,
  },
  {
    icon: Gift,
    title: "Merchandise Eksklusif",
    desc: "Plakat, kaos, block note, goodie bag, dan paket merchandise lainnya.",
    Mockup: MockupMerch,
  },
  {
    icon: FileCheck2,
    title: "Proses Transparan",
    desc: "Seleksi terbuka dengan tahapan jelas dan hasil yang dapat dipertanggungjawabkan.",
    Mockup: MockupTransparan,
  },
  {
    icon: BookOpen,
    title: "Mentoring & Pembinaan",
    desc: "Sesi mentoring, kelas inspiratif, dan akses materi pengembangan diri.",
    Mockup: MockupMentoring,
  },
  {
    icon: ShieldCheck,
    title: "Bebas Biaya",
    desc: "Tanpa biaya pendaftaran, tanpa potongan, dan seleksi 100% transparan.",
    Mockup: MockupBebasBiaya,
  },
];

export function BenefitsSection() {
  return (
    <section className="container-page py-20">
      <div className="text-center max-w-2xl mx-auto">
        <span className="inline-flex items-center gap-2 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
          <Sparkles size={14} /> Benefit Beasiswa
        </span>
        <h2 className="mt-4 text-3xl md:text-4xl font-extrabold text-foreground">
          Apa Saja yang Kamu Dapatkan?
        </h2>
        <p className="mt-3 text-muted-foreground">
          Bukan sekadar beasiswa tunai — kamu mendapatkan paket lengkap untuk mendukung
          perjalanan akademis dan pengembangan diri.
        </p>
      </div>

      <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {benefits.map((b) => (
          <div
            key={b.title}
            className="group rounded-3xl border border-border bg-gradient-to-b from-primary-soft/40 to-card p-6 shadow-card hover:shadow-soft hover:-translate-y-0.5 transition"
          >
            <div className="flex items-center justify-center pt-2 pb-5">
              <b.Mockup />
            </div>
            <div className="mt-2 flex items-center gap-2">
              <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <b.icon size={16} />
              </div>
              <h3 className="text-lg font-semibold text-foreground">{b.title}</h3>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{b.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
