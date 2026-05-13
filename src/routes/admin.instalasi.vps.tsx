import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Server } from "lucide-react";
import {
  CodeBlock,
  PageHeader,
  Step,
  UpdateSection,
} from "@/components/admin/InstallDocs";

export const Route = createFileRoute("/admin/instalasi/vps")({
  component: VpsInstallPage,
});

function VpsInstallPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        icon={Server}
        badge="VPS / Cloud Server + aaPanel"
        title="Instalasi di VPS dengan aaPanel"
        desc="Panduan deploy aplikasi Kejar Prestasi di VPS Linux (Ubuntu 20.04+ / Debian 11+) menggunakan aaPanel sebagai control panel, dengan domain kejarprestasi.id."
      />

      <Card className="rounded-2xl p-6 md:p-8">
        <div className="space-y-8">
          <Step n={1} title="Persiapan VPS">
            <p>Login ke VPS via SSH lalu update sistem:</p>
            <CodeBlock
              code={`ssh root@IP-VPS-ANDA
apt update && apt upgrade -y
apt install -y curl wget git ufw`}
            />
          </Step>

          <Step n={2} title="Install aaPanel">
            <p>
              Jalankan installer resmi aaPanel. Setelah selesai, catat <strong>panel URL</strong>,
              <strong> username</strong>, dan <strong>password</strong> yang muncul di terminal.
            </p>
            <CodeBlock
              code={`# Ubuntu / Debian
URL=https://www.aapanel.com/script/install_7.0_en.sh && \\
wget -O install_7.0_en.sh "$URL" && \\
bash install_7.0_en.sh aapanel`}
            />
            <p className="text-sm text-muted-foreground">
              Setelah install, buka panel URL (biasanya <code className="rounded bg-muted px-1">http://IP-VPS:7800/xxxxx</code>),
              login dan terima EULA.
            </p>
          </Step>

          <Step n={3} title="Buka Port di Firewall aaPanel">
            <p>
              Di menu <strong>Security</strong> aaPanel, buka port: <code className="rounded bg-muted px-1">22, 80, 443, 3000, 7800</code>.
              Atau via terminal:
            </p>
            <CodeBlock
              code={`ufw allow 22
ufw allow 80
ufw allow 443
ufw allow 3000
ufw allow 7800
ufw enable`}
            />
          </Step>

          <Step n={4} title="Install LNMP Stack via aaPanel">
            <p>
              Di dashboard aaPanel pilih <strong>LNMP</strong> (Nginx + MySQL + PHP). Yang wajib hanya{" "}
              <strong>Nginx 1.24+</strong> (untuk reverse proxy). MySQL & PHP boleh di-skip karena kita
              pakai Lovable Cloud.
            </p>
          </Step>

          <Step n={5} title="Install Node.js 20 + PM2">
            <p>
              Di aaPanel buka <strong>App Store → Node.js Version Manager</strong>, install{" "}
              <strong>Node.js 20 LTS</strong>, lalu set sebagai versi default. Atau via terminal:
            </p>
            <CodeBlock
              code={`curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
npm install -g pm2 bun`}
            />
          </Step>

          <Step n={6} title="Tambahkan Domain kejarprestasi.id">
            <p>
              Di aaPanel buka <strong>Website → Add Site</strong>:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li><strong>Domain</strong>: <code className="rounded bg-muted px-1">kejarprestasi.id</code> dan <code className="rounded bg-muted px-1">www.kejarprestasi.id</code></li>
              <li><strong>Root directory</strong>: <code className="rounded bg-muted px-1">/www/wwwroot/kejarprestasi.id</code></li>
              <li><strong>PHP Version</strong>: Pure static / Static</li>
              <li><strong>Database</strong>: tidak perlu</li>
            </ul>
            <p className="text-sm text-muted-foreground">
              Pastikan DNS A record <code className="rounded bg-muted px-1">kejarprestasi.id</code> dan{" "}
              <code className="rounded bg-muted px-1">www</code> sudah mengarah ke IP VPS Anda.
            </p>
          </Step>

          <Step n={7} title="Clone Repository">
            <CodeBlock
              code={`cd /www/wwwroot/kejarprestasi.id
rm -rf ./*  # bersihkan default index aaPanel
git clone https://github.com/USERNAME/REPO.git .`}
            />
          </Step>

          <Step n={8} title="Konfigurasi Environment (.env)">
            <CodeBlock
              code={`cat > /www/wwwroot/kejarprestasi.id/.env <<'EOF'
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOi...
VITE_SUPABASE_PROJECT_ID=xxxxx
EOF`}
            />
          </Step>

          <Step n={9} title="Install Dependencies & Build">
            <CodeBlock
              code={`cd /www/wwwroot/kejarprestasi.id
bun install
bun run build`}
            />
          </Step>

          <Step n={10} title="Jalankan dengan PM2">
            <CodeBlock
              code={`cd /www/wwwroot/kejarprestasi.id
pm2 start "npm run start" --name kejar-prestasi
pm2 save
pm2 startup   # jalankan command yang di-output`}
            />
          </Step>

          <Step n={11} title="Reverse Proxy di aaPanel">
            <p>
              Buka <strong>Website → kejarprestasi.id → Settings → Reverse Proxy → Add Reverse Proxy</strong>:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li><strong>Proxy Name</strong>: <code className="rounded bg-muted px-1">kejar-prestasi</code></li>
              <li><strong>Target URL</strong>: <code className="rounded bg-muted px-1">http://127.0.0.1:3000</code></li>
              <li><strong>Send Domain</strong>: <code className="rounded bg-muted px-1">$host</code></li>
              <li>Centang <strong>Enable cache</strong>: OFF (karena SSR)</li>
            </ul>
            <p className="text-sm text-muted-foreground">
              Atau edit langsung config Nginx di aaPanel (tab <strong>Config File</strong>):
            </p>
            <CodeBlock
              code={`location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
}`}
            />
          </Step>

          <Step n={12} title="SSL Gratis (Let's Encrypt)">
            <p>
              Di <strong>Website → kejarprestasi.id → Settings → SSL</strong>, pilih tab{" "}
              <strong>Let's Encrypt</strong>, centang <code className="rounded bg-muted px-1">kejarprestasi.id</code>{" "}
              dan <code className="rounded bg-muted px-1">www.kejarprestasi.id</code>, klik <strong>Apply</strong>.
            </p>
            <p className="text-sm text-muted-foreground">
              Setelah berhasil, aktifkan <strong>Force HTTPS</strong>. Sertifikat akan auto-renew setiap 60 hari.
            </p>
          </Step>

          <Step n={13} title="Verifikasi">
            <p>
              Buka <a href="https://kejarprestasi.id" className="text-primary underline">https://kejarprestasi.id</a>{" "}
              di browser. Cek status proses:
            </p>
            <CodeBlock
              code={`pm2 status
pm2 logs kejar-prestasi --lines 50`}
            />
          </Step>
        </div>
      </Card>

      <UpdateSection />
    </div>
  );
}
