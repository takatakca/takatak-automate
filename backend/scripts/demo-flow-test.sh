#!/usr/bin/env bash
# TAKATAK real demo marketplace flow test.
#
# Usage:
#   AUTH_JWT_SECRET=dev-secret BASE_URL=http://localhost:10000 bash backend/scripts/demo-flow-test.sh
#
# Requires a local/staging backend with SEED_DEMO_MARKETPLACE=true data seeded.
# Exits non-zero on the first failed endpoint; no payment or payout is faked.
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:10000}"
JWT_SECRET="${AUTH_JWT_SECRET:-dev-demo-secret-change-me}"
CLIENT_ID="${DEMO_CLIENT_ID:-demo-client-user}"
FREELANCER_ID="${DEMO_FREELANCER_ID:-demo-freelancer-user}"
ADMIN_ID="${DEMO_ADMIN_ID:-demo-admin}"

json_get() { node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{const o=JSON.parse(d||'{}');const p=process.argv[1].split('.');let v=o;for(const k of p)v=v?.[k];process.stdout.write(v == null ? '' : String(v));})" "$1"; }
token() { node -e "const crypto=require('crypto');const b=o=>Buffer.from(JSON.stringify(o)).toString('base64url');const h=b({alg:'HS256',typ:'JWT'});const p=b({sub:process.argv[1],roles:process.argv[2]?process.argv[2].split(','):[],iat:Math.floor(Date.now()/1000),exp:Math.floor(Date.now()/1000)+3600});const s=crypto.createHmac('sha256',process.argv[3]).update(h+'.'+p).digest('base64url');process.stdout.write(h+'.'+p+'.'+s);" "$1" "${2:-}" "$JWT_SECRET"; }
request() {
  local method="$1" path="$2" jwt="$3" body="${4:-}"
  local out status
  out=$(mktemp)
  if [[ -n "$body" ]]; then
    status=$(curl -sS -o "$out" -w "%{http_code}" -X "$method" "$BASE_URL$path" -H "Authorization: Bearer $jwt" -H "Content-Type: application/json" -d "$body" || true)
  else
    status=$(curl -sS -o "$out" -w "%{http_code}" -X "$method" "$BASE_URL$path" -H "Authorization: Bearer $jwt" || true)
  fi
  if [[ "$status" != 2* ]]; then echo "❌ $method $path [$status]"; cat "$out"; exit 1; fi
  cat "$out"
  rm -f "$out"
}
public_request() {
  local path="$1" out status
  out=$(mktemp); status=$(curl -sS -o "$out" -w "%{http_code}" "$BASE_URL$path" || true)
  if [[ "$status" != 2* ]]; then echo "❌ GET $path [$status]"; cat "$out"; exit 1; fi
  cat "$out"; rm -f "$out"
}
pass() { printf "✅ %s\n" "$1"; }

CLIENT_JWT=$(token "$CLIENT_ID" "")
FREELANCER_JWT=$(token "$FREELANCER_ID" "")
ADMIN_JWT=$(token "$ADMIN_ID" "admin")

echo "▶ TAKATAK demo flow test → $BASE_URL"
public_request /health >/dev/null; pass "health"
public_request /ready >/dev/null; pass "ready"
packages=$(public_request /marketplace/packages); package_id=$(printf '%s' "$packages" | json_get 'packages.0.id'); test -n "$package_id"; pass "marketplace packages"

project=$(request POST /marketplace/projects "$CLIENT_JWT" '{"title":"Demo flow quote project","brief":"Real endpoint walkthrough project.","category":"website_design","budgetCents":54900}')
project_id=$(printf '%s' "$project" | json_get 'project.id'); test -n "$project_id"; pass "create project $project_id"
request GET /marketplace/projects "$CLIENT_JWT" >/dev/null; pass "list client projects"
demo_project=$(request GET /marketplace/projects/demo "$CLIENT_JWT")
demo_project_id=$(printf '%s' "$demo_project" | json_get 'project.id'); test -n "$demo_project_id"; pass "seeded demo project $demo_project_id"

checkout=$(request POST "/marketplace/packages/$package_id/checkout" "$CLIENT_JWT" '{"title":"Starter business website","category":"website_design","tier":{"name":"Standard","priceCents":54900,"deliveryDays":10},"addons":[],"quantity":1,"currency":"CAD"}')
reason=$(printf '%s' "$checkout" | json_get 'reason'); pass "package checkout fallback ${reason:-configured}"
request GET /orders "$CLIENT_JWT" >/dev/null; pass "list orders"

assign=$(request POST "/admin/projects/$demo_project_id/assign" "$ADMIN_JWT" "{\"freelancerId\":\"$FREELANCER_ID\",\"amountCents\":40000,\"currency\":\"CAD\",\"note\":\"Demo flow assignment\"}")
contract_id=$(printf '%s' "$assign" | json_get 'contract.id'); test -n "$contract_id"; pass "admin assign project"
request POST "/freelancers/contracts/$contract_id/accept" "$FREELANCER_JWT" '{}' >/dev/null; pass "freelancer accept contract"
request POST "/freelancers/contracts/$contract_id/deliveries" "$FREELANCER_JWT" '{"note":"Demo delivery submitted to TAKATAK review."}' >/dev/null; pass "freelancer submit delivery"
request POST "/marketplace/projects/$demo_project_id/request-revision" "$CLIENT_JWT" '{"note":"Please refine the homepage section."}' >/dev/null; pass "client request revision"
request POST "/freelancers/contracts/$contract_id/deliveries" "$FREELANCER_JWT" '{"note":"Revision completed and resubmitted."}' >/dev/null; pass "freelancer resubmit delivery"
request POST "/marketplace/projects/$demo_project_id/approve" "$CLIENT_JWT" '{}' >/dev/null; pass "client approve delivery + grace"
request POST "/admin/projects/$demo_project_id/start-grace-period" "$ADMIN_JWT" '{}' >/dev/null; pass "admin start grace period"
release=$(request POST "/admin/projects/$demo_project_id/release-payment" "$ADMIN_JWT" '{"force":true}')
provider=$(printf '%s' "$release" | json_get 'provider'); test "$provider" = "none"; pass "release-ready provider safety"
admin_project=$(request GET "/admin/projects/$demo_project_id" "$ADMIN_JWT")
final_state=$(printf '%s' "$admin_project" | json_get 'project.paymentState'); test "$final_state" = "release_ready"; pass "final payout state release_ready"
request GET /notifications "$FREELANCER_JWT" >/dev/null; pass "notifications list"

echo "✅ demo flow script passed"