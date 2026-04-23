import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const research = await prisma.creatorResearch.findUnique({
      where: { creatorId: id },
    })
    return NextResponse.json(research ?? {})
  } catch (error) {
    console.error("Research GET error:", error)
    return NextResponse.json({ error: "Failed to fetch research" }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const research = await prisma.creatorResearch.upsert({
      where: { creatorId: id },
      create: { creatorId: id, ...body },
      update: { ...body },
    })

    return NextResponse.json(research)
  } catch (error) {
    console.error("Research POST error:", error)
    return NextResponse.json({ error: "Failed to save research" }, { status: 500 })
  }
}
