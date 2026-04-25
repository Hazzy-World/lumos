"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts"
import StatusBadge from "@/components/shared/StatusBadge"
import TierBadge from "@/components/shared/TierBadge"
import { Skeleton } from "@/components/shared/SkeletonCard"
import { formatCurrency } from "@/lib/rate-utils"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { Users, Megaphone, Calculator, FileText } from "lucide-react"

/* ── Types ────────────────────────────────────────────────────────────── */
interface Creator {
  id: string; name: string; nameAr?: string | null; tier: string
  country: string; profileImageUrl: string; niches: string[]
  isActive: boolean; createdAt: string
}
interface CampaignCreatorEntry {
  creatorId: string; totalClientRate: number; totalCommission: number
  creator: { id: string; name: string; profileImageUrl: string; tier: string }
}
interface Campaign {
  id: string; name: string; brandName: string; status: string
  startDate: string; endDate: string
  creators: CampaignCreatorEntry[]; createdAt: string
}

/* ── Particle hero background ─────────────────────────────────────────── */
function HeroParticles() {
  const particles = Array.from({ length: 28 }, (_, i) => ({
    id: i,
    x: 5 + (i * 37 + i * i * 3) % 90,
    y: 5 + (i * 53 + i * 7) % 85,
    size: 1 + (i % 3) * 0.7,
    delay: (i * 0.4) % 4,
    duration: 3 + (i % 4),
  }))
  return (
    <>
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: `${p.x}%`, top: `${p.y}%`,
            width: `${p.size}px`, height: `${p.size}px`,
            background: "#F5E642",
            animation: `float-particle ${p.duration}s ${p.delay}s ease-in-out infinite`,
            opacity: 0.3,
          }}
        />
      ))}
    </>
  )
}

/* ── KPI Card ─────────────────────────────────────────────────────────── */
function KPICard({
  label, value, sub, icon, href,
}: {
  label: string; value: string; sub?: string; icon: string; href?: string
}) {
  const inner = (
    <div
      className="relative overflow-hidden rounded-xl p-5 group-hover:-translate-y-1 transition-all duration-300"
      style={{
        background: "rgba(18, 8, 32, 0.9)",
        border: "1px solid rgba(245, 230, 66, 0.15)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
      }}
    >
      {/* Hover glow */}
      <div
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ boxShadow: "inset 0 0 40px rgba(245,230,66,0.05)" }}
      />
      {/* Top border glow on hover */}
      <div
        className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: "linear-gradient(90deg, transparent, rgba(245,230,66,0.5), transparent)" }}
      />

      <div className="flex items-start justify-between mb-3 relative z-10">
        <p className="text-[11px] font-raleway font-semibold text-[#A89BC2] uppercase tracking-widest">{label}</p>
        <span className="text-xl">{icon}</span>
      </div>
      <p
        className="font-cinzel font-bold text-3xl relative z-10"
        style={{ color: "#F5E642", textShadow: "0 0 20px rgba(245,230,66,0.35)" }}
      >
        {value}
      </p>
      {sub && <p className="text-[#A89BC2] text-xs mt-1.5 font-inter relative z-10">{sub}</p>}
    </div>
  )
  return href ? <Link href={href} className="group block">{inner}</Link> : <div className="group">{inner}</div>
}

/* ── Tooltip ──────────────────────────────────────────────────────────── */
const GoldTooltip = ({
  active, payload, label,
}: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) => {
  if (!active || !payload) return null
  return (
    <div className="rounded-lg p-3 text-xs" style={{ background: "#120820", border: "1px solid rgba(245,230,66,0.2)" }}>
      <p className="font-cinzel text-white font-semibold mb-1">{label}</p>
      {payload.map((e) => (
        <p key={e.name} style={{ color: e.color }}>{e.name}: {formatCurrency(e.value)}</p>
      ))}
    </div>
  )
}

