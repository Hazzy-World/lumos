import { anthropic, MODEL } from "@/lib/anthropic"
import { NextRequest, NextResponse } from "next/server"

export const maxDuration = 60

type FieldSource = "api" | "ai" | "none"

interface LookupResult {
  name: string
  bio: string
  platform: string
  handle: string
  followers: number
  avgLikes: number
  avgComments: number
  avgShares: number
  avgViews: number
  country: string
  profileImageUrl: string
  sources: Record<string, FieldSource>
}

// Bracket-matching JSON object extractor
function findJsonObject(text: string): string | null {
  let start = text.indexOf("{")
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
      if (ch === "{") depth++
      else if (ch === "}") {
        depth--
        if (depth === 0) return text.substring(start, i + 1)
      }
    }
    start = text.indexOf("{", start + 1)
  }
  return null
}

function extractJsonObject(text: string): Record<string, unknown> | null {
  // Strategy 1: fenced code block
  const codeBlock = text.match(/```(?:json)?\s*([\s\S]+?)\s*```/)
  if (codeBlock) {
    try {
      const parsed = JSON.parse(codeBlock[1].trim())
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) return parsed
    } catch { /* fall through */ }
  }

  // Strategy 2: bracket-matched JSON object
  const jsonStr = findJsonObject(text)
  if (jsonStr) {
    try {
      const parsed = JSON.parse(jsonStr)
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) return parsed
    } catch { /* fall through */ }
  }

  return null
}

async function lookupYouTube(handle: string): Promise<LookupResult> {
  const apiKey = process.env.YOUTUBE_API_KEY
  const cleanHandle = handle.replace(/^@/, "")

  if (!apiKey || apiKey === "your-youtube-api-key-here") {
    return fallbackWithAI("YouTube", handle)
  }

  const url = `https://www.googleapis.com/youtube/v3/channels?forHandle=${cleanHandle}&part=snippet,statistics&key=${apiKey}`
  const res = await fetch(url)
  const data = await res.json()

  if (!data.items || data.items.length === 0) {
    return fallbackWithAI("YouTube", handle)
  }

  const item = data.items[0]
  const subs = parseInt(item.statistics?.subscriberCount || "0")
  const views = parseInt(item.statistics?.viewCount || "0")
  const videoCount = Math.max(parseInt(item.statistics?.videoCount || "1"), 1)
  const avgViews = Math.round(views / videoCount)

  return {
    name: item.snippet?.title || cleanHandle,
    bio: (item.snippet?.description || "").substring(0, 500),
    platform: "YouTube",
    handle: `@${(item.snippet?.customUrl || cleanHandle).replace(/^@/, "")}`,
    followers: subs,
    avgLikes: 0,
    avgComments: 0,
    avgShares: 0,
    avgViews,
    country: item.snippet?.country || "",
    profileImageUrl: item.snippet?.thumbnails?.high?.url || "",
    sources: {
      name: "api",
      bio: "api",
      followers: "api",
      avgViews: "api",
      country: item.snippet?.country ? "api" : "none",
      profileImageUrl: item.snippet?.thumbnails?.high?.url ? "api" : "none",
    },
  }
}

async function scrapeOgImage(platform: string, handle: string): Promise<string | null> {
  const cleanHandle = handle.replace(/^@/, "")
  const urls: Record<string, string> = {
    Instagram: `https://www.instagram.com/${cleanHandle}/`,
    TikTok:    `https://www.tiktok.com/@${cleanHandle}`,
    Twitch:    `https://www.twitch.tv/${cleanHandle}`,
    Kick:      `https://kick.com/${cleanHandle}`,
    Snapchat:  `https://www.snapchat.com/add/${cleanHandle}`,
  }
  const url = urls[platform]
  if (!url) return null
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
      },
      signal: AbortSignal.timeout(6000),
    })
    if (!res.ok) return null
    const html = await res.text()
    const match =
      html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i)
    return match?.[1] ?? null
  } catch {
    return null
  }
}

const LOOKUP_SYSTEM = `You are a social media profile researcher with access to web search.
Search the web to find the creator's actual profile data.
IMPORTANT: Your entire response must be a single valid JSON object starting with { and ending with }.
Do not include any explanation, introduction, or text outside the JSON object.`

async function fallbackWithAI(platform: string, handle: string): Promise<LookupResult> {
  const cleanHandle = handle.replace(/^@/, "")

  const prompt = `Search the web for the ${platform} creator with the handle @${cleanHandle}.

Find their real profile and return their stats as a JSON object:
{
  "name": "Display Name",
  "bio": "Their bio (max 300 chars)",
  "handle": "@${cleanHandle}",
  "followers": 0,
  "avgLikes": 0,
  "avgComments": 0,
  "avgShares": 0,
  "avgViews": 0,
  "country": "Country name or empty string",
  "profileImageUrl": ""
}

Use 0 for any unknown numbers. Leave profileImageUrl as empty string.`

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1500,
    system: LOOKUP_SYSTEM,
    tools: [{ type: "web_search_20250305" as const, name: "web_search" as const }],
    messages: [{ role: "user", content: prompt }],
  })

  const text = response.content
    .filter((b) => b.type === "text")
    .map((b) => (b.type === "text" ? b.text : ""))
    .join("\n")

  const parsed = extractJsonObject(text)

  if (!parsed) {
    return emptyResult(platform, cleanHandle)
  }

  const followers = Number(parsed.followers) || 0
  const avgLikes = Number(parsed.avgLikes) || 0
  const avgComments = Number(parsed.avgComments) || 0
  const avgShares = Number(parsed.avgShares) || 0
  const avgViews = Number(parsed.avgViews) || 0

  // Try og:image scrape first, then fall back to whatever AI returned
  const scrapedImage = await scrapeOgImage(platform, cleanHandle)
  const profileImageUrl = scrapedImage || String(parsed.profileImageUrl || "")

  return {
    name: String(parsed.name || cleanHandle),
    bio: String(parsed.bio || ""),
    platform,
    handle: String(parsed.handle || `@${cleanHandle}`),
    followers,
    avgLikes,
    avgComments,
    avgShares,
    avgViews,
    country: String(parsed.country || ""),
    profileImageUrl,
    sources: {
      name: parsed.name ? "ai" : "none",
      bio: parsed.bio ? "ai" : "none",
      followers: followers > 0 ? "ai" : "none",
      avgLikes: avgLikes > 0 ? "ai" : "none",
      avgComments: avgComments > 0 ? "ai" : "none",
      avgViews: avgViews > 0 ? "ai" : "none",
      country: parsed.country ? "ai" : "none",
      profileImageUrl: profileImageUrl ? "api" : "none",
    },
  }
}

function emptyResult(platform: string, handle: string): LookupResult {
  return {
    name: handle,
    bio: "",
    platform,
    handle: `@${handle}`,
    followers: 0,
    avgLikes: 0,
    avgComments: 0,
    avgShares: 0,
    avgViews: 0,
    country: "",
    profileImageUrl: "",
    sources: {
      name: "none", bio: "none", followers: "none",
      avgLikes: "none", avgComments: "none", avgViews: "none",
      country: "none", profileImageUrl: "none",
    },
  }
}

export async function POST(request: NextRequest) {
  const { platform, handle } = await request.json()

  if (!platform || !handle) {
    return NextResponse.json({ error: "platform and handle required" }, { status: 400 })
  }

  try {
    const result =
      platform === "YouTube"
        ? await lookupYouTube(handle)
        : await fallbackWithAI(platform, handle)

    return NextResponse.json(result)
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
