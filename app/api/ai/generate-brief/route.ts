import { NextRequest } from "next/server"
import { anthropic, MODEL, createStreamResponse } from "@/lib/anthropic"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { brandName, product, goal, targetAudience, budget, keyMessage, restrictions } = body as {
      brandName: string
      product: string
      goal: string
      targetAudience: string
      budget: string
      keyMessage: string
      restrictions?: string
    }

    if (!brandName || !product || !goal) {
      return new Response("Missing required fields", { status: 400 })
    }

    const prompt = `You are a senior campaign strategist at Flamenzi, a leading MENA influencer marketing agency. Generate a comprehensive, professional campaign brief for an influencer marketing campaign.

INPUT:
Brand: ${brandName}
Product/Service: ${product}
Campaign Goal: ${goal}
Target Audience: ${targetAudience}
Budget Range: ${budget}
Key Message: ${keyMessage}
${restrictions ? `Restrictions/Requirements: ${restrictions}` : ""}

Generate a full structured campaign brief with these sections:

# ${brandName} — Influencer Marketing Campaign Brief

## Campaign Overview
[2-3 paragraph overview of the campaign context, brand positioning, and strategic approach]

## Objectives
[3-5 specific, measurable objectives as a numbered list]

## Target Audience Deep-Dive
[Detailed audience profile — demographics, psychographics, digital behavior, cultural context if MENA]

## Key Messages Hierarchy
[Primary message, secondary messages, and supporting proof points]

## Tone of Voice
[Specific guidance on how the brand should sound in creator content — what to do and avoid]

## Content Direction
[Specific creative directions, visual guidelines, content formats to prioritize]

## Recommended Deliverables
[Table or list of suggested deliverables per platform with rationale]

## KPIs & Success Metrics
[Specific metrics to track — reach, engagement, CTR, conversions, etc. with target benchmarks]

## Do's & Don'ts
[Bullet lists of specific dos and don'ts for creators]

## Timeline Suggestion
[Recommended campaign timeline from briefing to go-live]

Make this feel like a premium agency document. Be specific to the MENA market where relevant.`

    const stream = await anthropic.messages.stream({
      model: MODEL,
      max_tokens: 4000,
      messages: [{ role: "user", content: prompt }],
    })

    return createStreamResponse(stream)
  } catch (error) {
    console.error("Brief gen error:", error)
    return new Response("Brief generation failed", { status: 500 })
  }
}
