"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Telescope,
  Megaphone,
  PlusCircle,
  Calculator,
  FileText,
  Settings,
} from "lucide-react"
import LumosLogo from "@/components/layout/LumosLogo"
import { cn } from "@/lib/utils"

const navItems = [
  {
    section: "OVERVIEW",
    items: [
      { href: "/dashboard", label: "The Great Hall", icon: LayoutDashboard },
    ],
  },
  {
    section: "TALENT",
    items: [
      { href: "/creators",          label: "Talent Registry",  icon: Users },
      { href: "/creators/new",      label: "New Talent",   icon: UserPlus },
      { href: "/creators/discover", label: "Talent Scout",       icon: Telescope },
    ],
  },
  {
    section: "ENCHANTMENTS",
    items: [
      { href: "/campaigns",     label: "Campaigns",     icon: Megaphone },
      { href: "/campaigns/new", label: "New Campaign",  icon: PlusCircle },
    ],
  },
  {
    section: "TOOLS",
    items: [
      { href: "/tools/rate-calculator", label: "Rate Engine",       icon: Calculator },
      { href: "/tools/brief-generator", label: "Brief Studio",  icon: FileText },
    ],
  },
  {
    section: "SYSTEM",
    items: [
      { href: "/settings", label: "Headmaster's Office", icon: Settings },
    ],
  },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside
      className="fixed left-0 top-0 h-screen w-[240px] flex flex-col z-50 constellation-bg"
      style={{
        background: "linear-gradient(180deg, #0A0412 0%, #0F061A 50%, #1A0A2E 100%)",
        borderRight: "1px solid rgba(245, 230, 66, 0.1)",
      }}
    >
      {/* Logo */}
      <div
        className="h-[68px] flex items-center px-5"
        style={{ borderBottom: "1px solid rgba(245, 230, 66, 0.08)" }}
      >
        <LumosLogo size="sm" animate />
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-5 px-3 space-y-5">
        {navItems.map((section) => (
          <div key={section.section}>
            <p
              className="text-[9px] font-raleway font-semibold uppercase tracking-[0.2em] px-3 mb-2"
              style={{ color: "rgba(245, 230, 66, 0.5)" }}
            >
              {section.section}
            </p>
            {section.items.map((item) => {
              const Icon = item.icon
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href))

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium transition-all duration-200 mb-0.5 group relative",
                    isActive
                      ? "text-white"
                      : "text-[#A89BC2] hover:text-[#F5E642]"
                  )}
                  style={
                    isActive
                      ? {
                          borderLeft: "3px solid #F5E642",
                          background: "rgba(245, 230, 66, 0.07)",
                          paddingLeft: "calc(0.75rem - 3px)",
                        }
                      : undefined
                  }
                >
                  {/* Hover background */}
                  {!isActive && (
                    <span
                      className="absolute inset-0 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      style={{ background: "rgba(245, 230, 66, 0.04)" }}
                    />
                  )}
                  <Icon
                    className={cn(
                      "w-4 h-4 flex-shrink-0 transition-all duration-200 relative z-10",
                      isActive
                        ? "text-[#F5E642]"
                        : "text-[#A89BC2] group-hover:text-[#F5E642]"
                    )}
                    style={isActive ? { filter: "drop-shadow(0 0 6px rgba(245,230,66,0.6))" } : undefined}
                  />
                  <span className="relative z-10 font-inter">{item.label}</span>
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div
        className="px-5 py-4"
        style={{ borderTop: "1px solid rgba(245, 230, 66, 0.08)" }}
      >
        <p className="text-[10px] font-raleway text-center tracking-wider" style={{ color: "rgba(168, 155, 194, 0.4)" }}>
          Lumos v1.0 · by Flamenzi
        </p>
      </div>
    </aside>
  )
}
