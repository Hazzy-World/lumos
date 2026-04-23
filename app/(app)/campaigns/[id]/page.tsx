"use client"

import { useState, useEffect, useRef } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Plus, Trash2, Send, RotateCcw, Copy, CheckCircle, FileDown, ExternalLink } from "lucide-react"
import StatusBadge from "@/components/shared/StatusBadge"
import TierBadge from "@/components/shared/TierBadge"
import { Skeleton } from "@/components/shared/SkeletonCard"
import { formatCurrency, calcClientRate, calcCommission, calcCampaignTotals } from "@/lib/rate-utils"
import { DELIVERABLE_TYPES, CONFIRMATION_STATUSES, CONTENT_STATUSES, CAMPAIGN_STATUSES, CAMPAIGN_OBJECTIVES, ALL_COUNTRIES, NICHES, PLATFORMS } from "@/lib/constants"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

type Tab = "overview" | "lineup" | "matching" | "assistant" | "proposal" | "edit"

interface Deliverable {
  type: string
  quantity: number
  creatorRate: number
  clientRate: number
  commission: number
}

interface CampaignCreator {
  id: string
  campaignId: string
  creatorId: string
  selectedDeliverables: Deliverable[]
  totalCreatorRate: number
  totalClientRate: number
  totalCommission: number
  confirmationStatus: string
  contentStatus: string
  contentDeadline?: string | null
  liveUrl?: string | null
  performanceNotes?: string | null
  creator: {
    id: string
    name: string
    nameAr?: string | null
    profileImageUrl: string
    tier: string
    niches: string[]
    platforms: string[]
    country: string
    [key: string]: unknown
  }
}

interface Campaign {
  id: string
  name: string
  brandName: string
  brandWebsite?: string | null
  brandLogoUrl?: string | null
  brief: string
  objectives: string[]
  targetAudience: string
  targetCountries: string[]
  targetNiches: string[]
  platforms: string[]
  budget: number
  budgetCurrency: string
  startDate: string
  endDate: string
  status: string
  internalNotes?: string | null
  clientContactName?: string | null
  clientContactEmail?: string | null
  creators: CampaignCreator[]
}

interface MatchResult {
  creatorId: string
  matchScore: number
  reasoning: string
  recommendedDeliverables: string[]
  estimatedTotalClientRate: number
  redFlags: string[]
  strategicNote: string
}

interface SimpleCreator {
  id: string
  name: string
  tier: string
  niches: string[]
  platforms: string[]
  country: string
  profileImageUrl: string
  [key: string]: unknown
}

function KPICard({
  label,
  value,
  sub,
  color,
}: {
  label: string
  value: string | number
  sub?: string
  color?: string
}) {
  return (
    <div className="bg-[#120820] border border-[rgba(245,230,66,0.15)] rounded-xl p-5">
      <p className="text-[11px] font-semibold text-[#A89BC2] uppercase tracking-wider mb-1">{label}</p>
      <p className={cn("font-cinzel font-bold text-2xl", color || "text-white")}>{value}</p>
      {sub && <p className="text-[#A89BC2] text-xs mt-1">{sub}</p>}
    </div>
  )
}

function Toggle({ arr, val, onChange }: { arr: string[]; val: string; onChange: (v: string[]) => void }) {
  const active = arr.includes(val)
  return (
    <button
      type="button"
      onClick={() => onChange(active ? arr.filter((x) => x !== val) : [...arr, val])}
      className={cn(
        "text-xs px-3 py-1.5 rounded border transition-colors",
        active
          ? "bg-[rgba(245,230,66,0.1)] border-[rgba(245,230,66,0.3)] text-[#F5E642]"
          : "bg-[#1A0A2E] border-[rgba(245,230,66,0.1)] text-[#A89BC2] hover:text-white hover:border-[rgba(245,230,66,0.3)]"
      )}
    >
      {val}
    </button>
  )
}

