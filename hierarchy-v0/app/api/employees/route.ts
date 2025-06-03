import { NextResponse } from "next/server"
import { getEmployees } from "@/lib/database"

export async function GET() {
  try {
    const employees = await getEmployees()
    return NextResponse.json(employees)
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Failed to fetch employees" }, { status: 500 })
  }
}
