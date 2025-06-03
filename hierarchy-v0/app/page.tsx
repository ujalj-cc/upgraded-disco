"use client"

import { useState } from "react"
import { OrgChart } from "@/components/org-chart"
import { SearchAndFilters } from "@/components/search-and-filters"
import { StatsPanel } from "@/components/stats-panel"
import { EmployeeModal } from "@/components/employee-modal"
import { useEmployees } from "@/hooks/use-employees"
import { filterEmployees } from "@/lib/utils"
import type { Employee } from "@/types/employee"

export default function Page() {
  const { employees, loading, error } = useEmployees()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState("all")
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())

  const filteredEmployees = filterEmployees(employees, searchTerm, selectedDepartment)
  const departments = Array.from(new Set(employees.map((emp) => emp.department)))

  const handleNodeClick = (employee: Employee) => {
    setSelectedEmployee(employee)
  }

  const handleNodeToggle = (empCode: string) => {
    const newExpanded = new Set(expandedNodes)
    if (newExpanded.has(empCode)) {
      newExpanded.delete(empCode)
    } else {
      newExpanded.add(empCode)
    }
    setExpandedNodes(newExpanded)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading organizational data...</p>
          <p className="text-sm text-gray-500">Fetching from database</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">⚠️ Database Error</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto p-6 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-gray-900">Organizational Chart</h1>
          <p className="text-gray-600 text-lg">Interactive company hierarchy with department structure</p>
          <div className="text-sm text-green-600 font-medium">
            ✅ Connected to Neon Database • {employees.length} employees • {departments.length} departments
          </div>
        </div>

        <StatsPanel employees={employees} />

        <SearchAndFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedDepartment={selectedDepartment}
          onDepartmentChange={setSelectedDepartment}
          departments={departments}
          employees={employees}
        />

        <OrgChart
          employees={filteredEmployees}
          onNodeClick={handleNodeClick}
          onNodeToggle={handleNodeToggle}
          expandedNodes={expandedNodes}
          searchTerm={searchTerm}
        />

        {selectedEmployee && (
          <EmployeeModal
            employee={selectedEmployee}
            onClose={() => setSelectedEmployee(null)}
            allEmployees={employees}
          />
        )}
      </div>
    </div>
  )
}
