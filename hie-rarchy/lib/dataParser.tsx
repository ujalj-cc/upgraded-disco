import Papa from "papaparse"
import type { Employee, ValidationResult } from "./types"

export function parseCSV(csvText: string): Employee[] {
  const result = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
  })

  if (result.errors.length > 0) {
    throw new Error(`CSV parsing error: ${result.errors[0].message}`)
  }

  return result.data.map((row: any, index: number) => ({
    srNo: Number.parseInt(row.srNo) || index + 1,
    empCode: row.empCode?.trim() || "",
    empName: row.empName?.trim() || "",
    emailId: row.emailId?.trim() || "",
    location: row.location?.trim() || "",
    designation: row.designation?.trim() || "",
    reportingManager: row.reportingManager?.trim() || "",
    department: row.department?.trim() || "",
  }))
}

export function parseJSON(jsonText: string): Employee[] {
  try {
    const data = JSON.parse(jsonText)

    if (!Array.isArray(data)) {
      throw new Error("JSON must contain an array of employee objects")
    }

    return data.map((item: any, index: number) => ({
      srNo: item.srNo || index + 1,
      empCode: item.empCode?.trim() || "",
      empName: item.empName?.trim() || "",
      emailId: item.emailId?.trim() || "",
      location: item.location?.trim() || "",
      designation: item.designation?.trim() || "",
      reportingManager: item.reportingManager?.trim() || "",
      department: item.department?.trim() || "",
    }))
  } catch (error) {
    throw new Error(`JSON parsing error: ${error instanceof Error ? error.message : "Invalid JSON"}`)
  }
}

export function validateEmployeeData(employees: Employee[]): ValidationResult {
  const errors: string[] = []
  const empCodes = new Set<string>()

  if (employees.length === 0) {
    errors.push("No employee data found")
    return { isValid: false, errors }
  }

  employees.forEach((emp, index) => {
    const rowNum = index + 1

    // Check required fields
    if (!emp.empCode) {
      errors.push(`Row ${rowNum}: Employee code is required`)
    } else if (empCodes.has(emp.empCode)) {
      errors.push(`Row ${rowNum}: Duplicate employee code: ${emp.empCode}`)
    } else {
      empCodes.add(emp.empCode)
    }

    if (!emp.empName) {
      errors.push(`Row ${rowNum}: Employee name is required`)
    }

    if (!emp.designation) {
      errors.push(`Row ${rowNum}: Designation is required`)
    }

    if (!emp.department) {
      errors.push(`Row ${rowNum}: Department is required`)
    }

    // Validate email format
    if (emp.emailId && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emp.emailId)) {
      errors.push(`Row ${rowNum}: Invalid email format: ${emp.emailId}`)
    }
  })

  // Check for circular references in reporting structure
  const checkCircularReference = (empCode: string, visited: Set<string>): boolean => {
    if (visited.has(empCode)) return true

    const employee = employees.find((emp) => emp.empCode === empCode)
    if (!employee || !employee.reportingManager) return false

    visited.add(empCode)
    return checkCircularReference(employee.reportingManager, visited)
  }

  employees.forEach((emp) => {
    if (emp.reportingManager && checkCircularReference(emp.empCode, new Set())) {
      errors.push(`Circular reference detected for employee: ${emp.empCode}`)
    }
  })

  return {
    isValid: errors.length === 0,
    errors,
  }
}
