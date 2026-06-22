-- CreateEnum
CREATE TYPE "ServiceState" AS ENUM ('draft', 'checkout_started', 'payment_pending', 'paid', 'provisioning_queued', 'provisioning_running', 'intake_required', 'ai_processing', 'waiting_for_client', 'waiting_for_takatak', 'active', 'failed', 'cancelled', 'completed');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('queued', 'running', 'succeeded', 'failed', 'cancelled');

-- CreateEnum
CREATE TYPE "PaymentReleaseState" AS ENUM ('unpaid', 'paid_to_takatak', 'assigned', 'accepted_by_freelancer', 'in_progress', 'submitted', 'revision_requested', 'approved', 'grace_period', 'release_ready', 'released', 'disputed', 'cancelled', 'refunded');

-- CreateTable
CREATE TABLE "ServiceInstance" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "serviceKey" TEXT NOT NULL,
    "state" "ServiceState" NOT NULL DEFAULT 'draft',
    "upmindOrderId" TEXT,
    "upmindServiceId" TEXT,
    "externalPortalUrl" TEXT,
    "intakeId" TEXT,
    "meta" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceInstance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AutomationTimelineEvent" (
    "id" TEXT NOT NULL,
    "serviceInstanceId" TEXT NOT NULL,
    "state" "ServiceState" NOT NULL,
    "label" TEXT,
    "message" TEXT,
    "actor" TEXT NOT NULL DEFAULT 'system',
    "at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AutomationTimelineEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AutomationJob" (
    "id" TEXT NOT NULL,
    "serviceInstanceId" TEXT,
    "kind" TEXT NOT NULL,
    "status" "JobStatus" NOT NULL DEFAULT 'queued',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "payload" JSONB NOT NULL DEFAULT '{}',
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AutomationJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIIntake" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "serviceKey" TEXT NOT NULL,
    "serviceInstanceId" TEXT,
    "answers" JSONB NOT NULL DEFAULT '{}',
    "brief" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIIntake_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExternalIntegration" (
    "id" TEXT NOT NULL,
    "serviceKey" TEXT NOT NULL,
    "baseUrl" TEXT NOT NULL,
    "config" JSONB NOT NULL DEFAULT '{}',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExternalIntegration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "serviceInstanceId" TEXT,
    "serviceKey" TEXT NOT NULL,
    "upmindOrderId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'created',
    "amountCents" INTEGER,
    "currency" TEXT NOT NULL DEFAULT 'CAD',
    "meta" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketplaceGig" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priceCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'CAD',
    "freelancerId" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MarketplaceGig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketplaceProject" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "brief" TEXT NOT NULL,
    "budgetCents" INTEGER,
    "category" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MarketplaceProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FreelancerProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "bio" TEXT,
    "skills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "rating" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FreelancerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebhookEvent" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebhookEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketplaceCategory" (
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MarketplaceCategory_pkey" PRIMARY KEY ("slug")
);

-- CreateTable
CREATE TABLE "MarketplacePackage" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "shortDescription" TEXT,
    "longDescription" TEXT,
    "priceCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'CAD',
    "deliveryDays" INTEGER,
    "deliveryEstimate" TEXT,
    "serviceKey" TEXT,
    "requiresIntake" BOOLEAN NOT NULL DEFAULT false,
    "allowsQuote" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'active',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "tiers" JSONB,
    "addOns" JSONB,
    "deliverables" JSONB,
    "faq" JSONB,
    "metadata" JSONB,
    "freelancerId" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarketplacePackage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientProject" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "brief" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "budgetCents" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'submitted',
    "paymentState" "PaymentReleaseState" NOT NULL DEFAULT 'unpaid',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectFile" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "size" INTEGER,
    "uploadedBy" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectMessage" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "fromUser" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectMilestone" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "amountCents" INTEGER,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ProjectMilestone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectDelivery" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "note" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectDelivery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FreelancerApplication" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "bio" TEXT,
    "skills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FreelancerApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FreelancerContract" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "freelancerId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'assigned',
    "paymentState" "PaymentReleaseState" NOT NULL DEFAULT 'paid_to_takatak',
    "amountCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'CAD',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FreelancerContract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContractAssignment" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "assignedBy" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,

    CONSTRAINT "ContractAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayoutHold" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'CAD',
    "holdUntil" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PayoutHold_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayoutRelease" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'CAD',
    "releasedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reference" TEXT,

    CONSTRAINT "PayoutRelease_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DisputeCase" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "openedBy" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "resolution" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DisputeCase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectAuditLog" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "actor" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "data" JSONB NOT NULL DEFAULT '{}',
    "at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "actionUrl" TEXT,
    "readAt" TIMESTAMP(3),
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ServiceInstance_userId_idx" ON "ServiceInstance"("userId");

