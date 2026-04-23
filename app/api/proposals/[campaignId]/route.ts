import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ campaignId: string }> }
) {
  const { campaignId } = await params
  try {
    const body = await request.json()
    const { title, preparedBy, clientName, coverNote } = body as {
      title: string
      preparedBy: string
      clientName: string
      coverNote: string
    }

    const existing = await prisma.proposal.findFirst({
      where: { campaignId },
    })

    let proposal
    if (existing) {
      proposal = await prisma.proposal.update({
        where: { id: existing.id },
        data: { title, preparedBy, clientName, coverNote, status: "DRAFT" },
      })
    } else {
      proposal = await prisma.proposal.create({
        data: { campaignId, title, preparedBy, clientName, coverNote, status: "DRAFT" },
      })
    }

    return NextResponse.json(proposal)
  } catch (error) {
    console.error("Proposal error:", error)
    return NextResponse.json({ error: "Failed to save proposal" }, { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ campaignId: string }> }
) {
  const { campaignId } = await params
  try {
    const proposal = await prisma.proposal.findFirst({
      where: { campaignId },
    })
    return NextResponse.json(proposal || null)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch proposal" }, { status: 500 })
  }
}
