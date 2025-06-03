import type { Employee, HierarchyNode } from "@/types/employee"

export function buildHierarchy(employees: Employee[]): HierarchyNode[] {
  if (!employees.length) return []

  const employeeMap = new Map<string, Employee>()
  employees.forEach((emp) => employeeMap.set(emp.empName, emp))

  // Find the CEO (root employee)
  const ceo = employees.find((emp) => !emp.reportingManager || !employeeMap.has(emp.reportingManager))
  if (!ceo) return []

  // Group employees by department (excluding CEO)
  const departmentGroups = employees
    .filter((emp) => emp.empCode !== ceo.empCode)
    .reduce(
      (acc, emp) => {
        if (!acc[emp.department]) {
          acc[emp.department] = []
        }
        acc[emp.department].push(emp)
        return acc
      },
      {} as Record<string, Employee[]>,
    )

  // Create department head nodes
  const departmentHeads: HierarchyNode[] = Object.entries(departmentGroups).map(([deptName, deptEmployees]) => {
    // Find the department head (employee who reports directly to CEO)
    const deptHead = deptEmployees.find((emp) => emp.reportingManager === ceo.empName)

    if (!deptHead) {
      // If no direct report to CEO, use the first employee as department head
      const firstEmp = deptEmployees[0]
      return {
        employee: firstEmp,
        children: buildDepartmentHierarchy(
          deptEmployees.filter((emp) => emp.empCode !== firstEmp.empCode),
          employeeMap,
        ),
        level: 1,
        isDepartmentHead: true,
        departmentName: deptName,
      }
    }

    // Build hierarchy within the department
    const departmentChildren = buildDepartmentHierarchy(
      deptEmployees.filter((emp) => emp.empCode !== deptHead.empCode),
      employeeMap,
      deptHead.empName,
    )

    return {
      employee: deptHead,
      children: departmentChildren,
      level: 1,
      isDepartmentHead: true,
      departmentName: deptName,
    }
  })

  // Create the root hierarchy
  const rootHierarchy: HierarchyNode = {
    employee: ceo,
    children: departmentHeads,
    level: 0,
    isDepartmentHead: false,
  }

  return [rootHierarchy]
}

function buildDepartmentHierarchy(
  employees: Employee[],
  employeeMap: Map<string, Employee>,
  parentName?: string,
): HierarchyNode[] {
  const children: HierarchyNode[] = []
  const processed = new Set<string>()

  function buildNode(employee: Employee, level: number): HierarchyNode {
    if (processed.has(employee.empName)) {
      return {
        employee,
        children: [],
        level,
        isDepartmentHead: false,
      }
    }

    processed.add(employee.empName)

    const nodeChildren = employees
      .filter((emp) => emp.reportingManager === employee.empName && !processed.has(emp.empName))
      .map((emp) => buildNode(emp, level + 1))

    return {
      employee,
      children: nodeChildren,
      level,
      isDepartmentHead: false,
    }
  }

  // Find direct reports to the parent (or employees without managers in this department)
  const directReports = parentName
    ? employees.filter((emp) => emp.reportingManager === parentName)
    : employees.filter((emp) => !emp.reportingManager || !employeeMap.has(emp.reportingManager))

  directReports.forEach((emp) => {
    if (!processed.has(emp.empName)) {
      children.push(buildNode(emp, 2))
    }
  })

  return children
}
