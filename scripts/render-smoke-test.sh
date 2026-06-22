#!/usr/bin/env bash
# TAKATAK Render smoke test.
#
#   FRONTEND_URL=https://takatak.ca \
#   BACKEND_URL=https://api.takatak.ca \
#   ./scripts/render-smoke-test.sh
#
# Fails (exit 1) on any HTTP 5xx or connection error. 4xx is reported but not
# fatal (auth-guarded endpoints will 401 without a token).
set -u

FRONTEND_URL="${FRONTEND_URL:-}"
BACKEND_URL="${BACKEND_URL:-}"
ALLOW_PROD_TEST_USER="${ALLOW_PROD_TEST_USER:-false}"

fail=0

check() {
  local label="$1" url="$2"
  local code
  code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 15 "$url" || echo "000")
  if [ "$code" = "000" ]; then
    echo "  [FAIL] $label  $url  (connection error)"
    fail=1
  elif [ "${code:0:1}" = "5" ]; then
    echo "  [FAIL] $label  $url  -> $code"
    fail=1
  else
    echo "  [ ok ] $label  $url  -> $code"
  fi
}

if [ -n "$FRONTEND_URL" ]; then
  echo "Frontend ($FRONTEND_URL):"
  check "home"        "$FRONTEND_URL/"
  check "marketplace" "$FRONTEND_URL/marketplace"
  check "signup"      "$FRONTEND_URL/signup"
else
  echo "FRONTEND_URL unset — skipping frontend checks."
fi

if [ -n "$BACKEND_URL" ]; then
  echo "Backend ($BACKEND_URL):"
  check "health"              "$BACKEND_URL/health"
  check "ready"               "$BACKEND_URL/ready"
  check "marketplace pkgs"    "$BACKEND_URL/marketplace/packages"
  check "jwks"                "$BACKEND_URL/auth/well-known/jwks.json"

  if [ "$ALLOW_PROD_TEST_USER" = "true" ] && [ -n "${TEST_AUTH_TOKEN:-}" ]; then
    echo "  (auth-gated, with TEST_AUTH_TOKEN)"
    code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 15 \
      -H "Authorization: Bearer $TEST_AUTH_TOKEN" "$BACKEND_URL/user/dashboard")
    echo "  [ ok ] dashboard -> $code"
    code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 15 \
      -H "Authorization: Bearer $TEST_AUTH_TOKEN" "$BACKEND_URL/promotions/me")
    echo "  [ ok ] promotions/me -> $code"
  fi
else
  echo "BACKEND_URL unset — skipping backend checks."
fi

if [ "$fail" -ne 0 ]; then
  echo "SMOKE TEST FAILED"
  exit 1
fi
echo "SMOKE TEST OK"