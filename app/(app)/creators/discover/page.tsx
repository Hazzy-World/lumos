"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Check,
  CheckSquare,
  Square,
  Loader2,
  AlertCircle,
  UserPlus,
  ExternalLink,
  Telescope,
} from "lucide-react"
import { cn } from "@/lib/utils"

const CATEGORIES = [
  { label: "Gaming & Esports", emoji: "🎮" },
  { label: "Lifestyle & Fashion", emoji: "👗" },
  { label: "Food & Restaurants", emoji: "🍔" },
  { label: "Tech & Gadgets", emoji: "💻" },
  { label: "Beauty & Skincare", emoji: "💄" },
  { label: "Travel", emoji: "✈️" },
  { label: "Finance & Business", emoji: "💰" },
  { label: "Sports & Fitness", emoji: "🏋️" },
]

const PLATFORMS_LIST = ["Instagram", "TikTok", "YouTube", "Twitter/X", "Snapchat", "Twitch", "Kick"]
const REGIONS_LIST = ["Saudi Arabia", "UAE", "Egypt", "Kuwait", "Qatar", "Bahrain", "Jordan", "Morocco", "Turkey", "Global"]
const TIERS_LIST = ["NANO", "MICRO", "MID", "MACRO", "MEGA"]
const LANGUAGES_LIST = ["Arabic", "English", "French", "Turkish", "Any"]

const TIER_COLORS: Record<string, string> = {
  NANO: "bg-[rgba(107,114,128,0.2)] text-[#9CA3AF]",
  MICRO: "bg-[rgba(123,47,190,0.2)] text-[#C084FC]",
  MID: "bg-[rgba(6,182,212,0.15)] text-[#67E8F9]",
  MACRO: "bg-[rgba(245,230,66,0.12)] text-[#F5E642]",
  MEGA: "bg-[rgba(255,215,0,0.15)] text-[#FFD700]",
}

interface DiscoveredCreator {
  id: string
  name: string
  handle: string
  platform: string
  bio: string
  followers: number
  engagementRate: number
  tier: string
  niches: string[]
  country: string
  language: string
  profileImageUrl: string
  selected: boolean
  alreadyInDb: boolean
}

interface Filters {
  platforms: string[]
  regions: string[]
  tiers: string[]
  language: string
  count: number
}

