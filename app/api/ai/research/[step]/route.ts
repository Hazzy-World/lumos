import { NextRequest } from "next/server"
import { anthropic, MODEL, createStreamResponse } from "@/lib/anthropic"

const STEP_PROMPTS: Record<string, (creator: Record<string, unknown>, prevResults: Record<string, string>) => string> = {
  "1": (creator) => `You are a senior audience strategist at a top influencer marketing agency. Analyze this creator's data and produce a deep audience and tone analysis.

CREATOR DATA:
Name: ${creator.name}${creator.nameAr ? ` (${creator.nameAr})` : ""}
Country: ${creator.country}${creator.city ? `, ${creator.city}` : ""}
Bio: ${creator.bio}
Tier: ${creator.tier}
Niches: ${(creator.niches as string[]).join(", ")}
Languages: ${(creator.language as string[]).join(", ")}

Platform stats:
${creator.instagramHandle ? `- Instagram: @${creator.instagramHandle}, ${creator.instagramFollowers?.toLocaleString()} followers, ${creator.instagramEngagementRate}% engagement` : ""}
${creator.tiktokHandle ? `- TikTok: @${creator.tiktokHandle}, ${creator.tiktokFollowers?.toLocaleString()} followers, ${creator.tiktokEngagementRate}% engagement, ${creator.tiktokAvgViews?.toLocaleString()} avg views` : ""}
${creator.youtubeHandle ? `- YouTube: @${creator.youtubeHandle}, ${creator.youtubeSubscribers?.toLocaleString()} subscribers, ${creator.youtubeAvgViews?.toLocaleString()} avg views` : ""}
${creator.twitchHandle ? `- Twitch: @${creator.twitchHandle}, ${creator.twitchFollowers?.toLocaleString()} followers, ${creator.twitchAvgCCV?.toLocaleString()} avg CCV` : ""}
${creator.kickHandle ? `- Kick: @${creator.kickHandle}, ${creator.kickFollowers?.toLocaleString()} followers` : ""}

Audience data:
${creator.audienceGenderSplit ? `Gender: ${JSON.stringify(creator.audienceGenderSplit)}` : ""}
${creator.audienceAgeBreakdown ? `Age: ${JSON.stringify(creator.audienceAgeBreakdown)}` : ""}
${creator.audienceTopCountries ? `Top countries: ${JSON.stringify(creator.audienceTopCountries)}` : ""}

Past brand collabs: ${(creator.pastBrandCollabs as string[])?.join(", ") || "None listed"}

Write a comprehensive analysis covering these four sections:

## Section A — Audience Persona
Write a vivid, detailed description of who this creator's core audience is. Include: age range, gender tendency, cultural background, what they likely do for work/school, what they care about, what platforms they use, what time of day they're active, what content they engage with most. Write as a rich narrative paragraph.

## Section B — Content Tone & Voice
Describe the creator's content style in detail. What is the register (formal/casual/humorous)? What are their verbal habits? What topics do they gravitate toward? What makes their content feel distinct? What do their audience come back for?

## Section C — Cultural Positioning
How does this creator sit within the MENA content landscape? Are they bridging Arabic and Western aesthetics? Are they locally rooted or internationally oriented? What cultural touchpoints define their brand?

## Section D — Brand Safety Assessment
Based on their content style and audience, which brand categories are a natural fit? Which categories would feel forced or risk backlash? Any concerns an agency should flag?`,

  "2": (creator, prev) => `You are a content strategist building a full content architecture for a creator. You understand platform algorithms, audience psychology, and the MENA content market.

CREATOR:
Name: ${creator.name}
Niches: ${(creator.niches as string[]).join(", ")}
Platforms: ${(creator.platforms as string[]).join(", ")}
Country: ${creator.country}

STEP 1 ANALYSIS:
${prev["1"] || "Not available"}

Generate a comprehensive content strategy as JSON with this exact structure:
{
  "contentPillars": [
    {
      "pillarName": "string",
      "description": "string (2-3 sentences)",
      "platforms": ["string"],
      "contentRhythm": "string",
      "audienceResonanceReason": "string"
    }
  ],
  "contentIdeas": [
    {
      "pillar": "string",
      "title": "string",
      "platform": "string",
      "format": "string",
      "hook": "string",
      "concept": "string",
      "callToAction": "string",
      "estimatedEngagementPotential": "Low|Medium|High|Viral Potential"
    }
  ],
  "platformStrategy": {
    "platformName": {
      "primaryRole": "string",
      "postingFrequency": "string",
      "bestFormats": ["string"],
      "growthTactic": "string"
    }
  },
  "trendingFormats": [
    {
      "format": "string",
      "whyRelevant": "string",
      "applicationIdea": "string"
    }
  ]
}

Include 4-6 content pillars, 12-15 content ideas across all pillars, strategy for each platform, and 3-5 trending formats.
Return ONLY valid JSON.`,

  "3": (creator, prev) => `You are a commercial partnerships director with deep knowledge of the MENA advertising market. Build a complete brand partnership strategy for this creator.

CREATOR:
Name: ${creator.name}
Niches: ${(creator.niches as string[]).join(", ")}
Country: ${creator.country}
Tier: ${creator.tier}
Past collabs: ${(creator.pastBrandCollabs as string[])?.join(", ") || "None"}

PREVIOUS RESEARCH:
${prev["1"] || ""}
${prev["2"] ? "Content strategy available." : ""}

Generate a brand partnership strategy as JSON:
{
  "idealBrandCategories": [
    {
      "category": "string",
      "fitScore": 0-100,
      "reasoning": "string",
      "exampleBrands": ["string"]
    }
  ],
  "integrationFormats": [
    {
      "format": "string",
      "platforms": ["string"],
      "naturalFitReason": "string",
      "exampleBrief": "string (one paragraph mock brief)"
    }
  ],
  "messagingAngles": [
    {
      "angle": "string",
      "description": "string",
      "exampleCaption": "string"
    }
  ],
  "avoidCategories": [
    {
      "category": "string",
      "reason": "string"
    }
  ],
  "pricingStrategy": {
    "currentRateAssessment": "string",
    "recommendedRateAdjustments": "string",
    "premiumOpportunities": "string"
  }
}

Include 6-8 ideal brand categories, 5-6 integration formats, 3-4 messaging angles, avoid categories, and pricing strategy.
Return ONLY valid JSON.`,

  "4": (creator, prev) => `You are the creative director at a premium influencer marketing agency. You create high-concept visual and narrative directions for creators. Your output should feel like it came from a luxury branding studio.

CREATOR:
Name: ${creator.name}
Country: ${creator.country}
Niches: ${(creator.niches as string[]).join(", ")}
Tier: ${creator.tier}

PREVIOUS RESEARCH CONTEXT:
Audience: ${prev["1"] ? "Available" : "Not available"}
Content Strategy: ${prev["2"] ? "Available" : "Not available"}
Brand Strategy: ${prev["3"] ? "Available" : "Not available"}

Create 3 distinct creative directions as JSON:
{
  "creativeDirections": [
    {
      "directionName": "string (evocative, short — e.g. Raw Luxury)",
      "tagline": "string (one punchy line)",
      "conceptStatement": "string (a paragraph — what this direction IS)",
      "visualStyle": {
        "lighting": "string",
        "colorPalette": ["#hex Colorname"],
        "composition": "string",
        "texture": "string",
        "referenceAesthetic": "string (describe the visual world in detail)"
      },
      "shotIdeas": [
        {
          "sceneName": "string",
          "description": "string (detailed scene description)",
          "platform": "string",
          "format": "string"
        }
      ],
      "captionStyle": "string",
      "hashtagApproach": "string",
      "brandsThatFitThisDirection": ["string"]
    }
  ]
}

Each direction should feel completely different. Include 5 shot ideas per direction, 5 hex codes per colorPalette.
Return ONLY valid JSON.`,

  "5": (creator, prev) => `You are a campaign activation specialist. You create specific, executable content campaign ideas for influencer-brand partnerships. Your ideas should feel fresh, culturally aware, and designed for real results.

CREATOR:
Name: ${creator.name}
Country: ${creator.country}
Niches: ${(creator.niches as string[]).join(", ")}
Platforms: ${(creator.platforms as string[]).join(", ")}
Tier: ${creator.tier}

RESEARCH CONTEXT: Full research completed for this creator.

Generate 5 campaign activation ideas as JSON:
{
  "campaignActivations": [
    {
      "ideaTitle": "string",
      "format": "string",
      "platform": "string",
      "conceptBrief": "string (3-4 sentences)",
      "creativeAngle": "string (the unexpected twist or hook)",
      "heroContentTreatment": "string (detailed treatment — shot by shot)",
      "supportingContentPlan": [
        {
          "contentType": "string",
          "platform": "string",
          "purpose": "string",
          "timing": "string"
        }
      ],
      "kpis": ["string"],
      "estimatedPerformance": "string",
      "productionComplexity": "Low|Medium|High",
      "estimatedBudgetRange": "string"
    }
  ]
}

Return ONLY valid JSON.`,
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ step: string }> }
) {
  const { step } = await params

  try {
    const body = await request.json()
    const { creator, previousResults = {} } = body as {
      creator: Record<string, unknown>
      previousResults: Record<string, string>
    }

    if (!creator) {
      return new Response("Missing creator data", { status: 400 })
    }

    const promptFn = STEP_PROMPTS[step]
    if (!promptFn) {
      return new Response("Invalid step", { status: 400 })
    }

    const prompt = promptFn(creator, previousResults)

    const stream = await anthropic.messages.stream({
      model: MODEL,
      max_tokens: 6000,
      messages: [{ role: "user", content: prompt }],
    })

    return createStreamResponse(stream)
  } catch (error) {
    console.error("Research step error:", error)
    return new Response("Research generation failed", { status: 500 })
  }
}
