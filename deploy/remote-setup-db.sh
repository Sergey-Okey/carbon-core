#!/usr/bin/env bash
set -euo pipefail
export DEBIAN_FRONTEND=noninteractive

apt-get install -y -qq postgresql postgresql-contrib
systemctl enable --now postgresql

DB_PASS="$(openssl rand -hex 16)"

# Create role
sudo -u postgres psql -v ON_ERROR_STOP=1 -c "DO \$\$ BEGIN IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'cof') THEN CREATE ROLE cof LOGIN PASSWORD '${DB_PASS}'; ELSE ALTER ROLE cof WITH LOGIN PASSWORD '${DB_PASS}'; END IF; END \$\$;"

# Create database if missing
if ! sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='cof'" | grep -q 1; then
  sudo -u postgres psql -v ON_ERROR_STOP=1 -c "CREATE DATABASE cof OWNER cof;"
fi
sudo -u postgres psql -v ON_ERROR_STOP=1 -c "GRANT ALL PRIVILEGES ON DATABASE cof TO cof;"
sudo -u postgres psql -d cof -v ON_ERROR_STOP=1 -c "GRANT ALL ON SCHEMA public TO cof; ALTER SCHEMA public OWNER TO cof;"

# Password auth for local TCP
PG_HBA="$(find /etc/postgresql -name pg_hba.conf | head -n1)"
if [[ -n "${PG_HBA}" ]]; then
  if ! grep -qE '^[[:space:]]*host[[:space:]]+cof[[:space:]]+cof[[:space:]]+127\.0\.0\.1/32' "${PG_HBA}"; then
    printf '\n# cof app\nlocal   cof             cof                                     md5\nhost    cof             cof             127.0.0.1/32            md5\nhost    cof             cof             ::1/128                 md5\n' >> "${PG_HBA}"
  fi
  systemctl reload postgresql
fi

umask 077
cat >/root/cof-db-credentials <<EOF
DB_USER=cof
DB_NAME=cof
DB_PASS=${DB_PASS}
DATABASE_URL=postgresql://cof:${DB_PASS}@127.0.0.1:5432/cof
EOF
install -m 600 /root/cof-db-credentials /home/ubuntuuser/cof-db-credentials
chown ubuntuuser:ubuntuuser /home/ubuntuuser/cof-db-credentials

PGPASSWORD="${DB_PASS}" psql -h 127.0.0.1 -U cof -d cof -c 'SELECT current_database() AS db, current_user AS usr;'
echo DB_SETUP_OK
