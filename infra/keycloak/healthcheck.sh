#!/bin/bash
exec 3<>/dev/tcp/127.0.0.1/8080 || exit 1
printf 'GET /realms/hackathon HTTP/1.1\r\nHost: localhost\r\nConnection: close\r\n\r\n' >&3
read -r line <&3
[[ "$line" == *" 200 "* || "$line" == *" 302 "* || "$line" == *" 303 "* ]]