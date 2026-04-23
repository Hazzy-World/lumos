"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Plus } from "lucide-react"
import StatusBadge from "@/components/shared/StatusBadge"
import { Skeleton } from "@/components/shared/SkeletonCard"
import EmptyState from "@/components/shared/EmptyState"
import { formatCurrency } from "@/lib/rate-utils"
import { CAMPAIGN_STATUSES } from "@/lib/constants"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

interface Campaign {
  id: string
  name: string
  brandName: string
  brandLogoUrl?: string | null
  status: string
  startDate: string
  endDate: string
  budget: number
  budgetCurrency: string
  platforms: string[]
  creators: Array<{
    totalClientRate: number
    totalCommission: number
  }>
  _count?: { creators: number }
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>("ALL")

  useEffect(() => {
    const params = new URLSearchParams()
    if (statusFilter !== "ALL") params.set("status", statusFilter)
    fetch(`/api/campaigns?${params}`)
      .then((r) => r.json())
      .then((data) => setCampaigns(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false))
  }, [statusFilter])

  return (
    <div>
      {/* Filter bar */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setStatusFilter("ALL")}
          className={cn(
            "px-3 py-1.5 text-sm rounded-md border transition-colors",
            statusFilter === "ALL"
              ? "bg-[rgba(245,230,66,0.1)] border-[rgba(245,230,66,0.3)] text-lumos-gold"
              : "bg-lumos-surface border-[rgba(245,230,66,0.15)] text-lumos-lavender hover:text-white"
          )}
        >
          All
        </button>
        {CAMPAIGN_STATUSES.map((s) => (
          <button
            key={s.value}
            onClick={() => setStatusFilter(s.value)}
            className={cn(
              "px-3 py-1.5 text-sm rounded-md border transition-colors",
              statusFilter === s.value
                ? "bg-[rgba(245,230,66,0.1)] border-[rgba(245,230,66,0.3)] text-lumos-gold"
                : "bg-lumos-surface border-[rgba(245,230,66,0.15)] text-lumos-lavender hover:text-white"
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-lumos-surface border border-[rgba(245,230,66,0.15)] rounded-xl p-5 space-y-3">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-8 w-32" />
            </div>
          ))}
        </div>
      ) : campaigns.length === 0 ? (
        <EmptyState
          variant="campaigns"
          action={{ label: "✦ New Campaign", href: "/campaigns/new" }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {campaigns.map((campaign) => {
            const totalClientValue = campaign.creators.reduce(
              (sum, c) => sum + c.totalClientRate,
              0
            )
            const totalCommission = campaign.creators.reduce(
              (sum, c) => sum + c.totalCommission,
              0
            )
            const creatorCount = campaign._count?.creators ?? campaign.creators.length

            return (
              <Link key={campaign.id} href={`/campaigns/${campaign.id}`}>
                <div className="bg-lumos-surface border border-[rgba(245,230,66,0.15)] rounded-xl p-5 hover:border-[rgba(245,230,66,0.4)] hover:bg-[rgba(245,230,66,0.03)] transition-all cursor-pointer h-full flex flex-col">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {campaign.brandLogoUrl ? (
                        <img
                          src={campaign.brandLogoUrl}
                          alt={campaign.brandName}
                          className="w-10 h-10 rounded-lg object-cover border border-[rgba(245,230,66,0.15)]"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-lumos-deep border border-[rgba(245,230,66,0.15)] flex items-center justify-center">
                          <span className="text-lg font-bold text-lumos-lavender">
                            {campaign.brandName.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-white text-sm leading-tight">
                          {campaign.name}
                        </p>
                        <p className="text-lumos-lavender text-xs">{campaign.brandName}</p>
                      </div>
                    </div>
                    <StatusBadge status={campaign.status} />
                  </div>

                  <div className="text-xs text-lumos-lavender mb-3">
                    {format(new Date(campaign.startDate), "MMM d")} –{" "}
                    {format(new Date(campaign.endDate), "MMM d, yyyy")}
                  </div>

                  <div className="flex items-center gap-4 text-xs mb-3 flex-wrap">
                    <div>
                      <p className="text-lumos-lavender mb-0.5">Creators</p>
                      <p className="text-white font-semibold">{creatorCount}</p>
                    </div>
                    <div>
                      <p className="text-lumos-lavender mb-0.5">Client Value</p>
                      <p className="text-lumos-gold font-mono font-semibold">
                        {formatCurrency(totalClientValue)}
                      </p>
                    </div>
                    <div>
                      <p className="text-lumos-lavender mb-0.5">Commission</p>
                      <p className="text-emerald-400 font-mono font-semibold">
                        {formatCurrency(totalCommission)}
                      </p>
                    </div>
                  </div>

                  {campaign.platforms.length > 0 && (
                    <div className="flex gap-1.5 mt-auto flex-wrap">
                      {campaign.platforms.map((p) => (
                        <span
                          key={p}
                          className="text-[10px] px-2 py-0.5 rounded bg-[rgba(123,47,190,0.2)] border border-[rgba(123,47,190,0.3)] text-lumos-lavender"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
