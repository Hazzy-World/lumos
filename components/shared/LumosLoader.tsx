"use client"

import { useState, useEffect } from "react"

const PHRASES = [
  "Summoning data...",
  "Consulting the Pensieve...",
  "Reading the stars...",
  "Casting Accio...",
  "Illuminating...",
  "Conjuring results...",
]

interface LumosLoaderProps {
  text?: string
  size?: "sm" | "md" | "lg"
  inline?: boolean
}

export default function LumosLoader({ text, size = "md", inline = false }: LumosLoaderProps) {
  const [phraseIdx, setPhraseIdx] = useState(0)

  useEffect(() => {
    if (text) return
    const t = setInterval(() => setPhraseIdx(i => (i + 1) % PHRASES.length), 2200)
    return () => clearInterval(t)
  }, [text])

  const wandSize = size === "sm" ? 36 : size === "lg" ? 72 : 52

  if (inline) {
    return (
      <span className="inline-flex items-center gap-2">
        <svg width="18" height="18" viewBox="0 0 34 34" fill="none" className="animate-spin-slow flex-shrink-0">
          <line x1="24" y1="10" x2="7" y2="27" stroke="#A89BC2" strokeWidth="2.8" strokeLinecap="round"/>
          <circle cx="24" cy="10" r="3.2" fill="#F5E642" className="animate-wand-glow"/>
        </svg>
        <span className="font-cinzel text-[#A89BC2] text-xs tracking-wider">
          {text || PHRASES[phraseIdx]}
        </span>
      </span>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center gap-5 py-14">
      {/* Wand with orbiting particles */}
      <div className="relative" style={{ width: wandSize + 20, height: wandSize + 20 }}>
        <svg
          width={wandSize}
          height={wandSize}
          viewBox="0 0 34 34"
          fill="none"
          className="animate-spin-slow absolute inset-0 m-auto"
          style={{ animationDuration: "3.5s" }}
        >
          <line x1="24" y1="10" x2="7" y2="27" stroke="#A89BC2" strokeWidth="2.8" strokeLinecap="round"/>
          <circle cx="24" cy="10" r="5.5" fill="#F5E642" opacity="0.15"/>
          <circle cx="24" cy="10" r="3.2" fill="#F5E642"/>
          <line x1="24" y1="3"  x2="24" y2="7"  stroke="#F5E642" strokeWidth="1.8" strokeLinecap="round"/>
          <line x1="31" y1="10" x2="27" y2="10" stroke="#F5E642" strokeWidth="1.8" strokeLinecap="round"/>
          <line x1="29" y1="5"  x2="26" y2="8"  stroke="#F5E642" strokeWidth="1.8" strokeLinecap="round"/>
          <line x1="19" y1="5"  x2="21" y2="8"  stroke="#F5E642" strokeWidth="1.4" strokeLinecap="round" opacity="0.7"/>
          <line x1="29" y1="15" x2="26" y2="12" stroke="#F5E642" strokeWidth="1.4" strokeLinecap="round" opacity="0.7"/>
        </svg>
        {/* Floating particle trails */}
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: (3 - i * 0.6) + "px",
              height: (3 - i * 0.6) + "px",
              background: "#F5E642",
              top: `${25 + i * 8}%`,
              left: `${60 + i * 5}%`,
              animation: `particle-rise ${1.2 + i * 0.4}s ${i * 0.3}s ease-out infinite`,
            }}
          />
        ))}
      </div>

      {/* Cycling phrase */}
      <p
        key={phraseIdx}
        className="font-cinzel text-[#A89BC2] tracking-wider text-sm"
        style={{ animation: "fadeIn 0.4s ease-in" }}
      >
        {text || PHRASES[phraseIdx]}
      </p>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
