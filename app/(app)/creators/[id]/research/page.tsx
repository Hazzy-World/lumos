"use client"

import { useState, useEffect, useRef } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Play, RotateCcw, Download, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { Skeleton } from "@/components/shared/SkeletonCard"
import { cn } from "@/lib/utils"

type StepStatus = "idle" | "running" | "complete" | "error"

interface StepState {
  status: StepStatus
  output: string
  error?: string
}

interface Creator {
  id: string
  name: string
  nameAr?: string | null
  bio: string
  profileImageUrl: string
  country: string
  tier: string
  niches: string[]
  platforms: string[]
  language: string[]
  [key: string]: unknown
}

const STEPS = [
  {
    key: "1",
    title: "Audience & Tone Analysis",
    description: "Deep audience persona, content voice, cultural positioning, and brand safety assessment.",
    icon: "👥",
  },
  {
    key: "2",
    title: "Content Strategy Plan",
    description: "Content pillars, ideas, platform strategy, and trending formats.",
    icon: "📋",
  },
  {
    key: "3",
    title: "Brand Partnership Strategy",
    description: "Ideal brand categories, integration formats, messaging angles, and pricing strategy.",
    icon: "🤝",
  },
  {
    key: "4",
    title: "Moodboard & Creative Directions",
    description: "3 distinct creative directions with visual style, shot ideas, and color palettes.",
    icon: "🎨",
  },
  {
    key: "5",
    title: "Campaign Activation Ideas",
    description: "5 specific, executable campaign activation concepts with full production treatments.",
    icon: "🚀",
  },
]

function StepIcon({ status }: { status: StepStatus }) {
  if (status === "running") return <Loader2 className="w-4 h-4 text-[#F5E642] animate-spin" />
  if (status === "complete") return <CheckCircle className="w-4 h-4 text-emerald-400" />
  if (status === "error") return <AlertCircle className="w-4 h-4 text-red-400" />
  return null
}

function ContentPillarsDisplay({ data }: { data: { contentPillars?: Array<{ pillarName: string; description: string; contentRhythm: string; audienceResonanceReason: string; platforms: string[] }> } }) {
  if (!data.contentPillars) return null
  const COLORS = ["border-[#F5E642]", "border-[#7B2FBE]", "border-cyan-400", "border-emerald-500", "border-[#A89BC2]", "border-pink-500"]
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
      {data.contentPillars.map((pillar, i) => (
        <div key={pillar.pillarName} className={cn("bg-[#1A0A2E] border-l-4 rounded-r-lg p-4", COLORS[i % COLORS.length])}>
          <p className="font-cinzel font-semibold text-white mb-1">{pillar.pillarName}</p>
          <p className="text-[#A89BC2] text-xs mb-2">{pillar.description}</p>
          <p className="text-[10px] text-[#A89BC2]">
            <span className="text-[#F5E642]">Rhythm:</span> {pillar.contentRhythm}
          </p>
        </div>
      ))}
    </div>
  )
}

