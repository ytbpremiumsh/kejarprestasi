#!/usr/bin/env bash
# Backward-compatible root wrapper untuk webhook/admin updater.
# Jalur update resmi ada di deploy/update.sh.
set -e
cd "$(dirname "$0")"
exec bash deploy/update.sh "$@"