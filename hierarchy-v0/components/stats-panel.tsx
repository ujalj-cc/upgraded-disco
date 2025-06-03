"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Users, Building2, MapPin, DollarSign, ChevronUp } from "lucide-react"
import type { Employee } from "@/types/employee"

interface StatsPanelProps {
  employees: Employee[]
}

export function StatsPanel({ employees }: StatsPanelProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const totalEmployees = employees.length
  const departments = new Set(employees.map((emp) => emp.department)).size
  const avgSalary = employees.reduce((sum, emp) => sum + emp.salary, 0) / employees.length
  const locations = new Set(employees.map((emp) => emp.location)).size

  const departmentStats = employees.reduce(
    (acc, emp) => {
      acc[emp.department] = (acc[emp.department] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const largestDepartment = Object.entries(departmentStats).sort(([, a], [, b]) => b - a)[0]

  // Calculate growth metrics (simulated)
  const growthRate = 12.4 // Simulated growth rate

  // Department distribution for visualization
  const topDepartments = Object.entries(departmentStats)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([dept, count]) => ({
      name: dept,
      count,
      percentage: Math.round((count / totalEmployees) * 100),
    }))

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
      {/* Total Employees Card */}
      <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-800 shadow-lg overflow-hidden">
        <div className="p-6 relative">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full -mt-8 -mr-8"></div>

          <div className="flex items-center mb-4">
            <div className="bg-blue-500/20 p-2 rounded-lg mr-3">
              <Users className="h-5 w-5 text-blue-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-300">Total Employees</h3>
          </div>

          <div className="flex items-baseline">
            <span className="text-3xl font-bold text-white tracking-tight">{totalEmployees}</span>
            <div className="ml-3 flex items-center text-xs text-emerald-400 font-medium">
              <ChevronUp className="h-3 w-3 mr-0.5" />
              <span>{growthRate}%</span>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="text-xs text-gray-400">Across {departments} departments</div>
            <div className="text-xs font-medium text-blue-400">{mounted && new Date().toLocaleDateString()}</div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-800/50">
            <div className="flex justify-between items-center mb-1">
              <div className="text-xs text-gray-400">Department Distribution</div>
            </div>

            {topDepartments.map((dept, i) => (
              <div key={dept.name} className="mt-2">
                <div className="flex justify-between items-center mb-1">
                  <div className="text-xs text-gray-400">{dept.name}</div>
                  <div className="text-xs text-gray-300">{dept.percentage}%</div>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full ${i === 0 ? "bg-blue-500" : i === 1 ? "bg-emerald-500" : "bg-amber-500"}`}
                    style={{ width: `${dept.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Departments Card */}
      <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-800 shadow-lg overflow-hidden">
        <div className="p-6 relative">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full -mt-8 -mr-8"></div>

          <div className="flex items-center mb-4">
            <div className="bg-emerald-500/20 p-2 rounded-lg mr-3">
              <Building2 className="h-5 w-5 text-emerald-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-300">Departments</h3>
          </div>

          <div className="flex items-baseline">
            <span className="text-3xl font-bold text-white tracking-tight">{departments}</span>
          </div>

          <div className="mt-4">
            <div className="text-xs text-gray-400">
              Largest: <span className="text-emerald-400 font-medium">{largestDepartment?.[0]}</span>
            </div>
            <div className="text-xs text-gray-400 mt-1">
              With <span className="text-white">{largestDepartment?.[1]}</span> employees (
              {Math.round((Number(largestDepartment?.[1]) / totalEmployees) * 100)}%)
            </div>
          </div>

          <div className="mt-6 pt-3 border-t border-gray-800/50">
            <div className="flex justify-between items-center">
              <div className="text-xs text-gray-400">Department Coverage</div>
              <div className="text-xs font-medium text-emerald-400">{Math.round((departments / 10) * 100)}%</div>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2 mt-2">
              <div
                className="h-2 rounded-full bg-emerald-500"
                style={{ width: `${Math.round((departments / 10) * 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </Card>

      {/* Average Salary Card */}
      <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-800 shadow-lg overflow-hidden">
        <div className="p-6 relative">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full -mt-8 -mr-8"></div>

          <div className="flex items-center mb-4">
            <div className="bg-amber-500/20 p-2 rounded-lg mr-3">
              <DollarSign className="h-5 w-5 text-amber-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-300">Average Salary</h3>
          </div>

          <div className="flex items-baseline">
            <span className="text-3xl font-bold text-white tracking-tight">
              ${Math.round(avgSalary).toLocaleString()}
            </span>
          </div>

          <div className="mt-4">
            <div className="text-xs text-gray-400">Per employee annually</div>
            <div className="text-xs text-gray-400 mt-1">
              Industry average: <span className="text-white">${Math.round(avgSalary * 0.92).toLocaleString()}</span>
            </div>
          </div>

          <div className="mt-6 pt-3 border-t border-gray-800/50">
            <div className="flex justify-between items-center">
              <div className="text-xs text-gray-400">Comparison to Industry</div>
              <div className="text-xs font-medium text-amber-400">+8%</div>
            </div>
            <div className="flex items-center mt-2">
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div className="h-2 rounded-full bg-amber-500 w-[92%]"></div>
              </div>
              <div className="ml-2 w-2 h-8 flex items-center">
                <div className="h-4 w-0.5 bg-amber-400"></div>
              </div>
            </div>
            <div className="flex justify-between mt-1">
              <div className="text-[10px] text-gray-500">Industry</div>
              <div className="text-[10px] text-gray-500">Our Company</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Locations Card */}
      <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-800 shadow-lg overflow-hidden">
        <div className="p-6 relative">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full -mt-8 -mr-8"></div>

          <div className="flex items-center mb-4">
            <div className="bg-purple-500/20 p-2 rounded-lg mr-3">
              <MapPin className="h-5 w-5 text-purple-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-300">Global Presence</h3>
          </div>

          <div className="flex items-baseline">
            <span className="text-3xl font-bold text-white tracking-tight">{locations}</span>
            <span className="ml-2 text-sm text-gray-400">locations</span>
          </div>

          <div className="mt-4">
            <div className="text-xs text-gray-400">Across {Math.min(locations, 4)} continents</div>
          </div>

          <div className="mt-6 pt-3 border-t border-gray-800/50">
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className={`h-8 rounded-md ${i < locations ? "bg-gradient-to-br from-purple-500 to-purple-600" : "bg-gray-800"} 
                  flex items-center justify-center`}
                >
                  {i < locations && <div className="w-1 h-1 bg-white rounded-full"></div>}
                </div>
              ))}
            </div>
            <div className="mt-2 text-xs text-gray-400 flex justify-between">
              <span>Regional offices</span>
              <span className="text-purple-400">{Math.round((locations / 8) * 100)}% coverage</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
