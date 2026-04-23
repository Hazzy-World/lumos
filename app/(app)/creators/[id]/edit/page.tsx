"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, ChevronRight, ChevronLeft } from "lucide-react"
import { NICHES, PLATFORMS, TIERS, MENA_COUNTRIES, GLOBAL_COUNTRIES, DELIVERABLE_TYPES } from "@/lib/constants"
import {
  calcClientRate, calcCommission, formatCurrency,
  calcInstagramEngagement, calcTikTokEngagement, calcYouTubeEngagement,
  calcTwitchEngagement, calcTwitterEngagement, getEngagementLabel,
} from "@/lib/rate-utils"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/shared/SkeletonCard"

const STEPS = [
  "Basic Info",
  "Platform Stats",
  "Audience Data",
  "Rates",
  "Brand History",
  "Review",
]

interface FormData {
  name: string
  nameAr: string
  bio: string
  profileImageUrl: string
  country: string
  city: string
  language: string[]
  tier: string
  niches: string[]
  platforms: string[]
  exclusivityStatus: string
  managedByFlamenzi: boolean
  notes: string
  tags: string[]
  instagramHandle: string
  instagramFollowers: string
  instagramAvgLikes: string
  instagramAvgComments: string
  tiktokHandle: string
  tiktokFollowers: string
  tiktokAvgViews: string
  tiktokAvgLikes: string
  tiktokAvgComments: string
  tiktokAvgShares: string
  youtubeHandle: string
  youtubeSubscribers: string
  youtubeAvgViews: string
  twitterHandle: string
  twitterFollowers: string
  twitterAvgLikes: string
  twitterAvgRetweets: string
  snapchatHandle: string
  snapchatFollowers: string
  kickHandle: string
  kickFollowers: string
  kickAvgCCV: string
  twitchHandle: string
  twitchFollowers: string
  twitchAvgCCV: string
  audienceGenderMale: string
  audienceGenderFemale: string
  age1317: string
  age1824: string
  age2534: string
  age3544: string
  age45plus: string
  audienceCountry1: string
  audienceCountry1Pct: string
  audienceCountry2: string
  audienceCountry2Pct: string
  audienceCountry3: string
  audienceCountry3Pct: string
  audienceInterests: string[]
  rateInstagramPost: string
  rateInstagramStory: string
  rateInstagramReel: string
  rateTikTokVideo: string
  rateYouTubeIntegration: string
  rateYouTubeShort: string
  rateYouTubeDedicated: string
  rateSnapchatStory: string
  rateKickStream: string
  rateTwitchStream: string
  rateLiveEventAppearance: string
  rateUGCVideo: string
  pastBrandCollabs: string[]
  blacklistedBrands: string[]
}

const EMPTY: FormData = {
  name: "", nameAr: "", bio: "", profileImageUrl: "",
  country: "", city: "", language: [], tier: "MICRO", niches: [], platforms: [],
  exclusivityStatus: "NONE", managedByFlamenzi: false, notes: "", tags: [],
  instagramHandle: "", instagramFollowers: "", instagramAvgLikes: "", instagramAvgComments: "",
  tiktokHandle: "", tiktokFollowers: "", tiktokAvgViews: "", tiktokAvgLikes: "", tiktokAvgComments: "", tiktokAvgShares: "",
  youtubeHandle: "", youtubeSubscribers: "", youtubeAvgViews: "",
  twitterHandle: "", twitterFollowers: "", twitterAvgLikes: "", twitterAvgRetweets: "",
  snapchatHandle: "", snapchatFollowers: "",
  kickHandle: "", kickFollowers: "", kickAvgCCV: "",
  twitchHandle: "", twitchFollowers: "", twitchAvgCCV: "",
  audienceGenderMale: "50", audienceGenderFemale: "50",
  age1317: "10", age1824: "35", age2534: "35", age3544: "15", age45plus: "5",
  audienceCountry1: "", audienceCountry1Pct: "", audienceCountry2: "", audienceCountry2Pct: "",
  audienceCountry3: "", audienceCountry3Pct: "",
  audienceInterests: [],
  rateInstagramPost: "", rateInstagramStory: "", rateInstagramReel: "",
  rateTikTokVideo: "", rateYouTubeIntegration: "", rateYouTubeShort: "", rateYouTubeDedicated: "",
  rateSnapchatStory: "", rateKickStream: "", rateTwitchStream: "",
  rateLiveEventAppearance: "", rateUGCVideo: "",
  pastBrandCollabs: [], blacklistedBrands: [],
}

const INPUT_CLS = "w-full px-3 py-2 bg-[#1A0A2E] border border-[rgba(245,230,66,0.2)] rounded-lg text-sm text-white placeholder:text-[#4A3F6B] focus:outline-none focus:border-[#F5E642] focus:shadow-[0_0_0_2px_rgba(245,230,66,0.08)] transition-colors"

function Toggle({ arr, val, onChange }: { arr: string[]; val: string; onChange: (v: string[]) => void }) {
  const active = arr.includes(val)
  return (
    <button
      type="button"
      onClick={() => onChange(active ? arr.filter(x => x !== val) : [...arr, val])}
      className={cn(
        "text-xs px-2.5 py-1.5 rounded border transition-colors",
        active ? "bg-[rgba(245,230,66,0.1)] border-[rgba(245,230,66,0.3)] text-[#F5E642]" : "bg-[#1A0A2E] border-[rgba(245,230,66,0.1)] text-[#A89BC2] hover:text-white"
      )}
    >
      {val}
    </button>
  )
}

