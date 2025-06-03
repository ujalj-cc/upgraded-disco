import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Employee } from "@/types/employee"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function filterEmployees(employees: Employee[], searchTerm: string, selectedDepartment: string): Employee[] {
  return employees.filter((employee) => {
    const matchesSearch =
      !searchTerm ||
      employee.empName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.emailId.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesDepartment = selectedDepartment === "all" || employee.department === selectedDepartment

    return matchesSearch && matchesDepartment
  })
}
