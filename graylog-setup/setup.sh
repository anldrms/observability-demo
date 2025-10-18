#!/usr/bin/env bash
set -euo pipefail
GRAYLOG_URI="${GRAYLOG_URI:-http://graylog:9000/api}"
USER="${GRAYLOG_USER:-admin}"
PASS="${GRAYLOG_PASS:-admin}"
INPUT_TITLE="GELF UDP 12201"

wait_for_graylog() {
  echo "Waiting for Graylog API at $GRAYLOG_URI..."
  for i in {1..60}; do
    if curl -s -u "$USER:$PASS" "$GRAYLOG_URI/system" >/dev/null; then
      echo "Graylog API is up"; return 0
    fi
    sleep 5
  done
  echo "Graylog API did not become ready in time" >&2
  exit 1
}

create_input_if_missing() {
  echo "Ensuring GELF UDP input exists..."
  local existing
  existing=$(curl -s -u "$USER:$PASS" "$GRAYLOG_URI/system/inputs")
  echo "$existing" | grep -q 'org.graylog2.inputs.gelf.udp.GELFUDPInput' && { echo "GELF UDP input already present"; return 0; }

  curl -s -u "$USER:$PASS" -H 'Content-Type: application/json' -H 'X-Requested-By: curl' -X POST \
    -d '{
      "title": "GELF UDP",
      "global": true,
      "type": "org.graylog2.inputs.gelf.udp.GELFUDPInput",
      "configuration": {
        "port": 12201,
        "bind_address": "0.0.0.0",
        "recv_buffer_size": 262144
      }
    }' \
    "$GRAYLOG_URI/system/inputs"
}

wait_for_graylog
create_input_if_missing
