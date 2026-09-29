#!/bin/bash
# The realm file is the single source of truth: re-apply it on EVERY boot so
# stale/partial realm state in the Postgres `keycloak` DB can never drift from
# infra/keycloak/realm-export.json. Users/roles created by hand in the admin
# console are reset on restart -- add them to the realm file instead.
set -e
# --file (not --dir): --dir only reads files named <realm>-realm.json and would silently
# import nothing for realm-export.json.
/opt/keycloak/bin/kc.sh import --file /opt/keycloak/data/import/realm-export.json --override true
exec /opt/keycloak/bin/kc.sh start-dev