function TagInput({ tags, onChange, placeholder }: { tags: string[]; onChange: (v: string[]) => void; placeholder: string }) {
  const [input, setInput] = useState("")
  const add = () => {
    if (input.trim() && !tags.includes(input.trim())) {
      onChange([...tags, input.trim()])
      setInput("")
    }
  }
  return (
    <div>
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && (e.preventDefault(), add())}
          placeholder={placeholder}
          className={cn(INPUT_CLS, "flex-1")}
        />
        <button type="button" onClick={add} className="px-3 py-2 bg-[#1A0A2E] border border-[rgba(245,230,66,0.2)] rounded-lg text-[#A89BC2] hover:text-white text-sm">Add</button>
      </div>
      <div className="flex flex-wrap gap-2">
        {tags.map(tag => (
          <span key={tag} className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-[rgba(123,47,190,0.2)] border border-[rgba(123,47,190,0.4)] text-white">
            {tag}
            <button type="button" onClick={() => onChange(tags.filter(t => t !== tag))} className="text-[#A89BC2] hover:text-red-400 ml-1">×</button>
          </span>
        ))}
      </div>
    </div>
  )
}

function creatorToForm(c: Record<string, unknown>): FormData {
  const gender = (c.audienceGenderSplit as { male?: number; female?: number } | null) ?? {}
  const age = (c.audienceAgeBreakdown as Record<string, number> | null) ?? {}
  const countries = (c.audienceTopCountries as Array<{ country: string; percentage: number }> | null) ?? []

  return {
    name: String(c.name ?? ""),
    nameAr: String(c.nameAr ?? ""),
    bio: String(c.bio ?? ""),
    profileImageUrl: String(c.profileImageUrl ?? ""),
    country: String(c.country ?? ""),
    city: String(c.city ?? ""),
    language: Array.isArray(c.language) ? (c.language as string[]) : [],
    tier: String(c.tier ?? "MICRO"),
    niches: Array.isArray(c.niches) ? (c.niches as string[]) : [],
    platforms: Array.isArray(c.platforms) ? (c.platforms as string[]) : [],
    exclusivityStatus: String(c.exclusivityStatus ?? "NONE"),
    managedByFlamenzi: Boolean(c.managedByFlamenzi),
    notes: String(c.notes ?? ""),
    tags: Array.isArray(c.tags) ? (c.tags as string[]) : [],
    instagramHandle: String(c.instagramHandle ?? ""),
    instagramFollowers: c.instagramFollowers != null ? String(c.instagramFollowers) : "",
    instagramAvgLikes: c.instagramAvgLikes != null ? String(c.instagramAvgLikes) : "",
    instagramAvgComments: c.instagramAvgComments != null ? String(c.instagramAvgComments) : "",
    tiktokHandle: String(c.tiktokHandle ?? ""),
    tiktokFollowers: c.tiktokFollowers != null ? String(c.tiktokFollowers) : "",
    tiktokAvgViews: c.tiktokAvgViews != null ? String(c.tiktokAvgViews) : "",
    tiktokAvgLikes: c.tiktokAvgLikes != null ? String(c.tiktokAvgLikes) : "",
    tiktokAvgComments: c.tiktokAvgComments != null ? String(c.tiktokAvgComments) : "",
    tiktokAvgShares: c.tiktokAvgShares != null ? String(c.tiktokAvgShares) : "",
    youtubeHandle: String(c.youtubeHandle ?? ""),
    youtubeSubscribers: c.youtubeSubscribers != null ? String(c.youtubeSubscribers) : "",
    youtubeAvgViews: c.youtubeAvgViews != null ? String(c.youtubeAvgViews) : "",
    twitterHandle: String(c.twitterHandle ?? ""),
    twitterFollowers: c.twitterFollowers != null ? String(c.twitterFollowers) : "",
    twitterAvgLikes: c.twitterAvgLikes != null ? String(c.twitterAvgLikes) : "",
    twitterAvgRetweets: c.twitterAvgRetweets != null ? String(c.twitterAvgRetweets) : "",
    snapchatHandle: String(c.snapchatHandle ?? ""),
    snapchatFollowers: c.snapchatFollowers != null ? String(c.snapchatFollowers) : "",
    kickHandle: String(c.kickHandle ?? ""),
    kickFollowers: c.kickFollowers != null ? String(c.kickFollowers) : "",
    kickAvgCCV: c.kickAvgCCV != null ? String(c.kickAvgCCV) : "",
    twitchHandle: String(c.twitchHandle ?? ""),
    twitchFollowers: c.twitchFollowers != null ? String(c.twitchFollowers) : "",
    twitchAvgCCV: c.twitchAvgCCV != null ? String(c.twitchAvgCCV) : "",
    audienceGenderMale: String(gender.male ?? 50),
    audienceGenderFemale: String(gender.female ?? 50),
    age1317: String(age["13-17"] ?? 10),
    age1824: String(age["18-24"] ?? 35),
    age2534: String(age["25-34"] ?? 35),
    age3544: String(age["35-44"] ?? 15),
    age45plus: String(age["45+"] ?? 5),
    audienceCountry1: countries[0]?.country ?? "",
    audienceCountry1Pct: countries[0]?.percentage != null ? String(countries[0].percentage) : "",
    audienceCountry2: countries[1]?.country ?? "",
    audienceCountry2Pct: countries[1]?.percentage != null ? String(countries[1].percentage) : "",
    audienceCountry3: countries[2]?.country ?? "",
    audienceCountry3Pct: countries[2]?.percentage != null ? String(countries[2].percentage) : "",
    audienceInterests: Array.isArray(c.audienceInterests) ? (c.audienceInterests as string[]) : [],
    rateInstagramPost: c.rateInstagramPost != null ? String(c.rateInstagramPost) : "",
    rateInstagramStory: c.rateInstagramStory != null ? String(c.rateInstagramStory) : "",
    rateInstagramReel: c.rateInstagramReel != null ? String(c.rateInstagramReel) : "",
    rateTikTokVideo: c.rateTikTokVideo != null ? String(c.rateTikTokVideo) : "",
    rateYouTubeIntegration: c.rateYouTubeIntegration != null ? String(c.rateYouTubeIntegration) : "",
    rateYouTubeShort: c.rateYouTubeShort != null ? String(c.rateYouTubeShort) : "",
    rateYouTubeDedicated: c.rateYouTubeDedicated != null ? String(c.rateYouTubeDedicated) : "",
    rateSnapchatStory: c.rateSnapchatStory != null ? String(c.rateSnapchatStory) : "",
    rateKickStream: c.rateKickStream != null ? String(c.rateKickStream) : "",
    rateTwitchStream: c.rateTwitchStream != null ? String(c.rateTwitchStream) : "",
    rateLiveEventAppearance: c.rateLiveEventAppearance != null ? String(c.rateLiveEventAppearance) : "",
    rateUGCVideo: c.rateUGCVideo != null ? String(c.rateUGCVideo) : "",
    pastBrandCollabs: Array.isArray(c.pastBrandCollabs) ? (c.pastBrandCollabs as string[]) : [],
    blacklistedBrands: Array.isArray(c.blacklistedBrands) ? (c.blacklistedBrands as string[]) : [],
  }
}

