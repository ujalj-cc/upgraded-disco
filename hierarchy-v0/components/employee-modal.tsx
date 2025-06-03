"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Mail, MapPin, Calendar, DollarSign, Users, Phone, Building } from "lucide-react"
import type { Employee } from "@/types/employee"

interface EmployeeModalProps {
  employee: Employee
  onClose: () => void
  allEmployees: Employee[]
}

export function EmployeeModal({ employee, onClose, allEmployees }: EmployeeModalProps) {
  const directReports = allEmployees.filter((emp) => emp.reportingManager === employee.empName)
  const manager = allEmployees.find((emp) => emp.empName === employee.reportingManager)

  const departmentColleagues = allEmployees
    .filter((emp) => emp.department === employee.department && emp.empCode !== employee.empCode)
    .slice(0, 5)

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-lg font-bold text-blue-600">
                {employee.empName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-bold">{employee.empName}</h2>
              <p className="text-sm text-gray-600">{employee.designation}</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{employee.emailId}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{employee.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{employee.location}</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-gray-500" />
                <Badge variant="outline">{employee.department}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">${employee.salary.toLocaleString()}/year</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm">Joined {employee.joinDate}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Skills */}
          <div>
            <h3 className="font-semibold mb-2">Skills & Expertise</h3>
            <div className="flex flex-wrap gap-2">
              {employee.skills.map((skill, index) => (
                <Badge key={index} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Reporting Structure */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {manager && (
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Reports To
                </h3>
                <div className="p-3 border rounded-lg">
                  <p className="font-medium">{manager.empName}</p>
                  <p className="text-sm text-gray-600">{manager.designation}</p>
                </div>
              </div>
            )}

            {directReports.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Direct Reports ({directReports.length})
                </h3>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {directReports.map((report) => (
                    <div key={report.empCode} className="p-2 border rounded text-sm">
                      <p className="font-medium">{report.empName}</p>
                      <p className="text-gray-600">{report.designation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {departmentColleagues.length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">Department Colleagues</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {departmentColleagues.map((colleague) => (
                    <div key={colleague.empCode} className="p-2 border rounded text-sm">
                      <p className="font-medium">{colleague.empName}</p>
                      <p className="text-gray-600">{colleague.designation}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="flex justify-end">
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
