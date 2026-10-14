import { apiPost } from "./api-client";

export interface DomainRequestInput {
  domain: string;
  tld: string;
  contactName: string;
  contactEmail?: string;
  contactPhone?: string;
  source?: string;
}

export interface StoredDomainRequest extends DomainRequestInput {
  id: string;
  status: "new" | "checking" | "available" | "unavailable" | "registered" | "cancelled";
  createdAt: string;
  /** Kept for reading previously persisted local drafts; never mark them submitted. */
  localOnly?: boolean;
}

/** A request is only received after the backend confirms database persistence. */
export async function createDomainRequest(input: DomainRequestInput): Promise<StoredDomainRequest> {
  const res = await Promise.race([
    apiPost<{ request: StoredDomainRequest }>("/domain-requests", input),
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error("domain_request_timeout")), 3500)),
  ]);
  if (!res?.request?.id) throw new Error("domain_request_unconfirmed");
  return res.request;
}