function formatFollowers(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`
  return String(n)
}

function FilterToggle({
  value,
  active,
  onClick,
}: {
  value: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "text-xs px-3 py-1.5 rounded border transition-colors",
        active
          ? "bg-[rgba(245,230,66,0.1)] border-[rgba(245,230,66,0.3)] text-[#F5E642]"
          : "bg-[#1A0A2E] border-[rgba(245,230,66,0.1)] text-[#A89BC2] hover:text-white"
      )}
    >
      {value}
    </button>
  )
}

export default function DiscoverCreatorsPage() {
  const router = useRouter()
  const [step, setStep] = useState<"category" | "filters" | "results">("category")
  const [category, setCategory] = useState("")
  const [filters, setFilters] = useState<Filters>({
    platforms: [],
    regions: [],
    tiers: [],
    language: "",
    count: 10,
  })
  const [creators, setCreators] = useState<DiscoveredCreator[]>([])
  const [status, setStatus] = useState("")
  const [running, setRunning] = useState(false)
  const [error, setError] = useState("")
  const [existingNames, setExistingNames] = useState<Set<string>>(new Set())
  const [importing, setImporting] = useState(false)
  const [importedIds, setImportedIds] = useState<string[]>([])

  useEffect(() => {
    fetch("/api/creators?limit=500")
      .then((r) => r.json())
      .then((data: Array<{ name: string; instagramHandle?: string; tiktokHandle?: string; youtubeHandle?: string; twitterHandle?: string; snapchatHandle?: string; twitchHandle?: string; kickHandle?: string }>) => {
        const keys = new Set<string>()
        const list = Array.isArray(data) ? data : []
        for (const c of list) {
          keys.add(c.name.toLowerCase())
          for (const h of [c.instagramHandle, c.tiktokHandle, c.youtubeHandle, c.twitterHandle, c.snapchatHandle, c.twitchHandle, c.kickHandle]) {
            if (h) keys.add(h.toLowerCase().replace(/^@/, ""))
          }
        }
        setExistingNames(keys)
      })
      .catch(() => {})
  }, [])

  const togglePlatform = (p: string) =>
    setFilters((f) => ({
      ...f,
      platforms: f.platforms.includes(p)
        ? f.platforms.filter((x) => x !== p)
        : [...f.platforms, p],
    }))

  const toggleRegion = (r: string) =>
    setFilters((f) => ({
      ...f,
      regions: f.regions.includes(r)
        ? f.regions.filter((x) => x !== r)
        : [...f.regions, r],
    }))

  const toggleTier = (t: string) =>
    setFilters((f) => ({
      ...f,
      tiers: f.tiers.includes(t)
        ? f.tiers.filter((x) => x !== t)
        : [...f.tiers, t],
    }))

  const toggleCreator = (id: string) =>
    setCreators((prev) =>
      prev.map((c) => (c.id === id ? { ...c, selected: !c.selected } : c))
    )

  const toggleAll = () => {
    const eligible = creators.filter((c) => !c.alreadyInDb)
    const allSelected = eligible.every((c) => c.selected)
    setCreators((prev) =>
      prev.map((c) =>
        c.alreadyInDb ? c : { ...c, selected: !allSelected }
      )
    )
  }

  const handleDiscover = async () => {
    setCreators([])
    setError("")
    setStatus("Initializing search...")
    setRunning(true)
    setStep("results")

    try {
      const res = await fetch("/api/ai/discover-creators", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          platforms: filters.platforms,
          regions: filters.regions,
          tiers: filters.tiers,
          language: filters.language,
          count: filters.count,
        }),
      })

      if (!res.body) throw new Error("No stream")
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n")
        buffer = lines.pop() || ""
        for (const line of lines) {
          if (!line.trim()) continue
          try {
            const event = JSON.parse(line)
            if (event.type === "status") setStatus(event.message)
            if (event.type === "creator") {
              const nameKey = String(event.data.name || "").toLowerCase()
              const handleKey = String(event.data.handle || "").toLowerCase().replace(/^@/, "")
              const inDb = existingNames.has(nameKey) || (handleKey && existingNames.has(handleKey))
              setCreators((p) => [
                ...p,
                {
                  ...event.data,
                  id: crypto.randomUUID(),
                  selected: !inDb,
                  alreadyInDb: inDb,
                },
              ])
            }
            if (event.type === "done") setRunning(false)
            if (event.type === "error") {
              setError(event.message)
              setRunning(false)
            }
          } catch {
            // skip malformed line
          }
        }
      }
    } catch (e) {
      setError((e as Error).message)
      setRunning(false)
    }
  }

  const handleImport = async () => {
    const toImport = creators.filter((c) => c.selected && !c.alreadyInDb)
    if (toImport.length === 0) return
    setImporting(true)
    const ids: string[] = []

    for (const creator of toImport) {
      try {
        const platformHandle: Record<string, string | number | undefined> = {}
        const p = creator.platform
        if (p === "Instagram") {
          platformHandle.instagramHandle = creator.handle.replace("@", "")
          platformHandle.instagramFollowers = creator.followers
        } else if (p === "TikTok") {
          platformHandle.tiktokHandle = creator.handle.replace("@", "")
          platformHandle.tiktokFollowers = creator.followers
        } else if (p === "YouTube") {
          platformHandle.youtubeHandle = creator.handle.replace("@", "")
          platformHandle.youtubeSubscribers = creator.followers
        } else if (p === "Twitter/X") {
          platformHandle.twitterHandle = creator.handle.replace("@", "")
          platformHandle.twitterFollowers = creator.followers
        } else if (p === "Snapchat") {
          platformHandle.snapchatHandle = creator.handle.replace("@", "")
          platformHandle.snapchatFollowers = creator.followers
        } else if (p === "Twitch") {
          platformHandle.twitchHandle = creator.handle.replace("@", "")
          platformHandle.twitchFollowers = creator.followers
        } else if (p === "Kick") {
          platformHandle.kickHandle = creator.handle.replace("@", "")
          platformHandle.kickFollowers = creator.followers
        }

        const res = await fetch("/api/creators", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: creator.name,
            bio: creator.bio,
            profileImageUrl: creator.profileImageUrl || "https://i.pravatar.cc/400?img=1",
            country: creator.country || "Unknown",
            language: creator.language ? [creator.language] : ["English"],
            tier: creator.tier,
            niches: creator.niches,
            platforms: [creator.platform],
            exclusivityStatus: "NONE",
            managedByFlamenzi: false,
            tags: ["Lumos Discovered"],
            ...platformHandle,
          }),
        })
        if (res.ok) {
          const data = await res.json()
          ids.push(data.id)
        }
      } catch {
        // continue with remaining
      }
    }

    setImportedIds(ids)
    setImporting(false)
  }

  const selectedCount = creators.filter((c) => c.selected && !c.alreadyInDb).length

  return (
    <div className="max-w-5xl">
      <Link
        href="/creators"
        className="flex items-center gap-2 text-[#A89BC2] hover:text-white text-sm mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Creators
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 bg-[rgba(245,230,66,0.1)] border border-[rgba(245,230,66,0.2)] rounded-lg flex items-center justify-center">
          <Telescope className="w-5 h-5 text-[#F5E642]" />
        </div>
        <div>
          <h1 className="font-cinzel font-bold text-xl text-white">Discover Creators</h1>
          <p className="text-xs text-[#A89BC2]">AI-powered bulk creator discovery using live web search</p>
        </div>
      </div>

      {/* Step: Category */}
      {step === "category" && (
        <div>
          <p className="text-sm text-[#A89BC2] mb-4">Select a niche category to discover creators in:</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {CATEGORIES.map((c) => (
              <button
                key={c.label}
                type="button"
                onClick={() => setCategory(c.label)}
                className={cn(
                  "flex flex-col items-center gap-2 p-5 rounded-xl border-2 transition-all",
                  category === c.label
                    ? "border-[rgba(245,230,66,0.3)] bg-[rgba(245,230,66,0.1)]"
                    : "border-[rgba(245,230,66,0.15)] bg-[#120820] hover:border-[rgba(245,230,66,0.2)]"
                )}
              >
                <span className="text-3xl">{c.emoji}</span>
                <span
                  className={cn(
                    "text-xs font-medium text-center leading-tight",
                    category === c.label ? "text-[#F5E642]" : "text-[#A89BC2]"
                  )}
                >
                  {c.label}
                </span>
              </button>
            ))}
          </div>
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => category && setStep("filters")}
              disabled={!category}
              className="px-5 py-2.5 bg-[#F5E642] text-[#0A0412] text-sm font-semibold rounded-lg hover:bg-[#F5E642]/90 hover:shadow-[0_0_15px_rgba(245,230,66,0.4)] disabled:opacity-40 transition-all"
            >
              Next: Set Filters
            </button>
          </div>
        </div>
      )}

      {/* Step: Filters */}
      {step === "filters" && (
        <div className="space-y-5">
          <div className="flex items-center gap-2 text-sm text-[#A89BC2]">
            <button onClick={() => setStep("category")} className="hover:text-white transition-colors">
              Category
            </button>
            <span>/</span>
            <span className="text-white font-medium">{category}</span>
          </div>

          <div className="bg-[#120820] border border-[rgba(245,230,66,0.15)] rounded-xl p-5 space-y-5">
            <div>
              <p className="text-xs font-semibold text-[#A89BC2] uppercase tracking-wider mb-2">Platforms</p>
              <div className="flex flex-wrap gap-2">
                {PLATFORMS_LIST.map((p) => (
                  <FilterToggle
                    key={p}
                    value={p}
                    active={filters.platforms.includes(p)}
                    onClick={() => togglePlatform(p)}
                  />
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-[#A89BC2] uppercase tracking-wider mb-2">Regions</p>
              <div className="flex flex-wrap gap-2">
                {REGIONS_LIST.map((r) => (
                  <FilterToggle
                    key={r}
                    value={r}
                    active={filters.regions.includes(r)}
                    onClick={() => toggleRegion(r)}
                  />
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-[#A89BC2] uppercase tracking-wider mb-2">Tier</p>
              <div className="flex flex-wrap gap-2">
                {TIERS_LIST.map((t) => (
                  <FilterToggle
                    key={t}
                    value={t}
                    active={filters.tiers.includes(t)}
                    onClick={() => toggleTier(t)}
                  />
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-[#A89BC2] uppercase tracking-wider mb-2">Language</p>
              <div className="flex flex-wrap gap-2">
                {LANGUAGES_LIST.map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setFilters((f) => ({ ...f, language: f.language === l ? "" : l }))}
                    className={cn(
                      "text-xs px-3 py-1.5 rounded border transition-colors",
                      filters.language === l
                        ? "bg-[rgba(245,230,66,0.1)] border-[rgba(245,230,66,0.3)] text-[#F5E642]"
                        : "bg-[#1A0A2E] border-[rgba(245,230,66,0.1)] text-[#A89BC2] hover:text-white"
                    )}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-[#A89BC2] uppercase tracking-wider">
                  Number of Creators
                </p>
                <span className="text-[#F5E642] font-mono text-sm font-bold">{filters.count}</span>
              </div>
              <input
                type="range"
                min="5"
                max="25"
                step="5"
                value={filters.count}
                onChange={(e) => setFilters((f) => ({ ...f, count: parseInt(e.target.value) }))}
                className="w-full accent-[#F5E642]"
              />
              <div className="flex justify-between text-xs text-[#4A3F6B] mt-1">
                <span>5</span>
                <span>10</span>
                <span>15</span>
                <span>20</span>
                <span>25</span>
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setStep("category")}
              className="px-4 py-2 bg-[#120820] border border-[rgba(245,230,66,0.2)] text-[#A89BC2] text-sm rounded-lg hover:text-white hover:border-[rgba(245,230,66,0.4)] transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleDiscover}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#F5E642] text-[#0A0412] text-sm font-semibold rounded-lg hover:bg-[#F5E642]/90 hover:shadow-[0_0_15px_rgba(245,230,66,0.4)] transition-all"
            >
              <Telescope className="w-4 h-4" />
              Discover Creators
            </button>
          </div>
        </div>
      )}

      {/* Step: Results */}
      {step === "results" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => { setStep("filters"); setCreators([]); setImportedIds([]) }}
                className="text-sm text-[#A89BC2] hover:text-white transition-colors flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back
              </button>
              <div className="flex items-center gap-2 text-sm text-[#A89BC2]">
                <span className="text-white font-medium">{category}</span>
                {filters.platforms.length > 0 && (
                  <span>· {filters.platforms.join(", ")}</span>
                )}
              </div>
            </div>
            {creators.length > 0 && !running && importedIds.length === 0 && (
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleAll}
                  className="flex items-center gap-1.5 text-xs text-[#A89BC2] hover:text-white transition-colors"
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                  Toggle All
                </button>
                <button
                  onClick={handleImport}
                  disabled={importing || selectedCount === 0}
                  className="flex items-center gap-2 px-4 py-2 bg-[#F5E642] text-[#0A0412] text-sm font-semibold rounded-lg hover:bg-[#F5E642]/90 hover:shadow-[0_0_15px_rgba(245,230,66,0.4)] disabled:opacity-40 transition-all"
                >
                  {importing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5" />
                      Import {selectedCount > 0 ? `${selectedCount} Selected` : "Selected"}
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Status bar */}
          {(running || status) && (
            <div className="flex items-center gap-2 px-4 py-2.5 bg-[#120820] border border-[rgba(245,230,66,0.15)] rounded-lg">
              {running && <Loader2 className="w-4 h-4 text-[#F5E642] animate-spin flex-shrink-0" />}
              {!running && creators.length > 0 && <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
              <p className="text-sm text-[#A89BC2]">
                {running ? status : `Found ${creators.length} creators`}
              </p>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 px-4 py-2.5 bg-red-950/30 border border-red-800/40 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Import success */}
          {importedIds.length > 0 && (
            <div className="bg-emerald-950/30 border border-emerald-800/40 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-emerald-400" />
                <p className="text-emerald-400 font-medium text-sm">
                  Successfully imported {importedIds.length} creator{importedIds.length !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {importedIds.map((id) => (
                  <Link
                    key={id}
                    href={`/creators/${id}`}
                    className="flex items-center gap-1 text-xs px-3 py-1.5 bg-emerald-900/30 border border-emerald-800/30 text-emerald-300 rounded-md hover:bg-emerald-900/50 transition-colors"
                  >
                    View Profile
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                ))}
              </div>
              <Link
                href="/creators"
                className="inline-block text-xs text-[#A89BC2] hover:text-white underline transition-colors"
              >
                Go to Creator Roster →
              </Link>
            </div>
          )}

          {/* Creator cards */}
          <div className="grid grid-cols-1 gap-3">
            {creators.map((creator) => (
              <div
                key={creator.id}
                onClick={() => !creator.alreadyInDb && toggleCreator(creator.id)}
                className={cn(
                  "flex items-start gap-3 p-4 rounded-xl border transition-all",
                  creator.alreadyInDb
                    ? "border-[rgba(245,230,66,0.15)] bg-[#120820] opacity-60 cursor-default"
                    : creator.selected
                    ? "border-[rgba(245,230,66,0.3)] bg-[rgba(245,230,66,0.05)] cursor-pointer"
                    : "border-[rgba(245,230,66,0.15)] bg-[#120820] cursor-pointer hover:border-[rgba(245,230,66,0.2)]"
                )}
              >
                {/* Checkbox */}
                <div className="mt-0.5 flex-shrink-0">
                  {creator.alreadyInDb ? (
                    <div className="w-5 h-5 rounded bg-[rgba(245,230,66,0.1)] border border-[rgba(245,230,66,0.3)] flex items-center justify-center">
                      <Check className="w-3 h-3 text-[#F5E642]" />
                    </div>
                  ) : creator.selected ? (
                    <CheckSquare className="w-5 h-5 text-[#F5E642]" />
                  ) : (
                    <Square className="w-5 h-5 text-[#4A3F6B]" />
                  )}
                </div>

                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-[rgba(245,230,66,0.1)] flex-shrink-0 overflow-hidden">
                  {creator.profileImageUrl ? (
                    <img src={creator.profileImageUrl} alt={creator.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-lg font-bold text-[#4A3F6B]">
                      {creator.name.charAt(0)}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-white">{creator.name}</p>
                    <span className="text-xs text-[#4A3F6B]">{creator.handle}</span>
                    {creator.alreadyInDb && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-900/30 border border-blue-700/30 text-blue-300">
                        Already in Database
                      </span>
                    )}
                    {creator.tier && (
                      <span
                        className={cn(
                          "text-xs px-2 py-0.5 rounded-full border border-transparent",
                          TIER_COLORS[creator.tier] || "bg-[rgba(107,114,128,0.2)] text-[#9CA3AF]"
                        )}
                      >
                        {creator.tier}
                      </span>
                    )}
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[rgba(123,47,190,0.2)] border border-[rgba(123,47,190,0.3)] text-[#A89BC2]">
                      {creator.platform}
                    </span>
                  </div>
                  {creator.bio && (
                    <p className="text-xs text-[#A89BC2] mt-1 line-clamp-2">{creator.bio}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-xs text-[#A89BC2]">
                    {creator.followers > 0 && (
                      <span>{formatFollowers(creator.followers)} followers</span>
                    )}
                    {creator.engagementRate > 0 && (
                      <span>{creator.engagementRate.toFixed(1)}% eng.</span>
                    )}
                    {creator.country && <span>{creator.country}</span>}
                    {creator.niches.length > 0 && (
                      <span>{creator.niches.slice(0, 2).join(", ")}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {running && creators.length === 0 && (
              <div className="flex items-center justify-center py-16 text-[#A89BC2]">
                <div className="text-center space-y-3">
                  <Loader2 className="w-10 h-10 animate-spin mx-auto text-[#F5E642]" />
                  <p className="text-sm">{status || "Searching the web..."}</p>
                </div>
              </div>
            )}

            {!running && creators.length === 0 && !error && (
              <div className="flex items-center justify-center py-16 text-[#A89BC2]">
                <p className="text-sm">No creators found. Try adjusting your filters.</p>
              </div>
            )}
          </div>

          {/* Bottom import bar when many results */}
          {creators.length > 5 && !running && importedIds.length === 0 && (
            <div className="sticky bottom-4 flex justify-end">
              <button
                onClick={handleImport}
                disabled={importing || selectedCount === 0}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#F5E642] text-[#0A0412] text-sm font-semibold rounded-lg hover:bg-[#F5E642]/90 hover:shadow-[0_0_15px_rgba(245,230,66,0.4)] disabled:opacity-40 shadow-xl transition-all"
              >
                {importing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-3.5 h-3.5" />
                    Import {selectedCount > 0 ? `${selectedCount} Selected` : "Selected"}
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
