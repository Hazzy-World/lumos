import { formatCurrency } from "@/lib/rate-utils"
import { cn } from "@/lib/utils"

interface RateDisplayProps {
  amount: number | null | undefined
  currency?: string
  className?: string
  variant?: "default" | "muted" | "gold"
}

export default function RateDisplay({ amount, currency = "USD", className, variant = "default" }: RateDisplayProps) {
  if (amount === null || amount === undefined) {
    return <span className={cn("text-[#A0A0A0]", className)}>—</span>
  }

  return (
    <span className={cn(
      "font-mono tabular-nums",
      variant === "default" && "text-white",
      variant === "muted" && "text-[#A0A0A0]",
      variant === "gold" && "text-[#F5A623]",
      className
    )}>
      {formatCurrency(amount, currency)}
    </span>
  )
}
