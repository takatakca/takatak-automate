# TAKATAK — Task queue

Priority and evidence, as of 2026-10-14. Mark items complete only after checking result.

| Priority | Task | Status | Exit condition |
| --- | --- | --- | --- |
| P0 | Repair frontend dependency installation on Render | code pushed, verification pending | Render build succeeds, process starts, GET /healthz is 200 |
| P0 | Resolve any further Vite/TanStack runtime incompatibility | open | SSR homepage and static assets load correctly |
| P0 | Provision production Postgres/backend safely | blocked on production provisioning/credentials | migrations, GET /ready 200, CORS and frontend API connection valid |
| P0 | Secure app identity and product entitlements | partial | tenant- and product-aware integration tests pass |
| P0 | Confirm payments/webhooks and real payouts | blocked | full provider-confirmed lifecycle and replay tests, secrets and reconciliation |
| P1 | Implement actual file object-storage uploads | open | authenticated, permission-checked signed upload and verification |
| P1 | Finish frontend actions/API contracts without simulated success | open | end-to-end data-backed flows |
| P1 | Configure GitHub Actions CI | passing run 38622314470 on 150064f; new commits pending | frontend build, backend typecheck and targeted security tests green |
| P1 | Enable migrations and idempotent seed on backend deploy | open | safe migration + marketplace catalog in database |
| P1 | Confirm production hosting/DNS and rollback | open | target domain serves verified commit and health checks |
| P2 | Remove dependence on Lovable plugins | deferred | build-tested migration maintaining SSR semantics |

Only work on independent tasks when P0 depends on unavailable production secrets, without inventing credentials or paid services.

- Webhook follow-up: add atomic event/database transaction and provider replay integration tests before real payment processing. Marker cleanup after a caught failure is an interim safeguard, not proof of full exactly-once semantics.
