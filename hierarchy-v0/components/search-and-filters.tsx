"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, X } from "lucide-react"
import type { Employee } from "@/types/employee"

interface SearchAndFiltersProps {
  searchTerm: string
  onSearchChange: (term: string) => void
  selectedDepartment: string
  onDepartmentChange: (dept: string) => void
  departments: string[]
  employees: Employee[]
}

export function SearchAndFilters({
  searchTerm,
  onSearchChange,
  selectedDepartment,
  onDepartmentChange,
  departments,
  employees,
}: SearchAndFiltersProps) {
  const departmentCounts = departments.reduce(
    (acc, dept) => {
      acc[dept] = employees.filter((emp) => emp.department === dept).length
      return acc
    },
    {} as Record<string, number>,
  )

  const clearFilters = () => {
    onSearchChange("")
    onDepartmentChange("all")
  }

  const hasActiveFilters = searchTerm || selectedDepartment !== "all"

  return (
    <div className="bg-white rounded-lg border shadow-sm p-6">
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search employees, roles, or departments..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={selectedDepartment} onValueChange={onDepartmentChange}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept} ({departmentCounts[dept]})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {hasActiveFilters && (
          <Button variant="outline" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-2" />
            Clear Filters
          </Button>
        )}
      </div>

      {hasActiveFilters && (
        <div className="mt-4 flex flex-wrap gap-2">
          {searchTerm && (
            <Badge variant="secondary">
              Search: "{searchTerm}"
              <button onClick={() => onSearchChange("")} className="ml-2 hover:text-red-600">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {selectedDepartment !== "all" && (
            <Badge variant="secondary">
              Department: {selectedDepartment}
              <button onClick={() => onDepartmentChange("all")} className="ml-2 hover:text-red-600">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}
