/**
 * UpmindDomainSearch — TAKATAK domain availability + checkout widget.
 *
 * Thin wrapper around the canonical `UpmindDac` so consumers can import
 * a domain-search-specific name. Loads scripts once globally.
 */
import { UpmindDac } from "@/components/UpmindDac";
import { useAuth } from "@/lib/auth-context";

export function UpmindDomainSearch({ clientId }: { clientId?: string | null }) {
  const { user } = useAuth();
  const resolved =
    clientId ?? (user as { upmindClientId?: string | null } | null)?.upmindClientId ?? null;
  return <UpmindDac clientId={resolved} />;
}