function AddCreatorModal({
  campaignId,
  settings,
  onAdd,
  onClose,
  initialCreator,
  initialRecommendedDeliverables,
}: {
  campaignId: string
  settings: { serviceMarkup: number; agencyCommission: number }
  onAdd: () => void
  onClose: () => void
  initialCreator?: SimpleCreator | null
  initialRecommendedDeliverables?: string[]
}) {
  const [search, setSearch] = useState("")
  const [creators, setCreators] = useState<SimpleCreator[]>([])
  const [selected, setSelected] = useState<SimpleCreator | null>(initialCreator ?? null)
  const [deliverables, setDeliverables] = useState<Deliverable[]>([])
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => {
      const params = new URLSearchParams()
      if (search) params.set("search", search)
      fetch(`/api/creators?${params}`)
        .then((r) => r.json())
        .then((data) => setCreators(Array.isArray(data) ? data : []))
    }, 300)
    return () => clearTimeout(t)
  }, [search])

  // Pre-select recommended deliverables when initialCreator is provided
  useEffect(() => {
    if (!initialCreator || !initialRecommendedDeliverables?.length) return
    const preSelected: Deliverable[] = []
    for (const d of DELIVERABLE_TYPES) {
      if (initialRecommendedDeliverables.includes(d.label)) {
        const rate = initialCreator[d.key] as number | null
        if (rate != null && rate > 0) {
          preSelected.push({
            type: d.label,
            quantity: 1,
            creatorRate: rate,
            clientRate: calcClientRate(rate, settings.serviceMarkup),
            commission: calcCommission(rate, settings.agencyCommission),
          })
        }
      }
    }
    if (preSelected.length > 0) setDeliverables(preSelected)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const availableRates = selected
    ? DELIVERABLE_TYPES.filter((d) => {
        const rate = selected[d.key] as number | null
        return rate != null && rate > 0
      })
    : []

  const toggleDeliverable = (d: (typeof DELIVERABLE_TYPES)[number]) => {
    const rate = selected![d.key] as number
    const exists = deliverables.find((x) => x.type === d.label)
    if (exists) {
      setDeliverables(deliverables.filter((x) => x.type !== d.label))
    } else {
      setDeliverables([
        ...deliverables,
        {
          type: d.label,
          quantity: 1,
          creatorRate: rate,
          clientRate: calcClientRate(rate, settings.serviceMarkup),
          commission: calcCommission(rate, settings.agencyCommission),
        },
      ])
    }
  }

  const totals = deliverables.reduce(
    (acc, d) => ({
      creator: acc.creator + d.creatorRate * d.quantity,
      client: acc.client + d.clientRate * d.quantity,
      commission: acc.commission + d.commission * d.quantity,
    }),
    { creator: 0, client: 0, commission: 0 }
  )

  const handleAdd = async () => {
    if (!selected || deliverables.length === 0) return
    setAdding(true)
    try {
      await fetch(`/api/campaigns/${campaignId}/creators`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creatorId: selected.id,
          selectedDeliverables: deliverables,
          totalCreatorRate: totals.creator,
          totalClientRate: totals.client,
          totalCommission: totals.commission,
        }),
      })
      onAdd()
    } finally {
      setAdding(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-[rgba(10,4,18,0.85)] flex items-center justify-center z-50 p-4">
      <div className="bg-[#120820] border border-[rgba(245,230,66,0.2)] rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-5 border-b border-[rgba(245,230,66,0.15)] flex items-center justify-between">
          <h3 className="font-cinzel font-semibold text-white">Add Creator to Campaign</h3>
          <button onClick={onClose} className="text-[#A89BC2] hover:text-white">✕</button>
        </div>
        <div className="p-5">
          {!selected ? (
            <>
              <input
                type="text"
                placeholder="Search creators..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-3 py-2 bg-[#1A0A2E] border border-[rgba(245,230,66,0.2)] rounded-lg text-sm text-white placeholder:text-[#4A3F6B] focus:outline-none focus:border-[#F5E642] focus:shadow-[0_0_0_2px_rgba(245,230,66,0.08)] mb-4"
              />
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {creators.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelected(c)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg bg-[#1A0A2E] border border-[rgba(245,230,66,0.1)] hover:border-[rgba(245,230,66,0.4)] text-left transition-colors"
                  >
                    <img src={c.profileImageUrl} alt={c.name} className="w-10 h-10 rounded-full object-cover" />
                    <div className="flex-1">
                      <p className="font-medium text-white text-sm">{c.name}</p>
                      <p className="text-[#A89BC2] text-xs">{c.country} · {c.niches.slice(0, 2).join(", ")}</p>
                    </div>
                    <TierBadge tier={c.tier} />
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-4">
                <img src={selected.profileImageUrl} alt={selected.name} className="w-12 h-12 rounded-full object-cover" />
                <div>
                  <p className="font-semibold text-white">{selected.name}</p>
                  <p className="text-[#A89BC2] text-sm">{selected.country}</p>
                </div>
                {!initialCreator && (
                  <button
                    onClick={() => { setSelected(null); setDeliverables([]) }}
                    className="ml-auto text-xs text-[#A89BC2] hover:text-white underline"
                  >
                    Change
                  </button>
                )}
              </div>

              {initialRecommendedDeliverables && initialRecommendedDeliverables.length > 0 && (
                <div className="bg-[rgba(245,230,66,0.05)] border border-[rgba(245,230,66,0.2)] rounded-lg px-3 py-2 mb-4">
                  <p className="text-[#F5E642] text-xs">
                    AI recommended: {initialRecommendedDeliverables.join(", ")}
                  </p>
                </div>
              )}

              <p className="text-xs font-semibold text-[#A89BC2] uppercase tracking-wider mb-3">
                Select Deliverables
              </p>
              <div className="space-y-2 mb-4">
                {availableRates.length === 0 && (
                  <p className="text-[#A89BC2] text-sm">No rates set for this creator.</p>
                )}
                {availableRates.map((d) => {
                  const rate = selected[d.key] as number
                  const isSelected = deliverables.some((x) => x.type === d.label)
                  const item = deliverables.find((x) => x.type === d.label)
                  return (
                    <div
                      key={d.key}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border transition-colors",
                        isSelected
                          ? "border-[rgba(245,230,66,0.4)] bg-[rgba(245,230,66,0.06)]"
                          : "bg-[#1A0A2E] border-[rgba(245,230,66,0.1)]"
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleDeliverable(d)}
                        className="accent-[#F5E642]"
                      />
                      <div className="flex-1">
                        <p className="text-sm text-white">{d.label}</p>
                        <p className="text-[10px] text-[#A89BC2]">{d.platform}</p>
                      </div>
                      <p className="text-sm font-mono text-[#A89BC2]">{formatCurrency(rate)}</p>
                      <p className="text-sm font-mono text-[#F5E642] font-semibold">
                        {formatCurrency(calcClientRate(rate, settings.serviceMarkup))}
                      </p>
                      {isSelected && (
                        <input
                          type="number"
                          min="1"
                          value={item?.quantity || 1}
                          onChange={(e) => {
                            const qty = parseInt(e.target.value) || 1
                            setDeliverables(
                              deliverables.map((x) =>
                                x.type === d.label ? { ...x, quantity: qty } : x
                              )
                            )
                          }}
                          className="w-16 px-2 py-1 bg-[#0A0412] border border-[rgba(245,230,66,0.15)] rounded text-xs text-white text-center focus:outline-none"
                        />
                      )}
                    </div>
                  )
                })}
              </div>

              {deliverables.length > 0 && (
                <div className="bg-[#1A0A2E] rounded-lg p-3 mb-4 border border-[rgba(245,230,66,0.15)]">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#A89BC2]">Creator Total</span>
                    <span className="text-white font-mono">{formatCurrency(totals.creator)}</span>
                  </div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#A89BC2]">Client Total</span>
                    <span className="text-[#F5E642] font-mono font-semibold">{formatCurrency(totals.client)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-[#A89BC2]">Commission</span>
                    <span className="text-emerald-400 font-mono">{formatCurrency(totals.commission)}</span>
                  </div>
                </div>
              )}

              <button
                onClick={handleAdd}
                disabled={adding || deliverables.length === 0}
                className="w-full py-2.5 bg-[#F5E642] text-[#0A0412] font-semibold rounded-lg hover:bg-[#F5E642]/90 hover:shadow-[0_0_15px_rgba(245,230,66,0.4)] disabled:opacity-50 transition-all"
              >
                {adding ? "Adding..." : "Add to Campaign"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function AIMatchingTab({
  campaign,
  settings,
  onAddCreator,
  alreadyAddedIds,
}: {
  campaign: Campaign
  settings: { serviceMarkup: number; agencyCommission: number }
  onAddCreator: (creator: SimpleCreator, recs: string[]) => void
  alreadyAddedIds: Set<string>
}) {
  const [allCreators, setAllCreators] = useState<SimpleCreator[]>([])
  const [matches, setMatches] = useState<MatchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch("/api/creators").then((r) => r.json()).then((data) => setAllCreators(Array.isArray(data) ? data : []))
  }, [])

  const runMatching = async () => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/ai/match-creators", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaign, creators: allCreators }),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error || "Failed")
      }
      const data = await res.json()
      setMatches(data.matches || [])
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const scoreColor = (score: number) =>
    score >= 80 ? "text-emerald-400" : score >= 60 ? "text-[#F5E642]" : "text-[#A89BC2]"

  const creatorMap = Object.fromEntries(allCreators.map((c) => [c.id, c]))

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-cinzel font-semibold text-white text-lg">AI Creator Matching</h3>
          <p className="text-[#A89BC2] text-sm mt-1">
            Claude analyzes your campaign brief and ranks the best creator matches from your database.
          </p>
        </div>
        <button
          onClick={runMatching}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#F5E642] text-[#0A0412] font-semibold rounded-lg hover:bg-[#F5E642]/90 hover:shadow-[0_0_15px_rgba(245,230,66,0.4)] disabled:opacity-50 transition-all"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Analyzing...
            </>
          ) : (
            "Find Best Creators"
          )}
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-4 text-red-400 text-sm">
          {error}
        </div>
      )}

      {matches.length === 0 && !loading && (
        <div className="text-center py-16 text-[#A89BC2]">
          <p className="text-lg font-cinzel font-semibold text-white mb-2">Ready to match</p>
          <p className="text-sm">Click &quot;Find Best Creators&quot; to get AI-powered recommendations based on your campaign brief.</p>
        </div>
      )}

      <div className="space-y-4">
        {matches.map((match, i) => {
          const creator = creatorMap[match.creatorId]
          if (!creator) return null
          const isAdded = alreadyAddedIds.has(match.creatorId)
          return (
            <div
              key={match.creatorId}
              className="bg-[#120820] border border-[rgba(245,230,66,0.15)] rounded-xl p-5 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="text-[#A89BC2] text-sm font-mono w-6 text-center mt-1">
                  #{i + 1}
                </div>
                <img
                  src={creator.profileImageUrl}
                  alt={creator.name}
                  className="w-14 h-14 rounded-full object-cover border border-[rgba(245,230,66,0.15)] flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-white text-lg">{creator.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <TierBadge tier={creator.tier} />
                        <span className="text-[#A89BC2] text-xs">{creator.country}</span>
                      </div>
                    </div>
                    <div className="text-center flex-shrink-0">
                      <p className={cn("font-cinzel font-bold text-3xl", scoreColor(match.matchScore))}>
                        {match.matchScore}
                      </p>
                      <p className="text-[10px] text-[#A89BC2] uppercase tracking-wider">Match Score</p>
                    </div>
                  </div>

                  <p className="text-[#A89BC2] text-sm mt-3 leading-relaxed">{match.reasoning}</p>

                  {match.recommendedDeliverables.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {match.recommendedDeliverables.map((d) => (
                        <span
                          key={d}
                          className="text-[10px] px-2 py-0.5 rounded bg-[rgba(123,47,190,0.2)] border border-[rgba(123,47,190,0.3)] text-[#A89BC2]"
                        >
                          {d}
                        </span>
                      ))}
                    </div>
                  )}

                  {match.strategicNote && (
                    <div className="mt-3 bg-[rgba(245,230,66,0.05)] border border-[rgba(245,230,66,0.2)] rounded-lg px-4 py-2.5">
                      <p className="text-[#F5E642] text-xs italic">{match.strategicNote}</p>
                    </div>
                  )}

                  {match.redFlags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {match.redFlags.map((flag) => (
                        <span
                          key={flag}
                          className="text-[10px] px-2 py-0.5 rounded bg-red-500/10 border border-red-500/30 text-red-400"
                        >
                          ⚠ {flag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm">
                      <span className="text-[#A89BC2]">Est. client rate: </span>
                      <span className="text-[#F5E642] font-mono font-semibold">
                        {formatCurrency(match.estimatedTotalClientRate)}
                      </span>
                    </div>
                    {isAdded ? (
                      <span className="flex items-center gap-1.5 px-4 py-1.5 text-sm bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-md">
                        <CheckCircle className="w-3.5 h-3.5" />
                        In Lineup
                      </span>
                    ) : (
                      <button
                        onClick={() => onAddCreator(creator, match.recommendedDeliverables)}
                        className="px-4 py-1.5 text-sm bg-[#F5E642] text-[#0A0412] font-semibold rounded-md hover:bg-[#F5E642]/90 hover:shadow-[0_0_15px_rgba(245,230,66,0.4)] transition-all"
                      >
                        Add to Campaign
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function BriefAssistantTab({ campaign }: { campaign: Campaign }) {
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([])
  const [input, setInput] = useState("")
  const [streaming, setStreaming] = useState(false)
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || streaming) return
    const userMsg = { role: "user" as const, content: input.trim() }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput("")
    setStreaming(true)

    try {
      const res = await fetch("/api/ai/brief-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          campaign,
          creators: campaign.creators.map((cc) => ({
            name: cc.creator.name,
            tier: cc.creator.tier,
            niches: cc.creator.niches,
          })),
        }),
      })

      if (!res.body) return
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let assistantText = ""

      setMessages((prev) => [...prev, { role: "assistant", content: "" }])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        assistantText += decoder.decode(value, { stream: true })
        setMessages((prev) => [
          ...prev.slice(0, -1),
          { role: "assistant", content: assistantText },
        ])
      }
    } finally {
      setStreaming(false)
    }
  }

  const copyMessage = (text: string, idx: number) => {
    navigator.clipboard.writeText(text)
    setCopiedIdx(idx)
    setTimeout(() => setCopiedIdx(null), 2000)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-320px)] min-h-96">
      <div className="bg-[#120820] border border-[rgba(245,230,66,0.15)] rounded-xl p-4 mb-4">
        <p className="text-xs text-[#A89BC2]">
          <span className="text-white font-medium">Campaign context loaded:</span>{" "}
          {campaign.name} for {campaign.brandName} ·{" "}
          {campaign.creators.length} creator{campaign.creators.length !== 1 ? "s" : ""} in lineup
        </p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.length === 0 && (
          <div className="py-6">
            <p className="text-[#A89BC2] text-sm text-center mb-4">
              Ask anything about this campaign — strategy, creator ideas, content angles, budget allocation...
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[
                "How should we split the budget across the creator lineup?",
                "What content formats will perform best for this campaign?",
                "Suggest 3 creative content angles for this brief",
                "What KPIs should we track and what are realistic targets?",
                "Which platforms should we prioritise and why?",
                "How do we brief creators to ensure brand-safe content?",
              ].map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => setInput(prompt)}
                  className="text-left text-xs px-3 py-2.5 bg-[#1A0A2E] border border-[rgba(245,230,66,0.1)] rounded-lg text-[#A89BC2] hover:text-white hover:border-[rgba(245,230,66,0.3)] transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={cn(
              "flex gap-3",
              msg.role === "user" ? "flex-row-reverse" : "flex-row"
            )}
          >
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0",
                msg.role === "user"
                  ? "bg-[#F5E642] text-[#0A0412]"
                  : "bg-[#7B2FBE] text-white"
              )}
            >
              {msg.role === "user" ? "You" : "AI"}
            </div>
            <div
              className={cn(
                "max-w-[80%] rounded-xl px-4 py-3 text-sm relative group",
                msg.role === "user"
                  ? "bg-[rgba(245,230,66,0.08)] border border-[rgba(245,230,66,0.2)] text-white"
                  : "bg-[#1A0A2E] border border-[rgba(245,230,66,0.1)] text-[#A89BC2]"
              )}
            >
              <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              {msg.role === "assistant" && msg.content && (
                <button
                  onClick={() => copyMessage(msg.content, i)}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  {copiedIdx === i ? (
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-[#A89BC2] hover:text-white" />
                  )}
                </button>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
          placeholder="Ask about strategy, content ideas, creator suggestions..."
          className="flex-1 px-4 py-2.5 bg-[#1A0A2E] border border-[rgba(245,230,66,0.2)] rounded-xl text-sm text-white placeholder:text-[#4A3F6B] focus:outline-none focus:border-[#F5E642] focus:shadow-[0_0_0_2px_rgba(245,230,66,0.08)] transition-colors"
        />
        <button
          onClick={() => setMessages([])}
          className="p-2.5 border border-[rgba(245,230,66,0.2)] rounded-xl text-[#A89BC2] hover:text-white transition-colors"
          title="Clear history"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <button
          onClick={sendMessage}
          disabled={!input.trim() || streaming}
          className="p-2.5 bg-[#F5E642] rounded-xl text-[#0A0412] hover:bg-[#F5E642]/90 hover:shadow-[0_0_15px_rgba(245,230,66,0.4)] disabled:opacity-50 transition-all"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

function ProposalTab({ campaign }: { campaign: Campaign }) {
  const [form, setForm] = useState({
    title: `${campaign.brandName} — Influencer Campaign Proposal`,
    preparedBy: "Lumos Team",
    clientName: campaign.clientContactName || "",
    coverNote: "",
  })
  const [saving, setSaving] = useState(false)
  const [generating, setGenerating] = useState(false)

  const totalClientValue = campaign.creators.reduce((s, c) => s + c.totalClientRate, 0)

  const handleSave = async () => {
    setSaving(true)
    try {
      await fetch(`/api/proposals/${campaign.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
    } finally {
      setSaving(false)
    }
  }

  const handleExportPDF = async () => {
    setGenerating(true)
    try {
      const jsPDF = (await import("jspdf")).default
      const autoTable = (await import("jspdf-autotable")).default

      const doc = new jsPDF()
      const pw = doc.internal.pageSize.getWidth()
      const ph = doc.internal.pageSize.getHeight()
      const m = 20

      const addFooter = (pg: number, total: number) => {
        doc.setFontSize(7.5)
        doc.setTextColor(180, 180, 180)
        doc.text("Flamenzi  |  hello@flamenzi.com  |  flamenzi.com", pw / 2, ph - 10, { align: "center" })
        doc.text(`${pg} / ${total}`, pw - m, ph - 10, { align: "right" })
      }

      // ── Page 1: Cover ──────────────────────────────────────────────────────────
      // Dark background
      doc.setFillColor(10, 10, 10)
      doc.rect(0, 0, pw, ph, "F")

      // Red top band
      doc.setFillColor(200, 16, 46)
      doc.rect(0, 0, pw, 65, "F")

      // Agency name
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(32)
      doc.setFont("helvetica", "bold")
      doc.text("FLAMENZI", m, 35)
      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(255, 180, 180)
      doc.text("Influencer Marketing Agency", m, 48)
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(8)
      doc.text("CONFIDENTIAL", pw - m, 48, { align: "right" })

      // Campaign title
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(20)
      doc.setFont("helvetica", "bold")
      const titleLines = doc.splitTextToSize(form.title, pw - m * 2)
      doc.text(titleLines, m, 96)

      // Gold divider
      doc.setFillColor(245, 166, 35)
      doc.rect(m, 106, 50, 1.5, "F")

      // Meta info
      doc.setFontSize(9)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(180, 180, 180)
      const metaY = 118
      doc.text(`Prepared by:`, m, metaY)
      doc.setTextColor(230, 230, 230)
      doc.text(form.preparedBy, m + 26, metaY)

      doc.setTextColor(180, 180, 180)
      doc.text(`Prepared for:`, m, metaY + 10)
      doc.setTextColor(230, 230, 230)
      doc.text(form.clientName || "—", m + 26, metaY + 10)

      doc.setTextColor(180, 180, 180)
      doc.text(`Date:`, m, metaY + 20)
      doc.setTextColor(230, 230, 230)
      doc.text(format(new Date(), "MMMM d, yyyy"), m + 26, metaY + 20)

      doc.setTextColor(180, 180, 180)
      doc.text(`Campaign:`, m, metaY + 30)
      doc.setTextColor(230, 230, 230)
      doc.text(campaign.name, m + 26, metaY + 30)

      // Cover note
      if (form.coverNote) {
        doc.setFillColor(25, 25, 25)
        doc.roundedRect(m, 168, pw - m * 2, 60, 3, 3, "F")
        doc.setFontSize(9)
        doc.setTextColor(200, 200, 200)
        doc.setFont("helvetica", "italic")
        const noteLines = doc.splitTextToSize(form.coverNote, pw - m * 2 - 12)
        doc.text(noteLines.slice(0, 8), m + 6, 178)
      }

      // ── Page 2: Campaign Overview ──────────────────────────────────────────────
      doc.addPage()

      doc.setFillColor(248, 248, 248)
      doc.rect(0, 0, pw, ph, "F")

      // Page header
      doc.setFillColor(10, 10, 10)
      doc.rect(0, 0, pw, 20, "F")
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(7)
      doc.setFont("helvetica", "normal")
      doc.text("FLAMENZI  ·  CAMPAIGN PROPOSAL  ·  CONFIDENTIAL", m, 13)

      doc.setTextColor(30, 30, 30)
      doc.setFontSize(16)
      doc.setFont("helvetica", "bold")
      doc.text("Campaign Overview", m, 38)
      doc.setFillColor(200, 16, 46)
      doc.rect(m, 41, 40, 1.5, "F")

      let y = 52

      // Brief
      if (campaign.brief) {
        doc.setFillColor(255, 255, 255)
        doc.roundedRect(m, y, pw - m * 2, 8, 1, 1, "F")
        doc.setFillColor(200, 16, 46)
        doc.rect(m, y, 3, 8, "F")
        doc.setTextColor(50, 50, 50)
        doc.setFontSize(7.5)
        doc.setFont("helvetica", "bold")
        doc.text("BRIEF", m + 6, y + 5.5)
        y += 12

        doc.setTextColor(70, 70, 70)
        doc.setFontSize(8.5)
        doc.setFont("helvetica", "normal")
        const briefLines = doc.splitTextToSize(campaign.brief, pw - m * 2)
        doc.text(briefLines.slice(0, 8), m, y)
        y += briefLines.slice(0, 8).length * 5 + 8
      }

      // Details grid
      const details = [
        ["Budget", formatCurrency(campaign.budget, campaign.budgetCurrency)],
        ["Target Audience", campaign.targetAudience],
        ["Platforms", campaign.platforms.join(", ") || "—"],
        ["Timeline", `${format(new Date(campaign.startDate), "MMM d")} – ${format(new Date(campaign.endDate), "MMM d, yyyy")}`],
        ["Objectives", campaign.objectives.join(", ") || "—"],
        ["Target Countries", campaign.targetCountries.slice(0, 4).join(", ") || "—"],
      ]

      y += 4
      doc.setFontSize(8)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(30, 30, 30)
      doc.text("Campaign Details", m, y)
      doc.setFillColor(200, 16, 46)
      doc.rect(m, y + 2, 25, 0.8, "F")
      y += 8

      const colW = (pw - m * 2) / 2
      details.forEach(([k, v], i) => {
        const col = i % 2
        const row = Math.floor(i / 2)
        const x = m + col * colW
        const ry = y + row * 18
        doc.setFillColor(255, 255, 255)
        doc.roundedRect(x, ry, colW - 4, 14, 1, 1, "F")
        doc.setTextColor(150, 150, 150)
        doc.setFontSize(7)
        doc.setFont("helvetica", "bold")
        doc.text(k.toUpperCase(), x + 4, ry + 5)
        doc.setTextColor(40, 40, 40)
        doc.setFontSize(8.5)
        doc.setFont("helvetica", "normal")
        const vLines = doc.splitTextToSize(v, colW - 12)
        doc.text(vLines[0] || "", x + 4, ry + 11)
      })
      y += Math.ceil(details.length / 2) * 18 + 10

      // ── Page 3: Creator Lineup ─────────────────────────────────────────────────
      doc.addPage()

      doc.setFillColor(248, 248, 248)
      doc.rect(0, 0, pw, ph, "F")

      doc.setFillColor(10, 10, 10)
      doc.rect(0, 0, pw, 20, "F")
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(7)
      doc.text("FLAMENZI  ·  CAMPAIGN PROPOSAL  ·  CONFIDENTIAL", m, 13)

      doc.setTextColor(30, 30, 30)
      doc.setFontSize(16)
      doc.setFont("helvetica", "bold")
      doc.text("Creator Lineup & Investment", m, 38)
      doc.setFillColor(200, 16, 46)
      doc.rect(m, 41, 50, 1.5, "F")

      const tableData = campaign.creators.map((cc) => [
        cc.creator.name,
        cc.creator.tier,
        cc.creator.country,
        cc.selectedDeliverables.map((d) => `${d.quantity}× ${d.type}`).join("\n"),
        formatCurrency(cc.totalClientRate),
      ])

      autoTable(doc, {
        startY: 48,
        head: [["Creator", "Tier", "Country", "Deliverables", "Investment"]],
        body: tableData,
        foot: [["", "", "", "Total Investment", formatCurrency(totalClientValue)]],
        headStyles: {
          fillColor: [200, 16, 46],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          fontSize: 8,
        },
        footStyles: {
          fillColor: [245, 166, 35],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          fontSize: 9,
        },
        bodyStyles: { fontSize: 8, textColor: [50, 50, 50] },
        alternateRowStyles: { fillColor: [252, 252, 252] },
        columnStyles: {
          0: { fontStyle: "bold" },
          4: { fontStyle: "bold", halign: "right" },
        },
        styles: { cellPadding: 4 },
        margin: { left: m, right: m },
      })

      // Add footers to all pages
      const totalPages = doc.getNumberOfPages()
      for (let pg = 1; pg <= totalPages; pg++) {
        doc.setPage(pg)
        addFooter(pg, totalPages)
      }

      doc.save(`${campaign.name.replace(/\s+/g, "_")}_Proposal.pdf`)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="bg-[#120820] border border-[rgba(245,230,66,0.15)] rounded-xl p-5 space-y-4 mb-6">
        <h3 className="font-cinzel font-semibold text-white">Proposal Details</h3>
        {(["title", "preparedBy", "clientName"] as const).map((field) => (
          <div key={field}>
            <label className="block text-xs font-medium text-[#A89BC2] mb-1.5 capitalize">
              {field === "clientName" ? "Client Name" : field === "preparedBy" ? "Prepared By" : "Title"}
            </label>
            <input
              type="text"
              value={form[field]}
              onChange={(e) => setForm((p) => ({ ...p, [field]: e.target.value }))}
              className="w-full px-3 py-2 bg-[#1A0A2E] border border-[rgba(245,230,66,0.2)] rounded-lg text-sm text-white focus:outline-none focus:border-[#F5E642] focus:shadow-[0_0_0_2px_rgba(245,230,66,0.08)]"
            />
          </div>
        ))}
        <div>
          <label className="block text-xs font-medium text-[#A89BC2] mb-1.5">Cover Note</label>
          <textarea
            value={form.coverNote}
            onChange={(e) => setForm((p) => ({ ...p, coverNote: e.target.value }))}
            className="w-full px-3 py-2 bg-[#1A0A2E] border border-[rgba(245,230,66,0.2)] rounded-lg text-sm text-white focus:outline-none focus:border-[#F5E642] focus:shadow-[0_0_0_2px_rgba(245,230,66,0.08)] h-28 resize-none"
            placeholder="A personalised note to the client..."
          />
        </div>
      </div>

      <div className="bg-white rounded-xl overflow-hidden mb-6 shadow-2xl">
        <div className="bg-[#120820] p-6">
          <p className="text-[#F5E642] font-bold text-xl font-cinzel">LUMOS</p>
          <p className="text-[#A89BC2] text-sm">Influencer Marketing Agency</p>
        </div>
        <div className="p-6">
          <h2 className="text-[#1A1A2E] font-bold text-xl mb-2">{form.title}</h2>
          <p className="text-gray-500 text-sm mb-1">Prepared by: {form.preparedBy}</p>
          <p className="text-gray-500 text-sm mb-4">For: {form.clientName}</p>
          {form.coverNote && <p className="text-gray-700 text-sm leading-relaxed mb-6">{form.coverNote}</p>}

          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[#120820] text-[#F5E642]">
                <tr>
                  {["Creator", "Tier", "Deliverables", "Investment"].map((h) => (
                    <th key={h} className="text-left px-4 py-2 text-xs font-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {campaign.creators.map((cc, i) => (
                  <tr key={cc.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="px-4 py-2 font-medium text-gray-800">{cc.creator.name}</td>
                    <td className="px-4 py-2 text-gray-500">{cc.creator.tier}</td>
                    <td className="px-4 py-2 text-gray-500 text-xs">
                      {cc.selectedDeliverables.map((d) => `${d.quantity}x ${d.type}`).join(", ")}
                    </td>
                    <td className="px-4 py-2 font-mono text-gray-800 font-semibold">
                      {formatCurrency(cc.totalClientRate)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-[#1A0A2E]">
                <tr>
                  <td colSpan={3} className="px-4 py-2 font-bold text-white text-sm">
                    Total Investment
                  </td>
                  <td className="px-4 py-2 font-mono font-bold text-white">
                    {formatCurrency(totalClientValue)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <p className="text-gray-400 text-xs text-center mt-6">
            Flamenzi | hello@flamenzi.com | flamenzi.com
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-[#120820] border border-[rgba(245,230,66,0.2)] text-[#A89BC2] text-sm rounded-lg hover:text-white hover:border-[rgba(245,230,66,0.4)] transition-colors"
        >
          {saving ? "Saving..." : "Save Draft"}
        </button>
        <button
          onClick={handleExportPDF}
          disabled={generating}
          className="flex items-center gap-2 px-5 py-2 bg-[#F5E642] text-[#0A0412] text-sm font-semibold rounded-lg hover:bg-[#F5E642]/90 hover:shadow-[0_0_15px_rgba(245,230,66,0.4)] disabled:opacity-50 transition-all"
        >
          {generating ? "Generating..." : "Download PDF"}
        </button>
      </div>
    </div>
  )
}

const INPUT_CLS =
  "w-full px-3 py-2 bg-[#1A0A2E] border border-[rgba(245,230,66,0.2)] rounded-lg text-sm text-white placeholder:text-[#4A3F6B] focus:outline-none focus:border-[#F5E642] focus:shadow-[0_0_0_2px_rgba(245,230,66,0.08)] transition-colors"

function EditCampaignTab({
  campaign,
  onSaved,
}: {
  campaign: Campaign
  onSaved: (c: Campaign) => void
}) {
  const [form, setForm] = useState({
    name: campaign.name,
    brandName: campaign.brandName,
    brandWebsite: campaign.brandWebsite || "",
    brandLogoUrl: campaign.brandLogoUrl || "",
    brief: campaign.brief,
    objectives: [...campaign.objectives],
    targetAudience: campaign.targetAudience,
    targetCountries: [...campaign.targetCountries],
    targetNiches: [...campaign.targetNiches],
    platforms: [...campaign.platforms],
    budget: String(campaign.budget),
    budgetCurrency: campaign.budgetCurrency,
    startDate: campaign.startDate ? format(new Date(campaign.startDate), "yyyy-MM-dd") : "",
    endDate: campaign.endDate ? format(new Date(campaign.endDate), "yyyy-MM-dd") : "",
    internalNotes: campaign.internalNotes || "",
    clientContactName: campaign.clientContactName || "",
    clientContactEmail: campaign.clientContactEmail || "",
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const set = <K extends keyof typeof form>(key: K, val: (typeof form)[K]) =>
    setForm((p) => ({ ...p, [key]: val }))

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/campaigns/${campaign.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, budget: parseFloat(form.budget) || 0 }),
      })
      if (res.ok) {
        const updated = await res.json()
        onSaved(updated)
        setSaved(true)
        setTimeout(() => setSaved(false), 2500)
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="bg-[#120820] border border-[rgba(245,230,66,0.15)] rounded-xl p-5 space-y-4">
        <h3 className="font-cinzel font-semibold text-white">Campaign Identity</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#A89BC2] mb-1.5">Campaign Name</label>
            <input className={INPUT_CLS} value={form.name} onChange={(e) => set("name", e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#A89BC2] mb-1.5">Brand Name</label>
            <input className={INPUT_CLS} value={form.brandName} onChange={(e) => set("brandName", e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#A89BC2] mb-1.5">Brand Website</label>
            <input className={INPUT_CLS} value={form.brandWebsite} onChange={(e) => set("brandWebsite", e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#A89BC2] mb-1.5">Brand Logo URL</label>
            <input className={INPUT_CLS} value={form.brandLogoUrl} onChange={(e) => set("brandLogoUrl", e.target.value)} />
          </div>
        </div>
      </div>

      <div className="bg-[#120820] border border-[rgba(245,230,66,0.15)] rounded-xl p-5 space-y-4">
        <h3 className="font-cinzel font-semibold text-white">Campaign Brief</h3>
        <div>
          <label className="block text-xs font-medium text-[#A89BC2] mb-1.5">Brief</label>
          <textarea
            className={cn(INPUT_CLS, "h-36 resize-none")}
            value={form.brief}
            onChange={(e) => set("brief", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#A89BC2] mb-1.5">Target Audience</label>
          <input className={INPUT_CLS} value={form.targetAudience} onChange={(e) => set("targetAudience", e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#A89BC2] mb-2">Objectives</label>
          <div className="flex flex-wrap gap-2">
            {CAMPAIGN_OBJECTIVES.map((obj) => (
              <Toggle key={obj} arr={form.objectives} val={obj} onChange={(v) => set("objectives", v)} />
            ))}
          </div>
        </div>
      </div>

      <div className="bg-[#120820] border border-[rgba(245,230,66,0.15)] rounded-xl p-5 space-y-4">
        <h3 className="font-cinzel font-semibold text-white">Targeting</h3>
        <div>
          <label className="block text-xs font-medium text-[#A89BC2] mb-2">Target Countries</label>
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
            {ALL_COUNTRIES.map((c) => (
              <Toggle key={c} arr={form.targetCountries} val={c} onChange={(v) => set("targetCountries", v)} />
            ))}
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-[#A89BC2] mb-2">Target Niches</label>
          <div className="flex flex-wrap gap-2">
            {NICHES.map((n) => (
              <Toggle key={n} arr={form.targetNiches} val={n} onChange={(v) => set("targetNiches", v)} />
            ))}
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-[#A89BC2] mb-2">Platforms</label>
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.map((p) => (
              <Toggle key={p} arr={form.platforms} val={p} onChange={(v) => set("platforms", v)} />
            ))}
          </div>
        </div>
      </div>

      <div className="bg-[#120820] border border-[rgba(245,230,66,0.15)] rounded-xl p-5 space-y-4">
        <h3 className="font-cinzel font-semibold text-white">Budget & Timeline</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#A89BC2] mb-1.5">Budget</label>
            <div className="flex">
              <select
                value={form.budgetCurrency}
                onChange={(e) => set("budgetCurrency", e.target.value)}
                className="px-3 py-2 bg-[#1A0A2E] border border-[rgba(245,230,66,0.2)] border-r-0 rounded-l-lg text-sm text-white focus:outline-none"
              >
                {["USD", "SAR", "AED", "EGP", "GBP", "EUR"].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
              <input
                type="number"
                min="0"
                className={cn(INPUT_CLS, "rounded-l-none")}
                value={form.budget}
                onChange={(e) => set("budget", e.target.value)}
              />
            </div>
          </div>
          <div />
          <div>
            <label className="block text-xs font-medium text-[#A89BC2] mb-1.5">Start Date</label>
            <input type="date" className={INPUT_CLS} value={form.startDate} onChange={(e) => set("startDate", e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#A89BC2] mb-1.5">End Date</label>
            <input type="date" className={INPUT_CLS} value={form.endDate} onChange={(e) => set("endDate", e.target.value)} />
          </div>
        </div>
      </div>

      <div className="bg-[#120820] border border-[rgba(245,230,66,0.15)] rounded-xl p-5 space-y-4">
        <h3 className="font-cinzel font-semibold text-white">Client & Notes</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#A89BC2] mb-1.5">Contact Name</label>
            <input className={INPUT_CLS} value={form.clientContactName} onChange={(e) => set("clientContactName", e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#A89BC2] mb-1.5">Contact Email</label>
            <input type="email" className={INPUT_CLS} value={form.clientContactEmail} onChange={(e) => set("clientContactEmail", e.target.value)} />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-[#A89BC2] mb-1.5">Internal Notes</label>
          <textarea
            className={cn(INPUT_CLS, "h-24 resize-none")}
            value={form.internalNotes}
            onChange={(e) => set("internalNotes", e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center gap-3 pb-8">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2.5 bg-[#F5E642] text-[#0A0412] font-semibold rounded-lg hover:bg-[#F5E642]/90 hover:shadow-[0_0_15px_rgba(245,230,66,0.4)] disabled:opacity-50 transition-all"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
        {saved && (
          <span className="flex items-center gap-1.5 text-emerald-400 text-sm">
            <CheckCircle className="w-4 h-4" />
            Saved
          </span>
        )}
      </div>
    </div>
  )
}

export default function CampaignDashboardPage() {
  const { id } = useParams() as { id: string }
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>("overview")
  const [addCreatorState, setAddCreatorState] = useState<{
    open: boolean
    creator?: SimpleCreator
    recs?: string[]
  }>({ open: false })
  const [settings, setSettings] = useState({ serviceMarkup: 0.12, agencyCommission: 0.20 })
  const [liveUrls, setLiveUrls] = useState<Record<string, string>>({})

  const fetchCampaign = () => {
    return fetch(`/api/campaigns/${id}`)
      .then((r) => r.json())
      .then((c) => {
        setCampaign(c)
        const urls: Record<string, string> = {}
        if (c.creators) {
          c.creators.forEach((cc: CampaignCreator) => {
            urls[cc.creatorId] = cc.liveUrl || ""
          })
        }
        setLiveUrls(urls)
      })
  }

  useEffect(() => {
    Promise.all([
      fetchCampaign(),
      fetch("/api/settings").then((r) => r.json()).then((s) => setSettings({
        serviceMarkup: s.serviceMarkup ?? 0.12,
        agencyCommission: s.agencyCommission ?? 0.20,
      })),
    ]).finally(() => setLoading(false))
  }, [id])

  const handleStatusChange = async (status: string) => {
    await fetch(`/api/campaigns/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    fetchCampaign()
  }

  const handleCreatorStatusUpdate = async (creatorId: string, field: string, value: string) => {
    await fetch(`/api/campaigns/${id}/creators/${creatorId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    })
    fetchCampaign()
  }

  const handleRemoveCreator = async (creatorId: string) => {
    if (!confirm("Remove this creator from the campaign?")) return
    await fetch(`/api/campaigns/${id}/creators/${creatorId}`, { method: "DELETE" })
    fetchCampaign()
  }

  const exportLineupXLSX = async () => {
    if (!campaign) return
    const { utils, writeFile } = await import("xlsx")
    const rows = campaign.creators.map((cc) => ({
      Creator: cc.creator.name,
      Tier: cc.creator.tier,
      Country: cc.creator.country,
      Deliverables: cc.selectedDeliverables.map((d) => `${d.quantity}x ${d.type}`).join(", "),
      "Creator Rate": cc.totalCreatorRate,
      "Client Rate": cc.totalClientRate,
      "Commission": cc.totalCommission,
      "Confirmation": cc.confirmationStatus,
      "Content Status": cc.contentStatus,
      Deadline: cc.contentDeadline ? format(new Date(cc.contentDeadline), "MMM d, yyyy") : "",
      "Live URL": cc.liveUrl || "",
    }))
    const ws = utils.json_to_sheet(rows)
    const wb = utils.book_new()
    utils.book_append_sheet(wb, ws, "Creator Lineup")
    writeFile(wb, `${campaign.name.replace(/\s+/g, "_")}_Lineup.xlsx`)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (!campaign || ("error" in campaign && (campaign as Record<string, unknown>).error)) {
    return (
      <div className="text-center py-16">
        <p className="text-[#A89BC2] mb-4">Campaign not found.</p>
        <Link href="/campaigns" className="text-[#F5E642] hover:underline">
          ← Back to Campaigns
        </Link>
      </div>
    )
  }

  const totals = calcCampaignTotals(campaign.creators)
  const confirmedCount = campaign.creators.filter((c) => c.confirmationStatus === "CONFIRMED").length
  const alreadyAddedIds = new Set(campaign.creators.map((c) => c.creatorId))
  const budgetRemaining = campaign.budget - totals.totalClientRate
  const budgetUtilization = campaign.budget > 0 ? Math.round((totals.totalClientRate / campaign.budget) * 100) : 0

  const TABS: Array<{ key: Tab; label: string }> = [
    { key: "overview", label: "Overview" },
    { key: "lineup", label: "Creator Lineup" },
    { key: "matching", label: "AI Matching" },
    { key: "assistant", label: "Brief Assistant" },
    { key: "proposal", label: "Proposal" },
    { key: "edit", label: "Edit Campaign" },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <Link
          href="/campaigns"
          className="flex items-center gap-2 text-[#A89BC2] hover:text-white text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Campaigns
        </Link>
      </div>

      {/* Campaign header */}
      <div className="bg-[#120820] border border-[rgba(245,230,66,0.15)] rounded-xl p-5 mb-4 flex items-start gap-4">
        {campaign.brandLogoUrl ? (
          <img
            src={campaign.brandLogoUrl}
            alt={campaign.brandName}
            className="w-14 h-14 rounded-xl object-cover border border-[rgba(245,230,66,0.15)] flex-shrink-0"
          />
        ) : (
          <div className="w-14 h-14 rounded-xl bg-[#1A0A2E] border border-[rgba(245,230,66,0.15)] flex items-center justify-center flex-shrink-0">
            <span className="text-2xl font-bold text-[#A89BC2]">{campaign.brandName.charAt(0)}</span>
          </div>
        )}
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="font-cinzel font-bold text-xl text-white">{campaign.name}</h2>
            <StatusBadge status={campaign.status} />
          </div>
          <p className="text-[#A89BC2] text-sm mt-1">{campaign.brandName}</p>
          <p className="text-[#A89BC2] text-xs mt-1">
            {format(new Date(campaign.startDate), "MMM d, yyyy")} –{" "}
            {format(new Date(campaign.endDate), "MMM d, yyyy")}
          </p>
        </div>
        <select
          value={campaign.status}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="px-3 py-1.5 bg-[#1A0A2E] border border-[rgba(245,230,66,0.2)] rounded-lg text-sm text-white focus:outline-none"
        >
          {CAMPAIGN_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-5 gap-4 mb-4">
        <KPICard
          label="Total Creators"
          value={campaign.creators.length}
          sub={`${confirmedCount} confirmed`}
        />
        <KPICard
          label="Confirmed"
          value={confirmedCount}
          sub={`of ${campaign.creators.length}`}
          color="text-emerald-400"
        />
        <KPICard
          label="Client Investment"
          value={formatCurrency(totals.totalClientRate)}
          color="text-[#F5E642]"
        />
        <KPICard
          label="Lumos Revenue"
          value={formatCurrency(totals.totalCommission)}
          color="text-emerald-400"
        />
        <KPICard
          label="Budget Remaining"
          value={formatCurrency(budgetRemaining, campaign.budgetCurrency)}
          sub={`${budgetUtilization}% utilized`}
          color={budgetRemaining >= 0 ? "text-white" : "text-red-400"}
        />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[rgba(245,230,66,0.15)] mb-6 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "px-5 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-[1px] whitespace-nowrap",
              tab === t.key
                ? "border-[#F5E642] text-white"
                : "border-transparent text-[#A89BC2] hover:text-white"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {tab === "overview" && (
        <div className="space-y-6">
          <div className="bg-[#120820] border border-[rgba(245,230,66,0.15)] rounded-xl p-5">
            <h3 className="font-cinzel font-semibold text-sm text-[#A89BC2] uppercase tracking-wider mb-3">
              Campaign Brief
            </h3>
            <p className="text-[#A89BC2] text-sm leading-relaxed">{campaign.brief}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#120820] border border-[rgba(245,230,66,0.15)] rounded-xl p-5">
              <h3 className="font-cinzel font-semibold text-sm text-[#A89BC2] uppercase tracking-wider mb-3">
                Details
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#A89BC2]">Target Audience</span>
                  <span className="text-white text-right max-w-[60%]">{campaign.targetAudience}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#A89BC2]">Budget</span>
                  <span className="text-[#F5E642] font-mono">
                    {formatCurrency(campaign.budget, campaign.budgetCurrency)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#A89BC2]">Platforms</span>
                  <span className="text-white">{campaign.platforms.join(", ") || "—"}</span>
                </div>
              </div>
            </div>
            <div className="bg-[#120820] border border-[rgba(245,230,66,0.15)] rounded-xl p-5">
              <h3 className="font-cinzel font-semibold text-sm text-[#A89BC2] uppercase tracking-wider mb-3">
                Objectives
              </h3>
              <div className="flex flex-wrap gap-2">
                {campaign.objectives.map((obj) => (
                  <span
                    key={obj}
                    className="text-xs px-2.5 py-1 rounded bg-[rgba(123,47,190,0.2)] border border-[rgba(123,47,190,0.3)] text-[#A89BC2]"
                  >
                    {obj}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lineup Tab */}
      {tab === "lineup" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              {campaign.creators.length > 0 && (
                <button
                  onClick={exportLineupXLSX}
                  className="flex items-center gap-2 px-3 py-2 bg-[#120820] border border-[rgba(245,230,66,0.2)] text-[#A89BC2] text-sm rounded-lg hover:text-white hover:border-[rgba(245,230,66,0.4)] transition-colors"
                >
                  <FileDown className="w-4 h-4" />
                  Export XLSX
                </button>
              )}
            </div>
            <button
              onClick={() => setAddCreatorState({ open: true })}
              className="flex items-center gap-2 px-4 py-2 bg-[#F5E642] text-[#0A0412] text-sm font-semibold rounded-lg hover:bg-[#F5E642]/90 hover:shadow-[0_0_15px_rgba(245,230,66,0.4)] transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Creator
            </button>
          </div>

          {campaign.creators.length === 0 ? (
            <div className="text-center py-16 text-[#A89BC2]">
              <p className="text-lg font-cinzel font-semibold text-white mb-2">No creators yet</p>
              <p className="text-sm mb-4">Add creators to start building your campaign lineup.</p>
              <button
                onClick={() => setAddCreatorState({ open: true })}
                className="px-4 py-2 bg-[#F5E642] text-[#0A0412] text-sm font-semibold rounded-lg hover:bg-[#F5E642]/90 hover:shadow-[0_0_15px_rgba(245,230,66,0.4)] transition-all"
              >
                Add First Creator
              </button>
            </div>
          ) : (
            <div className="bg-[#120820] border border-[rgba(245,230,66,0.15)] rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[1200px]">
                  <thead>
                    <tr className="border-b border-[rgba(245,230,66,0.15)]">
                      {["Creator", "Deliverables", "Creator Rate", "Client Rate", "Commission", "Confirmation", "Content Status", "Deadline", "Live URL", ""].map(
                        (h) => (
                          <th
                            key={h}
                            className="text-left px-4 py-3 text-[11px] font-semibold text-[#F5E642] font-cinzel uppercase tracking-wider"
                          >
                            {h}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {campaign.creators.map((cc, i) => (
                      <tr
                        key={cc.id}
                        className={cn(
                          "border-b border-[rgba(245,230,66,0.1)] last:border-0 hover:bg-[rgba(245,230,66,0.04)]",
                          i % 2 === 0 ? "" : "bg-[#0A0412]"
                        )}
                      >
                        <td className="px-4 py-3">
                          <Link
                            href={`/creators/${cc.creatorId}`}
                            className="flex items-center gap-2 hover:opacity-80"
                          >
                            <img
                              src={cc.creator.profileImageUrl}
                              alt={cc.creator.name}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                            <div>
                              <p className="font-medium text-white text-sm" dir="auto">
                                {cc.creator.name}
                              </p>
                              <TierBadge tier={cc.creator.tier} />
                            </div>
                          </Link>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {cc.selectedDeliverables.slice(0, 2).map((d) => (
                              <span
                                key={d.type}
                                className="text-[10px] px-1.5 py-0.5 rounded bg-[rgba(123,47,190,0.2)] border border-[rgba(123,47,190,0.3)] text-[#A89BC2]"
                              >
                                {d.quantity}× {d.type}
                              </span>
                            ))}
                            {cc.selectedDeliverables.length > 2 && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[rgba(123,47,190,0.2)] border border-[rgba(123,47,190,0.3)] text-[#A89BC2]">
                                +{cc.selectedDeliverables.length - 2}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono text-white">
                          {formatCurrency(cc.totalCreatorRate)}
                        </td>
                        <td className="px-4 py-3 font-mono text-[#F5E642] font-semibold">
                          {formatCurrency(cc.totalClientRate)}
                        </td>
                        <td className="px-4 py-3 font-mono text-emerald-400">
                          {formatCurrency(cc.totalCommission)}
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={cc.confirmationStatus}
                            onChange={(e) =>
                              handleCreatorStatusUpdate(cc.creatorId, "confirmationStatus", e.target.value)
                            }
                            className="text-xs px-2 py-1 bg-[#1A0A2E] border border-[rgba(245,230,66,0.2)] rounded text-white focus:outline-none"
                          >
                            {CONFIRMATION_STATUSES.map((s) => (
                              <option key={s.value} value={s.value}>
                                {s.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={cc.contentStatus}
                            onChange={(e) =>
                              handleCreatorStatusUpdate(cc.creatorId, "contentStatus", e.target.value)
                            }
                            className="text-xs px-2 py-1 bg-[#1A0A2E] border border-[rgba(245,230,66,0.2)] rounded text-white focus:outline-none"
                          >
                            {CONTENT_STATUSES.map((s) => (
                              <option key={s.value} value={s.value}>
                                {s.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="date"
                            defaultValue={
                              cc.contentDeadline
                                ? format(new Date(cc.contentDeadline), "yyyy-MM-dd")
                                : ""
                            }
                            onChange={(e) =>
                              handleCreatorStatusUpdate(cc.creatorId, "contentDeadline", e.target.value)
                            }
                            className="text-xs px-2 py-1 bg-[#1A0A2E] border border-[rgba(245,230,66,0.2)] rounded text-white focus:outline-none w-32"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <input
                              type="url"
                              value={liveUrls[cc.creatorId] ?? ""}
                              onChange={(e) =>
                                setLiveUrls((prev) => ({ ...prev, [cc.creatorId]: e.target.value }))
                              }
                              onBlur={(e) => {
                                const val = e.target.value
                                if (val !== (cc.liveUrl || "")) {
                                  handleCreatorStatusUpdate(cc.creatorId, "liveUrl", val)
                                }
                              }}
                              placeholder="https://..."
                              className="text-xs px-2 py-1 bg-[#1A0A2E] border border-[rgba(245,230,66,0.2)] rounded text-white focus:outline-none w-36 placeholder:text-[#4A3F6B]"
                            />
                            {cc.liveUrl && (
                              <a
                                href={cc.liveUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#A89BC2] hover:text-[#F5E642] transition-colors"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleRemoveCreator(cc.creatorId)}
                            className="text-[#A89BC2] hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-[rgba(245,230,66,0.15)] bg-[#1A0A2E]">
                      <td className="px-4 py-3 font-semibold text-white text-xs uppercase tracking-wider font-cinzel" colSpan={2}>
                        Totals
                      </td>
                      <td className="px-4 py-3 font-mono font-semibold text-white">
                        {formatCurrency(totals.totalCreatorRate)}
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-[#F5E642]">
                        {formatCurrency(totals.totalClientRate)}
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-emerald-400">
                        {formatCurrency(totals.totalCommission)}
                      </td>
                      <td colSpan={5} />
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === "matching" && (
        <AIMatchingTab
          campaign={campaign}
          settings={settings}
          alreadyAddedIds={alreadyAddedIds}
          onAddCreator={(creator, recs) => setAddCreatorState({ open: true, creator, recs })}
        />
      )}

      {tab === "assistant" && <BriefAssistantTab campaign={campaign} />}

      {tab === "proposal" && <ProposalTab campaign={campaign} />}

      {tab === "edit" && (
        <EditCampaignTab
          campaign={campaign}
          onSaved={(updated) =>
            setCampaign((prev) =>
              prev ? { ...updated, creators: prev.creators } : prev
            )
          }
        />
      )}

      {addCreatorState.open && (
        <AddCreatorModal
          campaignId={id}
          settings={settings}
          initialCreator={addCreatorState.creator ?? null}
          initialRecommendedDeliverables={addCreatorState.recs ?? []}
          onAdd={() => {
            fetchCampaign()
            setAddCreatorState({ open: false })
          }}
          onClose={() => setAddCreatorState({ open: false })}
        />
      )}
    </div>
  )
}
