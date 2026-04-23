export const NICHES = [
  "Gaming & Esports",
  "Lifestyle & Fashion",
  "Food & Restaurants",
  "Tech & Gadgets",
  "Beauty & Skincare",
  "Travel",
  "Finance & Business",
  "Sports & Fitness",
  "Comedy & Entertainment",
  "Education",
  "Motorsports",
  "Luxury & High-End",
] as const

export const PLATFORMS = [
  "Instagram",
  "TikTok",
  "YouTube",
  "Twitter/X",
  "Snapchat",
  "Kick",
  "Twitch",
  "Facebook",
  "LinkedIn",
] as const

export const MENA_COUNTRIES = [
  "Saudi Arabia",
  "UAE",
  "Egypt",
  "Jordan",
  "Kuwait",
  "Bahrain",
  "Qatar",
  "Oman",
  "Lebanon",
  "Morocco",
  "Tunisia",
  "Iraq",
  "Yemen",
  "Libya",
  "Algeria",
  "Sudan",
  "Syria",
  "Palestine",
] as const

export const GLOBAL_COUNTRIES = [
  "United States",
  "United Kingdom",
  "France",
  "Germany",
  "Spain",
  "Italy",
  "Canada",
  "Australia",
  "Japan",
  "South Korea",
  "Brazil",
  "India",
  "Pakistan",
  "Turkey",
] as const

export const ALL_COUNTRIES = [...MENA_COUNTRIES, ...GLOBAL_COUNTRIES] as const

export const TIERS = [
  { value: "NANO", label: "Nano", range: "< 10K", color: "#6B7280" },
  { value: "MICRO", label: "Micro", range: "10K–100K", color: "#3B82F6" },
  { value: "MID", label: "Mid-Tier", range: "100K–500K", color: "#10B981" },
  { value: "MACRO", label: "Macro", range: "500K–2M", color: "#F5A623" },
  { value: "MEGA", label: "Mega", range: "2M+", color: "#C8102E" },
] as const

export const DELIVERABLE_TYPES = [
  { key: "rateInstagramPost", label: "Instagram Post", platform: "Instagram" },
  { key: "rateInstagramStory", label: "Instagram Story", platform: "Instagram" },
  { key: "rateInstagramReel", label: "Instagram Reel", platform: "Instagram" },
  { key: "rateTikTokVideo", label: "TikTok Video", platform: "TikTok" },
  { key: "rateYouTubeIntegration", label: "YouTube Integration", platform: "YouTube" },
  { key: "rateYouTubeShort", label: "YouTube Short", platform: "YouTube" },
  { key: "rateYouTubeDedicated", label: "YouTube Dedicated", platform: "YouTube" },
  { key: "rateSnapchatStory", label: "Snapchat Story", platform: "Snapchat" },
  { key: "rateKickStream", label: "Kick Stream", platform: "Kick" },
  { key: "rateTwitchStream", label: "Twitch Stream", platform: "Twitch" },
  { key: "rateLiveEventAppearance", label: "Live Event Appearance", platform: "Live" },
  { key: "rateUGCVideo", label: "UGC Video", platform: "Any" },
] as const

export const CAMPAIGN_OBJECTIVES = [
  "Awareness",
  "Engagement",
  "Conversion",
  "App Downloads",
  "Event Promotion",
  "Product Launch",
  "Brand Sentiment",
  "Community Growth",
] as const

export const CONFIRMATION_STATUSES = [
  { value: "PENDING", label: "Pending", color: "#F5A623" },
  { value: "NEGOTIATING", label: "Negotiating", color: "#3B82F6" },
  { value: "CONFIRMED", label: "Confirmed", color: "#10B981" },
  { value: "REJECTED", label: "Rejected", color: "#EF4444" },
  { value: "DROPPED", label: "Dropped", color: "#6B7280" },
] as const

export const CONTENT_STATUSES = [
  { value: "NOT_STARTED", label: "Not Started", color: "#6B7280" },
  { value: "BRIEFED", label: "Briefed", color: "#3B82F6" },
  { value: "IN_PRODUCTION", label: "In Production", color: "#F5A623" },
  { value: "REVIEW", label: "Review", color: "#8B5CF6" },
  { value: "APPROVED", label: "Approved", color: "#10B981" },
  { value: "LIVE", label: "Live", color: "#C8102E" },
  { value: "DONE", label: "Done", color: "#6B7280" },
] as const

export const CAMPAIGN_STATUSES = [
  { value: "DRAFT", label: "Draft", color: "#6B7280" },
  { value: "ACTIVE", label: "Active", color: "#10B981" },
  { value: "PAUSED", label: "Paused", color: "#F5A623" },
  { value: "COMPLETED", label: "Completed", color: "#3B82F6" },
  { value: "CANCELLED", label: "Cancelled", color: "#EF4444" },
] as const

export const EXCLUSIVITY_STATUSES = [
  { value: "NONE", label: "None" },
  { value: "SOFT", label: "Soft Exclusivity" },
  { value: "EXCLUSIVE", label: "Exclusive" },
] as const

export const COUNTRY_FLAGS: Record<string, string> = {
  "Saudi Arabia": "🇸🇦",
  "UAE": "🇦🇪",
  "Egypt": "🇪🇬",
  "Jordan": "🇯🇴",
  "Kuwait": "🇰🇼",
  "Bahrain": "🇧🇭",
  "Qatar": "🇶🇦",
  "Oman": "🇴🇲",
  "Lebanon": "🇱🇧",
  "Morocco": "🇲🇦",
  "Tunisia": "🇹🇳",
  "Iraq": "🇮🇶",
  "Libya": "🇱🇾",
  "Algeria": "🇩🇿",
  "United States": "🇺🇸",
  "United Kingdom": "🇬🇧",
  "France": "🇫🇷",
  "Germany": "🇩🇪",
  "Canada": "🇨🇦",
  "Australia": "🇦🇺",
  "Pakistan": "🇵🇰",
  "Turkey": "🇹🇷",
}
