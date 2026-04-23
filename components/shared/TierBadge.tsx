import { cn } from "@/lib/utils"

const TIER_CONFIG = {
  NANO:  { label: "Nano",     style: { background: "rgba(107,114,128,0.2)", color: "#9CA3AF", border: "1px solid rgba(107,114,128,0.3)" } },
  MICRO: { label: "Micro",    style: { background: "rgba(123,47,190,0.2)",  color: "#C084FC", border: "1px solid rgba(123,47,190,0.35)" } },
  MID:   { label: "Mid-Tier", style: { background: "rgba(34,211,238,0.1)",  color: "#67E8F9", border: "1px solid rgba(34,211,238,0.2)" } },
  MACRO: { label: "Macro",    style: { background: "rgba(245,230,66,0.12)", color: "#F5E642", border: "1px solid rgba(245,230,66,0.25)" } },
  MEGA:  { label: "Mega",     style: { background: "rgba(255,215,0,0.15)",  color: "#FFD700", border: "1px solid rgba(255,215,0,0.35)", boxShadow: "0 0 8px rgba(255,215,0,0.25)" } },
} as const

type Tier = keyof typeof TIER_CONFIG

interface TierBadgeProps {
  tier: string
  size?: "sm" | "md"
  className?: string
}

export default function TierBadge({ tier, size = "sm", className }: TierBadgeProps) {
  const config = TIER_CONFIG[tier as Tier] || TIER_CONFIG.NANO
  return (
    <span
      className={cn(
        "inline-flex items-center rounded font-inter font-medium uppercase tracking-wide",
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs",
        className
      )}
      style={config.style}
    >
      {config.label}
    </span>
  )
}
