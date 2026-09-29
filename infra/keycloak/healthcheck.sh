#!/bin/bash
# Healthy when GET /realms/hackathon returns 200. The Keycloak image has no
# curl/grep, so this uses only bash builtins.
exec 3<>/dev/tcp/127.0.0.1/8080 || exit 1
printf 'GET /realms/hackathon HTTP/1.0\r\nHost: localhost\r\n\r\n' >&3
read -r line <&3
[[ "$line" == *" 200 "* ]]