function MoodboardDisplay({ data }: {
  data: {
    creativeDirections?: Array<{
      directionName: string
      tagline: string
      conceptStatement: string
      visualStyle: {
        lighting: string
        colorPalette: string[]
        composition: string
        texture: string
        referenceAesthetic: string
      }
      shotIdeas: Array<{ sceneName: string; description: string; platform: string; format: string }>
      captionStyle: string
      hashtagApproach: string
      brandsThatFitThisDirection: string[]
    }>
  }
}) {
  if (!data.creativeDirections) return null
  return (
    <div className="space-y-8 mt-4">
      {data.creativeDirections.map((dir) => (
        <div key={dir.directionName} className="bg-[#120820] rounded-xl border border-[rgba(245,230,66,0.15)] overflow-hidden">
          <div className="p-5 border-b border-[rgba(245,230,66,0.1)]">
            <h4 className="font-cinzel font-bold text-2xl text-white mb-1">{dir.directionName}</h4>
            <p className="text-[#F5E642] italic text-sm mb-3">&ldquo;{dir.tagline}&rdquo;</p>
            <p className="text-[#A89BC2] text-sm leading-relaxed">{dir.conceptStatement}</p>
          </div>

          {dir.visualStyle.colorPalette?.length > 0 && (
            <div className="px-5 py-4 border-b border-[rgba(245,230,66,0.1)]">
              <p className="text-[10px] font-semibold text-[#A89BC2] uppercase tracking-wider mb-3">Color Palette</p>
              <div className="flex gap-4 flex-wrap">
                {dir.visualStyle.colorPalette.map((color, i) => {
                  const hex = color.split(" ")[0]
                  const name = color.split(" ").slice(1).join(" ")
                  return (
                    <div key={i} className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg border border-[rgba(245,230,66,0.1)] flex-shrink-0" style={{ backgroundColor: hex }} />
                      <div>
                        <p className="text-white text-[11px] font-mono">{hex}</p>
                        <p className="text-[#A89BC2] text-[9px]">{name}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <div className="px-5 py-4 border-b border-[rgba(245,230,66,0.1)] grid grid-cols-3 gap-4">
            <div>
              <p className="text-[10px] text-[#A89BC2] uppercase tracking-wider mb-1.5">Lighting</p>
              <p className="text-white text-xs leading-relaxed">{dir.visualStyle.lighting}</p>
            </div>
            <div>
              <p className="text-[10px] text-[#A89BC2] uppercase tracking-wider mb-1.5">Composition</p>
              <p className="text-white text-xs leading-relaxed">{dir.visualStyle.composition}</p>
            </div>
            <div>
              <p className="text-[10px] text-[#A89BC2] uppercase tracking-wider mb-1.5">Texture</p>
              <p className="text-white text-xs leading-relaxed">{dir.visualStyle.texture}</p>
            </div>
          </div>

          <div className="px-5 py-3 border-b border-[rgba(245,230,66,0.1)]">
            <p className="text-[10px] text-[#A89BC2] uppercase tracking-wider mb-1">Reference Aesthetic</p>
            <p className="text-[#A89BC2] text-xs italic leading-relaxed">{dir.visualStyle.referenceAesthetic}</p>
          </div>

          <div className="px-5 py-4 border-b border-[rgba(245,230,66,0.1)]">
            <p className="text-[10px] font-semibold text-[#A89BC2] uppercase tracking-wider mb-3">
              Shot Ideas <span className="normal-case text-[#A89BC2]/60">({dir.shotIdeas.length})</span>
            </p>
            <div className="space-y-2">
              {dir.shotIdeas.map((shot, i) => (
                <div key={shot.sceneName} className="flex gap-3 bg-[#1A0A2E] rounded-lg p-3 border border-[rgba(245,230,66,0.1)]">
                  <span className="text-[#A89BC2] text-xs font-mono pt-0.5 flex-shrink-0">{i + 1}.</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="text-white text-sm font-medium">{shot.sceneName}</p>
                      {shot.platform && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[rgba(123,47,190,0.2)] border border-[rgba(123,47,190,0.3)] text-[#A89BC2]">
                          {shot.platform}
                        </span>
                      )}
                      {shot.format && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[rgba(123,47,190,0.2)] border border-[rgba(123,47,190,0.3)] text-[#A89BC2]">
                          {shot.format}
                        </span>
                      )}
                    </div>
                    <p className="text-[#A89BC2] text-xs leading-relaxed">{shot.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="px-5 py-4 border-b border-[rgba(245,230,66,0.1)] grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] text-[#A89BC2] uppercase tracking-wider mb-1.5">Caption Style</p>
              <p className="text-[#A89BC2] text-xs leading-relaxed">{dir.captionStyle}</p>
            </div>
            <div>
              <p className="text-[10px] text-[#A89BC2] uppercase tracking-wider mb-1.5">Hashtag Approach</p>
              <p className="text-[#A89BC2] text-xs leading-relaxed">{dir.hashtagApproach}</p>
            </div>
          </div>

          {dir.brandsThatFitThisDirection?.length > 0 && (
            <div className="px-5 py-4">
              <p className="text-[10px] text-[#A89BC2] uppercase tracking-wider mb-2">Brands That Fit This Direction</p>
              <div className="flex flex-wrap gap-2">
                {dir.brandsThatFitThisDirection.map((brand) => (
                  <span key={brand} className="text-[10px] px-2.5 py-1 rounded bg-[rgba(123,47,190,0.2)] border border-[rgba(123,47,190,0.3)] text-[#A89BC2]">
                    {brand}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function ActivationsDisplay({ data }: {
  data: {
    campaignActivations?: Array<{
      ideaTitle: string
      format: string
      platform: string
      conceptBrief: string
      creativeAngle: string
      heroContentTreatment: string
      supportingContentPlan: Array<{ contentType: string; platform: string; purpose: string; timing: string }>
      kpis: string[]
      estimatedPerformance: string
      productionComplexity: string
      estimatedBudgetRange: string
    }>
  }
}) {
  const [expanded, setExpanded] = useState<Set<number>>(new Set())
  if (!data.campaignActivations) return null

  const toggle = (i: number) =>
    setExpanded((prev) => { const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n })

  return (
    <div className="space-y-6 mt-4">
      {data.campaignActivations.map((act, i) => (
        <div key={act.ideaTitle} className="bg-[#120820] rounded-xl border border-[rgba(245,230,66,0.15)] overflow-hidden">
          <div className="p-5 border-b border-[rgba(245,230,66,0.1)]">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <p className="text-[#A89BC2] text-xs mb-1">#{i + 1} · {act.platform} · {act.format}</p>
                <h4 className="font-cinzel font-semibold text-white text-lg">{act.ideaTitle}</h4>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={cn(
                  "text-[10px] px-2 py-1 rounded border font-medium",
                  act.productionComplexity === "Low"
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                    : act.productionComplexity === "Medium"
                    ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                    : "bg-red-500/10 border-red-500/30 text-red-400"
                )}>
                  {act.productionComplexity}
                </span>
                <span className="text-[#F5E642] text-xs font-mono">{act.estimatedBudgetRange}</span>
              </div>
            </div>
            <p className="text-[#A89BC2] text-sm leading-relaxed">{act.conceptBrief}</p>
          </div>

          <div className="px-5 py-4 bg-[rgba(245,230,66,0.04)] border-b border-[rgba(245,230,66,0.1)]">
            <p className="text-[10px] font-semibold text-[#F5E642] uppercase tracking-wider mb-1">Creative Angle</p>
            <p className="text-[#A89BC2] text-xs leading-relaxed">{act.creativeAngle}</p>
          </div>

          {act.heroContentTreatment && (
            <div className="border-b border-[rgba(245,230,66,0.1)]">
              <button
                onClick={() => toggle(i)}
                className="w-full flex items-center justify-between px-5 py-3 hover:bg-[rgba(245,230,66,0.04)] transition-colors text-left"
              >
                <p className="text-[10px] font-semibold text-[#A89BC2] uppercase tracking-wider">
                  Hero Content Treatment
                </p>
                <span className="text-[#A89BC2] text-[10px]">
                  {expanded.has(i) ? "▲ Collapse" : "▼ Expand"}
                </span>
              </button>
              {expanded.has(i) && (
                <div className="px-5 pb-4">
                  <p className="text-[#A89BC2] text-xs leading-relaxed whitespace-pre-wrap">
                    {act.heroContentTreatment}
                  </p>
                </div>
              )}
            </div>
          )}

          {act.supportingContentPlan?.length > 0 && (
            <div className="px-5 py-4 border-b border-[rgba(245,230,66,0.1)]">
              <p className="text-[10px] font-semibold text-[#A89BC2] uppercase tracking-wider mb-3">
                Supporting Content Plan
              </p>
              <div className="space-y-2.5">
                {act.supportingContentPlan.map((item, j) => (
                  <div key={j} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-[#F5E642] mt-1.5" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <span className="text-white text-xs font-medium">{item.contentType}</span>
                        <span className="text-[#A89BC2] text-[10px]">{item.platform}</span>
                        <span className="text-[#F5E642] text-[10px] ml-auto">{item.timing}</span>
                      </div>
                      <p className="text-[#A89BC2] text-[11px]">{item.purpose}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="px-5 py-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] font-semibold text-[#A89BC2] uppercase tracking-wider mb-2">KPIs</p>
              <div className="flex flex-wrap gap-1.5">
                {act.kpis?.map((kpi) => (
                  <span key={kpi} className="text-[10px] px-2 py-0.5 rounded bg-[rgba(123,47,190,0.15)] border border-[rgba(123,47,190,0.3)] text-[#A89BC2]">
                    {kpi}
                  </span>
                ))}
              </div>
            </div>
            {act.estimatedPerformance && (
              <div>
                <p className="text-[10px] font-semibold text-[#A89BC2] uppercase tracking-wider mb-2">
                  Estimated Performance
                </p>
                <p className="text-[#A89BC2] text-xs leading-relaxed">{act.estimatedPerformance}</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

function BrandStrategyDisplay({ data }: {
  data: {
    idealBrandCategories?: Array<{ category: string; fitScore: number; reasoning: string; exampleBrands: string[] }>
    integrationFormats?: Array<{ format: string; platforms: string[]; naturalFitReason: string; exampleBrief: string }>
    messagingAngles?: Array<{ angle: string; description: string; exampleCaption: string }>
    avoidCategories?: Array<{ category: string; reason: string }>
    pricingStrategy?: { currentRateAssessment: string; recommendedRateAdjustments: string; premiumOpportunities: string }
  }
}) {
  return (
    <div className="space-y-6 mt-4">
      {data.idealBrandCategories && data.idealBrandCategories.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold text-[#A89BC2] uppercase tracking-wider mb-3">Ideal Brand Categories</p>
          <div className="space-y-2">
            {data.idealBrandCategories.map((cat) => (
              <div key={cat.category} className="bg-[#1A0A2E] rounded-xl p-4 border border-[rgba(245,230,66,0.15)]">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-cinzel font-semibold text-white">{cat.category}</p>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-1.5 bg-[rgba(245,230,66,0.15)] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${cat.fitScore}%`,
                          backgroundColor: cat.fitScore >= 80 ? "#10B981" : cat.fitScore >= 60 ? "#F5E642" : "#6B7280",
                        }}
                      />
                    </div>
                    <span className={cn(
                      "text-sm font-bold font-mono",
                      cat.fitScore >= 80 ? "text-emerald-400" : cat.fitScore >= 60 ? "text-[#F5E642]" : "text-[#A89BC2]"
                    )}>{cat.fitScore}</span>
                  </div>
                </div>
                <p className="text-[#A89BC2] text-xs mb-2 leading-relaxed">{cat.reasoning}</p>
                <div className="flex flex-wrap gap-1.5">
                  {cat.exampleBrands.map((brand) => (
                    <span key={brand} className="text-[10px] px-2 py-0.5 rounded bg-[rgba(123,47,190,0.15)] border border-[rgba(123,47,190,0.3)] text-[#A89BC2]">
                      {brand}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.messagingAngles && data.messagingAngles.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold text-[#A89BC2] uppercase tracking-wider mb-3">Messaging Angles</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {data.messagingAngles.map((angle) => (
              <div key={angle.angle} className="bg-[#1A0A2E] rounded-xl p-4 border border-[rgba(245,230,66,0.15)]">
                <p className="font-cinzel font-semibold text-white mb-1">{angle.angle}</p>
                <p className="text-[#A89BC2] text-xs mb-3">{angle.description}</p>
                <div className="bg-[#120820] rounded-lg p-2 border border-[rgba(245,230,66,0.15)]">
                  <p className="text-[10px] text-[#F5E642] mb-1 uppercase tracking-wider">Example Caption</p>
                  <p className="text-[#A89BC2] text-xs italic">&ldquo;{angle.exampleCaption}&rdquo;</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.pricingStrategy && (
        <div className="bg-[rgba(245,230,66,0.04)] border border-[rgba(245,230,66,0.2)] rounded-xl p-4">
          <p className="text-[10px] font-semibold text-[#F5E642] uppercase tracking-wider mb-3">Pricing Strategy</p>
          <div className="space-y-3">
            <div>
              <p className="text-[10px] text-[#A89BC2] uppercase tracking-wider mb-1">Current Assessment</p>
              <p className="text-[#A89BC2] text-xs leading-relaxed">{data.pricingStrategy.currentRateAssessment}</p>
            </div>
            <div>
              <p className="text-[10px] text-[#A89BC2] uppercase tracking-wider mb-1">Recommended Adjustments</p>
              <p className="text-[#A89BC2] text-xs leading-relaxed">{data.pricingStrategy.recommendedRateAdjustments}</p>
            </div>
            <div>
              <p className="text-[10px] text-[#A89BC2] uppercase tracking-wider mb-1">Premium Opportunities</p>
              <p className="text-[#F5E642] text-xs leading-relaxed">{data.pricingStrategy.premiumOpportunities}</p>
            </div>
          </div>
        </div>
      )}

      {data.avoidCategories && data.avoidCategories.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold text-[#A89BC2] uppercase tracking-wider mb-3">Categories to Avoid</p>
          <div className="space-y-2">
            {data.avoidCategories.map((cat) => (
              <div key={cat.category} className="flex gap-3 items-start bg-red-500/5 border border-red-500/20 rounded-lg p-3">
                <span className="text-red-400 font-semibold text-sm whitespace-nowrap">{cat.category}</span>
                <span className="text-[#A89BC2] text-xs leading-relaxed">{cat.reason}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function StepOutput({ step, output }: { step: string; output: string }) {
  if (!output) return null

  let parsed: Record<string, unknown> | null = null
  if (step !== "1") {
    try {
      const cleaned = output.trim().replace(/^```json\n?/, "").replace(/\n?```$/, "")
      parsed = JSON.parse(cleaned)
    } catch {
      // fall through to raw display
    }
  }

  if (step === "1") {
    return (
      <div className="prose prose-invert prose-sm max-w-none text-[#A89BC2] leading-relaxed whitespace-pre-wrap mt-4">
        {output}
      </div>
    )
  }

  if (step === "2" && parsed) {
    return <ContentPillarsDisplay data={parsed as Parameters<typeof ContentPillarsDisplay>[0]["data"]} />
  }

  if (step === "3" && parsed) {
    return <BrandStrategyDisplay data={parsed as Parameters<typeof BrandStrategyDisplay>[0]["data"]} />
  }

  if (step === "4" && parsed) {
    return <MoodboardDisplay data={parsed as Parameters<typeof MoodboardDisplay>[0]["data"]} />
  }

  if (step === "5" && parsed) {
    return <ActivationsDisplay data={parsed as Parameters<typeof ActivationsDisplay>[0]["data"]} />
  }

  if (parsed) {
    return (
      <div className="bg-[#1A0A2E] rounded-xl p-4 mt-4 border border-[rgba(245,230,66,0.15)] overflow-x-auto">
        <pre className="text-[#A89BC2] text-xs whitespace-pre-wrap">
          {JSON.stringify(parsed, null, 2)}
        </pre>
      </div>
    )
  }

  return (
    <div className="prose prose-invert prose-sm max-w-none text-[#A89BC2] leading-relaxed whitespace-pre-wrap mt-4">
      {output}
    </div>
  )
}

export default function CreatorResearchPage() {
  const { id } = useParams() as { id: string }
  const [creator, setCreator] = useState<Creator | null>(null)
  const [loading, setLoading] = useState(true)
  const [steps, setSteps] = useState<Record<string, StepState>>(
    Object.fromEntries(STEPS.map((s) => [s.key, { status: "idle", output: "" }]))
  )
  const [runningAll, setRunningAll] = useState(false)
  const abortRefs = useRef<Record<string, AbortController>>({})

  useEffect(() => {
    fetch(`/api/creators/${id}`)
      .then((r) => r.json())
      .then((c) => {
        setCreator(c)
        if (c.research) {
          const research = c.research
          const updatedSteps: Record<string, StepState> = {}
          if (research.audiencePersona) updatedSteps["1"] = { status: "complete", output: research.audiencePersona }
          if (research.contentPillars) updatedSteps["2"] = { status: "complete", output: research.contentPillars }
          if (research.brandPartnershipStrategy) updatedSteps["3"] = { status: "complete", output: research.brandPartnershipStrategy }
          if (research.moodboardConcepts) updatedSteps["4"] = { status: "complete", output: research.moodboardConcepts }
          if (research.campaignActivations) updatedSteps["5"] = { status: "complete", output: research.campaignActivations }
          setSteps((prev) => ({ ...prev, ...updatedSteps }))
        }
      })
      .finally(() => setLoading(false))
  }, [id])

  const runStep = async (stepKey: string) => {
    if (!creator) return
    const previousResults: Record<string, string> = {}
    for (const s of STEPS) {
      if (s.key < stepKey && steps[s.key]?.output) {
        previousResults[s.key] = steps[s.key].output
      }
    }

    setSteps((prev) => ({ ...prev, [stepKey]: { status: "running", output: "" } }))
    abortRefs.current[stepKey] = new AbortController()

    try {
      const res = await fetch(`/api/ai/research/${stepKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ creator, previousResults }),
        signal: abortRefs.current[stepKey].signal,
      })

      if (!res.body) throw new Error("No stream")
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let output = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        output += decoder.decode(value, { stream: true })
        setSteps((prev) => ({ ...prev, [stepKey]: { status: "running", output } }))
      }

      setSteps((prev) => ({ ...prev, [stepKey]: { status: "complete", output } }))

      // Save to DB
      const fieldMap: Record<string, string> = {
        "1": "audiencePersona",
        "2": "contentPillars",
        "3": "brandPartnershipStrategy",
        "4": "moodboardConcepts",
        "5": "campaignActivations",
      }
      const field = fieldMap[stepKey]
      if (field) {
        await fetch(`/api/creators/${id}/research`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ [field]: output }),
        }).catch(() => {})
      }
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        setSteps((prev) => ({
          ...prev,
          [stepKey]: { status: "error", output: "", error: (e as Error).message },
        }))
      }
    }
  }

  const runAll = async () => {
    setRunningAll(true)
    for (const step of STEPS) {
      if (steps[step.key]?.status !== "complete") {
        await runStep(step.key)
      }
    }
    setRunningAll(false)
  }

  const exportPDF = async () => {
    if (!creator) return
    const jsPDF = (await import("jspdf")).default
    const doc = new jsPDF()
    const pw = doc.internal.pageSize.getWidth()
    const ph = doc.internal.pageSize.getHeight()
    const margin = 20
    const contentW = pw - margin * 2

    const addFooter = () => {
      doc.setFontSize(7)
      doc.setTextColor(180, 180, 180)
      doc.text("Lumos  |  Creator Intelligence Report  |  Confidential", pw / 2, ph - 8, { align: "center" })
    }

    const checkPage = (y: number, needed = 20) => {
      if (y + needed > ph - 15) { doc.addPage(); addFooter(); return margin }
      return y
    }

    const writeLines = (text: string, x: number, startY: number, maxW: number, lineH = 5): number => {
      const lines = doc.splitTextToSize(text, maxW)
      let y = startY
      for (const line of lines) {
        y = checkPage(y, lineH + 2)
        doc.text(line, x, y)
        y += lineH
      }
      return y
    }

    const sectionHeader = (title: string, y: number): number => {
      y = checkPage(y, 18)
      doc.setFillColor(200, 16, 46)
      doc.rect(margin, y, contentW, 10, "F")
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(10)
      doc.setFont("helvetica", "bold")
      doc.text(title, margin + 4, y + 7)
      return y + 16
    }

    const subHeader = (title: string, y: number): number => {
      y = checkPage(y, 12)
      doc.setFillColor(245, 246, 247)
      doc.rect(margin, y, contentW, 8, "F")
      doc.setTextColor(40, 40, 40)
      doc.setFontSize(8.5)
      doc.setFont("helvetica", "bold")
      doc.text(title, margin + 3, y + 5.5)
      return y + 12
    }

    const bodyText = (text: string, y: number, indent = 0): number => {
      doc.setTextColor(70, 70, 70)
      doc.setFontSize(8.5)
      doc.setFont("helvetica", "normal")
      return writeLines(text, margin + indent, y, contentW - indent) + 2
    }

    const label = (text: string, y: number): number => {
      doc.setTextColor(160, 160, 160)
      doc.setFontSize(7.5)
      doc.setFont("helvetica", "bold")
      doc.text(text.toUpperCase(), margin, y)
      return y + 5
    }

    const pill = (text: string, x: number, y: number): number => {
      const w = doc.getTextWidth(text) + 6
      doc.setFillColor(240, 240, 240)
      doc.roundedRect(x, y - 3.5, w, 6, 1, 1, "F")
      doc.setTextColor(80, 80, 80)
      doc.setFontSize(7.5)
      doc.setFont("helvetica", "normal")
      doc.text(text, x + 3, y + 0.5)
      return w + 4
    }

    // ── Cover Page ──────────────────────────────────────────────────────────────
    doc.setFillColor(15, 15, 15)
    doc.rect(0, 0, pw, ph, "F")

    doc.setFillColor(200, 16, 46)
    doc.rect(0, 0, pw, 70, "F")

    doc.setTextColor(255, 255, 255)
    doc.setFontSize(28)
    doc.setFont("helvetica", "bold")
    doc.text("FLAMENZI", margin, 32)
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(255, 200, 200)
    doc.text("Creator Intelligence Platform", margin, 44)
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(8)
    doc.text("CONFIDENTIAL", pw - margin, 44, { align: "right" })

    doc.setTextColor(255, 255, 255)
    doc.setFontSize(22)
    doc.setFont("helvetica", "bold")
    doc.text(creator.name, margin, 100)

    doc.setFontSize(11)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(200, 200, 200)
    doc.text("Creator Research & Strategy Report", margin, 114)

    doc.setFillColor(245, 166, 35)
    doc.rect(margin, 124, 60, 1, "F")

    doc.setFontSize(9)
    doc.setTextColor(180, 180, 180)
    doc.text(`${creator.tier} Creator  ·  ${creator.country}`, margin, 136)
    doc.text(creator.niches?.join("  ·  ") || "", margin, 148)

    const completedStepNames = STEPS.filter((s) => steps[s.key]?.status === "complete").map((s) => s.title)
    doc.setFontSize(8)
    doc.setTextColor(120, 120, 120)
    doc.text("SECTIONS INCLUDED", margin, 175)
    doc.setFillColor(245, 166, 35)
    doc.rect(margin, 178, 30, 0.5, "F")
    completedStepNames.forEach((name, i) => {
      doc.setTextColor(160, 160, 160)
      doc.setFontSize(8.5)
      doc.text(`${i + 1}.  ${name}`, margin + 4, 188 + i * 12)
    })

    doc.setTextColor(80, 80, 80)
    doc.setFontSize(7.5)
    doc.text(`Generated ${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}`, margin, ph - 16)
    doc.text("flamenzi.com", pw - margin, ph - 16, { align: "right" })

    // ── Content Pages ───────────────────────────────────────────────────────────
    const parseJSON = (raw: string): Record<string, unknown> | null => {
      try {
        return JSON.parse(raw.trim().replace(/^```json\n?/, "").replace(/\n?```$/, ""))
      } catch { return null }
    }

    for (const step of STEPS) {
      const state = steps[step.key]
      if (!state?.output) continue

      doc.addPage()
      addFooter()

      doc.setFillColor(248, 248, 248)
      doc.rect(0, 0, pw, ph, "F")

      let y = margin

      // Step header
      doc.setFillColor(15, 15, 15)
      doc.rect(0, 0, pw, 22, "F")
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(7)
      doc.setFont("helvetica", "normal")
      doc.text(`FLAMENZI  ·  ${creator.name.toUpperCase()}  ·  CREATOR INTELLIGENCE`, margin, 10)
      doc.setFontSize(11)
      doc.setFont("helvetica", "bold")
      doc.text(step.title, margin, 17)
      y = 32

      if (step.key === "1") {
        // Plain text with section parsing
        const text = state.output
        const sections = text.split(/^## /m).filter(Boolean)
        for (const section of sections) {
          const lines = section.split("\n")
          const heading = lines[0].trim()
          const body = lines.slice(1).join("\n").trim()
          if (heading) {
            y = sectionHeader(heading, y)
          }
          if (body) {
            y = bodyText(body, y)
            y += 4
          }
        }
        if (sections.length === 0) {
          y = bodyText(text, y)
        }
      } else if (step.key === "2") {
        const data = parseJSON(state.output) as { contentPillars?: Array<{ pillarName: string; description: string; contentRhythm: string; audienceResonanceReason: string; platforms: string[] }>; contentIdeas?: Array<{ pillar: string; title: string; platform: string; hook: string; estimatedEngagementPotential: string }> } | null
        if (data?.contentPillars) {
          y = sectionHeader("Content Pillars", y)
          for (const pillar of data.contentPillars) {
            y = checkPage(y, 30)
            doc.setFillColor(255, 255, 255)
            doc.roundedRect(margin, y, contentW, 28, 2, 2, "F")
            doc.setFillColor(200, 16, 46)
            doc.rect(margin, y, 3, 28, "F")
            doc.setTextColor(30, 30, 30)
            doc.setFontSize(9)
            doc.setFont("helvetica", "bold")
            doc.text(pillar.pillarName, margin + 7, y + 7)
            doc.setTextColor(100, 100, 100)
            doc.setFontSize(8)
            doc.setFont("helvetica", "normal")
            const descLines = doc.splitTextToSize(pillar.description, contentW - 12)
            doc.text(descLines.slice(0, 2), margin + 7, y + 14)
            doc.setTextColor(180, 100, 30)
            doc.text(`Rhythm: ${pillar.contentRhythm}`, margin + 7, y + 24)
            y += 32
          }
        }
        if (data?.contentIdeas) {
          y = checkPage(y, 20)
          y = sectionHeader(`Content Ideas (${data.contentIdeas.length})`, y)
          for (const idea of data.contentIdeas.slice(0, 12)) {
            y = checkPage(y, 18)
            doc.setFillColor(255, 255, 255)
            doc.roundedRect(margin, y, contentW, 14, 1, 1, "F")
            doc.setTextColor(30, 30, 30)
            doc.setFontSize(8.5)
            doc.setFont("helvetica", "bold")
            doc.text(idea.title, margin + 4, y + 6)
            doc.setTextColor(120, 120, 120)
            doc.setFontSize(7.5)
            doc.setFont("helvetica", "normal")
            doc.text(`${idea.platform}  ·  ${idea.estimatedEngagementPotential}`, margin + 4, y + 11)
            y += 17
          }
        }
      } else if (step.key === "3") {
        const data = parseJSON(state.output) as { idealBrandCategories?: Array<{ category: string; fitScore: number; reasoning: string; exampleBrands: string[] }>; pricingStrategy?: { currentRateAssessment: string; recommendedRateAdjustments: string; premiumOpportunities: string }; avoidCategories?: Array<{ category: string; reason: string }> } | null
        if (data?.idealBrandCategories) {
          y = sectionHeader("Ideal Brand Categories", y)
          for (const cat of data.idealBrandCategories) {
            y = checkPage(y, 26)
            doc.setFillColor(255, 255, 255)
            doc.roundedRect(margin, y, contentW, 24, 2, 2, "F")
            const barW = (contentW - 12) * 0.3
            const fillW = barW * (cat.fitScore / 100)
            const barX = pw - margin - barW - 4
            doc.setFillColor(230, 230, 230)
            doc.roundedRect(barX, y + 8, barW, 4, 1, 1, "F")
            const barColor = cat.fitScore >= 80 ? [16, 185, 129] as [number,number,number] : cat.fitScore >= 60 ? [245, 166, 35] as [number,number,number] : [160, 160, 160] as [number,number,number]
            doc.setFillColor(...barColor)
            doc.roundedRect(barX, y + 8, fillW, 4, 1, 1, "F")
            doc.setTextColor(30, 30, 30)
            doc.setFontSize(9)
            doc.setFont("helvetica", "bold")
            doc.text(cat.category, margin + 4, y + 8)
            doc.setFontSize(8.5)
            doc.text(`${cat.fitScore}`, barX + barW + 3, y + 12)
            doc.setTextColor(100, 100, 100)
            doc.setFontSize(7.5)
            doc.setFont("helvetica", "normal")
            const reasonLines = doc.splitTextToSize(cat.reasoning, contentW - barW - 16)
            doc.text(reasonLines.slice(0, 1), margin + 4, y + 15)
            doc.setTextColor(120, 120, 120)
            doc.text(cat.exampleBrands?.slice(0, 4).join("  ·  ") || "", margin + 4, y + 21)
            y += 27
          }
        }
        if (data?.pricingStrategy) {
          y = checkPage(y, 30)
          y = sectionHeader("Pricing Strategy", y)
          y = label("Current Assessment", y)
          y = bodyText(data.pricingStrategy.currentRateAssessment, y, 0) + 2
          y = label("Recommended Adjustments", y)
          y = bodyText(data.pricingStrategy.recommendedRateAdjustments, y, 0) + 2
          y = label("Premium Opportunities", y)
          y = bodyText(data.pricingStrategy.premiumOpportunities, y, 0) + 2
        }
        if (data?.avoidCategories?.length) {
          y = checkPage(y, 20)
          y = sectionHeader("Categories to Avoid", y)
          for (const cat of data.avoidCategories) {
            y = checkPage(y, 14)
            doc.setFillColor(255, 240, 240)
            doc.roundedRect(margin, y, contentW, 12, 1, 1, "F")
            doc.setTextColor(200, 16, 46)
            doc.setFontSize(8.5)
            doc.setFont("helvetica", "bold")
            doc.text(cat.category, margin + 4, y + 8)
            doc.setTextColor(100, 100, 100)
            doc.setFontSize(8)
            doc.setFont("helvetica", "normal")
            const reasonText = doc.splitTextToSize(cat.reason, contentW - 60)
            doc.text(reasonText[0] || "", margin + 50, y + 8)
            y += 14
          }
        }
      } else if (step.key === "4") {
        const data = parseJSON(state.output) as { creativeDirections?: Array<{ directionName: string; tagline: string; conceptStatement: string; visualStyle: { lighting: string; colorPalette: string[]; composition: string; texture: string; referenceAesthetic: string }; shotIdeas: Array<{ sceneName: string; description: string; platform: string; format: string }>; captionStyle: string; hashtagApproach: string; brandsThatFitThisDirection: string[] }> } | null
        if (data?.creativeDirections) {
          for (const dir of data.creativeDirections) {
            y = checkPage(y, 20)
            y = sectionHeader(`Direction: ${dir.directionName}`, y)

            doc.setFillColor(255, 255, 255)
            doc.roundedRect(margin, y, contentW, 18, 2, 2, "F")
            doc.setTextColor(180, 100, 30)
            doc.setFontSize(9)
            doc.setFont("helvetica", "italic")
            const taglines = doc.splitTextToSize(`"${dir.tagline}"`, contentW - 8)
            doc.text(taglines[0] || "", margin + 4, y + 7)
            doc.setTextColor(80, 80, 80)
            doc.setFontSize(8)
            doc.setFont("helvetica", "normal")
            const conceptLines = doc.splitTextToSize(dir.conceptStatement, contentW - 8)
            doc.text(conceptLines.slice(0, 1), margin + 4, y + 14)
            y += 22

            // Color palette
            y = checkPage(y, 14)
            y = label("Color Palette", y)
            let cx = margin
            for (const color of dir.visualStyle.colorPalette.slice(0, 6)) {
              const hex = color.split(" ")[0]
              try {
                const r = parseInt(hex.slice(1, 3), 16)
                const g = parseInt(hex.slice(3, 5), 16)
                const b = parseInt(hex.slice(5, 7), 16)
                doc.setFillColor(r, g, b)
                doc.roundedRect(cx, y, 14, 14, 2, 2, "F")
                doc.setTextColor(100, 100, 100)
                doc.setFontSize(6)
                doc.setFont("helvetica", "normal")
                doc.text(hex, cx, y + 19)
                cx += 20
              } catch {}
            }
            y += 24

            // Visual metadata
            y = checkPage(y, 28)
            const colW = contentW / 3
            for (const [i, [k, v]] of Object.entries({ Lighting: dir.visualStyle.lighting, Composition: dir.visualStyle.composition, Texture: dir.visualStyle.texture }).entries()) {
              const xOff = margin + i * colW
              doc.setTextColor(150, 150, 150)
              doc.setFontSize(7)
              doc.setFont("helvetica", "bold")
              doc.text(k.toUpperCase(), xOff, y)
              doc.setTextColor(60, 60, 60)
              doc.setFontSize(8)
              doc.setFont("helvetica", "normal")
              const vLines = doc.splitTextToSize(v, colW - 4)
              doc.text(vLines.slice(0, 2), xOff, y + 6)
            }
            y += 22

            // Shot ideas
            y = label(`Shot Ideas (${dir.shotIdeas.length})`, y)
            for (const shot of dir.shotIdeas.slice(0, 5)) {
              y = checkPage(y, 16)
              doc.setFillColor(252, 252, 252)
              doc.roundedRect(margin, y, contentW, 13, 1, 1, "F")
              doc.setTextColor(30, 30, 30)
              doc.setFontSize(8.5)
              doc.setFont("helvetica", "bold")
              doc.text(shot.sceneName, margin + 4, y + 6)
              doc.setTextColor(110, 110, 110)
              doc.setFontSize(7.5)
              doc.setFont("helvetica", "normal")
              const descLines = doc.splitTextToSize(shot.description, contentW - 8)
              doc.text(descLines.slice(0, 1), margin + 4, y + 11)
              y += 15
            }
            y += 6
          }
        }
      } else if (step.key === "5") {
        const data = parseJSON(state.output) as { campaignActivations?: Array<{ ideaTitle: string; platform: string; format: string; conceptBrief: string; creativeAngle: string; heroContentTreatment: string; kpis: string[]; estimatedPerformance: string; productionComplexity: string; estimatedBudgetRange: string }> } | null
        if (data?.campaignActivations) {
          for (const act of data.campaignActivations) {
            y = checkPage(y, 24)
            y = sectionHeader(`${act.ideaTitle}`, y)

            doc.setTextColor(110, 110, 110)
            doc.setFontSize(8)
            doc.setFont("helvetica", "normal")
            doc.text(`${act.platform}  ·  ${act.format}  ·  ${act.productionComplexity} complexity  ·  ${act.estimatedBudgetRange}`, margin, y)
            y += 8

            y = label("Concept", y)
            y = bodyText(act.conceptBrief, y, 0) + 2

            y = label("Creative Angle", y)
            y = bodyText(act.creativeAngle, y, 0) + 2

            if (act.heroContentTreatment) {
              y = label("Hero Content Treatment", y)
              y = bodyText(act.heroContentTreatment.substring(0, 600), y, 0) + 2
            }

            if (act.kpis?.length) {
              y = checkPage(y, 12)
              y = label("KPIs", y)
              let kx = margin
              for (const kpi of act.kpis.slice(0, 5)) {
                const kw = pill(kpi, kx, y)
                kx += kw
                if (kx > pw - margin - 30) { y += 8; kx = margin }
              }
              y += 10
            }

            if (act.estimatedPerformance) {
              y = label("Estimated Performance", y)
              y = bodyText(act.estimatedPerformance, y, 0) + 2
            }
            y += 6
          }
        }
      }
    }

    // Page numbers
    const total = doc.getNumberOfPages()
    for (let i = 2; i <= total; i++) {
      doc.setPage(i)
      doc.setFontSize(7)
      doc.setTextColor(180, 180, 180)
      doc.text(`${i - 1} / ${total - 1}`, pw - margin, ph - 8, { align: "right" })
    }

    doc.save(`${creator.name.replace(/\s+/g, "_")}_Research_Report.pdf`)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      </div>
    )
  }

  if (!creator) {
    return <div className="text-center py-16 text-[#A89BC2]">Creator not found.</div>
  }

  const completedCount = STEPS.filter((s) => steps[s.key]?.status === "complete").length

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <Link href={`/creators/${id}`} className="flex items-center gap-2 text-[#A89BC2] hover:text-white text-sm transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Profile
        </Link>
        <div className="flex items-center gap-2">
          {completedCount === STEPS.length && (
            <button
              onClick={exportPDF}
              className="flex items-center gap-2 px-4 py-2 bg-[#120820] border border-[rgba(245,230,66,0.2)] text-[#A89BC2] text-sm rounded-lg hover:text-white hover:border-[rgba(245,230,66,0.4)] transition-colors"
            >
              <Download className="w-4 h-4" />
              Download Full Research
            </button>
          )}
          <button
            onClick={runAll}
            disabled={runningAll}
            className="flex items-center gap-2 px-4 py-2 bg-[#F5E642] text-[#0A0412] text-sm font-semibold rounded-lg hover:bg-[#F5E642]/90 hover:shadow-[0_0_15px_rgba(245,230,66,0.4)] disabled:opacity-50 transition-all"
          >
            {runningAll ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            Run Full Research
          </button>
        </div>
      </div>

      {/* Creator header */}
      <div className="bg-[#120820] border border-[rgba(245,230,66,0.15)] rounded-xl p-5 mb-6 flex items-center gap-4">
        <img src={creator.profileImageUrl} alt={creator.name} className="w-16 h-16 rounded-full object-cover border border-[rgba(245,230,66,0.15)]" />
        <div>
          <h2 className="font-cinzel font-bold text-xl text-white" dir="auto">{creator.name}</h2>
          {creator.nameAr && <p className="text-[#A89BC2] text-sm" dir="rtl">{creator.nameAr}</p>}
          <p className="text-[#A89BC2] text-sm">{creator.country} · {creator.tier} · {creator.niches.join(", ")}</p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-[#A89BC2] text-xs mb-1">Progress</p>
          <p className="font-cinzel font-bold text-xl text-white">{completedCount}/{STEPS.length}</p>
          <div className="flex gap-1 mt-1">
            {STEPS.map((s) => (
              <div
                key={s.key}
                className={cn(
                  "w-5 h-1.5 rounded-full",
                  steps[s.key]?.status === "complete" ? "bg-[#F5E642]" :
                  steps[s.key]?.status === "running" ? "bg-[#F5E642]/60 animate-pulse" : "bg-[rgba(245,230,66,0.15)]"
                )}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-4">
        {STEPS.map((step, i) => {
          const state = steps[step.key]
          const isExpanded = state.status === "running" || state.status === "complete"

          return (
            <div
              key={step.key}
              className={cn(
                "bg-[#120820] border rounded-xl overflow-hidden transition-colors",
                state.status === "complete" ? "border-[rgba(245,230,66,0.15)]" :
                state.status === "running" ? "border-[rgba(245,230,66,0.4)]" :
                state.status === "error" ? "border-red-500/40" : "border-[rgba(245,230,66,0.15)]"
              )}
            >
              <div className="flex items-center gap-4 p-5">
                <div className="w-8 h-8 rounded-full bg-[#1A0A2E] border border-[rgba(245,230,66,0.15)] flex items-center justify-center flex-shrink-0">
                  <span className="text-sm">{step.icon}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-[#A89BC2] font-mono">Step {i + 1}</span>
                    <StepIcon status={state.status} />
                  </div>
                  <p className="font-cinzel font-semibold text-white">{step.title}</p>
                  <p className="text-[#A89BC2] text-xs mt-0.5">{step.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  {state.status === "complete" && (
                    <button
                      onClick={() => runStep(step.key)}
                      className="p-1.5 text-[#A89BC2] hover:text-white transition-colors"
                      title="Regenerate"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => runStep(step.key)}
                    disabled={state.status === "running"}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors",
                      state.status === "complete"
                        ? "bg-[#120820] border border-[rgba(245,230,66,0.2)] text-[#A89BC2] hover:text-white hover:border-[rgba(245,230,66,0.4)]"
                        : "bg-[#F5E642] text-[#0A0412] font-semibold hover:bg-[#F5E642]/90 hover:shadow-[0_0_15px_rgba(245,230,66,0.4)] disabled:opacity-50 transition-all"
                    )}
                  >
                    {state.status === "running" ? (
                      <><Loader2 className="w-3 h-3 animate-spin" /> Running</>
                    ) : state.status === "complete" ? (
                      "Regenerate"
                    ) : (
                      <><Play className="w-3 h-3" /> Run</>
                    )}
                  </button>
                </div>
              </div>

              {state.status === "error" && (
                <div className="px-5 pb-4 text-red-400 text-xs">{state.error || "Step failed. Please try again."}</div>
              )}

              {isExpanded && (
                <div className="border-t border-[rgba(245,230,66,0.15)] px-5 pb-5">
                  {state.status === "running" && !state.output && (
                    <div className="flex items-center gap-2 mt-4 text-[#A89BC2] text-sm">
                      <Loader2 className="w-4 h-4 animate-spin text-[#F5E642]" />
                      Generating...
                    </div>
                  )}
                  {state.output && (
                    <div className="relative">
                      <StepOutput step={step.key} output={state.output} />
                      {state.status === "running" && (
                        <span className="inline-block w-0.5 h-4 bg-[#F5E642] ml-0.5 animate-pulse" />
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
