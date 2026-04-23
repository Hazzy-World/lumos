"use client"

import { useState, useEffect } from "react"
import { Save, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

interface Settings {
  agencyName: string
  logoUrl: string | null
  primaryColor: string
  secondaryColor: string
  accentColor: string
  tagline: string | null
  contactEmail: string | null
  website: string | null
  serviceMarkup: number
  agencyCommission: number
  defaultCurrency: string
}

type Tab = "agency" | "rates" | "defaults"

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    agencyName: "Flamenzi",
    logoUrl: null,
    primaryColor: "#F5E642",
    secondaryColor: "#1A1A2E",
    accentColor: "#F5A623",
    tagline: null,
    contactEmail: null,
    website: null,
    serviceMarkup: 0.12,
    agencyCommission: 0.20,
    defaultCurrency: "USD",
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [tab, setTab] = useState<Tab>("agency")

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => setSettings(data))
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  const update = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  if (loading) {
    return <div className="text-[#A89BC2] text-sm">Loading settings...</div>
  }

  const exampleBase = 1000
  const clientEx = exampleBase * (1 + settings.serviceMarkup)
  const commEx = exampleBase * settings.agencyCommission

  const TABS = [
    { key: "agency", label: "Agency Profile" },
    { key: "rates", label: "Rate Settings" },
    { key: "defaults", label: "Platform Defaults" },
  ] as const

  return (
    <div className="max-w-3xl">
      <div className="flex border-b border-[rgba(245,230,66,0.15)] mb-6">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as Tab)}
            className={cn(
              "px-5 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-[1px]",
              tab === t.key
                ? "border-[#F5E642] text-white"
                : "border-transparent text-[#A89BC2] hover:text-white"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "agency" && (
        <div className="space-y-5">
          <div className="bg-[#120820] border border-[rgba(245,230,66,0.15)] rounded-xl p-5 space-y-4">
            <h3 className="font-cinzel font-semibold text-white">Agency Identity</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#A89BC2] mb-1.5">Agency Name</label>
                <input
                  type="text"
                  value={settings.agencyName}
                  onChange={(e) => update("agencyName", e.target.value)}
                  className="w-full px-3 py-2 bg-[#1A0A2E] border border-[rgba(245,230,66,0.2)] rounded-lg text-sm text-white placeholder:text-[#4A3F6B] focus:outline-none focus:border-[#F5E642] focus:shadow-[0_0_0_2px_rgba(245,230,66,0.08)] transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#A89BC2] mb-1.5">Tagline</label>
                <input
                  type="text"
                  value={settings.tagline || ""}
                  onChange={(e) => update("tagline", e.target.value)}
                  className="w-full px-3 py-2 bg-[#1A0A2E] border border-[rgba(245,230,66,0.2)] rounded-lg text-sm text-white placeholder:text-[#4A3F6B] focus:outline-none focus:border-[#F5E642] focus:shadow-[0_0_0_2px_rgba(245,230,66,0.08)] transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#A89BC2] mb-1.5">Contact Email</label>
                <input
                  type="email"
                  value={settings.contactEmail || ""}
                  onChange={(e) => update("contactEmail", e.target.value)}
                  className="w-full px-3 py-2 bg-[#1A0A2E] border border-[rgba(245,230,66,0.2)] rounded-lg text-sm text-white placeholder:text-[#4A3F6B] focus:outline-none focus:border-[#F5E642] focus:shadow-[0_0_0_2px_rgba(245,230,66,0.08)] transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#A89BC2] mb-1.5">Website</label>
                <input
                  type="url"
                  value={settings.website || ""}
                  onChange={(e) => update("website", e.target.value)}
                  className="w-full px-3 py-2 bg-[#1A0A2E] border border-[rgba(245,230,66,0.2)] rounded-lg text-sm text-white placeholder:text-[#4A3F6B] focus:outline-none focus:border-[#F5E642] focus:shadow-[0_0_0_2px_rgba(245,230,66,0.08)] transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="bg-[#120820] border border-[rgba(245,230,66,0.15)] rounded-xl p-5 space-y-4">
            <h3 className="font-cinzel font-semibold text-white">Brand Colors</h3>
            <div className="grid grid-cols-3 gap-4">
              {(
                [
                  { key: "primaryColor" as const, label: "Primary (Gold)" },
                  { key: "secondaryColor" as const, label: "Secondary (Navy)" },
                  { key: "accentColor" as const, label: "Accent (Gold)" },
                ] as const
              ).map(({ key, label }) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-[#A89BC2] mb-1.5">{label}</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={(settings[key] as string) || "#000000"}
                      onChange={(e) => update(key, e.target.value)}
                      className="w-10 h-9 rounded border border-[rgba(245,230,66,0.15)] bg-[#1A0A2E] cursor-pointer"
                    />
                    <input
                      type="text"
                      value={(settings[key] as string) || ""}
                      onChange={(e) => update(key, e.target.value)}
                      className="flex-1 px-3 py-2 bg-[#1A0A2E] border border-[rgba(245,230,66,0.2)] rounded-lg text-sm text-white placeholder:text-[#4A3F6B] focus:outline-none focus:border-[#F5E642] focus:shadow-[0_0_0_2px_rgba(245,230,66,0.08)] transition-colors font-mono"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "rates" && (
        <div className="space-y-5">
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-amber-400 text-sm font-medium">Important</p>
              <p className="text-amber-400/80 text-xs mt-0.5">
                Changing these values affects all future calculations. Existing campaign rates are not
                retroactively updated.
              </p>
            </div>
          </div>

          <div className="bg-[#120820] border border-[rgba(245,230,66,0.15)] rounded-xl p-5 space-y-6">
            <div>
              <label className="block text-sm font-medium text-white mb-1">Service Markup %</label>
              <p className="text-[#A89BC2] text-xs mb-3">
                Added on top of creator rate to get client-facing price.
              </p>
              <div className="flex items-center gap-4 flex-wrap">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={settings.serviceMarkup * 100}
                  onChange={(e) => update("serviceMarkup", Number(e.target.value) / 100)}
                  className="w-28 px-3 py-2 bg-[#1A0A2E] border border-[rgba(245,230,66,0.2)] rounded-lg text-sm text-white placeholder:text-[#4A3F6B] focus:outline-none focus:border-[#F5E642] focus:shadow-[0_0_0_2px_rgba(245,230,66,0.08)] transition-colors"
                />
                <span className="text-[#A89BC2] text-sm">%</span>
                <div className="text-sm text-[#A89BC2]">
                  Preview: $1,000 base →{" "}
                  <span className="text-[#F5E642] font-mono font-semibold">
                    ${clientEx.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>{" "}
                  client rate
                </div>
              </div>
            </div>

            <div className="border-t border-[rgba(245,230,66,0.15)] pt-5">
              <label className="block text-sm font-medium text-white mb-1">Agency Commission %</label>
              <p className="text-[#A89BC2] text-xs mb-3">Lumos&apos;s earnings from each creator rate.</p>
              <div className="flex items-center gap-4 flex-wrap">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={settings.agencyCommission * 100}
                  onChange={(e) => update("agencyCommission", Number(e.target.value) / 100)}
                  className="w-28 px-3 py-2 bg-[#1A0A2E] border border-[rgba(245,230,66,0.2)] rounded-lg text-sm text-white placeholder:text-[#4A3F6B] focus:outline-none focus:border-[#F5E642] focus:shadow-[0_0_0_2px_rgba(245,230,66,0.08)] transition-colors"
                />
                <span className="text-[#A89BC2] text-sm">%</span>
                <div className="text-sm text-[#A89BC2]">
                  Preview: $1,000 base →{" "}
                  <span className="text-emerald-400 font-mono font-semibold">
                    ${commEx.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>{" "}
                  commission
                </div>
              </div>
            </div>

            <div className="border-t border-[rgba(245,230,66,0.15)] pt-5">
              <label className="block text-sm font-medium text-white mb-1">Default Currency</label>
              <select
                value={settings.defaultCurrency}
                onChange={(e) => update("defaultCurrency", e.target.value)}
                className="px-3 py-2 bg-[#1A0A2E] border border-[rgba(245,230,66,0.2)] rounded-lg text-sm text-white focus:outline-none focus:border-[#F5E642] focus:shadow-[0_0_0_2px_rgba(245,230,66,0.08)] transition-colors"
              >
                <option value="USD">USD — US Dollar</option>
                <option value="SAR">SAR — Saudi Riyal</option>
                <option value="AED">AED — UAE Dirham</option>
                <option value="EGP">EGP — Egyptian Pound</option>
                <option value="GBP">GBP — British Pound</option>
                <option value="EUR">EUR — Euro</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {tab === "defaults" && (
        <div className="bg-[#120820] border border-[rgba(245,230,66,0.15)] rounded-xl p-5">
          <h3 className="font-cinzel font-semibold text-white mb-2">Platform Defaults</h3>
          <p className="text-[#A89BC2] text-sm mb-4">
            Configure default platform visibility and niche list for creator forms.
          </p>
          <p className="text-[#A89BC2] text-xs">Platform defaults configuration coming in a future update.</p>
        </div>
      )}

      <div className="flex justify-end mt-6">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#F5E642] text-[#0A0412] font-semibold rounded-lg hover:bg-[#F5E642]/90 hover:shadow-[0_0_15px_rgba(245,230,66,0.4)] transition-all disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : saved ? "Saved!" : "Save Settings"}
        </button>
      </div>
    </div>
  )
}
