import { anthropic, MODEL } from "@/lib/anthropic"
import { NextRequest } from "next/server"

export const maxDuration = 120

interface DiscoverRequest {
  category: string
  platforms: string[]
  regions: string[]
  tiers: string[]
  language: string
  count: number
}

function determineTier(followers: number): string {
  if (followers >= 1_000_000) return "MEGA"
  if (followers >= 500_000) return "MACRO"
  if (followers >= 100_000) return "MID"
  if (followers >= 10_000) return "MICRO"
  return "NANO"
}

// Bracket-matching JSON array extractor — handles nested arrays correctly
function findJsonArray(text: string): string | null {
  let start = text.indexOf("[")
  while (start !== -1) {
    let depth = 0
    let inString = false
    let escape = false
    for (let i = start; i < text.length; i++) {
      const ch = text[i]
      if (escape) { escape = false; continue }
      if (ch === "\\" && inString) { escape = true; continue }
      if (ch === '"') { inString = !inString; continue }
      if (inString) continue
      if (ch === "[") depth++
      else if (ch === "]") {
        depth--
        if (depth === 0) return text.substring(start, i + 1)
      }
    }
    start = text.indexOf("[", start + 1)
  }
  return null
}

function parseCreatorsFromText(text: string): Record<string, unknown>[] {
  // Strategy 1: fenced code block
  const codeBlock = text.match(/```(?:json)?\s*([\s\S]+?)\s*```/)
  if (codeBlock) {
    try {
      const parsed = JSON.parse(codeBlock[1].trim())
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    } catch { /* fall through */ }
  }

  // Strategy 2: bracket-matched JSON array
  const jsonStr = findJsonArray(text)
  if (jsonStr) {
    try {
      const parsed = JSON.parse(jsonStr)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    } catch { /* fall through */ }
  }

  return []
}

function buildPrompt(req: DiscoverRequest, batchLabel: string): string {
  const platformStr = req.platforms.length > 0 ? req.platforms.join(", ") : "Instagram, TikTok, YouTube"
  const regionStr = req.regions.length > 0 ? req.regions.join(", ") : "Saudi Arabia, UAE, Egypt"
  const tierStr = req.tiers.length > 0 ? req.tiers.join(", ") : "MICRO, MID, MACRO"
  const langStr = req.language && req.language !== "Any" ? req.language : "Arabic or English"
  const perBatch = Math.ceil(req.count / 2)

  return `Use web search to find ${perBatch} real ${batchLabel} ${req.category} creators/influencers.

Requirements:
- Platforms: ${platformStr}
- Regions: ${regionStr}
- Tier range: ${tierStr}  (NANO <10K | MICRO 10K-100K | MID 100K-500K | MACRO 500K-1M | MEGA 1M+)
- Language: ${langStr}

Search for their actual social media profiles, verify follower counts, then output a JSON array.

[
  {
    "name": "Display Name",
    "handle": "@username",
    "platform": "Instagram",
    "bio": "Short creator bio",
    "followers": 250000,
    "engagementRate": 3.5,
    "tier": "MID",
    "niches": ["${req.category}"],
    "country": "Saudi Arabia",
    "language": "Arabic",
    "profileImageUrl": ""
  }
]`
}

const SYSTEM = `You are a social media creator researcher with access to web search.
When asked to find creators, search the web to discover real active creators and verify their stats.
IMPORTANT: Your entire response must be a single valid JSON array starting with [ and ending with ].
Do not include any explanation, introduction, or text outside the JSON array.`

export async function POST(request: NextRequest) {
  const body: DiscoverRequest = await request.json()
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const emit = (data: object) =>
        controller.enqueue(encoder.encode(JSON.stringify(data) + "\n"))

      const seen = new Set<string>()

      const batches = [
        { label: "established", status: `Searching for top ${body.category} creators...` },
        { label: "rising", status: `Finding emerging ${body.category} creators...` },
      ]

      try {
        for (const batch of batches) {
          emit({ type: "status", message: batch.status })

          const response = await anthropic.messages.create({
            model: MODEL,
            max_tokens: 4000,
            system: SYSTEM,
            tools: [{ type: "web_search_20250305" as const, name: "web_search" as const }],
            messages: [{ role: "user", content: buildPrompt(body, batch.label) }],
          })

          const text = response.content
            .filter((b) => b.type === "text")
            .map((b) => (b.type === "text" ? b.text : ""))
            .join("\n")

          const creators = parseCreatorsFromText(text)

          for (const c of creators) {
            const handle = String(c.handle || "").toLowerCase()
            const name = String(c.name || "")
            const key = handle || name.toLowerCase()
            if (!key || seen.has(key)) continue
            seen.add(key)

            const followers = Number(c.followers) || 0
            const tier = String(c.tier || determineTier(followers))

            emit({
              type: "creator",
              data: {
                name,
                handle: String(c.handle || ""),
                platform: String(c.platform || "Instagram"),
                bio: String(c.bio || ""),
                followers,
                engagementRate: Number(c.engagementRate) || 0,
                tier,
                niches: Array.isArray(c.niches) ? c.niches : [body.category],
                country: String(c.country || ""),
                language: String(c.language || ""),
                profileImageUrl: String(c.profileImageUrl || ""),
              },
            })
          }
        }

        emit({ type: "done" })
        controller.close()
      } catch (e) {
        emit({ type: "error", message: (e as Error).message })
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson",
      "Cache-Control": "no-cache",
      "Transfer-Encoding": "chunked",
    },
  })
}
