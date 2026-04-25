"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Edit, Star } from "lucide-react"
import TierBadge from "@/components/shared/TierBadge"
import StatusBadge from "@/components/shared/StatusBadge"
import { Skeleton } from "@/components/shared/SkeletonCard"
import { formatFollowers, formatCurrency, calcClientRate, calcCommission, calcInstagramEngagement, calcTikTokEngagement, calcYouTubeEngagement, calcTwitchEngagement, calcTwitterEngagement, getEngagementLabel } from "@/lib/rate-utils"
import { COUNTRY_FLAGS, DELIVERABLE_TYPES } from "@/lib/constants"
import { cn } from "@/lib/utils"

type Tab = "overview" | "rates" | "campaigns"

interface AudienceGender {
  male: number
  female: number
}

interface AudienceCountry {
  country: string
  percentage: number
}

interface Deliverable {
  type: string
  quantity: number
  creatorRate: number
  clientRate: number
}

interface CampaignEntry {
  id: string
  campaignId: string
  totalCreatorRate: number
  totalClientRate: number
  confirmationStatus: string
  contentStatus: string
  campaign: { id: string; name: string; brandName: string; status: string }
  selectedDeliverables: Deliverable[]
}

interface Creator {
  id: string
  name: string
  nameAr?: string | null
  bio: string
  profileImageUrl: string
  country: string
  city?: string | null
  tier: string
  niches: string[]
  platforms: string[]
  language: string[]
  managedByFlamenzi: boolean
  exclusivityStatus: string
  instagramHandle?: string | null
  instagramFollowers?: number | null
  instagramAvgLikes?: number | null
  instagramAvgComments?: number | null
  tiktokHandle?: string | null
  tiktokFollowers?: number | null
  tiktokAvgViews?: number | null
  tiktokAvgLikes?: number | null
  tiktokAvgComments?: number | null
  tiktokAvgShares?: number | null
  youtubeHandle?: string | null
  youtubeSubscribers?: number | null
  youtubeAvgViews?: number | null
  twitterHandle?: string | null
  twitterFollowers?: number | null
  twitterAvgLikes?: number | null
  twitterAvgRetweets?: number | null
  snapchatHandle?: string | null
  snapchatFollowers?: number | null
  kickHandle?: string | null
  kickFollowers?: number | null
  kickAvgCCV?: number | null
  twitchHandle?: string | null
  twitchFollowers?: number | null
  twitchAvgCCV?: number | null
  audienceGenderSplit?: AudienceGender | null
  audienceAgeBreakdown?: Record<string, number> | null
  audienceTopCountries?: AudienceCountry[] | null
  audienceInterests: string[]
  pastBrandCollabs: string[]
  blacklistedBrands: string[]
  notes?: string | null
  tags: string[]
  campaigns?: CampaignEntry[]
  [key: string]: unknown
}

