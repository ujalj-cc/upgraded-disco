import { NextResponse } from "next/server"
import { getEmployeeByCode } from "@/lib/database"

export async function GET(request: Request, { params }: { params: { empCode: string } }) {
  try {
    const employee = await getEmployeeByCode(params.empCode)

    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 })
    }

    return NextResponse.json(employee)
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Failed to fetch employee" }, { status: 500 })
  }
}
