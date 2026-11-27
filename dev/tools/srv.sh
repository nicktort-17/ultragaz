#!/bin/sh
# поднять тестовый сервер (см. srv.py)
exec python "$(dirname "$0")/srv.py" "$@"
