import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")

    const campaigns = await prisma.campaign.findMany({
      where: status ? { status } : undefined,
      include: {
        creators: {
          include: { creator: true },
        },
        _count: { select: { creators: true } },
      },
      orderBy: { createdAt: "desc" },
    })

    const parsed = campaigns.map((c) => ({
      ...c,
      objectives: JSON.parse(c.objectives || "[]"),
      targetCountries: JSON.parse(c.targetCountries || "[]"),
      targetNiches: JSON.parse(c.targetNiches || "[]"),
      platforms: JSON.parse(c.platforms || "[]"),
      creators: c.creators.map((cc) => ({
        ...cc,
        selectedDeliverables: JSON.parse(cc.selectedDeliverables || "[]"),
        creator: {
          ...cc.creator,
          niches: JSON.parse(cc.creator.niches || "[]"),
          platforms: JSON.parse(cc.creator.platforms || "[]"),
        },
      })),
    }))

    return NextResponse.json(parsed)
  } catch (error) {
    console.error("Campaigns GET error:", error)
    return NextResponse.json({ error: "Failed to fetch campaigns" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const data = {
      ...body,
      objectives: JSON.stringify(body.objectives || []),
      targetCountries: JSON.stringify(body.targetCountries || []),
      targetNiches: JSON.stringify(body.targetNiches || []),
      platforms: JSON.stringify(body.platforms || []),
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
    }

    const campaign = await prisma.campaign.create({ data })

    return NextResponse.json({
      ...campaign,
      objectives: JSON.parse(campaign.objectives),
      targetCountries: JSON.parse(campaign.targetCountries),
      targetNiches: JSON.parse(campaign.targetNiches),
      platforms: JSON.parse(campaign.platforms),
    }, { status: 201 })
  } catch (error) {
    console.error("Campaign POST error:", error)
    return NextResponse.json({ error: "Failed to create campaign" }, { status: 500 })
  }
}