-- CreateIndex
CREATE INDEX "ServiceInstance_userId_serviceKey_idx" ON "ServiceInstance"("userId", "serviceKey");

-- CreateIndex
CREATE INDEX "ServiceInstance_serviceKey_idx" ON "ServiceInstance"("serviceKey");

-- CreateIndex
CREATE INDEX "ServiceInstance_state_idx" ON "ServiceInstance"("state");

-- CreateIndex
CREATE INDEX "AutomationTimelineEvent_serviceInstanceId_at_idx" ON "AutomationTimelineEvent"("serviceInstanceId", "at");

-- CreateIndex
CREATE INDEX "AutomationJob_status_idx" ON "AutomationJob"("status");

-- CreateIndex
CREATE INDEX "AutomationJob_serviceInstanceId_idx" ON "AutomationJob"("serviceInstanceId");

-- CreateIndex
CREATE INDEX "AutomationJob_kind_idx" ON "AutomationJob"("kind");

-- CreateIndex
CREATE INDEX "AutomationJob_kind_status_idx" ON "AutomationJob"("kind", "status");

-- CreateIndex
CREATE INDEX "AutomationJob_updatedAt_idx" ON "AutomationJob"("updatedAt");

-- CreateIndex
CREATE INDEX "AIIntake_userId_idx" ON "AIIntake"("userId");

-- CreateIndex
CREATE INDEX "AIIntake_serviceInstanceId_idx" ON "AIIntake"("serviceInstanceId");

-- CreateIndex
CREATE UNIQUE INDEX "ExternalIntegration_serviceKey_key" ON "ExternalIntegration"("serviceKey");

-- CreateIndex
CREATE INDEX "Order_userId_idx" ON "Order"("userId");

-- CreateIndex
CREATE INDEX "Order_upmindOrderId_idx" ON "Order"("upmindOrderId");

-- CreateIndex
CREATE INDEX "Order_serviceInstanceId_idx" ON "Order"("serviceInstanceId");

-- CreateIndex
CREATE INDEX "MarketplaceGig_category_idx" ON "MarketplaceGig"("category");

-- CreateIndex
CREATE INDEX "MarketplaceProject_userId_idx" ON "MarketplaceProject"("userId");

-- CreateIndex
CREATE INDEX "MarketplaceProject_category_idx" ON "MarketplaceProject"("category");

-- CreateIndex
CREATE UNIQUE INDEX "FreelancerProfile_userId_key" ON "FreelancerProfile"("userId");

-- CreateIndex
CREATE INDEX "WebhookEvent_receivedAt_idx" ON "WebhookEvent"("receivedAt");

-- CreateIndex
CREATE INDEX "WebhookEvent_source_receivedAt_idx" ON "WebhookEvent"("source", "receivedAt");

-- CreateIndex
CREATE UNIQUE INDEX "MarketplacePackage_slug_key" ON "MarketplacePackage"("slug");

-- CreateIndex
CREATE INDEX "MarketplacePackage_slug_idx" ON "MarketplacePackage"("slug");

-- CreateIndex
CREATE INDEX "MarketplacePackage_category_idx" ON "MarketplacePackage"("category");

-- CreateIndex
CREATE INDEX "MarketplacePackage_freelancerId_idx" ON "MarketplacePackage"("freelancerId");

-- CreateIndex
CREATE INDEX "MarketplacePackage_status_idx" ON "MarketplacePackage"("status");

-- CreateIndex
CREATE INDEX "MarketplacePackage_active_idx" ON "MarketplacePackage"("active");