function PlatformStat({
  label,
  handle,
  followers,
  calcEngRate,
  avgViews,
  avgCCV,
}: {
  label: string
  handle?: string | null
  followers?: number | null
  calcEngRate?: number | null
  avgViews?: number | null
  avgCCV?: number | null
}) {
  if (!handle && !followers) return null
  const engLabel = calcEngRate != null ? getEngagementLabel(calcEngRate) : null
  return (
    <div className="bg-[#1A0A2E] border border-[rgba(245,230,66,0.15)] rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-[#A89BC2] uppercase tracking-wider">{label}</span>
        {handle && <span className="text-[10px] text-[#A89BC2]">@{handle}</span>}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {followers != null && (
          <div>
            <p className="text-[10px] text-[#A89BC2] mb-0.5">Followers</p>
            <p className="font-semibold text-white text-sm">{formatFollowers(followers)}</p>
          </div>
        )}
        {calcEngRate != null && calcEngRate > 0 && (
          <div>
            <p className="text-[10px] text-[#A89BC2] mb-0.5">Engagement</p>
            <p className="font-semibold text-sm" style={{ color: engLabel?.color }}>
              {calcEngRate.toFixed(2)}% <span className="text-[10px] font-normal">{engLabel?.label}</span>
            </p>
          </div>
        )}
        {avgViews != null && (
          <div>
            <p className="text-[10px] text-[#A89BC2] mb-0.5">Avg Views</p>
            <p className="font-semibold text-white text-sm">{formatFollowers(avgViews)}</p>
          </div>
        )}
        {avgCCV != null && (
          <div>
            <p className="text-[10px] text-[#A89BC2] mb-0.5">Avg CCV</p>
            <p className="font-semibold text-white text-sm">{formatFollowers(avgCCV)}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function CreatorProfilePage() {
  const { id } = useParams() as { id: string }
  const [creator, setCreator] = useState<Creator | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>("overview")
  const [settings, setSettings] = useState({ serviceMarkup: 0.12, agencyCommission: 0.20 })

  useEffect(() => {
    Promise.all([
      fetch(`/api/creators/${id}`).then((r) => r.json()),
      fetch("/api/settings").then((r) => r.json()),
    ])
      .then(([c, s]) => {
        setCreator(c)
        setSettings({
          serviceMarkup: s.serviceMarkup ?? 0.12,
          agencyCommission: s.agencyCommission ?? 0.20,
        })
      })
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="bg-[#120820] border border-[rgba(245,230,66,0.15)] rounded-xl p-6">
          <div className="flex gap-6">
            <Skeleton className="w-24 h-24 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-7 w-64" />
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-5 w-32" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!creator || ("error" in creator && creator.error)) {
    return (
      <div className="text-center py-16">
        <p className="text-[#A89BC2] mb-4">Creator not found.</p>
        <Link href="/creators" className="text-[#F5E642] hover:underline">
          ← Back to Creators
        </Link>
      </div>
    )
  }

  const flag = COUNTRY_FLAGS[creator.country] || "🌍"

  const rateRows = DELIVERABLE_TYPES.filter((d) => {
    const rate = creator[d.key] as number | null | undefined
    return rate != null && rate > 0
  }).map((d) => {
    const creatorRate = creator[d.key] as number
    return {
      ...d,
      creatorRate,
      clientRate: calcClientRate(creatorRate, settings.serviceMarkup),
      commission: calcCommission(creatorRate, settings.agencyCommission),
    }
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <Link
          href="/creators"
          className="flex items-center gap-2 text-[#A89BC2] hover:text-white text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Creators
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href={`/creators/${id}/research`}
            className="px-3 py-1.5 text-sm border border-[rgba(245,230,66,0.4)] text-[#F5E642] rounded-md hover:bg-[rgba(245,230,66,0.08)] transition-colors"
          >
            Research & Strategy
          </Link>
          <Link
            href={`/creators/${id}/edit`}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-[#120820] border border-[rgba(245,230,66,0.2)] text-[#A89BC2] rounded-md hover:text-white hover:border-[rgba(245,230,66,0.4)] transition-colors"
          >
            <Edit className="w-3.5 h-3.5" />
            Edit
          </Link>
        </div>
      </div>

      {/* Profile header */}
      <div className="bg-[#120820] border border-[rgba(245,230,66,0.15)] rounded-xl p-6 mb-4">
        <div className="flex items-start gap-6">
          <div className="relative flex-shrink-0">
            <img
              src={creator.profileImageUrl}
              alt={creator.name}
              className="w-24 h-24 rounded-full object-cover border-2 border-[rgba(245,230,66,0.15)]"
              onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(creator.name)}&background=1A0A2E&color=F5E642&size=400` }}
            />
            {creator.managedByFlamenzi && (
              <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#F5E642] rounded-full flex items-center justify-center border-2 border-[#120820]">
                <Star className="w-3.5 h-3.5 text-[#0A0412] fill-[#0A0412]" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <h2 className="font-cinzel font-bold text-2xl text-white" dir="auto">
              {creator.name}
            </h2>
            {creator.nameAr && (
              <p className="text-[#A89BC2] text-lg mt-0.5" dir="rtl">
                {creator.nameAr}
              </p>
            )}
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <span className="text-[#A89BC2] text-sm">
                {flag} {creator.country}
                {creator.city ? `, ${creator.city}` : ""}
              </span>
              <TierBadge tier={creator.tier} size="md" />
              {creator.managedByFlamenzi && (
                <span className="text-[10px] px-2 py-0.5 rounded bg-[rgba(245,230,66,0.1)] border border-[rgba(245,230,66,0.3)] text-[#F5E642] font-medium">
                  Managed by Lumos
                </span>
              )}
              {creator.exclusivityStatus !== "NONE" && (
                <span className="text-[10px] px-2 py-0.5 rounded bg-[rgba(245,230,66,0.1)] border border-[rgba(245,230,66,0.3)] text-[#F5E642] font-medium">
                  {creator.exclusivityStatus === "EXCLUSIVE" ? "Exclusive" : "Soft Exclusivity"}
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {creator.niches.map((n) => (
                <span
                  key={n}
                  className="text-xs px-2.5 py-1 rounded-full bg-[rgba(123,47,190,0.2)] border border-[rgba(123,47,190,0.4)] text-[#A89BC2]"
                >
                  {n}
                </span>
              ))}
            </div>
            <p className="text-xs text-[#A89BC2] mt-2">
              Languages: {creator.language.join(", ")}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[rgba(245,230,66,0.15)] mb-6">
        {(["overview", "rates", "campaigns"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "px-5 py-2.5 text-sm font-medium capitalize transition-colors border-b-2 -mb-[1px]",
              tab === t
                ? "border-[#F5E642] text-white"
                : "border-transparent text-[#A89BC2] hover:text-white"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {tab === "overview" && (
        <div className="space-y-6">
          <div className="bg-[#120820] border border-[rgba(245,230,66,0.15)] rounded-xl p-5">
            <h3 className="font-cinzel font-semibold text-sm text-[#A89BC2] uppercase tracking-wider mb-3">
              Bio
            </h3>
            <p className="text-[#A89BC2] text-sm leading-relaxed">{creator.bio}</p>
          </div>

          <div>
            <h3 className="font-cinzel font-semibold text-sm text-[#A89BC2] uppercase tracking-wider mb-3">
              Platform Stats
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              <PlatformStat
                label="Instagram"
                handle={creator.instagramHandle}
                followers={creator.instagramFollowers}
                calcEngRate={calcInstagramEngagement(
                  creator.instagramFollowers || 0,
                  creator.instagramAvgLikes || 0,
                  creator.instagramAvgComments || 0,
                )}
              />
              <PlatformStat
                label="TikTok"
                handle={creator.tiktokHandle}
                followers={creator.tiktokFollowers}
                calcEngRate={calcTikTokEngagement(
                  creator.tiktokFollowers || 0,
                  creator.tiktokAvgLikes || 0,
                  creator.tiktokAvgComments || 0,
                  creator.tiktokAvgShares || 0,
                )}
                avgViews={creator.tiktokAvgViews}
              />
              <PlatformStat
                label="YouTube"
                handle={creator.youtubeHandle}
                followers={creator.youtubeSubscribers}
                calcEngRate={calcYouTubeEngagement(
                  creator.youtubeSubscribers || 0,
                  creator.youtubeAvgViews || 0,
                )}
                avgViews={creator.youtubeAvgViews}
              />
              <PlatformStat
                label="Twitter/X"
                handle={creator.twitterHandle}
                followers={creator.twitterFollowers}
                calcEngRate={calcTwitterEngagement(
                  creator.twitterFollowers || 0,
                  creator.twitterAvgLikes || 0,
                  creator.twitterAvgRetweets || 0,
                )}
              />
              <PlatformStat
                label="Snapchat"
                handle={creator.snapchatHandle}
                followers={creator.snapchatFollowers}
              />
              <PlatformStat
                label="Kick"
                handle={creator.kickHandle}
                followers={creator.kickFollowers}
                calcEngRate={calcTwitchEngagement(
                  creator.kickFollowers || 0,
                  creator.kickAvgCCV || 0,
                )}
                avgCCV={creator.kickAvgCCV}
              />
              <PlatformStat
                label="Twitch"
                handle={creator.twitchHandle}
                followers={creator.twitchFollowers}
                calcEngRate={calcTwitchEngagement(
                  creator.twitchFollowers || 0,
                  creator.twitchAvgCCV || 0,
                )}
                avgCCV={creator.twitchAvgCCV}
              />
            </div>
          </div>

          {(creator.audienceGenderSplit ||
            creator.audienceAgeBreakdown ||
            creator.audienceTopCountries) && (
            <div>
              <h3 className="font-cinzel font-semibold text-sm text-[#A89BC2] uppercase tracking-wider mb-3">
                Audience Data
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {creator.audienceGenderSplit && (
                  <div className="bg-[#120820] border border-[rgba(245,230,66,0.15)] rounded-xl p-4">
                    <p className="text-xs font-semibold text-[#A89BC2] uppercase tracking-wider mb-3">
                      Gender Split
                    </p>
                    <div className="space-y-2">
                      {(
                        [
                          { label: "Male", pct: creator.audienceGenderSplit.male, color: "bg-blue-500" },
                          { label: "Female", pct: creator.audienceGenderSplit.female, color: "bg-pink-500" },
                        ] as const
                      ).map(({ label, pct, color }) => (
                        <div key={label}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-[#A89BC2]">{label}</span>
                            <span className="text-white">{pct}%</span>
                          </div>
                          <div className="h-2 bg-[rgba(245,230,66,0.08)] rounded-full overflow-hidden">
                            <div
                              className={`h-full ${color} rounded-full`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {creator.audienceAgeBreakdown && (
                  <div className="bg-[#120820] border border-[rgba(245,230,66,0.15)] rounded-xl p-4">
                    <p className="text-xs font-semibold text-[#A89BC2] uppercase tracking-wider mb-3">
                      Age Breakdown
                    </p>
                    <div className="space-y-1.5">
                      {Object.entries(creator.audienceAgeBreakdown).map(([age, pct]) => (
                        <div key={age}>
                          <div className="flex justify-between text-xs mb-0.5">
                            <span className="text-[#A89BC2]">{age}</span>
                            <span className="text-white">{pct}%</span>
                          </div>
                          <div className="h-1.5 bg-[rgba(245,230,66,0.08)] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#F5E642] rounded-full"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {creator.audienceTopCountries && (
                  <div className="bg-[#120820] border border-[rgba(245,230,66,0.15)] rounded-xl p-4">
                    <p className="text-xs font-semibold text-[#A89BC2] uppercase tracking-wider mb-3">
                      Top Countries
                    </p>
                    <div className="space-y-2">
                      {creator.audienceTopCountries.map(({ country, percentage }) => (
                        <div key={country} className="flex items-center justify-between text-xs">
                          <span className="text-[#A89BC2]">
                            {COUNTRY_FLAGS[country] || "🌍"} {country}
                          </span>
                          <span className="text-white font-medium">{percentage}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {(creator.pastBrandCollabs.length > 0 || creator.notes) && (
            <div className="bg-[#120820] border border-[rgba(245,230,66,0.15)] rounded-xl p-5">
              <h3 className="font-cinzel font-semibold text-sm text-[#A89BC2] uppercase tracking-wider mb-3">
                Brand History
              </h3>
              <div className="flex flex-wrap gap-2 mb-3">
                {creator.pastBrandCollabs.map((brand) => (
                  <span
                    key={brand}
                    className="text-xs px-2.5 py-1 rounded bg-[rgba(123,47,190,0.2)] border border-[rgba(123,47,190,0.4)] text-white"
                  >
                    {brand}
                  </span>
                ))}
              </div>
              {creator.blacklistedBrands.length > 0 && (
                <div className="mt-3">
                  <p className="text-[10px] text-red-400 uppercase tracking-wider mb-2 font-semibold">
                    Blacklisted Brands
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {creator.blacklistedBrands.map((brand) => (
                      <span
                        key={brand}
                        className="text-xs px-2.5 py-1 rounded bg-red-500/10 border border-red-500/30 text-red-400"
                      >
                        {brand}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {creator.notes && (
                <div className="mt-3 pt-3 border-t border-[rgba(245,230,66,0.1)]">
                  <p className="text-[10px] text-[#A89BC2] uppercase tracking-wider mb-1 font-semibold">
                    Notes
                  </p>
                  <p className="text-sm text-[#A89BC2]">{creator.notes}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Rates Tab */}
      {tab === "rates" && (
        <div>
          {rateRows.length === 0 ? (
            <div className="text-center py-12 text-[#A89BC2]">
              No rates set.{" "}
              <Link href={`/creators/${id}/edit`} className="text-[#F5E642] hover:underline">
                Add rates
              </Link>
            </div>
          ) : (
            <div className="bg-[#120820] border border-[rgba(245,230,66,0.15)] rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[rgba(245,230,66,0.1)]">
                    {["Deliverable", "Platform", "Creator Rate", "Client Rate (+12%)", "Commission (20%)"].map(
                      (h) => (
                        <th
                          key={h}
                          className="text-left px-5 py-3 text-[11px] font-semibold text-[#F5E642] uppercase tracking-wider font-cinzel"
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {rateRows.map((row, i) => (
                    <tr
                      key={row.key}
                      className={cn(
                        "border-b border-[rgba(245,230,66,0.1)] last:border-0",
                        i % 2 === 0 ? "" : "bg-[#0A0412]"
                      )}
                    >
                      <td className="px-5 py-3 text-white font-medium">{row.label}</td>
                      <td className="px-5 py-3 text-[#A89BC2]">{row.platform}</td>
                      <td className="px-5 py-3 font-mono text-white">{formatCurrency(row.creatorRate)}</td>
                      <td className="px-5 py-3 font-mono text-[#F5E642] font-semibold">
                        {formatCurrency(row.clientRate)}
                      </td>
                      <td className="px-5 py-3 font-mono text-emerald-400">
                        {formatCurrency(row.commission)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Campaigns Tab */}
      {tab === "campaigns" && (
        <div>
          {!creator.campaigns || creator.campaigns.length === 0 ? (
            <div className="text-center py-12 text-[#A89BC2]">
              Not part of any campaigns yet.
            </div>
          ) : (
            <div className="space-y-3">
              {creator.campaigns.map((cc) => (
                <Link key={cc.id} href={`/campaigns/${cc.campaignId}`}>
                  <div className="bg-[#120820] border border-[rgba(245,230,66,0.15)] rounded-xl p-4 hover:border-[rgba(245,230,66,0.4)] transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-semibold text-white">{cc.campaign.name}</p>
                        <p className="text-[#A89BC2] text-sm">{cc.campaign.brandName}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={cc.confirmationStatus} type="confirmation" />
                        <StatusBadge status={cc.contentStatus} type="content" />
                        <StatusBadge status={cc.campaign.status} />
                      </div>
                    </div>
                    <div className="flex gap-4 text-xs">
                      <div>
                        <span className="text-[#A89BC2]">Creator Rate: </span>
                        <span className="text-white font-mono">{formatCurrency(cc.totalCreatorRate)}</span>
                      </div>
                      <div>
                        <span className="text-[#A89BC2]">Client Rate: </span>
                        <span className="text-[#F5E642] font-mono">{formatCurrency(cc.totalClientRate)}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
