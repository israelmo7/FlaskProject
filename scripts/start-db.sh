#!/usr/bin/env bash
# Start MariaDB (idempotent) and ensure the knocknok schema exists.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

ensure_socket_dirs() {
  sudo mkdir -p /var/run/mysqld /run/mysqld
  sudo chown mysql:mysql /var/run/mysqld /run/mysqld || true
}

link_client_socket() {
  # On some Cloud Agent images /var/run is not /run; mysql clients expect /run/mysqld.
  if [[ -S /var/run/mysqld/mysqld.sock && ! -e /run/mysqld/mysqld.sock ]]; then
    sudo ln -sfn /var/run/mysqld/mysqld.sock /run/mysqld/mysqld.sock
  fi
  if [[ -f /var/run/mysqld/mysqld.pid && ! -e /run/mysqld/mysqld.pid ]]; then
    sudo ln -sfn /var/run/mysqld/mysqld.pid /run/mysqld/mysqld.pid
  fi
}

is_alive() {
  mysqladmin --socket=/var/run/mysqld/mysqld.sock ping --silent 2>/dev/null \
    || mysqladmin --socket=/run/mysqld/mysqld.sock ping --silent 2>/dev/null \
    || mysqladmin ping --silent 2>/dev/null
}

start_mariadb() {
  if is_alive; then
    echo "MariaDB already running."
    link_client_socket
    return 0
  fi

  ensure_socket_dirs

  if command -v mysqld_safe >/dev/null 2>&1; then
    sudo mysqld_safe \
      --datadir=/var/lib/mysql \
      --socket=/var/run/mysqld/mysqld.sock \
      --pid-file=/var/run/mysqld/mysqld.pid \
      >/tmp/mysqld_safe.log 2>&1 &
  else
    sudo -u mysql mariadbd \
      --datadir=/var/lib/mysql \
      --socket=/var/run/mysqld/mysqld.sock \
      --pid-file=/var/run/mysqld/mysqld.pid \
      --bind-address=127.0.0.1 \
      >/tmp/mariadbd.log 2>&1 &
  fi

  for _ in $(seq 1 30); do
    if is_alive; then
      link_client_socket
      echo "MariaDB is up."
      return 0
    fi
    sleep 1
  done

  echo "MariaDB failed to start" >&2
  tail -50 /tmp/mysqld_safe.log /tmp/mariadbd.log 2>/dev/null || true
  return 1
}

ensure_schema() {
  local user pass name
  user="$(python3 -c "import json; print(json.load(open('config.json'))['db']['USER'])")"
  pass="$(python3 -c "import json; print(json.load(open('config.json'))['db']['PASSWORD'])")"
  name="$(python3 -c "import json; print(json.load(open('config.json'))['db']['NAME'])")"

  sudo mysql -e "CREATE DATABASE IF NOT EXISTS \`${name}\`;"
  sudo mysql -e "CREATE USER IF NOT EXISTS '${user}'@'localhost' IDENTIFIED BY '${pass}';"
  sudo mysql -e "GRANT ALL PRIVILEGES ON \`${name}\`.* TO '${user}'@'localhost'; FLUSH PRIVILEGES;"
  sudo mysql "${name}" < schema.sql
  echo "Schema ready for database '${name}'."
}

start_mariadb
if [[ -f config.json ]]; then
  ensure_schema
else
  echo "config.json missing; skip schema bootstrap." >&2
fi
