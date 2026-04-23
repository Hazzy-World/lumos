"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { CAMPAIGN_OBJECTIVES, ALL_COUNTRIES, PLATFORMS, NICHES } from "@/lib/constants"
import { cn } from "@/lib/utils"

interface FormData {
  name: string
  brandName: string
  brandWebsite: string
  brandLogoUrl: string
  brief: string
  objectives: string[]
  targetAudience: string
  targetCountries: string[]
  targetNiches: string[]
  platforms: string[]
  budget: string
  budgetCurrency: string
  startDate: string
  endDate: string
  clientContactName: string
  clientContactEmail: string
  internalNotes: string
}

const INITIAL: FormData = {
  name: "",
  brandName: "",
  brandWebsite: "",
  brandLogoUrl: "",
  brief: "",
  objectives: [],
  targetAudience: "",
  targetCountries: [],
  targetNiches: [],
  platforms: [],
  budget: "",
  budgetCurrency: "USD",
  startDate: "",
  endDate: "",
  clientContactName: "",
  clientContactEmail: "",
  internalNotes: "",
}

function Toggle({
  arr,
  val,
  onChange,
}: {
  arr: string[]
  val: string
  onChange: (v: string[]) => void
}) {
  const active = arr.includes(val)
  return (
    <button
      type="button"
      onClick={() => onChange(active ? arr.filter((x) => x !== val) : [...arr, val])}
      className={cn(
        "text-xs px-3 py-1.5 rounded border transition-colors",
        active
          ? "bg-[rgba(245,230,66,0.1)] border-[rgba(245,230,66,0.3)] text-[#F5E642]"
          : "bg-[#1A0A2E] border-[rgba(245,230,66,0.1)] text-[#A89BC2] hover:text-white"
      )}
    >
      {val}
    </button>
  )
}

