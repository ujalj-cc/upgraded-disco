"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Download, Search, Users, Building2 } from "lucide-react"
import type { Employee } from "@/lib/types"
import { exportToPDF } from "@/utils/pdfUtils"

interface ControlsProps {
  employees: Employee[]
}

export function Controls({ employees }: ControlsProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isExporting, setIsExporting] = useState(false)

  const handleExportPDF = async () => {
    setIsExporting(true)
    try {
      await exportToPDF("org-chart", "organizational-chart.pdf")
    } catch (error) {
      console.error("Export failed:", error)
    } finally {
      setIsExporting(false)
    }
  }

  const totalEmployees = employees.length
  const departments = [...new Set(employees.map((emp) => emp.department))].length
  const locations = [...new Set(employees.map((emp) => emp.location))].length

  return (
    <Card className="p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-gray-500" />
            <Badge variant="outline">{totalEmployees} Employees</Badge>
          </div>

          <div className="flex items-center space-x-2">
            <Building2 className="h-4 w-4 text-gray-500" />
            <Badge variant="outline">{departments} Departments</Badge>
          </div>

          <Badge variant="outline">{locations} Locations</Badge>
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full sm:w-64"
            />
          </div>

          <Button onClick={handleExportPDF} disabled={isExporting} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? "Exporting..." : "Export PDF"}
          </Button>
        </div>
      </div>
    </Card>
  )
}