function EngRateDisplay({ rate, formula }: { rate: number; formula: string }) {
  const { label, color } = getEngagementLabel(rate)
  if (rate === 0) return (
    <div className="col-span-full px-3 py-2 bg-[#0A0412] border border-[rgba(245,230,66,0.1)] rounded-lg">
      <span className="text-xs text-[#4A3F6B]">Engagement rate will appear once you fill the fields above</span>
    </div>
  )
  return (
    <div className="col-span-full flex items-center justify-between px-3 py-2 bg-[#0A0412] border border-[rgba(245,230,66,0.1)] rounded-lg">
      <div className="flex items-center gap-2">
        <span className="font-mono text-white font-semibold text-sm">{rate.toFixed(2)}%</span>
        <span className="text-xs font-medium" style={{ color }}>{label}</span>
      </div>
      <span className="text-[10px] text-[#4A3F6B] cursor-help" title={formula}>ℹ formula</span>
    </div>
  )
}

export default function EditCreatorPage() {
  const { id } = useParams() as { id: string }
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<FormData>(EMPTY)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState({ serviceMarkup: 0.12, agencyCommission: 0.20 })

  useEffect(() => {
    Promise.all([
      fetch(`/api/creators/${id}`).then(r => r.json()),
      fetch("/api/settings").then(r => r.json()),
    ]).then(([creator, s]) => {
      setForm(creatorToForm(creator))
      setSettings({ serviceMarkup: s.serviceMarkup ?? 0.12, agencyCommission: s.agencyCommission ?? 0.20 })
    }).finally(() => setLoading(false))
  }, [id])

  const set = <K extends keyof FormData>(key: K, val: FormData[K]) => setForm(p => ({ ...p, [key]: val }))

  const handleSubmit = async () => {
    setSaving(true)
    try {
      const payload = {
        name: form.name,
        nameAr: form.nameAr || null,
        bio: form.bio,
        profileImageUrl: form.profileImageUrl,
        country: form.country,
        city: form.city || null,
        language: form.language,
        tier: form.tier,
        niches: form.niches,
        platforms: form.platforms,
        exclusivityStatus: form.exclusivityStatus,
        managedByFlamenzi: form.managedByFlamenzi,
        notes: form.notes || null,
        tags: form.tags,
        instagramHandle: form.instagramHandle || null,
        instagramFollowers: form.instagramFollowers ? parseInt(form.instagramFollowers) : null,
        instagramAvgLikes: form.instagramAvgLikes ? parseInt(form.instagramAvgLikes) : null,
        instagramAvgComments: form.instagramAvgComments ? parseInt(form.instagramAvgComments) : null,
        tiktokHandle: form.tiktokHandle || null,
        tiktokFollowers: form.tiktokFollowers ? parseInt(form.tiktokFollowers) : null,
        tiktokAvgViews: form.tiktokAvgViews ? parseInt(form.tiktokAvgViews) : null,
        tiktokAvgLikes: form.tiktokAvgLikes ? parseInt(form.tiktokAvgLikes) : null,
        tiktokAvgComments: form.tiktokAvgComments ? parseInt(form.tiktokAvgComments) : null,
        tiktokAvgShares: form.tiktokAvgShares ? parseInt(form.tiktokAvgShares) : null,
        youtubeHandle: form.youtubeHandle || null,
        youtubeSubscribers: form.youtubeSubscribers ? parseInt(form.youtubeSubscribers) : null,
        youtubeAvgViews: form.youtubeAvgViews ? parseInt(form.youtubeAvgViews) : null,
        twitterHandle: form.twitterHandle || null,
        twitterFollowers: form.twitterFollowers ? parseInt(form.twitterFollowers) : null,
        twitterAvgLikes: form.twitterAvgLikes ? parseInt(form.twitterAvgLikes) : null,
        twitterAvgRetweets: form.twitterAvgRetweets ? parseInt(form.twitterAvgRetweets) : null,
        snapchatHandle: form.snapchatHandle || null,
        snapchatFollowers: form.snapchatFollowers ? parseInt(form.snapchatFollowers) : null,
        kickHandle: form.kickHandle || null,
        kickFollowers: form.kickFollowers ? parseInt(form.kickFollowers) : null,
        kickAvgCCV: form.kickAvgCCV ? parseInt(form.kickAvgCCV) : null,
        twitchHandle: form.twitchHandle || null,
        twitchFollowers: form.twitchFollowers ? parseInt(form.twitchFollowers) : null,
        twitchAvgCCV: form.twitchAvgCCV ? parseInt(form.twitchAvgCCV) : null,
        audienceGenderSplit: { male: parseInt(form.audienceGenderMale), female: parseInt(form.audienceGenderFemale) },
        audienceAgeBreakdown: { "13-17": parseInt(form.age1317), "18-24": parseInt(form.age1824), "25-34": parseInt(form.age2534), "35-44": parseInt(form.age3544), "45+": parseInt(form.age45plus) },
        audienceTopCountries: [
          form.audienceCountry1 && { country: form.audienceCountry1, percentage: parseInt(form.audienceCountry1Pct) },
          form.audienceCountry2 && { country: form.audienceCountry2, percentage: parseInt(form.audienceCountry2Pct) },
          form.audienceCountry3 && { country: form.audienceCountry3, percentage: parseInt(form.audienceCountry3Pct) },
        ].filter(Boolean),
        audienceInterests: form.audienceInterests,
        rateInstagramPost: form.rateInstagramPost ? parseFloat(form.rateInstagramPost) : null,
        rateInstagramStory: form.rateInstagramStory ? parseFloat(form.rateInstagramStory) : null,
        rateInstagramReel: form.rateInstagramReel ? parseFloat(form.rateInstagramReel) : null,
        rateTikTokVideo: form.rateTikTokVideo ? parseFloat(form.rateTikTokVideo) : null,
        rateYouTubeIntegration: form.rateYouTubeIntegration ? parseFloat(form.rateYouTubeIntegration) : null,
        rateYouTubeShort: form.rateYouTubeShort ? parseFloat(form.rateYouTubeShort) : null,
        rateYouTubeDedicated: form.rateYouTubeDedicated ? parseFloat(form.rateYouTubeDedicated) : null,
        rateSnapchatStory: form.rateSnapchatStory ? parseFloat(form.rateSnapchatStory) : null,
        rateKickStream: form.rateKickStream ? parseFloat(form.rateKickStream) : null,
        rateTwitchStream: form.rateTwitchStream ? parseFloat(form.rateTwitchStream) : null,
        rateLiveEventAppearance: form.rateLiveEventAppearance ? parseFloat(form.rateLiveEventAppearance) : null,
        rateUGCVideo: form.rateUGCVideo ? parseFloat(form.rateUGCVideo) : null,
        pastBrandCollabs: form.pastBrandCollabs,
        blacklistedBrands: form.blacklistedBrands,
      }
      const res = await fetch(`/api/creators/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        router.push(`/creators/${id}`)
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-3xl space-y-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    )
  }

  const ACTIVE_PLATFORMS = form.platforms

  return (
    <div className="max-w-3xl">
      <Link href={`/creators/${id}`} className="flex items-center gap-2 text-[#A89BC2] hover:text-white text-sm mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Profile
      </Link>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => i < step && setStep(i)}
              className={cn(
                "flex items-center gap-2 text-sm font-medium transition-colors",
                i === step ? "text-white" : i < step ? "text-[#F5E642] cursor-pointer hover:underline" : "text-[#4A3F6B] cursor-default"
              )}
            >
              <span className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0",
                i === step ? "bg-[#F5E642] text-[#0A0412] shadow-[0_0_10px_rgba(245,230,66,0.5)]" : i < step ? "bg-[#7B2FBE] text-white" : "bg-[#1A0A2E] border border-[rgba(245,230,66,0.15)] text-[#4A3F6B]"
              )}>
                {i < step ? "✓" : i + 1}
              </span>
              {s}
            </button>
            {i < STEPS.length - 1 && <ChevronRight className="w-3 h-3 text-[rgba(245,230,66,0.2)] flex-shrink-0" />}
          </div>
        ))}
      </div>

      {/* Step 1: Basic Info */}
      {step === 0 && (
        <div className="bg-[#120820] border border-[rgba(245,230,66,0.15)] rounded-xl p-5 space-y-4">
          <h3 className="font-cinzel font-semibold text-white">Basic Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#A89BC2] mb-1.5">Full Name / Handle <span className="text-[#F5E642]">*</span></label>
              <input className={INPUT_CLS} placeholder="Ahmed Al-Rashidi" value={form.name} onChange={e => set("name", e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#A89BC2] mb-1.5">Arabic Name (optional)</label>
              <input className={INPUT_CLS} placeholder="أحمد الراشدي" value={form.nameAr} onChange={e => set("nameAr", e.target.value)} dir="rtl" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-[#A89BC2] mb-1.5">Bio</label>
              <textarea className={cn(INPUT_CLS, "h-24 resize-none")} placeholder="Creator bio..." value={form.bio} onChange={e => set("bio", e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#A89BC2] mb-1.5">Profile Image URL</label>
              <input className={INPUT_CLS} placeholder="https://..." value={form.profileImageUrl} onChange={e => set("profileImageUrl", e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#A89BC2] mb-1.5">Country <span className="text-[#F5E642]">*</span></label>
              <select className={INPUT_CLS} value={form.country} onChange={e => set("country", e.target.value)}>
                <option value="">Select country...</option>
                <optgroup label="MENA">
                  {MENA_COUNTRIES.map(c => <option key={c}>{c}</option>)}
                </optgroup>
                <optgroup label="Global">
                  {GLOBAL_COUNTRIES.map(c => <option key={c}>{c}</option>)}
                </optgroup>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#A89BC2] mb-1.5">City</label>
              <input className={INPUT_CLS} placeholder="Riyadh" value={form.city} onChange={e => set("city", e.target.value)} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#A89BC2] mb-2">Tier</label>
            <div className="flex gap-2 flex-wrap">
              {TIERS.map(t => (
                <button key={t.value} type="button" onClick={() => set("tier", t.value)}
                  className={cn("text-xs px-3 py-1.5 rounded border transition-colors",
                    form.tier === t.value ? "bg-[rgba(245,230,66,0.1)] border-[rgba(245,230,66,0.3)] text-[#F5E642]" : "bg-[#1A0A2E] border-[rgba(245,230,66,0.1)] text-[#A89BC2] hover:text-white")}>
                  {t.label} ({t.range})
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#A89BC2] mb-2">Niches</label>
            <div className="flex flex-wrap gap-2">{NICHES.map(n => <Toggle key={n} arr={form.niches} val={n} onChange={v => set("niches", v)} />)}</div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#A89BC2] mb-2">Active Platforms</label>
            <div className="flex flex-wrap gap-2">{PLATFORMS.map(p => <Toggle key={p} arr={form.platforms} val={p} onChange={v => set("platforms", v)} />)}</div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#A89BC2] mb-2">Languages</label>
            <div className="flex flex-wrap gap-2">
              {["Arabic", "English", "French", "Turkish", "Hindi", "Urdu"].map(l => <Toggle key={l} arr={form.language} val={l} onChange={v => set("language", v)} />)}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#A89BC2] mb-1.5">Exclusivity</label>
              <select className={INPUT_CLS} value={form.exclusivityStatus} onChange={e => set("exclusivityStatus", e.target.value)}>
                <option value="NONE">None</option>
                <option value="SOFT">Soft Exclusivity</option>
                <option value="EXCLUSIVE">Exclusive</option>
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.managedByFlamenzi} onChange={e => set("managedByFlamenzi", e.target.checked)} className="accent-[#F5E642] w-4 h-4" />
                <span className="text-sm text-[#A89BC2]">Managed by Lumos</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#A89BC2] mb-2">Tags</label>
            <TagInput tags={form.tags} onChange={v => set("tags", v)} placeholder="Add tag..." />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#A89BC2] mb-1.5">Internal Notes</label>
            <textarea className={cn(INPUT_CLS, "h-20 resize-none")} value={form.notes} onChange={e => set("notes", e.target.value)} placeholder="Notes visible only to Lumos team..." />
          </div>
        </div>
      )}

      {/* Step 2: Platform Stats */}
      {step === 1 && (
        <div className="bg-[#120820] border border-[rgba(245,230,66,0.15)] rounded-xl p-5 space-y-5">
          <h3 className="font-cinzel font-semibold text-white">Platform Statistics</h3>
          <p className="text-[#A89BC2] text-xs">Showing stats for selected platforms only. Engagement rates are calculated automatically.</p>

          {ACTIVE_PLATFORMS.includes("Instagram") && (
            <div>
              <p className="text-sm font-semibold text-white mb-3">📸 Instagram</p>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-[#A89BC2] mb-1 block">Handle</label><input className={INPUT_CLS} placeholder="username" value={form.instagramHandle} onChange={e => set("instagramHandle", e.target.value)} /></div>
                <div><label className="text-xs text-[#A89BC2] mb-1 block">Followers</label><input type="number" className={INPUT_CLS} value={form.instagramFollowers} onChange={e => set("instagramFollowers", e.target.value)} /></div>
                <div><label className="text-xs text-[#A89BC2] mb-1 block">Avg Likes / post</label><input type="number" className={INPUT_CLS} value={form.instagramAvgLikes} onChange={e => set("instagramAvgLikes", e.target.value)} /></div>
                <div><label className="text-xs text-[#A89BC2] mb-1 block">Avg Comments / post</label><input type="number" className={INPUT_CLS} value={form.instagramAvgComments} onChange={e => set("instagramAvgComments", e.target.value)} /></div>
                <EngRateDisplay rate={calcInstagramEngagement(parseInt(form.instagramFollowers)||0, parseInt(form.instagramAvgLikes)||0, parseInt(form.instagramAvgComments)||0)} formula="(Avg Likes + Avg Comments) / Followers × 100" />
              </div>
            </div>
          )}
          {ACTIVE_PLATFORMS.includes("TikTok") && (
            <div>
              <p className="text-sm font-semibold text-white mb-3">🎵 TikTok</p>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-[#A89BC2] mb-1 block">Handle</label><input className={INPUT_CLS} value={form.tiktokHandle} onChange={e => set("tiktokHandle", e.target.value)} /></div>
                <div><label className="text-xs text-[#A89BC2] mb-1 block">Followers</label><input type="number" className={INPUT_CLS} value={form.tiktokFollowers} onChange={e => set("tiktokFollowers", e.target.value)} /></div>
                <div><label className="text-xs text-[#A89BC2] mb-1 block">Avg Views / video</label><input type="number" className={INPUT_CLS} value={form.tiktokAvgViews} onChange={e => set("tiktokAvgViews", e.target.value)} /></div>
                <div><label className="text-xs text-[#A89BC2] mb-1 block">Avg Likes / video</label><input type="number" className={INPUT_CLS} value={form.tiktokAvgLikes} onChange={e => set("tiktokAvgLikes", e.target.value)} /></div>
                <div><label className="text-xs text-[#A89BC2] mb-1 block">Avg Comments / video</label><input type="number" className={INPUT_CLS} value={form.tiktokAvgComments} onChange={e => set("tiktokAvgComments", e.target.value)} /></div>
                <div><label className="text-xs text-[#A89BC2] mb-1 block">Avg Shares / video</label><input type="number" className={INPUT_CLS} value={form.tiktokAvgShares} onChange={e => set("tiktokAvgShares", e.target.value)} /></div>
                <EngRateDisplay rate={calcTikTokEngagement(parseInt(form.tiktokFollowers)||0, parseInt(form.tiktokAvgLikes)||0, parseInt(form.tiktokAvgComments)||0, parseInt(form.tiktokAvgShares)||0)} formula="(Avg Likes + Comments + Shares) / Followers × 100" />
              </div>
            </div>
          )}
          {ACTIVE_PLATFORMS.includes("YouTube") && (
            <div>
              <p className="text-sm font-semibold text-white mb-3">▶️ YouTube</p>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-[#A89BC2] mb-1 block">Handle</label><input className={INPUT_CLS} value={form.youtubeHandle} onChange={e => set("youtubeHandle", e.target.value)} /></div>
                <div><label className="text-xs text-[#A89BC2] mb-1 block">Subscribers</label><input type="number" className={INPUT_CLS} value={form.youtubeSubscribers} onChange={e => set("youtubeSubscribers", e.target.value)} /></div>
                <div><label className="text-xs text-[#A89BC2] mb-1 block">Avg Views / video</label><input type="number" className={INPUT_CLS} value={form.youtubeAvgViews} onChange={e => set("youtubeAvgViews", e.target.value)} /></div>
                <EngRateDisplay rate={calcYouTubeEngagement(parseInt(form.youtubeSubscribers)||0, parseInt(form.youtubeAvgViews)||0)} formula="Avg Views / Subscribers × 100 (View Rate)" />
              </div>
            </div>
          )}
          {ACTIVE_PLATFORMS.includes("Twitter/X") && (
            <div>
              <p className="text-sm font-semibold text-white mb-3">𝕏 Twitter/X</p>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-[#A89BC2] mb-1 block">Handle</label><input className={INPUT_CLS} value={form.twitterHandle} onChange={e => set("twitterHandle", e.target.value)} /></div>
                <div><label className="text-xs text-[#A89BC2] mb-1 block">Followers</label><input type="number" className={INPUT_CLS} value={form.twitterFollowers} onChange={e => set("twitterFollowers", e.target.value)} /></div>
                <div><label className="text-xs text-[#A89BC2] mb-1 block">Avg Likes / tweet</label><input type="number" className={INPUT_CLS} value={form.twitterAvgLikes} onChange={e => set("twitterAvgLikes", e.target.value)} /></div>
                <div><label className="text-xs text-[#A89BC2] mb-1 block">Avg Retweets / tweet</label><input type="number" className={INPUT_CLS} value={form.twitterAvgRetweets} onChange={e => set("twitterAvgRetweets", e.target.value)} /></div>
                <EngRateDisplay rate={calcTwitterEngagement(parseInt(form.twitterFollowers)||0, parseInt(form.twitterAvgLikes)||0, parseInt(form.twitterAvgRetweets)||0)} formula="(Avg Likes + Retweets) / Followers × 100" />
              </div>
            </div>
          )}
          {ACTIVE_PLATFORMS.includes("Snapchat") && (
            <div>
              <p className="text-sm font-semibold text-white mb-3">👻 Snapchat</p>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-[#A89BC2] mb-1 block">Handle</label><input className={INPUT_CLS} value={form.snapchatHandle} onChange={e => set("snapchatHandle", e.target.value)} /></div>
                <div><label className="text-xs text-[#A89BC2] mb-1 block">Followers</label><input type="number" className={INPUT_CLS} value={form.snapchatFollowers} onChange={e => set("snapchatFollowers", e.target.value)} /></div>
              </div>
            </div>
          )}
          {ACTIVE_PLATFORMS.includes("Kick") && (
            <div>
              <p className="text-sm font-semibold text-white mb-3">🟢 Kick</p>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-[#A89BC2] mb-1 block">Handle</label><input className={INPUT_CLS} value={form.kickHandle} onChange={e => set("kickHandle", e.target.value)} /></div>
                <div><label className="text-xs text-[#A89BC2] mb-1 block">Followers</label><input type="number" className={INPUT_CLS} value={form.kickFollowers} onChange={e => set("kickFollowers", e.target.value)} /></div>
                <div><label className="text-xs text-[#A89BC2] mb-1 block">Avg CCV</label><input type="number" className={INPUT_CLS} value={form.kickAvgCCV} onChange={e => set("kickAvgCCV", e.target.value)} /></div>
                <EngRateDisplay rate={calcTwitchEngagement(parseInt(form.kickFollowers)||0, parseInt(form.kickAvgCCV)||0)} formula="Avg CCV / Followers × 100 (Viewer Rate)" />
              </div>
            </div>
          )}
          {ACTIVE_PLATFORMS.includes("Twitch") && (
            <div>
              <p className="text-sm font-semibold text-white mb-3">💜 Twitch</p>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-[#A89BC2] mb-1 block">Handle</label><input className={INPUT_CLS} value={form.twitchHandle} onChange={e => set("twitchHandle", e.target.value)} /></div>
                <div><label className="text-xs text-[#A89BC2] mb-1 block">Followers</label><input type="number" className={INPUT_CLS} value={form.twitchFollowers} onChange={e => set("twitchFollowers", e.target.value)} /></div>
                <div><label className="text-xs text-[#A89BC2] mb-1 block">Avg CCV</label><input type="number" className={INPUT_CLS} value={form.twitchAvgCCV} onChange={e => set("twitchAvgCCV", e.target.value)} /></div>
                <EngRateDisplay rate={calcTwitchEngagement(parseInt(form.twitchFollowers)||0, parseInt(form.twitchAvgCCV)||0)} formula="Avg CCV / Followers × 100 (Viewer Rate)" />
              </div>
            </div>
          )}
          {ACTIVE_PLATFORMS.length === 0 && (
            <p className="text-[#A89BC2] text-sm">Select platforms in Step 1 first.</p>
          )}
        </div>
      )}

      {/* Step 3: Audience Data */}
      {step === 2 && (
        <div className="bg-[#120820] border border-[rgba(245,230,66,0.15)] rounded-xl p-5 space-y-5">
          <h3 className="font-cinzel font-semibold text-white">Audience Data</h3>
          <div>
            <p className="text-xs font-medium text-[#A89BC2] mb-3">Gender Split</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-[#A89BC2] mb-1 block">Male %</label>
                <input type="number" min="0" max="100" className={INPUT_CLS} value={form.audienceGenderMale}
                  onChange={e => { set("audienceGenderMale", e.target.value); set("audienceGenderFemale", String(100 - parseInt(e.target.value || "0"))) }} />
              </div>
              <div>
                <label className="text-xs text-[#A89BC2] mb-1 block">Female %</label>
                <input type="number" min="0" max="100" className={INPUT_CLS} value={form.audienceGenderFemale}
                  onChange={e => { set("audienceGenderFemale", e.target.value); set("audienceGenderMale", String(100 - parseInt(e.target.value || "0"))) }} />
              </div>
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-[#A89BC2] mb-3">Age Breakdown %</p>
            <div className="grid grid-cols-5 gap-3">
              {[["13-17", "age1317"], ["18-24", "age1824"], ["25-34", "age2534"], ["35-44", "age3544"], ["45+", "age45plus"]].map(([label, key]) => (
                <div key={key}>
                  <label className="text-xs text-[#A89BC2] mb-1 block">{label}</label>
                  <input type="number" min="0" max="100" className={INPUT_CLS} value={form[key as keyof FormData] as string} onChange={e => set(key as keyof FormData, e.target.value as FormData[keyof FormData])} />
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-[#A89BC2] mb-3">Top Countries (up to 3)</p>
            <div className="space-y-2">
              {[["audienceCountry1", "audienceCountry1Pct"], ["audienceCountry2", "audienceCountry2Pct"], ["audienceCountry3", "audienceCountry3Pct"]].map(([countryKey, pctKey], i) => (
                <div key={countryKey} className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <select className={INPUT_CLS} value={form[countryKey as keyof FormData] as string} onChange={e => set(countryKey as keyof FormData, e.target.value as FormData[keyof FormData])}>
                      <option value="">Country {i + 1}</option>
                      {[...MENA_COUNTRIES, ...GLOBAL_COUNTRIES].map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <input type="number" min="0" max="100" className={INPUT_CLS} placeholder="%" value={form[pctKey as keyof FormData] as string} onChange={e => set(pctKey as keyof FormData, e.target.value as FormData[keyof FormData])} />
                </div>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#A89BC2] mb-2">Audience Interests</label>
            <TagInput tags={form.audienceInterests} onChange={v => set("audienceInterests", v)} placeholder="Add interest..." />
          </div>
        </div>
      )}

      {/* Step 4: Rates */}
      {step === 3 && (
        <div className="bg-[#120820] border border-[rgba(245,230,66,0.15)] rounded-xl p-5 space-y-4">
          <h3 className="font-cinzel font-semibold text-white">Rates (USD)</h3>
          <p className="text-[#A89BC2] text-xs">Enter creator rates. Client rate and commission are calculated automatically.</p>
          <div className="space-y-3">
            {DELIVERABLE_TYPES.filter(d => {
              if (d.platform === "Any" || d.platform === "Live") return true
              return form.platforms.some(p => p.toLowerCase().includes(d.platform.toLowerCase()) || d.platform.toLowerCase().includes(p.toLowerCase()))
            }).map(d => {
              const rateKey = d.key as keyof FormData
              const rateVal = parseFloat(form[rateKey] as string) || 0
              return (
                <div key={d.key} className="grid grid-cols-3 gap-3 items-start">
                  <div>
                    <label className="text-xs text-[#A89BC2] mb-1 block">{d.label}</label>
                    <div className="flex">
                      <span className="px-2 py-2 bg-[#0A0412] border border-r-0 border-[rgba(245,230,66,0.15)] rounded-l-lg text-xs text-[#A89BC2]">$</span>
                      <input type="number" min="0" className={cn(INPUT_CLS, "rounded-l-none")} placeholder="0" value={form[rateKey] as string} onChange={e => set(rateKey, e.target.value as FormData[keyof FormData])} />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-[#A89BC2] mb-1 block">Client Rate</label>
                    <p className="text-[#F5E642] font-mono text-sm py-2">{rateVal > 0 ? formatCurrency(calcClientRate(rateVal, settings.serviceMarkup)) : "—"}</p>
                  </div>
                  <div>
                    <label className="text-xs text-[#A89BC2] mb-1 block">Commission</label>
                    <p className="text-emerald-400 font-mono text-sm py-2">{rateVal > 0 ? formatCurrency(calcCommission(rateVal, settings.agencyCommission)) : "—"}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Step 5: Brand History */}
      {step === 4 && (
        <div className="bg-[#120820] border border-[rgba(245,230,66,0.15)] rounded-xl p-5 space-y-5">
          <h3 className="font-cinzel font-semibold text-white">Brand History</h3>
          <div>
            <label className="block text-xs font-medium text-[#A89BC2] mb-2">Past Brand Collaborations</label>
            <TagInput tags={form.pastBrandCollabs} onChange={v => set("pastBrandCollabs", v)} placeholder="Add brand..." />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#A89BC2] mb-2">Blacklisted Brands</label>
            <TagInput tags={form.blacklistedBrands} onChange={v => set("blacklistedBrands", v)} placeholder="Add blacklisted brand..." />
          </div>
        </div>
      )}

      {/* Step 6: Review */}
      {step === 5 && (
        <div className="bg-[#120820] border border-[rgba(245,230,66,0.15)] rounded-xl p-5 space-y-4">
          <h3 className="font-cinzel font-semibold text-white">Review & Confirm</h3>
          <div className="flex items-center gap-4">
            {form.profileImageUrl && <img src={form.profileImageUrl} alt={form.name} className="w-16 h-16 rounded-full object-cover border border-[rgba(245,230,66,0.2)]" />}
            <div>
              <p className="text-xl font-cinzel font-bold text-white" dir="auto">{form.name || "Unnamed Creator"}</p>
              {form.nameAr && <p className="text-[#A89BC2]" dir="rtl">{form.nameAr}</p>}
              <p className="text-[#A89BC2] text-sm">{form.tier} · {form.country}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-[#A89BC2]">Niches: </span><span className="text-white">{form.niches.join(", ") || "—"}</span></div>
            <div><span className="text-[#A89BC2]">Platforms: </span><span className="text-white">{form.platforms.join(", ") || "—"}</span></div>
            <div><span className="text-[#A89BC2]">Languages: </span><span className="text-white">{form.language.join(", ") || "—"}</span></div>
            <div><span className="text-[#A89BC2]">Managed: </span><span className="text-white">{form.managedByFlamenzi ? "Yes" : "No"}</span></div>
          </div>
          {form.bio && (
            <div>
              <p className="text-xs font-medium text-[#A89BC2] mb-1">Bio</p>
              <p className="text-[#A89BC2] text-sm">{form.bio}</p>
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        {step > 0 ? (
          <button onClick={() => setStep(s => s - 1)} className="flex items-center gap-2 px-4 py-2 bg-[#120820] border border-[rgba(245,230,66,0.2)] text-[#A89BC2] text-sm rounded-lg hover:text-white hover:border-[rgba(245,230,66,0.4)] transition-colors">
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>
        ) : <div />}

        {step < STEPS.length - 1 ? (
          <button
            onClick={() => {
              if (step === 0 && (!form.name.trim() || !form.country)) {
                alert("Please fill in Name and Country.")
                return
              }
              setStep(s => s + 1)
            }}
            className="flex items-center gap-2 px-4 py-2 bg-[#F5E642] text-[#0A0412] font-semibold text-sm rounded-lg hover:bg-[#F5E642]/90 hover:shadow-[0_0_15px_rgba(245,230,66,0.4)] transition-all"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-6 py-2 bg-[#F5E642] text-[#0A0412] font-semibold text-sm rounded-lg hover:bg-[#F5E642]/90 hover:shadow-[0_0_15px_rgba(245,230,66,0.4)] disabled:opacity-50 transition-all"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        )}
      </div>
    </div>
  )
}
