"use client"

import React, { useState, useRef } from "react"
import { Sparkles, Copy, CheckCircle, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

const GOALS = [
  "Brand Awareness",
  "Product Launch",
  "App Downloads",
  "Event Promotion",
  "Sales Conversion",
  "Community Growth",
  "Brand Sentiment",
  "Engagement",
]

const INPUT_CLS =
  "w-full px-3 py-2 bg-[#1A0A2E] border border-[rgba(245,230,66,0.2)] rounded-lg text-sm text-white placeholder:text-[#4A3F6B] focus:outline-none focus:border-[#F5E642] focus:shadow-[0_0_0_2px_rgba(245,230,66,0.08)] transition-colors"

export default function BriefGeneratorPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    brandName: "",
    product: "",
    goal: "",
    targetAudience: "",
    budget: "",
    keyMessage: "",
    restrictions: "",
  })
  const [brief, setBrief] = useState("")
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)
  const briefRef = useRef<HTMLDivElement>(null)

  const set = (key: keyof typeof form, val: string) =>
    setForm((p) => ({ ...p, [key]: val }))

  const handleGenerate = async () => {
    if (!form.brandName || !form.product || !form.goal) {
      setError("Please fill in Brand, Product/Service, and Goal.")
      return
    }
    setError("")
    setBrief("")
    setGenerating(true)

    try {
      const res = await fetch("/api/ai/generate-brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })

      if (!res.body) throw new Error("No stream")
      const reader = res.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        setBrief((prev) => prev + decoder.decode(value, { stream: true }))
        briefRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
      }
    } catch (e) {
      setError((e as Error).message || "Generation failed")
    } finally {
      setGenerating(false)
    }
  }

  const copyBrief = () => {
    navigator.clipboard.writeText(brief)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const useBrief = () => {
    const params = new URLSearchParams({
      briefText: brief.substring(0, 2000),
      brandName: form.brandName,
    })
    router.push(`/campaigns/new?${params}`)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Left: Input form */}
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-[#120820] border border-[rgba(245,230,66,0.15)] rounded-xl p-5 space-y-4">
          <h3 className="font-cinzel font-semibold text-white">Campaign Inputs</h3>

          <div>
            <label className="block text-xs font-medium text-[#A89BC2] mb-1.5">
              Brand Name <span className="text-[#F5E642]">*</span>
            </label>
            <input
              className={INPUT_CLS}
              placeholder="e.g. Nike KSA"
              value={form.brandName}
              onChange={(e) => set("brandName", e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#A89BC2] mb-1.5">
              Product / Service <span className="text-[#F5E642]">*</span>
            </label>
            <input
              className={INPUT_CLS}
              placeholder="e.g. Air Max 2025 running shoes"
              value={form.product}
              onChange={(e) => set("product", e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#A89BC2] mb-1.5">
              Campaign Goal <span className="text-[#F5E642]">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {GOALS.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => set("goal", g)}
                  className={cn(
                    "text-xs px-3 py-2 rounded border transition-colors text-left",
                    form.goal === g
                      ? "bg-[rgba(245,230,66,0.1)] border-[rgba(245,230,66,0.3)] text-[#F5E642]"
                      : "bg-[#1A0A2E] border-[rgba(245,230,66,0.1)] text-[#A89BC2] hover:text-white"
                  )}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#A89BC2] mb-1.5">Target Audience</label>
            <input
              className={INPUT_CLS}
              placeholder="e.g. Saudi males 18-34, fitness enthusiasts"
              value={form.targetAudience}
              onChange={(e) => set("targetAudience", e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#A89BC2] mb-1.5">Budget Range</label>
            <input
              className={INPUT_CLS}
              placeholder="e.g. $50,000 - $80,000"
              value={form.budget}
              onChange={(e) => set("budget", e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#A89BC2] mb-1.5">Key Message</label>
            <input
              className={INPUT_CLS}
              placeholder="The one thing we want people to remember"
              value={form.keyMessage}
              onChange={(e) => set("keyMessage", e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#A89BC2] mb-1.5">
              Restrictions / Must-Includes
            </label>
            <textarea
              className={cn(INPUT_CLS, "h-20 resize-none")}
              placeholder="Any brand restrictions, required hashtags, competitor blacklist, legal disclaimers..."
              value={form.restrictions}
              onChange={(e) => set("restrictions", e.target.value)}
            />
          </div>

          {error && (
            <p className="text-red-400 text-xs">{error}</p>
          )}

          <button
            onClick={handleGenerate}
            disabled={generating}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#F5E642] text-[#0A0412] font-semibold rounded-lg hover:bg-[#F5E642]/90 hover:shadow-[0_0_15px_rgba(245,230,66,0.4)] disabled:opacity-50 transition-all"
          >
            {generating ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating Brief...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Brief
              </>
            )}
          </button>
        </div>
      </div>

      {/* Right: Output */}
      <div className="lg:col-span-3">
        <div className="bg-[#120820] border border-[rgba(245,230,66,0.15)] rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-[rgba(245,230,66,0.15)]">
            <h3 className="font-cinzel font-semibold text-white">Generated Brief</h3>
            {brief && (
              <div className="flex items-center gap-2">
                <button
                  onClick={copyBrief}
                  className="flex items-center gap-1.5 text-xs text-[#A89BC2] hover:text-white transition-colors"
                >
                  {copied ? (
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  {copied ? "Copied!" : "Copy"}
                </button>
                <button
                  onClick={useBrief}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-[#F5E642] text-[#0A0412] font-semibold rounded-md hover:bg-[#F5E642]/90 hover:shadow-[0_0_15px_rgba(245,230,66,0.4)] transition-all"
                >
                  Use This Brief
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          <div className="p-5 min-h-[500px]">
            {!brief && !generating && (
              <div className="text-center py-16 text-[#A89BC2]">
                <Sparkles className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Fill in the form and click Generate to create a comprehensive campaign brief.</p>
              </div>
            )}
            {generating && !brief && (
              <div className="flex items-center gap-2 text-[#A89BC2] text-sm">
                <span className="w-4 h-4 border-2 border-[#A89BC2]/30 border-t-[#F5E642] rounded-full animate-spin" />
                Generating your brief...
              </div>
            )}
            {brief && (
              <div ref={briefRef} className="space-y-5">
                {(() => {
                  const blocks = brief.split(/^(#{1,2} .+)$/m).filter(Boolean)
                  const rendered: React.ReactNode[] = []
                  let i = 0
                  while (i < blocks.length) {
                    const block = blocks[i]
                    if (block.startsWith("## ")) {
                      rendered.push(
                        <div key={i} className="border-l-2 border-[#F5E642] pl-4 pt-1">
                          <h3 className="font-cinzel font-semibold text-white text-sm uppercase tracking-wider mb-2">
                            {block.replace(/^## /, "")}
                          </h3>
                          {blocks[i + 1] && !blocks[i + 1].startsWith("#") && (
                            <p className="text-[#A89BC2] text-sm leading-relaxed whitespace-pre-wrap">
                              {blocks[i + 1]}
                            </p>
                          )}
                        </div>
                      )
                      if (blocks[i + 1] && !blocks[i + 1].startsWith("#")) i += 2
                      else i += 1
                    } else if (block.startsWith("# ")) {
                      rendered.push(
                        <div key={i} className="mb-2">
                          <h2 className="font-cinzel font-bold text-white text-lg">
                            {block.replace(/^# /, "")}
                          </h2>
                        </div>
                      )
                      i++
                    } else {
                      rendered.push(
                        <p key={i} className="text-[#A89BC2] text-sm leading-relaxed whitespace-pre-wrap">
                          {block}
                        </p>
                      )
                      i++
                    }
                  }
                  return rendered
                })()}
                {generating && (
                  <span className="inline-block w-0.5 h-4 bg-[#F5E642] ml-0.5 animate-pulse" />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
