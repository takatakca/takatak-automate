-- TAKATAK auth: User + Session models (ported from legacy Mongo backend onto Postgres/Prisma)

CREATE TYPE "UserRole" AS ENUM ('user', 'admin', 'freelancer');

CREATE TABLE "User" (
  "id"                  TEXT PRIMARY KEY,
  "firstName"           TEXT,
  "lastName"            TEXT,
  "email"               TEXT NOT NULL,
  "phone"               TEXT,
  "username"            TEXT,
  "passwordHash"        TEXT,
  "encryptedPassword"   TEXT,
  "role"                "UserRole" NOT NULL DEFAULT 'user',
  "isVerified"          BOOLEAN NOT NULL DEFAULT FALSE,
  "verifiedAt"          TIMESTAMP(3),
  "otpHash"             TEXT,
  "otpExpiresAt"        TIMESTAMP(3),
  "lastOtpRequestedAt"  TIMESTAMP(3),
  "lastAction"          TEXT,
  "lastActionAt"        TIMESTAMP(3),
  "upmindClientId"      TEXT,
  "upmindRetryNeeded"   BOOLEAN NOT NULL DEFAULT FALSE,
  "metadata"            JSONB NOT NULL DEFAULT '{}'::jsonb,
  "createdAt"           TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"           TIMESTAMP(3) NOT NULL
);
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "User_phone_idx" ON "User"("phone");
CREATE INDEX "User_username_idx" ON "User"("username");

CREATE TABLE "Session" (
  "id"           TEXT PRIMARY KEY,
  "userId"       TEXT NOT NULL,
  "refreshHash"  TEXT NOT NULL,
  "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastActivity" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expiresAt"    TIMESTAMP(3) NOT NULL,
  "revoked"      BOOLEAN NOT NULL DEFAULT FALSE,
  "deviceInfo"   TEXT,
  "ip"           TEXT,
  CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "Session_userId_idx" ON "Session"("userId");
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");