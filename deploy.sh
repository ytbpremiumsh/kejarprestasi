#!/usr/bin/env bash
# Root-level wrapper agar auto-deploy hook (aaPanel, GitHub webhook, dll)
# selalu memanggil deploy/update.sh — bukan menjalankan `npm run build`
# (target Cloudflare Worker) yang akan menghasilkan dist Worker-style
# yang tidak bisa dilayani PM2.
set -e
cd "$(dirname "$0")"
exec bash deploy/update.sh "$@"