/* ── Quick action card ────────────────────────────────────────────────── */
function QuickAction({ label, sub, icon: Icon, href }: { label: string; sub: string; icon: React.ElementType; href: string }) {
  return (
    <Link href={href}>
      <div
        className="flex items-center gap-4 p-4 rounded-xl cursor-pointer group transition-all duration-300 hover:-translate-y-0.5"
        style={{
          background: "rgba(18,8,32,0.7)",
          border: "1px solid rgba(245,230,66,0.12)",
        }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(245,230,66,0.35)")}
        onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(245,230,66,0.12)")}
      >
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300"
          style={{ background: "rgba(245,230,66,0.1)", border: "1px solid rgba(245,230,66,0.2)" }}
        >
          <Icon className="w-5 h-5" style={{ color: "#F5E642" }} />
        </div>
        <div>
          <p className="font-cinzel text-white text-sm font-semibold">{label}</p>
          <p className="font-inter text-[#A89BC2] text-xs">{sub}</p>
        </div>
      </div>
    </Link>
  )
}

/* ── Page ─────────────────────────────────────────────────────────────── */
const TIER_COLORS: Record<string, string> = {
  NANO: "#6B7280", MICRO: "#C084FC", MID: "#67E8F9", MACRO: "#F5E642", MEGA: "#FFD700",
}

export default function DashboardPage() {
  const [creators, setCreators]   = useState<Creator[]>([])
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    Promise.all([
      fetch("/api/creators").then((r) => r.json()),
      fetch("/api/campaigns").then((r) => r.json()),
    ])
      .then(([c, camp]) => {
        setCreators(Array.isArray(c) ? c : [])
        setCampaigns(Array.isArray(camp) ? camp : [])
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-44 rounded-2xl" style={{ background: "rgba(18,8,32,0.8)" }} />
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" style={{ background: "rgba(18,8,32,0.6)" }} />
          ))}
        </div>
      </div>
    )
  }

  const activeCreators  = creators.filter((c) => c.isActive).length
  const activeCampaigns = campaigns.filter((c) => c.status === "ACTIVE")
  const pipelineValue   = activeCampaigns.reduce((s, c) => s + c.creators.reduce((a, cc) => a + cc.totalClientRate, 0), 0)
  const lumosRevenue    = activeCampaigns.reduce((s, c) => s + c.creators.reduce((a, cc) => a + cc.totalCommission, 0), 0)

  const recentCampaigns = [...campaigns].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)).slice(0, 5)
  const recentCreators  = [...creators].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)).slice(0, 5)

  const campaignChartData = campaigns.slice(0, 6).map((c) => ({
    name: c.name.length > 16 ? c.name.substring(0, 16) + "…" : c.name,
    clientValue: c.creators.reduce((s, cc) => s + cc.totalClientRate, 0),
    commission:  c.creators.reduce((s, cc) => s + cc.totalCommission, 0),
  }))

  const tierCounts = creators.reduce<Record<string, number>>((acc, c) => {
    acc[c.tier] = (acc[c.tier] || 0) + 1; return acc
  }, {})
  const tierDistribution = Object.entries(tierCounts).map(([name, value]) => ({ name, value }))

  const creatorValues: Record<string, { id: string; name: string; profileImageUrl: string; tier: string; totalValue: number }> = {}
  campaigns.forEach((camp) => {
    camp.creators.forEach((cc) => {
      if (!creatorValues[cc.creatorId]) {
        creatorValues[cc.creatorId] = { id: cc.creator.id, name: cc.creator.name, profileImageUrl: cc.creator.profileImageUrl, tier: cc.creator.tier, totalValue: 0 }
      }
      creatorValues[cc.creatorId].totalValue += cc.totalClientRate
    })
  })
  const topCreators = Object.values(creatorValues).sort((a, b) => b.totalValue - a.totalValue).slice(0, 10)

  return (
    <div className="space-y-6">

      {/* ── Hero Banner ── */}
      <div
        className="relative overflow-hidden rounded-2xl"
        style={{
          background: "linear-gradient(135deg, #1A0A2E 0%, #0A0412 55%, #120820 100%)",
          border: "1px solid rgba(245,230,66,0.12)",
          minHeight: "180px",
        }}
      >
        <HeroParticles />

        {/* Constellation lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-10" preserveAspectRatio="none">
          <line x1="5%"  y1="20%" x2="25%" y2="60%" stroke="#F5E642" strokeWidth="0.5"/>
          <line x1="25%" y1="60%" x2="55%" y2="30%" stroke="#F5E642" strokeWidth="0.5"/>
          <line x1="55%" y1="30%" x2="80%" y2="70%" stroke="#F5E642" strokeWidth="0.5"/>
          <line x1="80%" y1="70%" x2="95%" y2="40%" stroke="#F5E642" strokeWidth="0.5"/>
        </svg>

        <div className="relative z-10 p-8 flex items-center justify-between">
          <div>
            <h1
              className="font-cinzel font-black text-white mb-2 leading-none"
              style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", textShadow: "0 0 40px rgba(245,230,66,0.6), 0 0 80px rgba(245,230,66,0.2)" }}
            >
              Lumos
            </h1>
            <p className="font-raleway text-[#A89BC2] text-lg tracking-wide">Illuminate Your Talent</p>
            <p className="font-inter text-xs mt-1" style={{ color: "rgba(168,155,194,0.5)" }}>Powered by Flamenzi</p>
          </div>

          <div className="text-right hidden md:block">
            <p className="font-cinzel text-[#F5E642] text-sm tracking-widest mb-3">
              {format(new Date(), "EEEE, d MMMM yyyy")}
            </p>
            {/* Decorative wand */}
            <svg width="90" height="90" viewBox="0 0 90 90" fill="none" className="animate-wand-glow ml-auto">
              <circle cx="45" cy="45" r="44" fill="rgba(245,230,66,0.03)" stroke="rgba(245,230,66,0.08)" strokeWidth="1"/>
              <line x1="62" y1="28" x2="22" y2="68" stroke="#A89BC2" strokeWidth="3.5" strokeLinecap="round"/>
              <circle cx="62" cy="28" r="8" fill="#F5E642" opacity="0.15"/>
              <circle cx="62" cy="28" r="5" fill="#F5E642"/>
              <line x1="62" y1="16" x2="62" y2="22" stroke="#F5E642" strokeWidth="2.5" strokeLinecap="round"/>
              <line x1="74" y1="28" x2="68" y2="28" stroke="#F5E642" strokeWidth="2.5" strokeLinecap="round"/>
              <line x1="71" y1="20" x2="67" y2="24" stroke="#F5E642" strokeWidth="2" strokeLinecap="round"/>
              <line x1="53" y1="20" x2="57" y2="24" stroke="#F5E642" strokeWidth="2" strokeLinecap="round" opacity="0.7"/>
              <line x1="71" y1="36" x2="67" y2="32" stroke="#F5E642" strokeWidth="2" strokeLinecap="round" opacity="0.7"/>
              <circle cx="42" cy="48" r="1.5" fill="#F5E642" opacity="0.4"/>
              <circle cx="34" cy="56" r="1.2" fill="#F5E642" opacity="0.3"/>
              <circle cx="58" cy="18" r="1.2" fill="#FFD700" opacity="0.5"/>
            </svg>
          </div>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Total Creators"   value={creators.length.toString()}   icon="✦" sub={`${activeCreators} active`}    href="/creators" />
        <KPICard label="Campaigns"     value={activeCampaigns.length.toString()} icon="⚡" sub="Active campaigns"              href="/campaigns" />
        <KPICard label="Pipeline Value"   value={formatCurrency(pipelineValue)} icon="💎" sub="Across active campaigns" />
        <KPICard label="Lumos Revenue"    value={formatCurrency(lumosRevenue)}  icon="🌟" sub="Active campaigns" />
      </div>

      {/* ── Quick Actions ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <QuickAction label="New Talent"  sub="Add to the registry"      icon={Users}     href="/creators/new" />
        <QuickAction label="New Campaign" sub="Start a campaign"         icon={Megaphone} href="/campaigns/new" />
        <QuickAction label="Rate Engine"       sub="Calculate rates"          icon={Calculator}href="/tools/rate-calculator" />
        <QuickAction label="Brief Studio"  sub="Generate a brief"         icon={FileText}  href="/tools/brief-generator" />
      </div>

      {/* ── Charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Bar chart */}
        <div
          className="lg:col-span-2 rounded-xl p-5"
          style={{ background: "rgba(18,8,32,0.85)", border: "1px solid rgba(245,230,66,0.12)" }}
        >
          <h3 className="font-cinzel font-semibold text-white mb-4">Revenue by Enchantment</h3>
          {campaignChartData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-[#A89BC2] text-sm font-inter">
              No campaign data yet —{" "}
              <Link href="/campaigns/new" className="text-[#F5E642] ml-1 hover:underline">begin one</Link>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={campaignChartData} margin={{ top: 0, right: 0, bottom: 24, left: 0 }}>
                <XAxis dataKey="name" tick={{ fill: "#A89BC2", fontSize: 10 }} angle={-25} textAnchor="end" interval={0} />
                <YAxis tick={{ fill: "#A89BC2", fontSize: 10 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<GoldTooltip />} />
                <Legend formatter={(v) => <span className="text-xs text-[#A89BC2]">{v}</span>} />
                <Bar dataKey="clientValue" name="Client Value" fill="#F5E642"  radius={[3, 3, 0, 0]} />
                <Bar dataKey="commission"  name="Commission"   fill="#7B2FBE"  radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Donut chart */}
        <div
          className="rounded-xl p-5"
          style={{ background: "rgba(18,8,32,0.85)", border: "1px solid rgba(245,230,66,0.12)" }}
        >
          <h3 className="font-cinzel font-semibold text-white mb-4">Creator Tiers</h3>
          {tierDistribution.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-[#A89BC2] text-sm font-inter">No creators yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={tierDistribution} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                  {tierDistribution.map((e) => (
                    <Cell key={e.name} fill={TIER_COLORS[e.name] || "#6B7280"} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "#120820", border: "1px solid rgba(245,230,66,0.2)", borderRadius: "8px", fontSize: "12px", color: "#fff" }} />
                <Legend formatter={(v) => <span className="text-xs text-[#A89BC2]">{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Recent Activity ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent campaigns */}
        <div className="rounded-xl p-5" style={{ background: "rgba(18,8,32,0.85)", border: "1px solid rgba(245,230,66,0.12)" }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-cinzel font-semibold text-white">Recent Campaigns</h3>
            <Link href="/campaigns" className="text-xs text-[#F5E642] hover:underline font-inter">View all</Link>
          </div>
          {recentCampaigns.length === 0 ? (
            <div className="text-center py-8 text-[#A89BC2] text-sm font-inter">No campaigns yet</div>
          ) : (
            <div className="space-y-2">
              {recentCampaigns.map((c) => {
                const val = c.creators.reduce((s, cc) => s + cc.totalClientRate, 0)
                return (
                  <Link key={c.id} href={`/campaigns/${c.id}`}>
                    <div
                      className="flex items-center justify-between p-3 rounded-lg transition-colors"
                      style={{ background: "rgba(26,10,46,0.5)", border: "1px solid rgba(245,230,66,0.07)" }}
                      onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(245,230,66,0.2)")}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(245,230,66,0.07)")}
                    >
                      <div>
                        <p className="text-sm font-cinzel font-medium text-white">{c.name}</p>
                        <p className="text-xs text-[#A89BC2] font-inter">{c.brandName}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {val > 0 && <span className="text-xs font-cinzel" style={{ color: "#F5E642" }}>{formatCurrency(val)}</span>}
                        <StatusBadge status={c.status} />
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        {/* Recent creators */}
        <div className="rounded-xl p-5" style={{ background: "rgba(18,8,32,0.85)", border: "1px solid rgba(245,230,66,0.12)" }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-cinzel font-semibold text-white">Recently Summoned</h3>
            <Link href="/creators" className="text-xs text-[#F5E642] hover:underline font-inter">View all</Link>
          </div>
          {recentCreators.length === 0 ? (
            <div className="text-center py-8 text-[#A89BC2] text-sm font-inter">No creators yet</div>
          ) : (
            <div className="space-y-2">
              {recentCreators.map((c) => (
                <Link key={c.id} href={`/creators/${c.id}`}>
                  <div
                    className="flex items-center gap-3 p-3 rounded-lg transition-colors"
                    style={{ background: "rgba(26,10,46,0.5)", border: "1px solid rgba(245,230,66,0.07)" }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(245,230,66,0.2)")}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(245,230,66,0.07)")}
                  >
                    <img src={c.profileImageUrl} alt={c.name} className="w-9 h-9 rounded-full object-cover flex-shrink-0" style={{ border: "1px solid rgba(245,230,66,0.2)" }} onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}&background=1A0A2E&color=F5E642&size=400` }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-cinzel font-medium text-white truncate" dir="auto">{c.name}</p>
                      <p className="text-xs text-[#A89BC2] font-inter">{c.country}{c.niches[0] ? ` · ${c.niches[0]}` : ""}</p>
                    </div>
                    <TierBadge tier={c.tier} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Top Creators by Value ── */}
      {topCreators.length > 0 && (
        <div className="rounded-xl p-5" style={{ background: "rgba(18,8,32,0.85)", border: "1px solid rgba(245,230,66,0.12)" }}>
          <h3 className="font-cinzel font-semibold text-white mb-4">✦ Top Creators by Campaign Value</h3>
          <div className="space-y-2">
            {topCreators.map((c, i) => (
              <Link key={c.id} href={`/creators/${c.id}`}>
                <div
                  className="flex items-center gap-3 p-2.5 rounded-lg transition-colors"
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(26,10,46,0.5)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <span className="text-[#A89BC2] text-xs font-cinzel w-6 flex-shrink-0">#{i + 1}</span>
                  <img src={c.profileImageUrl} alt={c.name} className="w-8 h-8 rounded-full object-cover flex-shrink-0" onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}&background=1A0A2E&color=F5E642&size=400` }} />
                  <p className="flex-1 text-sm font-cinzel font-medium text-white min-w-0 truncate">{c.name}</p>
                  <TierBadge tier={c.tier} />
                  <div className="w-32 h-1.5 rounded-full overflow-hidden hidden sm:block" style={{ background: "rgba(245,230,66,0.1)" }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(c.totalValue / (topCreators[0]?.totalValue || 1)) * 100}%`,
                        background: "linear-gradient(90deg, #7B2FBE, #F5E642)",
                        boxShadow: "0 0 6px rgba(245,230,66,0.4)",
                      }}
                    />
                  </div>
                  <span className="font-cinzel text-sm w-24 text-right" style={{ color: "#F5E642" }}>{formatCurrency(c.totalValue)}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
