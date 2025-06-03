import { NextResponse } from "next/server"
import { getDepartmentStats } from "@/lib/database"

export async function GET() {
  try {
    const stats = await getDepartmentStats()
    return NextResponse.json(stats)
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Failed to fetch statistics" }, { status: 500 })
  }
}
