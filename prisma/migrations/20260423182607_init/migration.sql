-- CreateTable
CREATE TABLE "AgencySettings" (
    "id" TEXT NOT NULL,
    "agencyName" TEXT NOT NULL DEFAULT 'Lumos',
    "logoUrl" TEXT,
    "primaryColor" TEXT NOT NULL DEFAULT '#C8102E',
    "secondaryColor" TEXT NOT NULL DEFAULT '#1A1A2E',
    "accentColor" TEXT NOT NULL DEFAULT '#F5A623',
    "tagline" TEXT,
    "contactEmail" TEXT,
    "website" TEXT,
    "serviceMarkup" DOUBLE PRECISION NOT NULL DEFAULT 0.12,
    "agencyCommission" DOUBLE PRECISION NOT NULL DEFAULT 0.20,
    "defaultCurrency" TEXT NOT NULL DEFAULT 'USD',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgencySettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Creator" (
    "id" TEXT NOT NULL,
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
    "instagramAvgLikes" INTEGER,
    "instagramAvgComments" INTEGER,
    "tiktokHandle" TEXT,
    "tiktokFollowers" INTEGER,
    "tiktokAvgViews" INTEGER,
    "tiktokAvgLikes" INTEGER,
    "tiktokAvgComments" INTEGER,
    "tiktokAvgShares" INTEGER,
    "youtubeHandle" TEXT,
    "youtubeSubscribers" INTEGER,
    "youtubeAvgViews" INTEGER,
    "twitterHandle" TEXT,
    "twitterFollowers" INTEGER,
    "twitterAvgLikes" INTEGER,
    "twitterAvgRetweets" INTEGER,
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
    "rateInstagramPost" DOUBLE PRECISION,
    "rateInstagramStory" DOUBLE PRECISION,
    "rateInstagramReel" DOUBLE PRECISION,
    "rateTikTokVideo" DOUBLE PRECISION,
    "rateYouTubeIntegration" DOUBLE PRECISION,
    "rateYouTubeShort" DOUBLE PRECISION,
    "rateYouTubeDedicated" DOUBLE PRECISION,
    "rateSnapchatStory" DOUBLE PRECISION,
    "rateKickStream" DOUBLE PRECISION,
    "rateTwitchStream" DOUBLE PRECISION,
    "rateLiveEventAppearance" DOUBLE PRECISION,
    "rateUGCVideo" DOUBLE PRECISION,
    "rateCustom" TEXT,
    "exclusivityStatus" TEXT NOT NULL DEFAULT 'NONE',
    "managedByFlamenzi" BOOLEAN NOT NULL DEFAULT false,
    "pastBrandCollabs" TEXT NOT NULL DEFAULT '[]',
    "blacklistedBrands" TEXT NOT NULL DEFAULT '[]',
    "notes" TEXT,
    "tags" TEXT NOT NULL DEFAULT '[]',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Creator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Campaign" (
    "id" TEXT NOT NULL,
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
    "budget" DOUBLE PRECISION NOT NULL,
    "budgetCurrency" TEXT NOT NULL DEFAULT 'USD',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "internalNotes" TEXT,
    "clientContactName" TEXT,
    "clientContactEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampaignCreator" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "selectedDeliverables" TEXT NOT NULL DEFAULT '[]',
    "totalCreatorRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalClientRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalCommission" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "confirmationStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "contentStatus" TEXT NOT NULL DEFAULT 'NOT_STARTED',
    "contentDeadline" TIMESTAMP(3),
    "liveUrl" TEXT,
    "performanceNotes" TEXT,
    "internalNotes" TEXT,

    CONSTRAINT "CampaignCreator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreatorResearch" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "audiencePersona" TEXT,
    "toneAnalysis" TEXT,
    "contentPillars" TEXT,
    "contentIdeas" TEXT,
    "brandPartnershipStrategy" TEXT,
    "moodboardConcepts" TEXT,
    "campaignActivations" TEXT,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CreatorResearch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Proposal" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "preparedBy" TEXT NOT NULL DEFAULT 'Lumos Team',
    "clientName" TEXT NOT NULL,
    "coverNote" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "pdfUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Proposal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CampaignCreator_campaignId_creatorId_key" ON "CampaignCreator"("campaignId", "creatorId");

-- CreateIndex
CREATE UNIQUE INDEX "CreatorResearch_creatorId_key" ON "CreatorResearch"("creatorId");

-- AddForeignKey
ALTER TABLE "CampaignCreator" ADD CONSTRAINT "CampaignCreator_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignCreator" ADD CONSTRAINT "CampaignCreator_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "Creator"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreatorResearch" ADD CONSTRAINT "CreatorResearch_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "Creator"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proposal" ADD CONSTRAINT "Proposal_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;
