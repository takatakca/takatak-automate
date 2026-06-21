#!/usr/bin/env bash
# TAKATAK backend smoke test.
#
# Usage:
#   BASE_URL=https://takatak-backend.onrender.com ./backend/scripts/smoke-test.sh
#
# Exits non-zero on the first unexpected response. No secrets required —
# only verifies public health/catalog endpoints and that protected routes
# reject unauthenticated traffic.
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:10000}"
FAIL=0

pass() { printf "  ✅ %s\n" "$1"; }
fail() { printf "  ❌ %s (got %s)\n" "$1" "$2"; FAIL=1; }

check_status() {
  local label="$1" method="$2" path="$3" want="$4"
  local extra=("${@:5}")
  local code
  code=$(curl -sS -o /dev/null -w "%{http_code}" -X "$method" "${extra[@]}" "$BASE_URL$path" || echo "000")
  if [[ " $want " == *" $code "* ]]; then pass "$label [$code]"; else fail "$label want=$want" "$code"; fi
}

echo "▶ TAKATAK smoke test → $BASE_URL"

echo "— public health —"
check_status "GET /health"  GET "/health"  "200"
check_status "GET /ready"   GET "/ready"   "200 503"

echo "— public catalog —"
check_status "GET /marketplace/categories" GET "/marketplace/categories" "200"
check_status "GET /marketplace/packages"   GET "/marketplace/packages"   "200"

echo "— auth-protected routes must reject anonymous —"
check_status "GET /user/services rejects"         GET  "/user/services"          "401 403"
check_status "POST /integrations/launch rejects"  POST "/integrations/launch"    "401 403" -H "Content-Type: application/json" -d '{}'
check_status "GET /notifications rejects"         GET  "/notifications"          "401 403"

echo "— webhooks must reject missing/invalid signatures —"
check_status "Payments webhook no sig"  POST "/api/public/webhooks/payments"  "400 401" -H "Content-Type: application/json" -d '{}'
check_status "Upmind webhook no sig"    POST "/api/public/webhooks/upmind"    "400 401" -H "Content-Type: application/json" -d '{}'
check_status "Automation webhook no sig" POST "/api/public/webhooks/automation" "400 401" -H "Content-Type: application/json" -d '{}'

if [[ "$FAIL" -ne 0 ]]; then
  echo "❌ smoke test FAILED"
  exit 1
fi
echo "✅ smoke test passed"