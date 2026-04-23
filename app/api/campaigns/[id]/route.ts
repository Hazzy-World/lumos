import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

function parseCampaign(c: any) {
  return {
    ...c,
    objectives: JSON.parse(c.objectives || "[]"),
    targetCountries: JSON.parse(c.targetCountries || "[]"),
    targetNiches: JSON.parse(c.targetNiches || "[]"),
    platforms: JSON.parse(c.platforms || "[]"),
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: {
        creators: {
          include: {
            creator: {
              include: { research: true },
            },
          },
        },
        proposals: true,
      },
    })

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
    }

    const parsed = parseCampaign(campaign)
    parsed.creators = campaign.creators.map((cc: any) => ({
      ...cc,
      selectedDeliverables: JSON.parse(cc.selectedDeliverables || "[]"),
      creator: {
        ...cc.creator,
        language: JSON.parse(cc.creator.language || "[]"),
        niches: JSON.parse(cc.creator.niches || "[]"),
        platforms: JSON.parse(cc.creator.platforms || "[]"),
        pastBrandCollabs: JSON.parse(cc.creator.pastBrandCollabs || "[]"),
        tags: JSON.parse(cc.creator.tags || "[]"),
      },
    }))

    return NextResponse.json(parsed)
  } catch (error) {
    console.error("Campaign GET error:", error)
    return NextResponse.json({ error: "Failed to fetch campaign" }, { status: 500 })
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
    const jsonFields = ["objectives", "targetCountries", "targetNiches", "platforms"]
    for (const field of jsonFields) {
      if (Array.isArray(data[field])) {
        data[field] = JSON.stringify(data[field])
      }
    }
    if (data.startDate) data.startDate = new Date(data.startDate)
    if (data.endDate) data.endDate = new Date(data.endDate)

    const campaign = await prisma.campaign.update({
      where: { id },
      data,
    })

    return NextResponse.json(parseCampaign(campaign))
  } catch (error) {
    console.error("Campaign PUT error:", error)
    return NextResponse.json({ error: "Failed to update campaign" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.campaign.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Campaign DELETE error:", error)
    return NextResponse.json({ error: "Failed to delete campaign" }, { status: 500 })
  }
}
