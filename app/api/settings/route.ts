import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    let settings = await prisma.agencySettings.findFirst()
    if (!settings) {
      settings = await prisma.agencySettings.create({
        data: {
          agencyName: "Flamenzi",
          primaryColor: "#C8102E",
          secondaryColor: "#1A1A2E",
          accentColor: "#F5A623",
          serviceMarkup: 0.12,
          agencyCommission: 0.20,
          defaultCurrency: "USD",
        },
      })
    }
    return NextResponse.json(settings)
  } catch (error) {
    console.error("Settings GET error:", error)
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    let settings = await prisma.agencySettings.findFirst()

    if (!settings) {
      settings = await prisma.agencySettings.create({ data: body })
    } else {
      settings = await prisma.agencySettings.update({
        where: { id: settings.id },
        data: body,
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error("Settings PUT error:", error)
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
  }
}
