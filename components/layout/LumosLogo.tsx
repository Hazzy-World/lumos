"use client"

import Link from "next/link"

interface LumosLogoProps {
  size?: "sm" | "md" | "lg"
  animate?: boolean
  linkTo?: string
}

export default function LumosLogo({ size = "md", animate = true, linkTo = "/dashboard" }: LumosLogoProps) {
  const dims = {
    sm: { w: 26, textCls: "text-base",  subCls: "text-[8px]",  gap: "gap-2" },
    md: { w: 34, textCls: "text-xl",    subCls: "text-[9px]",  gap: "gap-2.5" },
    lg: { w: 48, textCls: "text-3xl",   subCls: "text-[11px]", gap: "gap-3" },
  }
  const d = dims[size]

  const logo = (
    <div className={`flex items-center ${d.gap} group cursor-pointer`}>
      {/* Wand SVG */}
      <div className="relative flex-shrink-0">
        <svg
          width={d.w}
          height={d.w}
          viewBox="0 0 34 34"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={animate ? "animate-logo-pulse" : ""}
        >
          {/* Wand body */}
          <line x1="24" y1="10" x2="7" y2="27" stroke="#A89BC2" strokeWidth="2.8" strokeLinecap="round"/>
          {/* Tip glow halo */}
          <circle cx="24" cy="10" r="5.5" fill="#F5E642" opacity="0.15"/>
          {/* Tip core */}
          <circle cx="24" cy="10" r="3.2" fill="#F5E642"/>
          {/* Starburst rays */}
          <line x1="24" y1="3"  x2="24" y2="7"  stroke="#F5E642" strokeWidth="1.8" strokeLinecap="round"/>
          <line x1="31" y1="10" x2="27" y2="10" stroke="#F5E642" strokeWidth="1.8" strokeLinecap="round"/>
          <line x1="29" y1="5"  x2="26" y2="8"  stroke="#F5E642" strokeWidth="1.8" strokeLinecap="round"/>
          <line x1="19" y1="5"  x2="21" y2="8"  stroke="#F5E642" strokeWidth="1.4" strokeLinecap="round" opacity="0.7"/>
          <line x1="29" y1="15" x2="26" y2="12" stroke="#F5E642" strokeWidth="1.4" strokeLinecap="round" opacity="0.7"/>
          {/* Floating sparkles */}
          <circle cx="16" cy="19" r="1.1" fill="#F5E642" opacity="0.35"/>
          <circle cx="11" cy="14" r="0.8" fill="#F5E642" opacity="0.25"/>
          <circle cx="22" cy="3"  r="0.9" fill="#FFD700" opacity="0.5"/>
        </svg>
      </div>

      {/* Text */}
      <div className="flex flex-col leading-none">
        <span
          className={`font-cinzel font-bold tracking-[0.15em] text-white ${d.textCls}`}
          style={{ textShadow: "0 0 14px rgba(245,230,66,0.55), 0 0 28px rgba(245,230,66,0.2)" }}
        >
          LUMOS
        </span>
        <span className={`font-raleway text-[#A89BC2] tracking-widest uppercase ${d.subCls} mt-0.5 opacity-70`}>
          by Flamenzi
        </span>
      </div>
    </div>
  )

  return linkTo ? <Link href={linkTo}>{logo}</Link> : logo
}
