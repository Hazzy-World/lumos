-- CreateTable
CREATE TABLE "AgencySettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "agencyName" TEXT NOT NULL DEFAULT 'Flamenzi',
    "logoUrl" TEXT,
    "primaryColor" TEXT NOT NULL DEFAULT '#C8102E',
    "secondaryColor" TEXT NOT NULL DEFAULT '#1A1A2E',
    "accentColor" TEXT NOT NULL DEFAULT '#F5A623',
    "tagline" TEXT,
    "contactEmail" TEXT,
    "website" TEXT,
    "serviceMarkup" REAL NOT NULL DEFAULT 0.12,
    "agencyCommission" REAL NOT NULL DEFAULT 0.20,
    "defaultCurrency" TEXT NOT NULL DEFAULT 'USD',
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Creator" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "nameAr" TEXT,
    "bio" TEXT NOT NULL,
    "profileImageUrl" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "city" TEXT,
    "language" TEXT NOT NULL DEFAULT '[]',
    "tier" TEXT NOT NULL DEFAULT 'MICRO',
    "niches" TEXT NOT NULL DEFAULT '[]',
    "platforms" TEXT NOT NULL DEFAULT '[]',
    "instagramHandle" TEXT,
    "instagramFollowers" INTEGER,
    "instagramEngagementRate" REAL,
    "tiktokHandle" TEXT,
    "tiktokFollowers" INTEGER,
    "tiktokEngagementRate" REAL,
    "tiktokAvgViews" INTEGER,
    "youtubeHandle" TEXT,
    "youtubeSubscribers" INTEGER,
    "youtubeAvgViews" INTEGER,
    "twitterHandle" TEXT,
    "twitterFollowers" INTEGER,
    "snapchatHandle" TEXT,
    "snapchatFollowers" INTEGER,
    "kickHandle" TEXT,
    "kickFollowers" INTEGER,
    "kickAvgCCV" INTEGER,
    "twitchHandle" TEXT,
    "twitchFollowers" INTEGER,
    "twitchAvgCCV" INTEGER,
    "audienceGenderSplit" TEXT,
    "audienceAgeBreakdown" TEXT,
    "audienceTopCountries" TEXT,
    "audienceInterests" TEXT NOT NULL DEFAULT '[]',
    "rateInstagramPost" REAL,
    "rateInstagramStory" REAL,
    "rateInstagramReel" REAL,
    "rateTikTokVideo" REAL,
    "rateYouTubeIntegration" REAL,
    "rateYouTubeShort" REAL,
    "rateYouTubeDedicated" REAL,
    "rateSnapchatStory" REAL,
    "rateKickStream" REAL,
    "rateTwitchStream" REAL,
    "rateLiveEventAppearance" REAL,
    "rateUGCVideo" REAL,
    "rateCustom" TEXT,
    "exclusivityStatus" TEXT NOT NULL DEFAULT 'NONE',
    "managedByFlamenzi" BOOLEAN NOT NULL DEFAULT false,
    "pastBrandCollabs" TEXT NOT NULL DEFAULT '[]',
    "blacklistedBrands" TEXT NOT NULL DEFAULT '[]',
    "notes" TEXT,
    "tags" TEXT NOT NULL DEFAULT '[]',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Campaign" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "brandName" TEXT NOT NULL,
    "brandWebsite" TEXT,
    "brandLogoUrl" TEXT,
    "brief" TEXT NOT NULL,
    "objectives" TEXT NOT NULL DEFAULT '[]',
    "targetAudience" TEXT NOT NULL,
    "targetCountries" TEXT NOT NULL DEFAULT '[]',
    "targetNiches" TEXT NOT NULL DEFAULT '[]',
    "platforms" TEXT NOT NULL DEFAULT '[]',
    "budget" REAL NOT NULL,
    "budgetCurrency" TEXT NOT NULL DEFAULT 'USD',
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "internalNotes" TEXT,
    "clientContactName" TEXT,
    "clientContactEmail" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "CampaignCreator" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "campaignId" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "selectedDeliverables" TEXT NOT NULL DEFAULT '[]',
    "totalCreatorRate" REAL NOT NULL DEFAULT 0,
    "totalClientRate" REAL NOT NULL DEFAULT 0,
    "totalCommission" REAL NOT NULL DEFAULT 0,
    "confirmationStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "contentStatus" TEXT NOT NULL DEFAULT 'NOT_STARTED',
    "contentDeadline" DATETIME,
    "liveUrl" TEXT,
    "performanceNotes" TEXT,
    "internalNotes" TEXT,
    CONSTRAINT "CampaignCreator_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CampaignCreator_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "Creator" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CreatorResearch" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "creatorId" TEXT NOT NULL,
    "audiencePersona" TEXT,
    "toneAnalysis" TEXT,
    "contentPillars" TEXT,
    "contentIdeas" TEXT,
    "brandPartnershipStrategy" TEXT,
    "moodboardConcepts" TEXT,
    "campaignActivations" TEXT,
    "generatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CreatorResearch_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "Creator" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Proposal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "campaignId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "preparedBy" TEXT NOT NULL DEFAULT 'Flamenzi Team',
    "clientName" TEXT NOT NULL,
    "coverNote" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "pdfUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Proposal_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "CampaignCreator_campaignId_creatorId_key" ON "CampaignCreator"("campaignId", "creatorId");

-- CreateIndex
CREATE UNIQUE INDEX "CreatorResearch_creatorId_key" ON "CreatorResearch"("creatorId");
