#!/usr/bin/env bash
set -euo pipefail

ROUTER_URL="${ROUTER_URL:-https://your-app.vercel.app/v1/notifications/send}"
API_KEY="${API_KEY:-your-api-secret-key}"

BODY=$(cat <<'EOF'
{
  "channels": ["telegram"],
  "priority": "high",
  "message": {
    "title": "Build Failed",
    "body": "Task execution failed on OpenCode instance #42.",
    "parse_mode": "MarkdownV2"
  },
  "metadata": {
    "source_app": "opencode",
    "timestamp": "2026-09-08T10:41:00Z"
  }
}
EOF
)

curl -sS -i -X POST "$ROUTER_URL" \
  -H "Authorization: Bearer ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d "$BODY"
