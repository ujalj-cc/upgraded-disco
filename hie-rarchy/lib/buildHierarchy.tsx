import type { Employee, HierarchyNode } from "./types"

export function buildHierarchy(employees: Employee[]): HierarchyNode[] {
  console.log("🏗️ Building hierarchy for", employees.length, "employees")

  if (!employees || employees.length === 0) {
    console.log("❌ No employees provided")
    return []
  }

  // Normalize data
  const cleanedEmployees = employees.map((emp) => ({
    ...emp,
    empCode: emp.empCode?.toString().trim() ?? "",
    reportingManager: emp.reportingManager?.toString().trim() ?? "",
  })).filter(emp => emp.empCode !== "") // Filter out empty empCodes

  // Build lookup maps
  const employeeMap = new Map<string, Employee>()
  const childrenMap = new Map<string, Employee[]>()

  for (const emp of cleanedEmployees) {
    employeeMap.set(emp.empCode, emp)

    const managerCode = emp.reportingManager
    if (managerCode) {
      if (!childrenMap.has(managerCode)) {
        childrenMap.set(managerCode, [])
      }
      childrenMap.get(managerCode)!.push(emp)
    }
  }

  // Find roots: no manager, or manager not in employeeMap
  const rootEmployees = cleanedEmployees.filter(
    (emp) => !emp.reportingManager || !employeeMap.has(emp.reportingManager)
  )

  // Build hierarchy recursively
  const buildNode = (employee: Employee, level: number = 0): HierarchyNode => {
    const children = childrenMap.get(employee.empCode) ?? []
    return {
      employee,
      level,
      children: children.map(child => buildNode(child, level + 1)),
    }
  }

  const hierarchy = rootEmployees.map(root => buildNode(root))

  console.log("✅ Hierarchy built:", hierarchy.length, "root nodes")
  return hierarchy
}
