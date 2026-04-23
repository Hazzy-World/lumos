import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

function parseCreator(c: any) {
  return {
    ...c,
    language: JSON.parse(c.language || "[]"),
    niches: JSON.parse(c.niches || "[]"),
    platforms: JSON.parse(c.platforms || "[]"),
    audienceInterests: JSON.parse(c.audienceInterests || "[]"),
    pastBrandCollabs: JSON.parse(c.pastBrandCollabs || "[]"),
    blacklistedBrands: JSON.parse(c.blacklistedBrands || "[]"),
    tags: JSON.parse(c.tags || "[]"),
    audienceGenderSplit: c.audienceGenderSplit ? JSON.parse(c.audienceGenderSplit) : null,
    audienceAgeBreakdown: c.audienceAgeBreakdown ? JSON.parse(c.audienceAgeBreakdown) : null,
    audienceTopCountries: c.audienceTopCountries ? JSON.parse(c.audienceTopCountries) : null,
    rateCustom: c.rateCustom ? JSON.parse(c.rateCustom) : null,
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const niche = searchParams.get("niche")
    const tier = searchParams.get("tier")
    const platform = searchParams.get("platform")
    const country = searchParams.get("country")
    const managedOnly = searchParams.get("managed") === "true"
    const activeOnly = searchParams.get("active") !== "false"

    const creators = await prisma.creator.findMany({
      where: {
        isActive: activeOnly ? true : undefined,
        managedByFlamenzi: managedOnly ? true : undefined,
        ...(search && {
          OR: [
            { name: { contains: search } },
            { nameAr: { contains: search } },
            { instagramHandle: { contains: search } },
            { tiktokHandle: { contains: search } },
            { youtubeHandle: { contains: search } },
            { tags: { contains: search } },
          ],
        }),
        ...(tier && { tier }),
        ...(country && { country: { contains: country } }),
      },
      orderBy: { createdAt: "desc" },
    })

    let parsed = creators.map(parseCreator)

    if (niche) {
      parsed = parsed.filter((c: any) => c.niches.includes(niche))
    }
    if (platform) {
      parsed = parsed.filter((c: any) => c.platforms.includes(platform))
    }

    return NextResponse.json(parsed)
  } catch (error) {
    console.error("Creators GET error:", error)
    return NextResponse.json({ error: "Failed to fetch creators" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const data = {
      ...body,
      language: JSON.stringify(body.language || []),
      niches: JSON.stringify(body.niches || []),
      platforms: JSON.stringify(body.platforms || []),
      audienceInterests: JSON.stringify(body.audienceInterests || []),
      pastBrandCollabs: JSON.stringify(body.pastBrandCollabs || []),
      blacklistedBrands: JSON.stringify(body.blacklistedBrands || []),
      tags: JSON.stringify(body.tags || []),
      audienceGenderSplit: body.audienceGenderSplit ? JSON.stringify(body.audienceGenderSplit) : null,
      audienceAgeBreakdown: body.audienceAgeBreakdown ? JSON.stringify(body.audienceAgeBreakdown) : null,
      audienceTopCountries: body.audienceTopCountries ? JSON.stringify(body.audienceTopCountries) : null,
      rateCustom: body.rateCustom ? JSON.stringify(body.rateCustom) : null,
    }

    const creator = await prisma.creator.create({ data })
    return NextResponse.json(parseCreator(creator), { status: 201 })
  } catch (error) {
    console.error("Creator POST error:", error)
    return NextResponse.json({ error: "Failed to create creator" }, { status: 500 })
  }
}
