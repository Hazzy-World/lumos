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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const creator = await prisma.creator.findUnique({
      where: { id },
      include: {
        campaigns: {
          include: { campaign: true },
        },
        research: true,
      },
    })

    if (!creator) {
      return NextResponse.json({ error: "Creator not found" }, { status: 404 })
    }

    const parsed = parseCreator(creator)
    parsed.campaigns = creator.campaigns.map((cc: any) => ({
      ...cc,
      selectedDeliverables: JSON.parse(cc.selectedDeliverables || "[]"),
    }))

    return NextResponse.json(parsed)
  } catch (error) {
    console.error("Creator GET error:", error)
    return NextResponse.json({ error: "Failed to fetch creator" }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const data: any = { ...body }
    const jsonFields = ["language", "niches", "platforms", "audienceInterests", "pastBrandCollabs", "blacklistedBrands", "tags"]
    for (const field of jsonFields) {
      if (Array.isArray(data[field])) {
        data[field] = JSON.stringify(data[field])
      }
    }
    const objFields = ["audienceGenderSplit", "audienceAgeBreakdown", "audienceTopCountries", "rateCustom"]
    for (const field of objFields) {
      if (data[field] !== undefined && typeof data[field] === "object") {
        data[field] = JSON.stringify(data[field])
      }
    }

    const creator = await prisma.creator.update({
      where: { id },
      data,
    })

    return NextResponse.json(parseCreator(creator))
  } catch (error) {
    console.error("Creator PUT error:", error)
    return NextResponse.json({ error: "Failed to update creator" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.creator.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Creator DELETE error:", error)
    return NextResponse.json({ error: "Failed to delete creator" }, { status: 500 })
  }
}
