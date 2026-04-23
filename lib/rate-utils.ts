export interface RateCalculation {
  creatorRate: number
  clientRate: number
  commission: number
}

export interface DeliverableItem {
  type: string
  quantity: number
  creatorRate: number
  clientRate: number
  commission: number
}

export function calcClientRate(creatorRate: number, markup: number = 0.12): number {
  return creatorRate * (1 + markup)
}

export function calcCommission(creatorRate: number, commissionRate: number = 0.20): number {
  return creatorRate * commissionRate
}

export function calcRates(creatorRate: number, markup: number = 0.12, commissionRate: number = 0.20): RateCalculation {
  return {
    creatorRate,
    clientRate: calcClientRate(creatorRate, markup),
    commission: calcCommission(creatorRate, commissionRate),
  }
}

export function formatCurrency(amount: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatFollowers(count: number): string {
  if (count >= 1_000_000) {
    return `${(count / 1_000_000).toFixed(1)}M`
  }
  if (count >= 1_000) {
    return `${(count / 1_000).toFixed(1)}K`
  }
  return count.toString()
}

export function calcCampaignTotals(campaignCreators: Array<{
  totalCreatorRate: number
  totalClientRate: number
  totalCommission: number
}>) {
  return campaignCreators.reduce(
    (acc, cc) => ({
      totalCreatorRate: acc.totalCreatorRate + cc.totalCreatorRate,
      totalClientRate: acc.totalClientRate + cc.totalClientRate,
      totalCommission: acc.totalCommission + cc.totalCommission,
    }),
    { totalCreatorRate: 0, totalClientRate: 0, totalCommission: 0 }
  )
}

export function calcDeliverableTotal(deliverables: DeliverableItem[]) {
  return deliverables.reduce(
    (acc, d) => ({
      totalCreatorRate: acc.totalCreatorRate + d.creatorRate * d.quantity,
      totalClientRate: acc.totalClientRate + d.clientRate * d.quantity,
      totalCommission: acc.totalCommission + d.commission * d.quantity,
    }),
    { totalCreatorRate: 0, totalClientRate: 0, totalCommission: 0 }
  )
}

export function calcInstagramEngagement(followers: number, avgLikes: number, avgComments: number): number {
  if (!followers) return 0
  return Number((((avgLikes + avgComments) / followers) * 100).toFixed(2))
}

export function calcTikTokEngagement(followers: number, avgLikes: number, avgComments: number, avgShares: number): number {
  if (!followers) return 0
  return Number((((avgLikes + avgComments + avgShares) / followers) * 100).toFixed(2))
}

export function calcYouTubeEngagement(subscribers: number, avgViews: number): number {
  if (!subscribers) return 0
  return Number(((avgViews / subscribers) * 100).toFixed(2))
}

export function calcTwitchEngagement(followers: number, avgCCV: number): number {
  if (!followers) return 0
  return Number(((avgCCV / followers) * 100).toFixed(2))
}

export function calcTwitterEngagement(followers: number, avgLikes: number, avgRetweets: number): number {
  if (!followers) return 0
  return Number((((avgLikes + avgRetweets) / followers) * 100).toFixed(2))
}

export function getEngagementLabel(rate: number): { label: string; color: string } {
  if (rate >= 6) return { label: "Excellent", color: "#22c55e" }
  if (rate >= 3) return { label: "Good", color: "#f5a623" }
  if (rate >= 1) return { label: "Average", color: "#a0a0a0" }
  return { label: "Low", color: "#ef4444" }
}

export function calcCreatorEngagement(creator: Record<string, unknown>): number | null {
  const igF = Number(creator.instagramFollowers) || 0
  const igL = Number(creator.instagramAvgLikes) || 0
  const igC = Number(creator.instagramAvgComments) || 0
  if (igF > 0 && (igL > 0 || igC > 0)) return calcInstagramEngagement(igF, igL, igC)

  const ttF = Number(creator.tiktokFollowers) || 0
  const ttL = Number(creator.tiktokAvgLikes) || 0
  const ttC = Number(creator.tiktokAvgComments) || 0
  const ttS = Number(creator.tiktokAvgShares) || 0
  if (ttF > 0 && (ttL > 0 || ttC > 0 || ttS > 0)) return calcTikTokEngagement(ttF, ttL, ttC, ttS)

  const ytS = Number(creator.youtubeSubscribers) || 0
  const ytV = Number(creator.youtubeAvgViews) || 0
  if (ytS > 0 && ytV > 0) return calcYouTubeEngagement(ytS, ytV)

  const twF = Number(creator.twitterFollowers) || 0
  const twL = Number(creator.twitterAvgLikes) || 0
  const twR = Number(creator.twitterAvgRetweets) || 0
  if (twF > 0 && (twL > 0 || twR > 0)) return calcTwitterEngagement(twF, twL, twR)

  const kiF = Number(creator.kickFollowers) || 0
  const kiC = Number(creator.kickAvgCCV) || 0
  if (kiF > 0 && kiC > 0) return calcTwitchEngagement(kiF, kiC)

  const thF = Number(creator.twitchFollowers) || 0
  const thC = Number(creator.twitchAvgCCV) || 0
  if (thF > 0 && thC > 0) return calcTwitchEngagement(thF, thC)

  return null
}

export function getMinRate(creator: Record<string, unknown>): number | null {
  const rateFields = [
    "rateInstagramPost", "rateInstagramStory", "rateInstagramReel",
    "rateTikTokVideo", "rateYouTubeIntegration", "rateYouTubeShort",
    "rateYouTubeDedicated", "rateSnapchatStory", "rateKickStream",
    "rateTwitchStream", "rateLiveEventAppearance", "rateUGCVideo",
  ]
  const rates = rateFields
    .map((f) => creator[f] as number | null)
    .filter((r): r is number => r !== null && r !== undefined && r > 0)
  return rates.length > 0 ? Math.min(...rates) : null
}
