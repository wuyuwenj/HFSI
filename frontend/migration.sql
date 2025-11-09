-- Create Enums
CREATE TYPE "EvidenceReliability" AS ENUM ('High', 'Medium', 'Low', 'Unverified');
CREATE TYPE "AlertSeverity" AS ENUM ('High', 'Medium', 'Low');

-- Create Analysis Table
CREATE TABLE "Analysis" (
    "id" TEXT NOT NULL,
    "caseName" TEXT NOT NULL,
    "personName" TEXT NOT NULL,
    "crimeConvicted" TEXT NOT NULL,
    "innocenceClaim" TEXT NOT NULL,
    "paroleBoardFocus" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "riskScore" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Analysis_pkey" PRIMARY KEY ("id")
);

-- Create KeyQuote Table
CREATE TABLE "KeyQuote" (
    "id" TEXT NOT NULL,
    "analysisId" TEXT NOT NULL,
    "quote" TEXT NOT NULL,
    "lineNumber" TEXT NOT NULL,
    "context" TEXT NOT NULL,

    CONSTRAINT "KeyQuote_pkey" PRIMARY KEY ("id")
);

-- Create TimelineEvent Table
CREATE TABLE "TimelineEvent" (
    "id" TEXT NOT NULL,
    "analysisId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "TimelineEvent_pkey" PRIMARY KEY ("id")
);

-- Create Inconsistency Table
CREATE TABLE "Inconsistency" (
    "id" TEXT NOT NULL,
    "analysisId" TEXT NOT NULL,
    "statement1" TEXT NOT NULL,
    "source1" TEXT NOT NULL,
    "statement2" TEXT NOT NULL,
    "source2" TEXT NOT NULL,
    "analysis" TEXT NOT NULL,

    CONSTRAINT "Inconsistency_pkey" PRIMARY KEY ("id")
);

-- Create EvidenceItem Table
CREATE TABLE "EvidenceItem" (
    "id" TEXT NOT NULL,
    "analysisId" TEXT NOT NULL,
    "evidence" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "reliability" "EvidenceReliability" NOT NULL,
    "notes" TEXT NOT NULL,

    CONSTRAINT "EvidenceItem_pkey" PRIMARY KEY ("id")
);

-- Create PrecedentCase Table
CREATE TABLE "PrecedentCase" (
    "id" TEXT NOT NULL,
    "analysisId" TEXT NOT NULL,
    "caseName" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "outcome" TEXT NOT NULL,

    CONSTRAINT "PrecedentCase_pkey" PRIMARY KEY ("id")
);

-- Create CriticalAlert Table
CREATE TABLE "CriticalAlert" (
    "id" TEXT NOT NULL,
    "analysisId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "severity" "AlertSeverity" NOT NULL,

    CONSTRAINT "CriticalAlert_pkey" PRIMARY KEY ("id")
);

-- Create Indexes
CREATE INDEX "Analysis_createdAt_idx" ON "Analysis"("createdAt");
CREATE INDEX "Analysis_riskScore_idx" ON "Analysis"("riskScore");
CREATE INDEX "KeyQuote_analysisId_idx" ON "KeyQuote"("analysisId");
CREATE INDEX "TimelineEvent_analysisId_idx" ON "TimelineEvent"("analysisId");
CREATE INDEX "Inconsistency_analysisId_idx" ON "Inconsistency"("analysisId");
CREATE INDEX "EvidenceItem_analysisId_idx" ON "EvidenceItem"("analysisId");
CREATE INDEX "PrecedentCase_analysisId_idx" ON "PrecedentCase"("analysisId");
CREATE INDEX "CriticalAlert_analysisId_idx" ON "CriticalAlert"("analysisId");

-- Add Foreign Keys
ALTER TABLE "KeyQuote" ADD CONSTRAINT "KeyQuote_analysisId_fkey" FOREIGN KEY ("analysisId") REFERENCES "Analysis"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TimelineEvent" ADD CONSTRAINT "TimelineEvent_analysisId_fkey" FOREIGN KEY ("analysisId") REFERENCES "Analysis"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Inconsistency" ADD CONSTRAINT "Inconsistency_analysisId_fkey" FOREIGN KEY ("analysisId") REFERENCES "Analysis"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EvidenceItem" ADD CONSTRAINT "EvidenceItem_analysisId_fkey" FOREIGN KEY ("analysisId") REFERENCES "Analysis"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PrecedentCase" ADD CONSTRAINT "PrecedentCase_analysisId_fkey" FOREIGN KEY ("analysisId") REFERENCES "Analysis"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CriticalAlert" ADD CONSTRAINT "CriticalAlert_analysisId_fkey" FOREIGN KEY ("analysisId") REFERENCES "Analysis"("id") ON DELETE CASCADE ON UPDATE CASCADE;