function Field({
  label,
  required,
  children,
  error,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
  error?: string
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-[#A89BC2] mb-1.5">
        {label} {required && <span className="text-[#F5E642]">*</span>}
      </label>
      {children}
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  )
}

const INPUT_CLS =
  "w-full px-3 py-2 bg-[#1A0A2E] border border-[rgba(245,230,66,0.2)] rounded-lg text-sm text-white placeholder:text-[#4A3F6B] focus:outline-none focus:border-[#F5E642] focus:shadow-[0_0_0_2px_rgba(245,230,66,0.08)] transition-colors"

export default function NewCampaignPage() {
  const router = useRouter()
  const [form, setForm] = useState<FormData>(INITIAL)
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})
  const [saving, setSaving] = useState(false)

  const set = <K extends keyof FormData>(key: K, val: FormData[K]) =>
    setForm((p) => ({ ...p, [key]: val }))

  const validate = () => {
    const e: Partial<Record<keyof FormData, string>> = {}
    if (!form.name.trim()) e.name = "Campaign name is required"
    if (!form.brandName.trim()) e.brandName = "Brand name is required"
    if (!form.brief.trim()) e.brief = "Brief is required"
    if (!form.startDate) e.startDate = "Start date is required"
    if (!form.endDate) e.endDate = "End date is required"
    if (!form.budget) e.budget = "Budget is required"
    if (!form.targetAudience.trim()) e.targetAudience = "Target audience is required"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          budget: parseFloat(form.budget),
        }),
      })
      if (res.ok) {
        const data = await res.json()
        router.push(`/campaigns/${data.id}`)
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-3xl">
      <Link
        href="/campaigns"
        className="flex items-center gap-2 text-[#A89BC2] hover:text-white text-sm mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Campaigns
      </Link>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Campaign Identity */}
        <div className="bg-[#120820] border border-[rgba(245,230,66,0.15)] rounded-xl p-5 space-y-4">
          <h3 className="font-cinzel font-semibold text-white">Campaign Identity</h3>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Campaign Name" required error={errors.name}>
              <input
                className={INPUT_CLS}
                placeholder="e.g. Ramadan 2025 - Nike KSA"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
              />
            </Field>
            <Field label="Brand Name" required error={errors.brandName}>
              <input
                className={INPUT_CLS}
                placeholder="e.g. Nike KSA"
                value={form.brandName}
                onChange={(e) => set("brandName", e.target.value)}
              />
            </Field>
            <Field label="Brand Website">
              <input
                className={INPUT_CLS}
                placeholder="https://..."
                value={form.brandWebsite}
                onChange={(e) => set("brandWebsite", e.target.value)}
              />
            </Field>
            <Field label="Brand Logo URL">
              <input
                className={INPUT_CLS}
                placeholder="https://..."
                value={form.brandLogoUrl}
                onChange={(e) => set("brandLogoUrl", e.target.value)}
              />
            </Field>
          </div>
        </div>

        {/* Brief */}
        <div className="bg-[#120820] border border-[rgba(245,230,66,0.15)] rounded-xl p-5 space-y-4">
          <h3 className="font-cinzel font-semibold text-white">Campaign Brief</h3>
          <Field label="Brief" required error={errors.brief}>
            <textarea
              className={cn(INPUT_CLS, "h-36 resize-none")}
              placeholder="Describe the campaign in detail — goals, messaging, content requirements, deliverables, any special instructions..."
              value={form.brief}
              onChange={(e) => set("brief", e.target.value)}
            />
          </Field>
          <Field label="Target Audience" required error={errors.targetAudience}>
            <input
              className={INPUT_CLS}
              placeholder="e.g. Saudi males 18-35, fitness enthusiasts, urban professionals"
              value={form.targetAudience}
              onChange={(e) => set("targetAudience", e.target.value)}
            />
          </Field>

          <div>
            <label className="block text-xs font-medium text-[#A89BC2] mb-2">Objectives</label>
            <div className="flex flex-wrap gap-2">
              {CAMPAIGN_OBJECTIVES.map((obj) => (
                <Toggle
                  key={obj}
                  arr={form.objectives}
                  val={obj}
                  onChange={(v) => set("objectives", v)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Targeting */}
        <div className="bg-[#120820] border border-[rgba(245,230,66,0.15)] rounded-xl p-5 space-y-4">
          <h3 className="font-cinzel font-semibold text-white">Targeting</h3>
          <div>
            <label className="block text-xs font-medium text-[#A89BC2] mb-2">Target Countries</label>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
              {ALL_COUNTRIES.map((c) => (
                <Toggle
                  key={c}
                  arr={form.targetCountries}
                  val={c}
                  onChange={(v) => set("targetCountries", v)}
                />
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

        {/* Budget & Dates */}
        <div className="bg-[#120820] border border-[rgba(245,230,66,0.15)] rounded-xl p-5 space-y-4">
          <h3 className="font-cinzel font-semibold text-white">Budget & Timeline</h3>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Budget" required error={errors.budget}>
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
                  placeholder="50000"
                  value={form.budget}
                  onChange={(e) => set("budget", e.target.value)}
                />
              </div>
            </Field>
            <div />
            <Field label="Start Date" required error={errors.startDate}>
              <input
                type="date"
                className={INPUT_CLS}
                value={form.startDate}
                onChange={(e) => set("startDate", e.target.value)}
              />
            </Field>
            <Field label="End Date" required error={errors.endDate}>
              <input
                type="date"
                className={INPUT_CLS}
                value={form.endDate}
                onChange={(e) => set("endDate", e.target.value)}
              />
            </Field>
          </div>
        </div>

        {/* Client Contact */}
        <div className="bg-[#120820] border border-[rgba(245,230,66,0.15)] rounded-xl p-5 space-y-4">
          <h3 className="font-cinzel font-semibold text-white">Client Contact</h3>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Contact Name">
              <input
                className={INPUT_CLS}
                placeholder="Ahmed Al-Mansouri"
                value={form.clientContactName}
                onChange={(e) => set("clientContactName", e.target.value)}
              />
            </Field>
            <Field label="Contact Email">
              <input
                type="email"
                className={INPUT_CLS}
                placeholder="ahmed@brand.com"
                value={form.clientContactEmail}
                onChange={(e) => set("clientContactEmail", e.target.value)}
              />
            </Field>
          </div>
          <Field label="Internal Notes">
            <textarea
              className={cn(INPUT_CLS, "h-24 resize-none")}
              placeholder="Notes visible only to Lumos team..."
              value={form.internalNotes}
              onChange={(e) => set("internalNotes", e.target.value)}
            />
          </Field>
        </div>

        <div className="flex justify-end gap-3">
          <Link
            href="/campaigns"
            className="px-5 py-2.5 bg-[#120820] border border-[rgba(245,230,66,0.2)] text-[#A89BC2] font-medium rounded-lg hover:text-white hover:border-[rgba(245,230,66,0.4)] transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 bg-[#F5E642] text-[#0A0412] font-semibold rounded-lg hover:bg-[#F5E642]/90 hover:shadow-[0_0_15px_rgba(245,230,66,0.4)] transition-all disabled:opacity-50"
          >
            {saving ? "Creating..." : "Create Campaign"}
          </button>
        </div>
      </form>
    </div>
  )
}
