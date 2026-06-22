-- CreateEnum
CREATE TYPE "PromotionStatus" AS ENUM ('available', 'claimed', 'applied', 'redeemed', 'expired', 'cancelled');

-- CreateEnum
CREATE TYPE "PromotionType" AS ENUM ('percent', 'fixed');

-- CreateTable
CREATE TABLE "Promotion" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" "PromotionType" NOT NULL DEFAULT 'percent',
    "percentOff" INTEGER NOT NULL DEFAULT 0,
    "amountOffCents" INTEGER NOT NULL DEFAULT 0,
    "status" "PromotionStatus" NOT NULL DEFAULT 'available',
    "claimedAt" TIMESTAMP(3),
    "appliedAt" TIMESTAMP(3),
    "redeemedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "orderId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Promotion_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Promotion_userId_code_key" ON "Promotion"("userId", "code");
CREATE INDEX "Promotion_userId_idx" ON "Promotion"("userId");
CREATE INDEX "Promotion_code_idx" ON "Promotion"("code");
CREATE INDEX "Promotion_status_idx" ON "Promotion"("status");
CREATE INDEX "Promotion_orderId_idx" ON "Promotion"("orderId");
