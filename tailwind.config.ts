import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      colors: {
        lumos: {
          bg:       "#0A0412",
          deep:     "#1A0A2E",
          surface:  "#120820",
          gold:     "#F5E642",
          glow:     "#FFD700",
          purple:   "#7B2FBE",
          lavender: "#A89BC2",
        },
        // legacy tokens kept so existing hardcoded usages still resolve
        flamenzi: {
          red:     "#C8102E",
          navy:    "#1A1A2E",
          gold:    "#F5A623",
          bg:      "#0D0D0D",
          surface: "#161616",
          border:  "#2A2A2A",
        },
        border:      "hsl(var(--border))",
        input:       "hsl(var(--input))",
        ring:        "hsl(var(--ring))",
        background:  "hsl(var(--background))",
        foreground:  "hsl(var(--foreground))",
        primary: {
          DEFAULT:    "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT:    "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT:    "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT:    "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT:    "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT:    "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT:    "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        // Remap font-syne → Cinzel so ALL existing font-syne classes use the new font automatically
        syne:    ["var(--font-cinzel)", "serif"],
        cinzel:  ["var(--font-cinzel)", "serif"],
        raleway: ["var(--font-raleway)", "sans-serif"],
        inter:   ["var(--font-inter)", "sans-serif"],
      },
      boxShadow: {
        "glow-gold":    "0 0 20px rgba(245, 230, 66, 0.4)",
        "glow-gold-lg": "0 0 40px rgba(245, 230, 66, 0.5), 0 0 80px rgba(245, 230, 66, 0.2)",
        "glow-purple":  "0 0 20px rgba(123, 47, 190, 0.4)",
        "card-lumos":   "0 4px 24px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(245, 230, 66, 0.05)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to:   { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to:   { height: "0" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 8px rgba(245, 230, 66, 0.3)" },
          "50%":      { boxShadow: "0 0 28px rgba(245, 230, 66, 0.8)" },
        },
        "wand-glow": {
          "0%, 100%": { filter: "drop-shadow(0 0 4px #F5E642) drop-shadow(0 0 8px rgba(245,230,66,0.4))" },
          "50%":      { filter: "drop-shadow(0 0 10px #FFD700) drop-shadow(0 0 20px rgba(255,215,0,0.6))" },
        },
        "float-particle": {
          "0%, 100%": { transform: "translateY(0px) scale(1)",    opacity: "0.3" },
          "50%":      { transform: "translateY(-18px) scale(1.3)", opacity: "0.7" },
        },
        "particle-rise": {
          "0%":   { transform: "translateY(0)",    opacity: "0" },
          "10%":  { opacity: "1" },
          "90%":  { opacity: "0.6" },
          "100%": { transform: "translateY(-80px)", opacity: "0" },
        },
        "shimmer": {
          "0%":   { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
        "logo-pulse": {
          "0%, 100%": { filter: "drop-shadow(0 0 5px rgba(245,230,66,0.4))" },
          "50%":      { filter: "drop-shadow(0 0 18px rgba(245,230,66,0.9))" },
        },
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to:   { transform: "rotate(360deg)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up":   "accordion-up 0.2s ease-out",
        "pulse-glow":     "pulse-glow 2.5s ease-in-out infinite",
        "wand-glow":      "wand-glow 2s ease-in-out infinite",
        "float-particle": "float-particle 4s ease-in-out infinite",
        "particle-rise":  "particle-rise 3s ease-out infinite",
        "shimmer":        "shimmer 3s linear infinite",
        "logo-pulse":     "logo-pulse 3s ease-in-out infinite",
        "spin-slow":      "spin-slow 4s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config
