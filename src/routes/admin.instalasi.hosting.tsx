import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Globe, AlertTriangle } from "lucide-react";
import {
  CodeBlock,
  PageHeader,
  Step,
  UpdateSection,
} from "@/components/admin/InstallDocs";

export const Route = createFileRoute("/admin/instalasi/hosting")({
  component: HostingInstallPage,
});

function HostingInstallPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        icon={Globe}
        tone="gold"
        badge="Shared Hosting / cPanel"
        title="Instalasi di Shared Hosting"
        desc="Panduan deploy di hosting cPanel/Plesk yang mendukung Node.js (Setup Node.js App)."
      />

      <Card className="rounded-2xl border-amber-500/30 bg-amber-500/5 p-4">
        <div className="flex gap-3 text-sm">
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
          <div className="text-foreground">
            <p className="font-medium">Penting</p>
            <p className="text-muted-foreground">
              Hosting Anda harus mendukung <strong>Node.js 20+</strong> dan akses{" "}
              <strong>Terminal SSH</strong>. Jika tidak ada keduanya, gunakan VPS.
              Provider yang umum mendukung: Niagahoster, Hostinger Premium, IDCloudHost,
              Domainesia, A2 Hosting, dll.
            </p>
          </div>
        </div>
      </Card>

      <Card className="rounded-2xl p-6 md:p-8">
        <div className="space-y-8">
          <Step n={1} title="Aktifkan Node.js di cPanel">
            <p>
              Login cPanel → cari menu <strong>Setup Node.js App</strong> →{" "}
              <strong>Create Application</strong>.
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Node.js version: <strong>20.x</strong></li>
              <li>Application mode: <strong>Production</strong></li>
              <li>Application root: <code className="rounded bg-muted px-1">kejar-prestasi</code></li>
              <li>Application URL: pilih domain/subdomain</li>
              <li>Application startup file: <code className="rounded bg-muted px-1">.output/server/index.mjs</code></li>
            </ul>
          </Step>

          <Step n={2} title="Upload Source Code">
            <p>Dua cara — pilih salah satu:</p>
            <p className="font-medium text-foreground">A. Via Git (rekomendasi)</p>
            <p>cPanel → <strong>Git Version Control</strong> → Create:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Clone URL: URL repo Anda</li>
              <li>Repository Path: <code className="rounded bg-muted px-1">/home/USER/kejar-prestasi</code></li>
              <li>Repository Name: <code className="rounded bg-muted px-1">kejar-prestasi</code></li>
            </ul>
            <p className="font-medium text-foreground mt-2">B. Via File Manager</p>
            <p>
              Compress project lokal jadi <code className="rounded bg-muted px-1">.zip</code> →
              upload ke folder <code className="rounded bg-muted px-1">kejar-prestasi</code> → extract.
            </p>
          </Step>

          <Step n={3} title="Buat File .env">
            <p>
              File Manager → masuk ke folder app → <strong>+ File</strong> →{" "}
              <code className="rounded bg-muted px-1">.env</code> → Edit:
            </p>
            <CodeBlock
              code={`VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOi...
VITE_SUPABASE_PROJECT_ID=xxxxx`}
            />
          </Step>

          <Step n={4} title="Install Dependencies & Build">
            <p>Buka <strong>Terminal</strong> di cPanel, lalu jalankan:</p>
            <CodeBlock
              code={`cd ~/kejar-prestasi

# Aktifkan environment Node.js cPanel
source /home/USER/nodevenv/kejar-prestasi/20/bin/activate

npm install
npm run build`}
            />
            <p className="text-xs">
              Ganti <code className="rounded bg-muted px-1">USER</code> dengan username cPanel Anda.
              Path environment ada di halaman <strong>Setup Node.js App</strong>.
            </p>
          </Step>

          <Step n={5} title="Restart Aplikasi">
            <p>
              Kembali ke <strong>Setup Node.js App</strong> → klik tombol{" "}
              <strong>Restart</strong> di sebelah aplikasi Anda.
            </p>
          </Step>

          <Step n={6} title="Pasang SSL (HTTPS)">
            <p>
              cPanel → <strong>SSL/TLS Status</strong> → pilih domain → <strong>Run AutoSSL</strong>.
              Tunggu beberapa menit hingga sertifikat aktif.
            </p>
          </Step>
        </div>
      </Card>

      <UpdateSection />
    </div>
  );
}
