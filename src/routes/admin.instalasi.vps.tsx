import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Server, AlertTriangle, CheckCircle2 } from "lucide-react";
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
        badge="VPS / Node SSR + PM2 + Nginx"
        title="Instalasi di VPS (Node SSR)"
        desc="Deploy Kejar Prestasi ke VPS Linux (Ubuntu 20.04+ / Debian 11+) sebagai Node.js SSR di /var/www/kejarprestasi, di-proxy Nginx. Bukan static SPA — tidak ada index.html di webroot."
      />

      {/* Arsitektur singkat */}
      <Card className="rounded-2xl p-6">
        <h2 className="mb-2 text-lg font-semibold text-foreground">Arsitektur</h2>
        <CodeBlock
          code={`Browser ──HTTPS──▶ Nginx :443
                   ├─ /assets/*  → alias /var/www/kejarprestasi/dist/client/assets/  (cache 1y)
                   └─ /*         → proxy_pass 127.0.0.1:3000  (Node SSR via PM2)

App dir tunggal: /var/www/kejarprestasi
Webroot /www/wwwroot/kejarprestasi.id HARUS KOSONG.`}
        />
      </Card>

      {/* Migrasi dari instalasi lama */}
      <Card className="rounded-2xl border-red-500/40 bg-red-500/5 p-4">
        <div className="flex gap-3 text-sm">
          <AlertTriangle className="h-5 w-5 shrink-0 text-red-600" />
          <div className="text-foreground space-y-2">
            <p className="font-semibold">Migrasi dari instalasi lama (aaPanel / static)</p>
            <p className="text-muted-foreground">
              Jika <code className="rounded bg-muted px-1">/www/wwwroot/kejarprestasi.id/</code> masih
              berisi <code>client/</code>, <code>server/</code>, <code>assets/</code>, atau{" "}
              <code>index.html</code> → itu sisa deploy lama yang tidak relevan untuk SSR. Bersihkan dengan:
            </p>
            <CodeBlock
              code={`sudo bash /var/www/kejarprestasi/deploy/migrate-from-static.sh`}
            />
            <p className="text-muted-foreground">
              Script ini menghapus isi webroot lama, memasang Nginx config baru, menonaktifkan vhost aaPanel,
              dan restart PM2. Aman dijalankan berkali-kali.
            </p>
          </div>
        </div>
      </Card>

      {/* Langkah install */}
      <Card className="rounded-2xl p-6 md:p-8">
        <div className="space-y-8">
          <Step n={1} title="Prasyarat VPS">
            <ul className="list-disc space-y-1 pl-5">
              <li>Ubuntu 20.04+ / Debian 11+ dengan akses <strong>sudo</strong></li>
              <li>Port 80 & 443 terbuka, domain <code className="rounded bg-muted px-1">kejarprestasi.id</code> sudah point ke IP VPS</li>
              <li>Nginx + Git terpasang (<code className="rounded bg-muted px-1">apt install -y nginx git</code>)</li>
              <li>Node 20+ & PM2 akan diinstal otomatis oleh installer</li>
            </ul>
          </Step>

          <Step n={2} title="Clone Repository ke /var/www/kejarprestasi">
            <CodeBlock
              code={`sudo mkdir -p /var/www
cd /var/www
sudo git clone -b main <REPO_URL> kejarprestasi
cd kejarprestasi`}
            />
            <p className="text-xs text-muted-foreground">
              Ganti <code className="rounded bg-muted px-1">&lt;REPO_URL&gt;</code> dengan URL Git Anda.
              <strong> Jangan</strong> clone ke <code>/www/wwwroot/...</code>.
            </p>
          </Step>

          <Step n={3} title="Isi File .env">
            <CodeBlock
              code={`sudo nano /var/www/kejarprestasi/.env`}
            />
            <p>Minimum yang harus ada:</p>
            <CodeBlock
              code={`VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOi...
VITE_SUPABASE_PROJECT_ID=xxxxx
# secret server (jangan pakai prefix VITE_)
SUPABASE_SERVICE_ROLE_KEY=...
LOVABLE_API_KEY=...`}
            />
          </Step>

          <Step n={4} title="Jalankan Installer Otomatis">
            <CodeBlock
              code={`sudo REPO_URL=<REPO_URL> bash /var/www/kejarprestasi/deploy/install-vps.sh`}
            />
            <p>Installer akan otomatis:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Install Node 20 (via NodeSource) & PM2 global jika belum ada</li>
              <li><code className="rounded bg-muted px-1">npm ci</code> + <code className="rounded bg-muted px-1">npm run build:node</code></li>
              <li>Validasi keras: <code>dist/server/server.node.js</code> harus ada</li>
              <li><code>pm2 start ecosystem.config.cjs</code> + <code>pm2 save</code> + autostart on boot</li>
              <li>Salin contoh Nginx config ke <code>/etc/nginx/conf.d/kejarprestasi.id.conf.example</code></li>
              <li>Smoke test <code>curl http://127.0.0.1:3000</code></li>
            </ul>
          </Step>

          <Step n={5} title="Aktifkan Nginx Reverse Proxy">
            <CodeBlock
              code={`sudo cp /etc/nginx/conf.d/kejarprestasi.id.conf.example /etc/nginx/conf.d/kejarprestasi.id.conf
sudo nginx -t && sudo systemctl reload nginx`}
            />
            <p className="text-xs text-muted-foreground">
              Config sudah berisi: <code>/assets/</code> → alias disk (cache 1y immutable),{" "}
              <code>/</code> → proxy ke Node port 3000.
            </p>
          </Step>

          <Step n={6} title="HTTPS via Let's Encrypt">
            <CodeBlock
              code={`sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d kejarprestasi.id -d www.kejarprestasi.id`}
            />
            <p className="text-xs text-muted-foreground">Auto-renew aktif otomatis.</p>
          </Step>

          <Step n={7} title="Verifikasi (yang BENAR)">
            <CodeBlock
              code={`# 1. Build artifact Node SSR ada?
ls /var/www/kejarprestasi/dist/server/server.node.js

# 2. PM2 jalan?
pm2 status

# 3. Node respond di port 3000?
curl -I http://127.0.0.1:3000

# 4. Domain respond + HTML (bukan 403)?
curl -I https://kejarprestasi.id

# 5. Webroot lama HARUS kosong (ini fitur, bukan bug!)
ls -lah /www/wwwroot/kejarprestasi.id`}
            />
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 text-xs text-foreground">
              <div className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                <div>
                  <p className="font-medium">Hasil yang benar:</p>
                  <ul className="mt-1 list-disc space-y-0.5 pl-5 text-muted-foreground">
                    <li><code>dist/server/server.node.js</code> ada</li>
                    <li><code>pm2 status</code> → <code>kejarprestasi · online · cluster</code></li>
                    <li><code>curl -I https://kejarprestasi.id</code> → <code>HTTP/2 200</code> +{" "}
                      <code>content-type: text/html</code></li>
                    <li><code>/www/wwwroot/kejarprestasi.id/</code> <strong>KOSONG</strong> —
                      SSR berarti HTML dirender Node, bukan disajikan dari disk. Tidak ada{" "}
                      <code>index.html</code>, tidak ada <code>client/</code>, tidak ada{" "}
                      <code>server/</code> di sini.</li>
                  </ul>
                </div>
              </div>
            </div>
          </Step>

          <Step n={8} title="Update / Deploy Ulang">
            <CodeBlock
              code={`cd /var/www/kejarprestasi
sudo bash deploy/update.sh`}
            />
            <p className="text-xs text-muted-foreground">
              Script: <code>git pull</code> → <code>npm ci</code> → <code>npm run build:node</code> →
              validasi → <code>pm2 reload</code> (zero-downtime). Auto-rollback jika build gagal.
              Membersihkan sisa <code>/www/wwwroot/kejarprestasi.id/</code> legacy otomatis.
            </p>
          </Step>
        </div>
      </Card>

      {/* Troubleshooting */}
      <Card className="rounded-2xl p-6">
        <h2 className="mb-3 text-lg font-semibold text-foreground">Troubleshooting</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase text-muted-foreground">
                <th className="py-2 pr-4">Gejala</th>
                <th className="py-2 pr-4">Penyebab</th>
                <th className="py-2">Fix</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              <tr className="border-b">
                <td className="py-2 pr-4">403 di domain; webroot berisi <code>assets/</code> + <code>update.sh</code></td>
                <td className="py-2 pr-4">Sisa deploy static lama</td>
                <td className="py-2"><code>bash deploy/migrate-from-static.sh</code></td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4">Webroot berisi <code>client/</code> + <code>server/</code></td>
                <td className="py-2 pr-4">Build di-copy ke webroot oleh script lama</td>
                <td className="py-2"><code>bash deploy/migrate-from-static.sh</code></td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4"><code>dist/server/server.node.js</code> tidak ada setelah build</td>
                <td className="py-2 pr-4">Dijalankan <code>npm run build</code> (target Cloudflare Worker)</td>
                <td className="py-2">Wajib <code>npm run build:node</code></td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4">PM2 restart loop</td>
                <td className="py-2 pr-4"><code>.env</code> kurang / port 3000 sudah dipakai</td>
                <td className="py-2"><code>pm2 logs kejarprestasi</code></td>
              </tr>
              <tr>
                <td className="py-2 pr-4">502 Bad Gateway</td>
                <td className="py-2 pr-4">Node mati</td>
                <td className="py-2"><code>pm2 restart kejarprestasi</code></td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Shared hosting cPanel tidak didukung → lihat{" "}
          <Link to="/admin/instalasi/hosting" className="text-primary underline">
            tab Hosting
          </Link>
          .
        </p>
      </Card>

      <UpdateSection />
    </div>
  );
}