-- CreateIndex
CREATE INDEX "MarketplacePackage_serviceKey_idx" ON "MarketplacePackage"("serviceKey");

-- CreateIndex
CREATE INDEX "ClientProject_userId_idx" ON "ClientProject"("userId");

-- CreateIndex
CREATE INDEX "ClientProject_category_idx" ON "ClientProject"("category");

-- CreateIndex
CREATE INDEX "ClientProject_status_idx" ON "ClientProject"("status");

-- CreateIndex
CREATE INDEX "ClientProject_paymentState_idx" ON "ClientProject"("paymentState");

-- CreateIndex
CREATE INDEX "ProjectFile_projectId_idx" ON "ProjectFile"("projectId");

-- CreateIndex
CREATE INDEX "ProjectMessage_projectId_at_idx" ON "ProjectMessage"("projectId", "at");

-- CreateIndex
CREATE INDEX "ProjectMilestone_projectId_idx" ON "ProjectMilestone"("projectId");

-- CreateIndex
CREATE INDEX "ProjectDelivery_projectId_idx" ON "ProjectDelivery"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "FreelancerApplication_userId_key" ON "FreelancerApplication"("userId");

-- CreateIndex
CREATE INDEX "FreelancerContract_freelancerId_idx" ON "FreelancerContract"("freelancerId");

-- CreateIndex
CREATE INDEX "FreelancerContract_projectId_idx" ON "FreelancerContract"("projectId");

-- CreateIndex
CREATE INDEX "FreelancerContract_status_idx" ON "FreelancerContract"("status");

-- CreateIndex
CREATE INDEX "ContractAssignment_contractId_idx" ON "ContractAssignment"("contractId");

-- CreateIndex
CREATE INDEX "PayoutHold_contractId_idx" ON "PayoutHold"("contractId");

-- CreateIndex
CREATE INDEX "PayoutRelease_contractId_idx" ON "PayoutRelease"("contractId");

-- CreateIndex
CREATE INDEX "DisputeCase_contractId_idx" ON "DisputeCase"("contractId");

-- CreateIndex
CREATE INDEX "DisputeCase_status_idx" ON "DisputeCase"("status");

-- CreateIndex
CREATE INDEX "ProjectAuditLog_projectId_at_idx" ON "ProjectAuditLog"("projectId", "at");

-- CreateIndex
CREATE INDEX "Notification_userId_createdAt_idx" ON "Notification"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Notification_userId_readAt_idx" ON "Notification"("userId", "readAt");

-- AddForeignKey
ALTER TABLE "AutomationTimelineEvent" ADD CONSTRAINT "AutomationTimelineEvent_serviceInstanceId_fkey" FOREIGN KEY ("serviceInstanceId") REFERENCES "ServiceInstance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AutomationJob" ADD CONSTRAINT "AutomationJob_serviceInstanceId_fkey" FOREIGN KEY ("serviceInstanceId") REFERENCES "ServiceInstance"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIIntake" ADD CONSTRAINT "AIIntake_serviceInstanceId_fkey" FOREIGN KEY ("serviceInstanceId") REFERENCES "ServiceInstance"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_serviceInstanceId_fkey" FOREIGN KEY ("serviceInstanceId") REFERENCES "ServiceInstance"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectFile" ADD CONSTRAINT "ProjectFile_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "ClientProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectMessage" ADD CONSTRAINT "ProjectMessage_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "ClientProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectMilestone" ADD CONSTRAINT "ProjectMilestone_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "ClientProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectDelivery" ADD CONSTRAINT "ProjectDelivery_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "ClientProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FreelancerContract" ADD CONSTRAINT "FreelancerContract_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "ClientProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractAssignment" ADD CONSTRAINT "ContractAssignment_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "FreelancerContract"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayoutHold" ADD CONSTRAINT "PayoutHold_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "FreelancerContract"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayoutRelease" ADD CONSTRAINT "PayoutRelease_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "FreelancerContract"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DisputeCase" ADD CONSTRAINT "DisputeCase_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "FreelancerContract"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectAuditLog" ADD CONSTRAINT "ProjectAuditLog_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "ClientProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
