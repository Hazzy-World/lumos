"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Search, Grid, List, Filter } from "lucide-react"
import CreatorCard from "@/components/creators/CreatorCard"
import TierBadge from "@/components/shared/TierBadge"
import { CreatorCardSkeleton } from "@/components/shared/SkeletonCard"
import EmptyState from "@/components/shared/EmptyState"
import { formatFollowers, formatCurrency, getMinRate, calcCreatorEngagement, getEngagementLabel } from "@/lib/rate-utils"
import { NICHES, PLATFORMS, TIERS, COUNTRY_FLAGS } from "@/lib/constants"
import { cn } from "@/lib/utils"

type ViewMode = "grid" | "table"

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
  youtubeAvgViews?: number | null
  twitchFollowers?: number | null
  kickFollowers?: number | null
  managedByFlamenzi: boolean
  isActive: boolean
  createdAt: string
  [key: string]: unknown
}

function CreatorTable({ creators }: { creators: Creator[] }) {
  const router = useRouter()

  return (
    <div className="bg-[#120820] border border-[rgba(245,230,66,0.15)] rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[rgba(245,230,66,0.1)]">
            {["Creator", "Tier", "Top Platform", "Followers", "Eng%", "Niches", "Country", "Base Rate", ""].map((h) => (
              <th key={h} className="text-left px-4 py-3 text-[11px] font-semibold text-[#F5E642] font-cinzel uppercase tracking-wider">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {creators.map((creator, i) => {
            const topPlatform = [
              { platform: "YouTube", followers: creator.youtubeSubscribers || 0 },
              { platform: "TikTok", followers: creator.tiktokFollowers || 0 },
              { platform: "Instagram", followers: creator.instagramFollowers || 0 },
            ].filter(s => s.followers > 0).sort((a, b) => b.followers - a.followers)[0]

            const engRate = calcCreatorEngagement(creator)
            const engLabel = engRate != null ? getEngagementLabel(engRate) : null
            const minRate = getMinRate(creator)
            const flag = COUNTRY_FLAGS[creator.country] || "🌍"

            return (
              <tr
                key={creator.id}
                className={cn("border-b border-[rgba(245,230,66,0.1)] last:border-0 hover:bg-[rgba(245,230,66,0.04)] cursor-pointer transition-colors", i % 2 === 0 ? "" : "bg-[#0A0412]")}
                onClick={() => router.push(`/creators/${creator.id}`)}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img src={creator.profileImageUrl} alt={creator.name} className="w-8 h-8 rounded-full object-cover border border-[rgba(245,230,66,0.15)]" />
                    <div>
                      <p className="font-medium text-white text-sm" dir="auto">{creator.name}</p>
                      {creator.nameAr && <p className="text-[10px] text-[#A89BC2]" dir="rtl">{creator.nameAr}</p>}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3"><TierBadge tier={creator.tier} /></td>
                <td className="px-4 py-3 text-[#A89BC2]">{topPlatform?.platform || "—"}</td>
                <td className="px-4 py-3 font-mono text-white">{topPlatform ? formatFollowers(topPlatform.followers) : "—"}</td>
                <td className="px-4 py-3" style={{ color: engLabel?.color ?? "#A89BC2" }}>{engRate != null && engRate > 0 ? `${engRate.toFixed(1)}%` : "—"}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    {creator.niches.slice(0, 1).map((n: string) => (
                      <span key={n} className="text-[10px] px-1.5 py-0.5 rounded bg-[rgba(123,47,190,0.2)] border border-[rgba(123,47,190,0.4)] text-[#A89BC2]">{n}</span>
                    ))}
                    {creator.niches.length > 1 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[rgba(123,47,190,0.2)] border border-[rgba(123,47,190,0.4)] text-[#A89BC2]">+{creator.niches.length - 1}</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-[#A89BC2]">{flag} {creator.country}</td>
                <td className="px-4 py-3 font-mono text-[#F5E642]">{minRate ? formatCurrency(minRate) : "—"}</td>
                <td className="px-4 py-3">
                  <a href={`/creators/${creator.id}`} className="text-xs text-[#F5E642] hover:underline" onClick={(e) => e.stopPropagation()}>View</a>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default function CreatorsPage() {
  const [creators, setCreators] = useState<Creator[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [selectedNiches, setSelectedNiches] = useState<string[]>([])
  const [selectedTiers, setSelectedTiers] = useState<string[]>([])
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [managedOnly, setManagedOnly] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  const fetchCreators = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set("search", search)
      if (managedOnly) params.set("managed", "true")
      if (selectedTiers.length === 1) params.set("tier", selectedTiers[0])

      const res = await fetch(`/api/creators?${params}`)
      const data = await res.json()

      let filtered = Array.isArray(data) ? data : []
      if (selectedNiches.length > 0) {
        filtered = filtered.filter((c: Creator) => selectedNiches.some(n => c.niches.includes(n)))
      }
      if (selectedTiers.length > 1) {
        filtered = filtered.filter((c: Creator) => selectedTiers.includes(c.tier))
      }
      if (selectedPlatforms.length > 0) {
        filtered = filtered.filter((c: Creator) => selectedPlatforms.some(p => c.platforms.includes(p)))
      }

      setCreators(filtered)
    } finally {
      setLoading(false)
    }
  }, [search, managedOnly, selectedNiches, selectedTiers, selectedPlatforms])

  useEffect(() => {
    const t = setTimeout(fetchCreators, 300)
    return () => clearTimeout(t)
  }, [fetchCreators])

  const toggleFilter = (arr: string[], setArr: (v: string[]) => void, val: string) => {
    setArr(arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val])
  }

  return (
    <div>
      {/* Search + View Controls */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A89BC2]" />
          <input
            type="text"
            placeholder="Search creators, handles, tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#120820] border border-[rgba(245,230,66,0.15)] rounded-lg text-sm text-white placeholder:text-[#A89BC2] focus:outline-none focus:border-[#F5E642] transition-colors"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors",
            showFilters ? "bg-[rgba(245,230,66,0.1)] border-[rgba(245,230,66,0.3)] text-[#F5E642]" : "bg-[#120820] border-[rgba(245,230,66,0.15)] text-[#A89BC2] hover:text-white"
          )}
        >
          <Filter className="w-4 h-4" />
          Filters
          {(selectedNiches.length + selectedTiers.length + selectedPlatforms.length) > 0 && (
            <span className="w-5 h-5 rounded-full bg-[#F5E642] text-[#0A0412] text-[10px] flex items-center justify-center font-semibold">
              {selectedNiches.length + selectedTiers.length + selectedPlatforms.length}
            </span>
          )}
        </button>
        <label className="flex items-center gap-2 text-sm text-[#A89BC2] cursor-pointer">
          <input
            type="checkbox"
            checked={managedOnly}
            onChange={(e) => setManagedOnly(e.target.checked)}
            className="rounded border-[rgba(245,230,66,0.2)] bg-[#120820] accent-[#F5E642]"
          />
          Managed
        </label>
        <div className="flex border border-[rgba(245,230,66,0.15)] rounded-lg overflow-hidden ml-auto">
          <button
            onClick={() => setViewMode("grid")}
            className={cn("p-2", viewMode === "grid" ? "bg-[rgba(245,230,66,0.1)] text-[#F5E642]" : "bg-[#120820] text-[#A89BC2] hover:text-white")}
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={cn("p-2 border-l border-[rgba(245,230,66,0.15)]", viewMode === "table" ? "bg-[rgba(245,230,66,0.1)] text-[#F5E642]" : "bg-[#120820] text-[#A89BC2] hover:text-white")}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-[#120820] border border-[rgba(245,230,66,0.15)] rounded-xl p-4 mb-4">
          <div className="grid grid-cols-3 gap-6">
            <div>
              <p className="text-[11px] font-semibold text-[#A89BC2] uppercase tracking-wider mb-2">Tier</p>
              <div className="flex flex-wrap gap-2">
                {TIERS.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => toggleFilter(selectedTiers, setSelectedTiers, t.value)}
                    className={cn(
                      "text-xs px-2.5 py-1 rounded border transition-colors",
                      selectedTiers.includes(t.value)
                        ? "bg-[rgba(245,230,66,0.1)] border-[rgba(245,230,66,0.3)] text-[#F5E642]"
                        : "bg-[#1A0A2E] border-[rgba(245,230,66,0.1)] text-[#A89BC2] hover:text-white"
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-[#A89BC2] uppercase tracking-wider mb-2">Niche</p>
              <div className="flex flex-wrap gap-2">
                {NICHES.slice(0, 8).map((n) => (
                  <button
                    key={n}
                    onClick={() => toggleFilter(selectedNiches, setSelectedNiches, n)}
                    className={cn(
                      "text-xs px-2.5 py-1 rounded border transition-colors",
                      selectedNiches.includes(n)
                        ? "bg-[rgba(245,230,66,0.1)] border-[rgba(245,230,66,0.3)] text-[#F5E642]"
                        : "bg-[#1A0A2E] border-[rgba(245,230,66,0.1)] text-[#A89BC2] hover:text-white"
                    )}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-[#A89BC2] uppercase tracking-wider mb-2">Platform</p>
              <div className="flex flex-wrap gap-2">
                {PLATFORMS.slice(0, 7).map((p) => (
                  <button
                    key={p}
                    onClick={() => toggleFilter(selectedPlatforms, setSelectedPlatforms, p)}
                    className={cn(
                      "text-xs px-2.5 py-1 rounded border transition-colors",
                      selectedPlatforms.includes(p)
                        ? "bg-[rgba(245,230,66,0.1)] border-[rgba(245,230,66,0.3)] text-[#F5E642]"
                        : "bg-[#1A0A2E] border-[rgba(245,230,66,0.1)] text-[#A89BC2] hover:text-white"
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {(selectedNiches.length + selectedTiers.length + selectedPlatforms.length) > 0 && (
            <button
              onClick={() => { setSelectedNiches([]); setSelectedTiers([]); setSelectedPlatforms([]) }}
              className="mt-3 text-xs text-[#A89BC2] hover:text-white underline"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}

      {/* Results count */}
      <p className="text-sm text-[#A89BC2] mb-4">
        {loading ? "Loading..." : `${creators.length} creator${creators.length !== 1 ? "s" : ""}`}
      </p>

      {/* Grid / Table */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <CreatorCardSkeleton key={i} />)}
        </div>
      ) : creators.length === 0 ? (
        <EmptyState
          variant="creators"
          action={{ label: "✦ New Talent", href: "/creators/new" }}
        />
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {creators.map((c) => <CreatorCard key={c.id} creator={c} />)}
        </div>
      ) : (
        <CreatorTable creators={creators} />
      )}
    </div>
  )
}
