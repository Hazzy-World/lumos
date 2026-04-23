import { NextRequest, NextResponse } from "next/server"
import { anthropic, MODEL } from "@/lib/anthropic"
import { calcCreatorEngagement } from "@/lib/rate-utils"

const rateLimitMap = new Map<string, number>()

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown"
  const now = Date.now()
  const last = rateLimitMap.get(ip) || 0
  if (now - last < 10000) {
    return NextResponse.json({ error: "Too many requests. Please wait a moment." }, { status: 429 })
  }
  rateLimitMap.set(ip, now)

  try {
    const body = await request.json()
    const { campaign, creators } = body as {
      campaign: {
        name: string
        brandName: string
        brief: string
        objectives: string[]
        targetAudience: string
        targetCountries: string[]
        targetNiches: string[]
        platforms: string[]
        budget: number
      }
      creators: Array<{
        id: string
        name: string
        tier: string
        niches: string[]
        platforms: string[]
        country: string
        instagramFollowers?: number | null
        instagramAvgLikes?: number | null
        instagramAvgComments?: number | null
        tiktokFollowers?: number | null
        tiktokAvgLikes?: number | null
        tiktokAvgComments?: number | null
        tiktokAvgShares?: number | null
        youtubeSubscribers?: number | null
        audienceGenderSplit?: { male: number; female: number } | null
        audienceAgeBreakdown?: Record<string, number> | null
        audienceTopCountries?: Array<{ country: string; percentage: number }> | null
        pastBrandCollabs?: string[]
        rateInstagramPost?: number | null
        rateInstagramReel?: number | null
        rateTikTokVideo?: number | null
        rateYouTubeIntegration?: number | null
        rateYouTubeDedicated?: number | null
      }>
    }

    if (!campaign || !creators) {
      return NextResponse.json({ error: "Missing campaign or creators" }, { status: 400 })
    }

    const creatorSummaries = creators
      .slice(0, 50)
      .map(
        (c) =>
          `ID: ${c.id} | Name: ${c.name} | Tier: ${c.tier} | Country: ${c.country} | ` +
          `Niches: ${c.niches.join(", ")} | Platforms: ${c.platforms.join(", ")} | ` +
          `Top followers: ${Math.max(c.instagramFollowers || 0, c.tiktokFollowers || 0, c.youtubeSubscribers || 0).toLocaleString()} | ` +
          `Eng rate: ${calcCreatorEngagement(c as Record<string, unknown>)?.toFixed(2) ?? "N/A"}% | ` +
          `Past collabs: ${(c.pastBrandCollabs || []).join(", ") || "None"} | ` +
          `IG Post rate: $${c.rateInstagramPost || "N/A"} | TikTok rate: $${c.rateTikTokVideo || "N/A"} | YT rate: $${c.rateYouTubeIntegration || "N/A"}`
      )
      .join("\n")

    const prompt = `You are Lumos's senior talent strategist. Analyze this campaign and rank the best creator matches from the database.

CAMPAIGN:
Name: ${campaign.name}
Brand: ${campaign.brandName}
Brief: ${campaign.brief}
Objectives: ${campaign.objectives.join(", ")}
Target Audience: ${campaign.targetAudience}
Target Countries: ${campaign.targetCountries.join(", ")}
Target Niches: ${campaign.targetNiches.join(", ")}
Platforms: ${campaign.platforms.join(", ")}
Budget: $${campaign.budget?.toLocaleString()}

AVAILABLE CREATORS:
${creatorSummaries}

Return a JSON array of up to 15 best matches. For each match:
{
  "creatorId": "<id from database>",
  "matchScore": <0-100>,
  "reasoning": "<3-4 sentences explaining why this creator is a strong fit for this specific campaign>",
  "recommendedDeliverables": ["<deliverable type>"],
  "estimatedTotalClientRate": <number in USD>,
  "redFlags": ["<any concern>"],
  "strategicNote": "<one creative idea for how to use this creator specifically in this campaign>"
}

Be specific and accurate. Match score 80-100 = excellent fit, 60-79 = good fit, below 60 = possible but not ideal.
Return ONLY the JSON array, no other text.`

    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 4000,
      messages: [{ role: "user", content: prompt }],
    })

    const content = message.content[0]
    if (content.type !== "text") {
      return NextResponse.json({ error: "Invalid AI response" }, { status: 500 })
    }

    let matches
    try {
      const cleaned = content.text.trim().replace(/^```json\n?/, "").replace(/\n?```$/, "")
      matches = JSON.parse(cleaned)
    } catch {
      return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 })
    }

    return NextResponse.json({ matches })
  } catch (error) {
    console.error("AI match error:", error)
    return NextResponse.json({ error: "AI matching failed" }, { status: 500 })
  }
}
