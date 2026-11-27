curl -s -o /dev/null http://localhost:8765/index.html || (cd /tmp/srv && nohup python3 -m http.server 8765 >/dev/null 2>&1 &) ; sleep 1
