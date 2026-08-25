#!/bin/sh
set -e

if [ -n "$PROXY_SERVER" ]; then
  export HTTP_PROXY="$PROXY_SERVER"
  export HTTPS_PROXY="$PROXY_SERVER"
  export NO_PROXY="${NO_PROXY:-localhost,127.0.0.1}"
  export no_proxy="$NO_PROXY"
  export NODE_USE_ENV_PROXY=1
  echo "Proxy enabled: $PROXY_SERVER"

  echo "Configuring SearXNG outgoing proxy..."
  /usr/local/searxng/searx-pyenv/bin/python - <<'PYEOF'
import os, yaml

path = '/etc/searxng/settings.yml'
with open(path) as f:
    cfg = yaml.safe_load(f) or {}

proxy = os.environ['PROXY_SERVER']
outgoing = cfg.get('outgoing') or {}
outgoing['proxies'] = {'all://': [proxy]}
cfg['outgoing'] = outgoing

with open(path, 'w') as f:
    yaml.safe_dump(cfg, f, sort_keys=False)

print(f'SearXNG outgoing proxy configured: {proxy}')
PYEOF
fi

echo "Starting SearXNG..."

sudo -H -u searxng bash -c "cd /usr/local/searxng/searxng-src && export SEARXNG_SETTINGS_PATH='/etc/searxng/settings.yml' && export FLASK_APP=searx/webapp.py && /usr/local/searxng/searx-pyenv/bin/python -m flask run --host=0.0.0.0 --port=8080" &
SEARXNG_PID=$!

echo "Waiting for SearXNG to be ready..."
sleep 5

COUNTER=0
MAX_TRIES=30
until curl -s http://localhost:8080 > /dev/null 2>&1; do
  COUNTER=$((COUNTER+1))
  if [ $COUNTER -ge $MAX_TRIES ]; then
    echo "Warning: SearXNG health check timeout, but continuing..."
    break
  fi
  sleep 1
done

if curl -s http://localhost:8080 > /dev/null 2>&1; then
  echo "SearXNG started successfully (PID: $SEARXNG_PID)"
else
  echo "SearXNG may not be fully ready, but continuing (PID: $SEARXNG_PID)"
fi

cd /home/vane

# Bundled SearXNG is the default; an operator-provided SEARXNG_API_URL
# (external instance, e.g. with authentication) takes precedence.
export SEARXNG_API_URL="${SEARXNG_API_URL:-http://localhost:8080}"
echo "Using SearXNG: $SEARXNG_API_URL"
echo "Starting Vane..."

exec node server.js