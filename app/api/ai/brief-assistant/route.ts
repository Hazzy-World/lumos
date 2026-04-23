import { NextRequest } from "next/server"
import { anthropic, MODEL, createStreamResponse } from "@/lib/anthropic"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { messages, campaign, creators } = body as {
      messages: Array<{ role: "user" | "assistant"; content: string }>
      campaign: {
        name: string
        brandName: string
        brief: string
        objectives: string[]
        targetAudience: string
        targetCountries: string[]
        platforms: string[]
        budget: number
      }
      creators: Array<{ name: string; tier: string; niches: string[] }>
    }

    if (!messages || messages.length === 0) {
      return new Response("No messages provided", { status: 400 })
    }

    const creatorList = creators
      ?.slice(0, 20)
      .map((c) => `${c.name} (${c.tier}, ${c.niches.join(", ")})`)
      .join("; ")

    const systemPrompt = `You are Flamenzi's senior campaign strategist. You have deep knowledge of the MENA influencer marketing landscape, particularly Saudi Arabia, UAE, Egypt, and Jordan. You understand both Arabic and Western cultural nuances in content. You are advising on a campaign for ${campaign?.brandName || "a brand"}.

${
  campaign
    ? `CAMPAIGN CONTEXT:
Name: ${campaign.name}
Brand: ${campaign.brandName}
Brief: ${campaign.brief}
Objectives: ${campaign.objectives?.join(", ")}
Target Audience: ${campaign.targetAudience}
Target Countries: ${campaign.targetCountries?.join(", ")}
Platforms: ${campaign.platforms?.join(", ")}
Budget: $${campaign.budget?.toLocaleString()}

SELECTED CREATORS: ${creatorList || "None selected yet"}`
    : ""
}

Answer all questions with specific, actionable, culturally-informed recommendations. Be direct and practical. Reference specific creators by name when relevant. Consider Ramadan, national day campaigns, and regional market dynamics when appropriate.`

    const stream = await anthropic.messages.stream({
      model: MODEL,
      max_tokens: 2000,
      system: systemPrompt,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    })

    return createStreamResponse(stream)
  } catch (error) {
    console.error("Brief assistant error:", error)
    return new Response("Chat failed", { status: 500 })
  }
}
