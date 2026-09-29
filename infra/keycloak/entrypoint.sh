#!/bin/bash
# The realm file is the single source of truth: re-apply it on EVERY boot so
# stale/partial realm state in the Postgres `keycloak` DB can never drift from
# infra/keycloak/realm-export.json. Users/roles created by hand in the admin
# console are reset on restart -- add them to the realm file instead.
set -e
/opt/keycloak/bin/kc.sh import --dir /opt/keycloak/data/import --override true
exec /opt/keycloak/bin/kc.sh start-dev