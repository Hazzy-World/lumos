"use client"

import { useRef, useState } from "react"
import { cn } from "@/lib/utils"

interface StreamingTextProps {
  streamUrl: string
  body: object
  onComplete?: (text: string) => void
  className?: string
  autoStart?: boolean
}

export function useStreamingText(streamUrl: string, body: object) {
  const [text, setText] = useState("")
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDone, setIsDone] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  const start = async () => {
    if (isStreaming) return
    setText("")
    setError(null)
    setIsDone(false)
    setIsStreaming(true)

    abortRef.current = new AbortController()

    try {
      const res = await fetch(streamUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: abortRef.current.signal,
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      if (!res.body) throw new Error("No response body")

      const reader = res.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        setText((prev) => prev + decoder.decode(value, { stream: true }))
      }

      setIsDone(true)
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setError((err as Error).message || "Streaming failed")
      }
    } finally {
      setIsStreaming(false)
    }
  }

  const stop = () => {
    abortRef.current?.abort()
    setIsStreaming(false)
  }

  const reset = () => {
    stop()
    setText("")
    setError(null)
    setIsDone(false)
  }

  return { text, isStreaming, error, isDone, start, stop, reset }
}

export default function StreamingText({ className }: { className?: string }) {
  return <div className={cn("text-sm text-[#A0A0A0]", className)}>Use useStreamingText hook</div>
}
