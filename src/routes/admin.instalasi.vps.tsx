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
        badge="VPS / Cloud Server"
        title="Instalasi di VPS"
        desc="Panduan deploy aplikasi Kejar Prestasi di VPS Linux (Ubuntu 22.04+, Debian, atau CentOS) dengan Node.js, PM2, dan Nginx."
      />

      <Card className="rounded-2xl p-6 md:p-8">
        <div className="space-y-8">
          <Step n={1} title="Persiapan Server">
            <p>Login ke VPS via SSH lalu update sistem:</p>
            <CodeBlock
              code={`ssh root@IP-VPS-ANDA
apt update && apt upgrade -y
apt install -y curl git build-essential nginx ufw`}
            />
          </Step>

          <Step n={2} title="Install Node.js 20 + Bun">
            <CodeBlock
              code={`# Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Bun (opsional, lebih cepat)
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc

# PM2 untuk manajemen proses
npm install -g pm2`}
            />
          </Step>

          <Step n={3} title="Clone Repository">
            <CodeBlock
              code={`mkdir -p /var/www && cd /var/www
git clone https://github.com/USERNAME/REPO.git kejar-prestasi
cd kejar-prestasi`}
            />
          </Step>

          <Step n={4} title="Konfigurasi Environment">
            <p>
              Buat file <code className="rounded bg-muted px-1">.env</code> dengan kredensial
              backend (Lovable Cloud / Supabase):
            </p>
            <CodeBlock
              code={`cat > .env <<'EOF'
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOi...
VITE_SUPABASE_PROJECT_ID=xxxxx
EOF`}
            />
          </Step>

          <Step n={5} title="Install & Build">
            <CodeBlock
              code={`bun install   # atau: npm install
bun run build # atau: npm run build`}
            />
          </Step>

          <Step n={6} title="Jalankan dengan PM2">
            <CodeBlock
              code={`pm2 start "npm run start" --name kejar-prestasi
pm2 save
pm2 startup        # ikuti instruksi yang muncul`}
            />
          </Step>

          <Step n={7} title="Konfigurasi Nginx (Reverse Proxy)">
            <CodeBlock
              code={`cat > /etc/nginx/sites-available/kejar-prestasi <<'EOF'
server {
    listen 80;
    server_name domain-anda.com www.domain-anda.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

ln -s /etc/nginx/sites-available/kejar-prestasi /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx`}
            />
          </Step>

          <Step n={8} title="SSL Gratis dengan Let's Encrypt">
            <CodeBlock
              code={`apt install -y certbot python3-certbot-nginx
certbot --nginx -d domain-anda.com -d www.domain-anda.com
# Auto-renew sudah aktif via cron`}
            />
          </Step>

          <Step n={9} title="Firewall">
            <CodeBlock
              code={`ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable`}
            />
          </Step>
        </div>
      </Card>

      <UpdateSection />
    </div>
  );
}
