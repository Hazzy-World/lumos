"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Plus } from "lucide-react"

const PAGE_TITLES: Record<string, { title: string; sub?: string; action?: { label: string; href: string } }> = {
  "/dashboard":             { title: "The Great Hall",       sub: "Illuminate Your Talent" },
  "/creators":              { title: "Talent Registry",      sub: "The Talent Registry",       action: { label: "✦ New Talent",    href: "/creators/new" } },
  "/creators/new":          { title: "Summon a Creator",     sub: "Add to the Registry" },
  "/creators/discover":     { title: "Talent Scout",           sub: "AI-Powered Creator Discovery" },
  "/campaigns":             { title: "Campaigns",         sub: "Active Campaigns",        action: { label: "✦ New Campaign",   href: "/campaigns/new" } },
  "/campaigns/new":         { title: "New Campaign",      sub: "Begin a Campaign" },
  "/tools/rate-calculator": { title: "Rate Engine",            sub: "Rate Calculator" },
  "/tools/brief-generator": { title: "Brief Studio",       sub: "Brief Generator" },
  "/settings":              { title: "Headmaster's Office",  sub: "Platform Settings" },
}

export default function TopBar() {
  const pathname = usePathname()

  let config = PAGE_TITLES[pathname]
  if (!config) {
    if (pathname.includes("/research"))      config = { title: "The Pensieve",        sub: "Creator Research & Strategy" }
    else if (pathname.includes("/edit"))     config = { title: "Edit Creator",         sub: "Update the Registry" }
    else if (pathname.match(/\/creators\/[^/]+$/)) config = { title: "Creator Profile", sub: "Talent Profile" }
    else if (pathname.match(/\/campaigns\/[^/]+$/)) config = { title: "Enchantment",   sub: "Campaign Dashboard" }
    else config = { title: "Lumos" }
  }

  return (
    <header
      className="h-16 flex items-center justify-between px-6 sticky top-0 z-40"
      style={{
        background: "rgba(10, 4, 18, 0.92)",
        borderBottom: "1px solid rgba(245, 230, 66, 0.1)",
        backdropFilter: "blur(12px)",
      }}
    >
      <div>
        <h1 className="font-cinzel font-semibold text-white text-lg leading-tight">
          {config.title}
        </h1>
        {config.sub && config.sub !== config.title && (
          <p className="text-[11px] font-raleway text-[#A89BC2] mt-0.5 leading-none">{config.sub}</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        {config.action && (
          <Link
            href={config.action.href}
            className="btn-lumos flex items-center gap-1.5 text-sm px-4 py-2"
          >
            <Plus className="w-3.5 h-3.5" />
            {config.action.label}
          </Link>
        )}
      </div>
    </header>
  )
}
