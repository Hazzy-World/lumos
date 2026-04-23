import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; creatorId: string }> }
) {
  try {
    const { id, creatorId } = await params
    const body = await request.json()

    const data: any = { ...body }
    if (Array.isArray(data.selectedDeliverables)) {
      data.selectedDeliverables = JSON.stringify(data.selectedDeliverables)
    }
    if (data.contentDeadline) {
      data.contentDeadline = new Date(data.contentDeadline)
    }

    const cc = await prisma.campaignCreator.update({
      where: {
        campaignId_creatorId: {
          campaignId: id,
          creatorId,
        },
      },
      data,
    })

    return NextResponse.json({
      ...cc,
      selectedDeliverables: JSON.parse(cc.selectedDeliverables || "[]"),
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; creatorId: string }> }
) {
  try {
    const { id, creatorId } = await params
    await prisma.campaignCreator.delete({
      where: {
        campaignId_creatorId: {
          campaignId: id,
          creatorId,
        },
      },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to remove creator" }, { status: 500 })
  }
}
