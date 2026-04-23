import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  status: string
  type?: "campaign" | "confirmation" | "content"
  className?: string
}

const CAMPAIGN_STYLES: Record<string, React.CSSProperties> = {
  DRAFT:     { background: "rgba(107,114,128,0.15)", color: "#9CA3AF", border: "1px solid rgba(107,114,128,0.25)" },
  ACTIVE:    { background: "rgba(74,222,128,0.12)",  color: "#4ADE80", border: "1px solid rgba(74,222,128,0.25)" },
  PAUSED:    { background: "rgba(245,230,66,0.12)",  color: "#F5E642", border: "1px solid rgba(245,230,66,0.25)" },
  COMPLETED: { background: "rgba(147,197,253,0.12)", color: "#93C5FD", border: "1px solid rgba(147,197,253,0.25)" },
  CANCELLED: { background: "rgba(248,113,113,0.12)", color: "#F87171", border: "1px solid rgba(248,113,113,0.25)" },
}

const CONFIRMATION_STYLES: Record<string, React.CSSProperties> = {
  PENDING:     { background: "rgba(245,230,66,0.12)",  color: "#F5E642", border: "1px solid rgba(245,230,66,0.25)" },
  NEGOTIATING: { background: "rgba(147,197,253,0.12)", color: "#93C5FD", border: "1px solid rgba(147,197,253,0.25)" },
  CONFIRMED:   { background: "rgba(74,222,128,0.12)",  color: "#4ADE80", border: "1px solid rgba(74,222,128,0.25)" },
  REJECTED:    { background: "rgba(248,113,113,0.12)", color: "#F87171", border: "1px solid rgba(248,113,113,0.25)" },
  DROPPED:     { background: "rgba(107,114,128,0.15)", color: "#9CA3AF", border: "1px solid rgba(107,114,128,0.25)" },
}

const CONTENT_STYLES: Record<string, React.CSSProperties> = {
  NOT_STARTED:  { background: "rgba(107,114,128,0.15)", color: "#9CA3AF",  border: "1px solid rgba(107,114,128,0.25)" },
  BRIEFED:      { background: "rgba(147,197,253,0.12)", color: "#93C5FD",  border: "1px solid rgba(147,197,253,0.25)" },
  IN_PRODUCTION:{ background: "rgba(245,230,66,0.12)",  color: "#F5E642",  border: "1px solid rgba(245,230,66,0.25)" },
  REVIEW:       { background: "rgba(192,132,252,0.15)", color: "#C084FC",  border: "1px solid rgba(192,132,252,0.3)" },
  APPROVED:     { background: "rgba(74,222,128,0.12)",  color: "#4ADE80",  border: "1px solid rgba(74,222,128,0.25)" },
  LIVE:         { background: "rgba(255,215,0,0.14)",   color: "#FFD700",  border: "1px solid rgba(255,215,0,0.3)",   boxShadow: "0 0 6px rgba(255,215,0,0.2)" },
  DONE:         { background: "rgba(107,114,128,0.15)", color: "#9CA3AF",  border: "1px solid rgba(107,114,128,0.25)" },
}

function formatLabel(s: string) {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

export default function StatusBadge({ status, type = "campaign", className }: StatusBadgeProps) {
  const styleMap =
    type === "confirmation" ? CONFIRMATION_STYLES :
    type === "content"      ? CONTENT_STYLES :
    CAMPAIGN_STYLES

  const style = styleMap[status] || { background: "rgba(107,114,128,0.15)", color: "#9CA3AF", border: "1px solid rgba(107,114,128,0.25)" }

  return (
    <span
      className={cn("inline-flex items-center rounded px-2 py-0.5 text-[10px] font-inter font-medium", className)}
      style={style}
    >
      {formatLabel(status)}
    </span>
  )
}
