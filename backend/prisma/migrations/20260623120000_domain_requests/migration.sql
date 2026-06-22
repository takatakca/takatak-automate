-- TAKATAK domain registration request fallback for Upmind DAC outages.

CREATE TYPE "DomainRequestStatus" AS ENUM ('new', 'checking', 'available', 'unavailable', 'registered', 'cancelled');

CREATE TABLE "DomainRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "domain" TEXT NOT NULL,
    "tld" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "status" "DomainRequestStatus" NOT NULL DEFAULT 'new',
    "source" TEXT NOT NULL DEFAULT 'upmind_fallback',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DomainRequest_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "DomainRequest" ADD CONSTRAINT "DomainRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "DomainRequest_userId_idx" ON "DomainRequest"("userId");
CREATE INDEX "DomainRequest_domain_idx" ON "DomainRequest"("domain");
CREATE INDEX "DomainRequest_status_idx" ON "DomainRequest"("status");
CREATE INDEX "DomainRequest_createdAt_idx" ON "DomainRequest"("createdAt");