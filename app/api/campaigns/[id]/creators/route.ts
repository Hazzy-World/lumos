import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const creators = await prisma.campaignCreator.findMany({
      where: { campaignId: id },
      include: { creator: true },
    })

    return NextResponse.json(creators.map((cc) => ({
      ...cc,
      selectedDeliverables: JSON.parse(cc.selectedDeliverables || "[]"),
      creator: {
        ...cc.creator,
        niches: JSON.parse(cc.creator.niches || "[]"),
        platforms: JSON.parse(cc.creator.platforms || "[]"),
      },
    })))
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch campaign creators" }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { creatorId, selectedDeliverables, totalCreatorRate, totalClientRate, totalCommission } = body

    const existing = await prisma.campaignCreator.findUnique({
      where: { campaignId_creatorId: { campaignId: id, creatorId } },
    })

    if (existing) {
      return NextResponse.json({ error: "Creator already in campaign" }, { status: 409 })
    }

    const cc = await prisma.campaignCreator.create({
      data: {
        campaignId: id,
        creatorId,
        selectedDeliverables: JSON.stringify(selectedDeliverables || []),
        totalCreatorRate: totalCreatorRate || 0,
        totalClientRate: totalClientRate || 0,
        totalCommission: totalCommission || 0,
      },
      include: { creator: true },
    })

    return NextResponse.json({
      ...cc,
      selectedDeliverables: JSON.parse(cc.selectedDeliverables),
    }, { status: 201 })
  } catch (error) {
    console.error("Campaign creator POST error:", error)
    return NextResponse.json({ error: "Failed to add creator to campaign" }, { status: 500 })
  }
}
