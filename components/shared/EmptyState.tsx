import Link from "next/link"
import { cn } from "@/lib/utils"

interface EmptyStateProps {
  variant?: "creators" | "campaigns" | "search" | "generic"
  title?: string
  description?: string
  action?: { label: string; href?: string; onClick?: () => void }
  className?: string
}

function TelescopeIllustration() {
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="36" cy="36" r="35" fill="rgba(123,47,190,0.08)" stroke="rgba(245,230,66,0.12)" strokeWidth="1"/>
      {/* Stars */}
      <circle cx="18" cy="16" r="1.2" fill="#F5E642" opacity="0.6"/>
      <circle cx="55" cy="22" r="0.9" fill="#F5E642" opacity="0.4"/>
      <circle cx="60" cy="14" r="1.4" fill="#F5E642" opacity="0.5"/>
      <circle cx="12" cy="28" r="0.8" fill="#F5E642" opacity="0.3"/>
      {/* Telescope body */}
      <rect x="28" y="34" width="24" height="8" rx="4" fill="#7B2FBE" opacity="0.7" transform="rotate(-30 28 34)"/>
      <rect x="22" y="32" width="14" height="10" rx="5" fill="#A89BC2" opacity="0.5" transform="rotate(-30 22 32)"/>
      {/* Lens glow */}
      <circle cx="44" cy="24" r="5" fill="rgba(245,230,66,0.2)" stroke="#F5E642" strokeWidth="1.5"/>
      <circle cx="44" cy="24" r="3" fill="rgba(245,230,66,0.15)"/>
      {/* Tripod */}
      <line x1="34" y1="50" x2="28" y2="62" stroke="#A89BC2" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
      <line x1="34" y1="50" x2="34" y2="62" stroke="#A89BC2" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
      <line x1="34" y1="50" x2="40" y2="62" stroke="#A89BC2" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
    </svg>
  )
}

function ScrollIllustration() {
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="36" cy="36" r="35" fill="rgba(123,47,190,0.08)" stroke="rgba(245,230,66,0.12)" strokeWidth="1"/>
      {/* Scroll */}
      <rect x="18" y="22" width="36" height="28" rx="3" fill="rgba(26,10,46,0.8)" stroke="rgba(245,230,66,0.2)" strokeWidth="1.2"/>
      <rect x="14" y="20" width="8" height="32" rx="4" fill="#7B2FBE" opacity="0.6"/>
      <rect x="50" y="20" width="8" height="32" rx="4" fill="#7B2FBE" opacity="0.6"/>
      {/* Lines */}
      <line x1="24" y1="30" x2="48" y2="30" stroke="rgba(245,230,66,0.25)" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="24" y1="35" x2="42" y2="35" stroke="rgba(245,230,66,0.25)" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="24" y1="40" x2="45" y2="40" stroke="rgba(245,230,66,0.25)" strokeWidth="1.2" strokeLinecap="round"/>
      {/* Wand */}
      <line x1="44" y1="44" x2="56" y2="56" stroke="#A89BC2" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="44" cy="44" r="3" fill="#F5E642"/>
      <line x1="44" y1="38" x2="44" y2="41" stroke="#F5E642" strokeWidth="1.4" strokeLinecap="round"/>
      <line x1="50" y1="44" x2="47" y2="44" stroke="#F5E642" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  )
}

function CrystalBallIllustration() {
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="36" cy="36" r="35" fill="rgba(123,47,190,0.08)" stroke="rgba(245,230,66,0.12)" strokeWidth="1"/>
      {/* Ball base */}
      <ellipse cx="36" cy="58" rx="12" ry="4" fill="#7B2FBE" opacity="0.3"/>
      <rect x="30" y="52" width="12" height="6" rx="2" fill="#7B2FBE" opacity="0.4"/>
      {/* Crystal ball */}
      <circle cx="36" cy="34" r="18" fill="rgba(123,47,190,0.15)" stroke="rgba(245,230,66,0.2)" strokeWidth="1.5"/>
      <circle cx="36" cy="34" r="18" fill="url(#ballGrad)"/>
      {/* Question mark */}
      <text x="30" y="40" fontFamily="serif" fontSize="18" fill="#A89BC2" opacity="0.7">?</text>
      {/* Shine */}
      <circle cx="28" cy="26" r="5" fill="rgba(255,255,255,0.06)"/>
      <defs>
        <radialGradient id="ballGrad" cx="40%" cy="35%" r="60%">
          <stop offset="0%"  stopColor="#7B2FBE" stopOpacity="0.4"/>
          <stop offset="100%" stopColor="#1A0A2E" stopOpacity="0.8"/>
        </radialGradient>
      </defs>
    </svg>
  )
}

function GenericIllustration() {
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="36" cy="36" r="35" fill="rgba(123,47,190,0.08)" stroke="rgba(245,230,66,0.12)" strokeWidth="1"/>
      <circle cx="36" cy="36" r="12" fill="rgba(245,230,66,0.08)" stroke="rgba(245,230,66,0.2)" strokeWidth="1.5"/>
      {/* Wand */}
      <line x1="46" y1="26" x2="26" y2="46" stroke="#A89BC2" strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx="46" cy="26" r="4" fill="#F5E642"/>
      <line x1="46" y1="18" x2="46" y2="22" stroke="#F5E642" strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="54" y1="26" x2="50" y2="26" stroke="#F5E642" strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="52" y1="20" x2="49" y2="23" stroke="#F5E642" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
    </svg>
  )
}

const VARIANTS = {
  creators: {
    illustration: <TelescopeIllustration />,
    title: "The registry is empty",
    description: "No creators in the registry yet. Use Talent Scout or add your first talent manually.",
    actionLabel: "✦ New Talent",
  },
  campaigns: {
    illustration: <ScrollIllustration />,
    title: "No campaigns active",
    description: "No campaigns have been created. Start your first campaign to bring talent together.",
    actionLabel: "✦ New Campaign",
  },
  search: {
    illustration: <CrystalBallIllustration />,
    title: "The crystal ball sees nothing",
    description: "No results match your search. Try different terms or broaden your filters.",
    actionLabel: undefined,
  },
  generic: {
    illustration: <GenericIllustration />,
    title: "Nothing here yet",
    description: "This section is empty. Check back soon or take an action to get started.",
    actionLabel: undefined,
  },
}

export default function EmptyState({
  variant = "generic",
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  const v = VARIANTS[variant]
  const displayTitle = title || v.title
  const displayDesc = description || v.description
  const actionLabel = action?.label || v.actionLabel

  return (
    <div className={cn("flex flex-col items-center justify-center py-16 text-center", className)}>
      <div className="mb-5 opacity-90">{v.illustration}</div>

      <h3 className="font-cinzel font-semibold text-white text-lg mb-2">{displayTitle}</h3>
      <p className="font-inter text-[#A89BC2] text-sm max-w-xs leading-relaxed mb-7">{displayDesc}</p>

      {action && actionLabel && (
        action.href ? (
          <Link href={action.href} className="btn-lumos">
            {actionLabel}
          </Link>
        ) : (
          <button onClick={action.onClick} className="btn-lumos">
            {actionLabel}
          </button>
        )
      )}
    </div>
  )
}
