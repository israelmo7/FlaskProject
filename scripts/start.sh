#!/usr/bin/env bash
# Per-boot Cloud Agent start: bring up MariaDB and ensure schema.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
exec "$ROOT/scripts/start-db.sh"
