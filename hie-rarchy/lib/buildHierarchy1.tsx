"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Search, 
  Users, 
  Building2, 
  MapPin, 
  Mail, 
  UserCheck,
  ChevronLeft,
  ChevronRight,
  Download,
  Filter
} from "lucide-react"
import type { Employee } from "@/lib/types"

interface DataPreviewProps {
  employees: Employee[]
  onExportData?: () => void
}

export function DataPreview({ employees, onExportData }: DataPreviewProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedDepartment, setSelectedDepartment] = useState("")
  const [selectedLocation, setSelectedLocation] = useState("")
  const itemsPerPage = 10

  // Filter and search employees
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const matchesSearch = searchTerm === "" || 
        emp.empName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.empCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.department.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesDepartment = selectedDepartment === "" || emp.department === selectedDepartment
      const matchesLocation = selectedLocation === "" || emp.location === selectedLocation

      return matchesSearch && matchesDepartment && matchesLocation
    })
  }, [employees, searchTerm, selectedDepartment, selectedLocation])

  // Pagination
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentEmployees = filteredEmployees.slice(startIndex, endIndex)

  // Get unique values for filters
  const departments = [...new Set(employees.map(emp => emp.department))].filter(Boolean).sort()
  const locations = [...new Set(employees.map(emp => emp.location))].filter(Boolean).sort()

  // Statistics
  const stats = {
    total: employees.length,
    departments: departments.length,
    locations: locations.length,
    withManagers: employees.filter(emp => emp.reportingManager).length
  }

  const resetFilters = () => {
    setSearchTerm("")
    setSelectedDepartment("")
    setSelectedLocation("")
    setCurrentPage(1)
  }

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  if (employees.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
          <p className="text-gray-600">Upload a file to preview employee data</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Employee Data Preview
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Showing {filteredEmployees.length} of {employees.length} employees
            </p>
          </div>
          
          {onExportData && (
            <Button onClick={onExportData} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          )}
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-blue-500" />
            <div>
              <p className="text-sm font-medium">{stats.total}</p>
              <p className="text-xs text-gray-500">Total Employees</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Building2 className="h-4 w-4 text-green-500" />
            <div>
              <p className="text-sm font-medium">{stats.departments}</p>
              <p className="text-xs text-gray-500">Departments</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-orange-500" />
            <div>
              <p className="text-sm font-medium">{stats.locations}</p>
              <p className="text-xs text-gray-500">Locations</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <UserCheck className="h-4 w-4 text-purple-500" />
            <div>
              <p className="text-sm font-medium">{stats.withManagers}</p>
              <p className="text-xs text-gray-500">With Managers</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name, code, designation, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>

          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Locations</option>
            {locations.map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>

          {(searchTerm || selectedDepartment || selectedLocation) && (
            <Button onClick={resetFilters} variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Clear
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left p-3 font-medium text-gray-900">Employee</th>
                <th className="text-left p-3 font-medium text-gray-900">Code</th>
                <th className="text-left p-3 font-medium text-gray-900">Designation</th>
                <th className="text-left p-3 font-medium text-gray-900">Department</th>
                <th className="text-left p-3 font-medium text-gray-900">Manager</th>
                <th className="text-left p-3 font-medium text-gray-900">Location</th>
                <th className="text-left p-3 font-medium text-gray-900">Email</th>
              </tr>
            </thead>
            <tbody>
              {currentEmployees.map((employee, index) => (
                <tr key={employee.empCode} className="border-b hover:bg-gray-50">
                  <td className="p-3">
                    <div className="font-medium text-gray-900">{employee.empName}</div>
                    <div className="text-sm text-gray-500">#{employee.srNo}</div>
                  </td>
                  <td className="p-3">
                    <Badge variant="secondary" className="font-mono text-xs">
                      {employee.empCode}
                    </Badge>
                  </td>
                  <td className="p-3 text-sm text-gray-900">{employee.designation}</td>
                  <td className="p-3">
                    <Badge variant="outline" className="text-xs">
                      {employee.department}
                    </Badge>
                  </td>
                  <td className="p-3 text-sm text-gray-600">
                    {employee.reportingManager || (
                      <span className="text-gray-400 italic">No manager</span>
                    )}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-3 w-3 mr-1" />
                      {employee.location}
                    </div>
                  </td>
                  <td className="p-3">
                    {employee.emailId ? (
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="h-3 w-3 mr-1" />
                        {employee.emailId}
                      </div>
                    ) : (
                      <span className="text-gray-400 italic text-sm">No email</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredEmployees.length === 0 && (
          <div className="text-center py-8">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Results Found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t">
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredEmployees.length)} of {filteredEmployees.length} results
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                variant="outline"
                size="sm"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum
                  if (totalPages <= 5) {
                    pageNum = i + 1
                  } else if (currentPage <= 3) {
                    pageNum = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = currentPage - 2 + i
                  }
                  
                  return (
                    <Button
                      key={pageNum}
                      onClick={() => goToPage(pageNum)}
                      variant={pageNum === currentPage ? "default" : "outline"}
                      size="sm"
                      className="w-8 h-8 p-0"
                    >
                      {pageNum}
                    </Button>
                  )
                })}
              </div>
              
              <Button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                variant="outline"
                size="sm"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}