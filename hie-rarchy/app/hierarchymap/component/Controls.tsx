// "use client"

// import { useState } from "react"
// import { Button } from "@/components/ui/button"
// import { Card } from "@/components/ui/card"
// import { Input } from "@/components/ui/input"
// import { Badge } from "@/components/ui/badge"
// import { Download, Search, Users, Building2 } from "lucide-react"
// import type { Employee } from "@/lib/types"
// import { exportToPDF } from "@/utils/pdfUtils"

// interface ControlsProps {
//   employees: Employee[]
// }

// export function Controls({ employees }: ControlsProps) {
//   const [searchTerm, setSearchTerm] = useState("")
//   const [isExporting, setIsExporting] = useState(false)

//   const handleExportPDF = async () => {
//     setIsExporting(true)
//     try {
//       await exportToPDF("org-chart", "organizational-chart.pdf")
//     } catch (error) {
//       console.error("Export failed:", error)
//     } finally {
//       setIsExporting(false)
//     }
//   }

//   const totalEmployees = employees.length
//   const departments = [...new Set(employees.map((emp) => emp.department))].length
//   const locations = [...new Set(employees.map((emp) => emp.location))].length

//   return (
//     <Card className="p-4">
//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
//         <div className="flex flex-wrap items-center gap-4">
//           <div className="flex items-center space-x-2">
//             <Users className="h-4 w-4 text-gray-500" />
//             <Badge variant="outline">{totalEmployees} Employees</Badge>
//           </div>

//           <div className="flex items-center space-x-2">
//             <Building2 className="h-4 w-4 text-gray-500" />
//             <Badge variant="outline">{departments} Departments</Badge>
//           </div>

//           <Badge variant="outline">{locations} Locations</Badge>
//         </div>

//         <div className="flex items-center space-x-2 w-full sm:w-auto">
//           <div className="relative flex-1 sm:flex-initial">
//             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
//             <Input
//               placeholder="Search employees..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="pl-10 w-full sm:w-64"
//             />
//           </div>

//           <Button onClick={handleExportPDF} disabled={isExporting} variant="outline" size="sm">
//             <Download className="h-4 w-4 mr-2" />
//             {isExporting ? "Exporting..." : "Export PDF"}
//           </Button>
//         </div>
//       </div>
//     </Card>
//   )
// }

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
//import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Download, Users, Building2, MapPin, } from "lucide-react"
import type { Employee } from "@/lib/types"

interface ControlsProps {
  employees: Employee[]
}

export function Controls({ employees }: ControlsProps) {
  //const [searchTerm, setSearchTerm] = useState("")
  const [isExporting, setIsExporting] = useState(false)

  const handleExportPDF = async () => {
    setIsExporting(true)
    try {
      // Use html2canvas and jsPDF for better PDF generation
      const html2canvas = (await import('html2canvas')).default
      const jsPDF = (await import('jspdf')).default
      
      const element = document.getElementById('org-chart')
      if (!element) {
        throw new Error('Chart element not found')
      }

      // Create canvas from the chart element
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: element.offsetWidth,
        height: element.offsetHeight,
      })

      // Create PDF
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      })

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height)
      
      // Download the PDF
      const fileName = `organizational-chart-${new Date().toISOString().split('T')[0]}.pdf`
      pdf.save(fileName)
      
    } catch (error) {
      console.error("Export failed:", error)
      alert("Failed to export PDF. Please try again.")
    } finally {
      setIsExporting(false)
    }
  }

  const totalEmployees = employees.length
  const departments = [...new Set(employees.map((emp) => emp.department).filter(Boolean))].length
  const locations = [...new Set(employees.map((emp) => emp.location).filter(Boolean))].length

  // Filter employees based on search term
  // const filteredEmployees = employees.filter(emp => 
  //   emp.empName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //   emp.empCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //   emp.designation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //   emp.department?.toLowerCase().includes(searchTerm.toLowerCase())
  // )

  return (
    <div className="space-y-4">
      <Card className="p-6 bg-gradient-to-r from-white to-slate-50 border-slate-200">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
          {/* Statistics */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2 bg-blue-50 px-3 py-2 rounded-lg border border-blue-100">
              <Users className="h-4 w-4 text-blue-600" />
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                {totalEmployees} Employees
              </Badge>
            </div>

            <div className="flex items-center space-x-2 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-100">
              <Building2 className="h-4 w-4 text-emerald-600" />
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200">
                {departments} Departments
              </Badge>
            </div>

            <div className="flex items-center space-x-2 bg-amber-50 px-3 py-2 rounded-lg border border-amber-100">
              <MapPin className="h-4 w-4 text-amber-600" />
              <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-200">
                {locations} Locations
              </Badge>
            </div>
          </div>

          {/* Search and Export */}
          <div className="flex items-center space-x-3 w-full lg:w-auto">
            {/* <div className="relative flex-1 lg:flex-initial">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search employees, roles, departments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full lg:w-80 bg-white border-gray-200 focus:border-blue-400 focus:ring-blue-400"
              />
            </div> */}

            <Button 
              onClick={handleExportPDF} 
              disabled={isExporting || totalEmployees === 0} 
              variant="default"
              size="default"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 min-w-[120px]"
            >
              <Download className="h-4 w-4 mr-2" />
              {isExporting ? "Exporting..." : "Export PDF"}
            </Button>
          </div>
        </div>

        {/* Search Results Indicator */}
        {/* {searchTerm && (
          <div className="mt-4 pt-4 border-t border-slate-200">
            <div className="flex items-center space-x-2 text-sm">
              <Search className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600">
                Showing {filteredEmployees.length} of {totalEmployees} employees
              </span>
              {filteredEmployees.length === 0 && (
                <div className="flex items-center space-x-1 text-amber-600">
                  <AlertCircle className="h-4 w-4" />
                  <span>No matches found</span>
                </div>
              )}
            </div>
          </div>
        )} */}
      </Card>

      {/* Quick Actions */}
      <Card className="p-4 bg-slate-50/50 border-slate-200">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded border-2 border-blue-600"></div>
              <span>Level 0 (Top Management)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-emerald-500 rounded border-2 border-emerald-600"></div>
              <span>Level 1 (Senior Management)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded border-2 border-red-600"></div>
              <span>Level 2 (Middle Management)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gray-400 rounded border-2 border-gray-500"></div>
              <span>Other Levels</span>
            </div>
          </div>
          
          <div className="text-xs text-gray-500">
            Last updated: {new Date().toLocaleDateString()}
          </div>
        </div>
      </Card>
    </div>
  )
}