#!/usr/bin/env bash
set -euo pipefail

echo "Opening Core of Life database console."
echo "Useful commands: \\dt lists tables, \\q exits."
exec sudo -u postgres psql -d cof_db1
