-- TAKATAK hosting plan request fallback for Upmind product 404s.

CREATE TYPE "HostingRequestStatus" AS ENUM ('new', 'contacted', 'provisioned', 'cancelled');

CREATE TABLE "HostingRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "planId" TEXT NOT NULL,
    "planName" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "notes" TEXT,
    "status" "HostingRequestStatus" NOT NULL DEFAULT 'new',
    "source" TEXT NOT NULL DEFAULT 'upmind_fallback',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HostingRequest_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "HostingRequest" ADD CONSTRAINT "HostingRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "HostingRequest_userId_idx" ON "HostingRequest"("userId");
CREATE INDEX "HostingRequest_planId_idx" ON "HostingRequest"("planId");
CREATE INDEX "HostingRequest_status_idx" ON "HostingRequest"("status");
CREATE INDEX "HostingRequest_createdAt_idx" ON "HostingRequest"("createdAt");