"use client"

import Link from "next/link"
import TierBadge from "@/components/shared/TierBadge"
import { formatFollowers, formatCurrency, getMinRate, calcCreatorEngagement, getEngagementLabel } from "@/lib/rate-utils"
import { COUNTRY_FLAGS } from "@/lib/constants"

interface Creator {
  id: string
  name: string
  nameAr?: string | null
  profileImageUrl: string
  country: string
  tier: string
  niches: string[]
  platforms: string[]
  instagramFollowers?: number | null
  instagramAvgLikes?: number | null
  instagramAvgComments?: number | null
  tiktokFollowers?: number | null
  tiktokAvgLikes?: number | null
  tiktokAvgComments?: number | null
  tiktokAvgShares?: number | null
  youtubeSubscribers?: number | null
  twitchFollowers?: number | null
  kickFollowers?: number | null
  managedByFlamenzi: boolean
  [key: string]: unknown
}

const PLATFORM_ICONS: Record<string, string> = {
  Instagram: "📸", TikTok: "🎵", YouTube: "▶️", "Twitter/X": "𝕏",
  Snapchat: "👻", Kick: "🟢", Twitch: "💜",
}

function getTopPlatform(creator: Creator): { platform: string; followers: number } | null {
  const stats = [
    { platform: "YouTube",   followers: creator.youtubeSubscribers || 0 },
    { platform: "TikTok",    followers: creator.tiktokFollowers || 0 },
    { platform: "Instagram", followers: creator.instagramFollowers || 0 },
    { platform: "Twitch",    followers: creator.twitchFollowers || 0 },
    { platform: "Kick",      followers: creator.kickFollowers || 0 },
  ].filter((s) => s.followers > 0)
  if (!stats.length) return null
  return stats.reduce((a, b) => (a.followers > b.followers ? a : b))
}

export default function CreatorCard({ creator }: { creator: Creator }) {
  const topPlatform = getTopPlatform(creator)
  const engRate     = calcCreatorEngagement(creator as Record<string, unknown>)
  const engLabel    = engRate != null ? getEngagementLabel(engRate) : null
  const minRate     = getMinRate(creator as Record<string, unknown>)
  const flag        = COUNTRY_FLAGS[creator.country] || "🌍"
  const displayNiches = creator.niches.slice(0, 2)
  const extraNiches   = creator.niches.length - 2

  return (
    <Link href={`/creators/${creator.id}`}>
      <div
        className="rounded-xl overflow-hidden cursor-pointer group transition-all duration-300 hover:-translate-y-1"
        style={{
          background: "#120820",
          border: "1px solid rgba(245, 230, 66, 0.12)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(245,230,66,0.38)"
          ;(e.currentTarget as HTMLDivElement).style.boxShadow  = "0 8px 32px rgba(245,230,66,0.12), 0 4px 16px rgba(0,0,0,0.5)"
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(245,230,66,0.12)"
          ;(e.currentTarget as HTMLDivElement).style.boxShadow  = "0 4px 20px rgba(0,0,0,0.4)"
        }}
      >
        {/* ── Photo section ── */}
        <div className="relative h-40 overflow-hidden">
          <img
            src={creator.profileImageUrl}
            alt={creator.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {/* Gold-to-dark gradient overlay */}
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(to top, rgba(18,8,32,1) 0%, rgba(18,8,32,0.5) 45%, rgba(18,8,32,0.1) 100%)" }}
          />

          {/* Managed by Lumos badge */}
          {creator.managedByFlamenzi && (
            <div
              className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium font-cinzel"
              style={{ background: "rgba(245,230,66,0.15)", border: "1px solid rgba(245,230,66,0.4)", color: "#F5E642" }}
            >
              ✦ Lumos
            </div>
          )}

          {/* Name + country on photo */}
          <div className="absolute bottom-2.5 left-3 right-3">
            <p
              className="font-cinzel font-bold text-white text-sm leading-tight truncate"
              style={{ textShadow: "0 1px 8px rgba(0,0,0,0.9)" }}
              dir="auto"
            >
              {creator.name}
            </p>
            <p className="text-[11px] text-[#A89BC2] font-inter mt-0.5">
              {flag} {creator.country}
            </p>
          </div>
        </div>

        {/* ── Content section ── */}
        <div className="p-3 space-y-2.5">
          {/* Tier + top platform */}
          <div className="flex items-center justify-between">
            <TierBadge tier={creator.tier} />
            {topPlatform && (
              <div className="flex items-center gap-1.5">
                <span className="text-sm leading-none">{PLATFORM_ICONS[topPlatform.platform] || "📱"}</span>
                <span
                  className="font-cinzel font-bold text-sm"
                  style={{ color: "#F5E642", textShadow: "0 0 10px rgba(245,230,66,0.4)" }}
                >
                  {formatFollowers(topPlatform.followers)}
                </span>
              </div>
            )}
          </div>

          {/* Engagement rate bar */}
          {engRate != null && engRate > 0 && (
            <div>
              <div className="flex justify-between text-[10px] mb-1">
                <span className="text-[#A89BC2] font-inter">Engagement</span>
                <span className="font-cinzel font-semibold" style={{ color: engLabel?.color }}>
                  {engRate.toFixed(1)}%
                </span>
              </div>
              <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(245,230,66,0.08)" }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.min(engRate * 12, 100)}%`,
                    background: "linear-gradient(90deg, #7B2FBE, #F5E642)",
                    boxShadow: "0 0 6px rgba(245,230,66,0.4)",
                    transition: "width 0.5s ease",
                  }}
                />
              </div>
            </div>
          )}

          {/* Niche pills */}
          <div className="flex flex-wrap gap-1">
            {displayNiches.map((niche) => (
              <span
                key={niche}
                className="text-[9px] px-1.5 py-0.5 rounded-full font-inter"
                style={{
                  background: "rgba(123,47,190,0.18)",
                  border: "1px solid rgba(123,47,190,0.28)",
                  color: "#A89BC2",
                }}
              >
                {niche}
              </span>
            ))}
            {extraNiches > 0 && (
              <span
                className="text-[9px] px-1.5 py-0.5 rounded-full font-inter"
                style={{ background: "rgba(123,47,190,0.18)", border: "1px solid rgba(123,47,190,0.28)", color: "#A89BC2" }}
              >
                +{extraNiches}
              </span>
            )}
          </div>

          {/* Rate */}
          <div className="flex items-center justify-between pt-0.5" style={{ borderTop: "1px solid rgba(245,230,66,0.07)" }}>
            {minRate ? (
              <div>
                <p className="text-[9px] text-[#A89BC2] uppercase tracking-wider font-inter mb-0.5">From</p>
                <p className="font-cinzel font-bold text-sm" style={{ color: "#F5E642" }}>{formatCurrency(minRate)}</p>
              </div>
            ) : (
              <span className="text-[#A89BC2] text-xs font-inter">Rate on request</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
