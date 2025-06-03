// interface Employee {
//   srNo: number
//   empCode: string
//   empName: string
//   emailId: string
//   location: string
//   designation: string
//   reportingManager: string
//   department: string
// }

// interface HierarchyNode {
//   employee: Employee
//   children: HierarchyNode[]
//   level: number
// }

// // Enhanced hierarchy building function with extensive logging
// export function buildHierarchy(employees: Employee[]): HierarchyNode[] {
//   console.log("🏗️ ===== HIERARCHY BUILDING START =====")
//   console.log("📊 Input employees count:", employees.length)
//   console.log("📋 Raw employees data:", employees)
  
//   if (!employees || employees.length === 0) {
//     console.log("❌ No employees provided - returning empty array")
//     return []
//   }

//   // Log the structure of the first few employees to verify data format
//   console.log("🔍 First 3 employees structure:")
//   employees.slice(0, 3).forEach((emp, index) => {
//     console.log(`Employee ${index + 1}:`, {
//       srNo: emp.srNo,
//       empCode: emp.empCode,
//       empName: emp.empName,
//       emailId: emp.emailId,
//       location: emp.location,
//       designation: emp.designation,
//       reportingManager: emp.reportingManager,
//       department: emp.department,
//       types: {
//         srNo: typeof emp.srNo,
//         empCode: typeof emp.empCode,
//         empName: typeof emp.empName,
//         emailId: typeof emp.emailId,
//         location: typeof emp.location,
//         designation: typeof emp.designation,
//         reportingManager: typeof emp.reportingManager,
//         department: typeof emp.department,
//       }
//     })
//   })

//   // Normalize data with extensive logging
//   console.log("🧹 ===== DATA CLEANING START =====")
//   const cleanedEmployees = employees.map((emp, index) => {
//     const cleaned = {
//       ...emp,
//       empCode: emp.empCode?.toString().trim() ?? "",
//       empName: emp.empName?.toString().trim() ?? "",
//       reportingManager: emp.reportingManager?.toString().trim() ?? "",
//     }
    
//     if (index < 5) { // Log first 5 for debugging
//       console.log(`🧽 Cleaned employee ${index + 1}:`, {
//         original: {
//           empCode: emp.empCode,
//           empName: emp.empName,
//           reportingManager: emp.reportingManager
//         },
//         cleaned: {
//           empCode: cleaned.empCode,
//           empName: cleaned.empName,
//           reportingManager: cleaned.reportingManager
//         }
//       })
//     }
    
//     return cleaned
//   }).filter(emp => {
//     const hasCode = emp.empCode !== ""
//     if (!hasCode) {
//       console.log("⚠️ Filtering out employee with empty empCode:", emp)
//     }
//     return hasCode
//   })

//   console.log("✅ Cleaned employees count:", cleanedEmployees.length)
//   console.log("🧹 ===== DATA CLEANING END =====")

//   // Build lookup maps with logging
//   console.log("🗂️ ===== BUILDING LOOKUP MAPS =====")
//   const employeeByCode = new Map<string, Employee>()
//   const employeeByName = new Map<string, Employee>()
//   const childrenByManagerCode = new Map<string, Employee[]>()

//   // First pass: Build lookup maps
//   cleanedEmployees.forEach((emp, index) => {
//     employeeByCode.set(emp.empCode, emp)
//     employeeByName.set(emp.empName, emp)
    
//     if (index < 5) {
//       console.log(`📇 Added to maps - Code: "${emp.empCode}", Name: "${emp.empName}"`)
//     }
//   })

//   console.log("📊 Employee maps built:")
//   console.log("  - By Code:", employeeByCode.size, "entries")
//   console.log("  - By Name:", employeeByName.size, "entries")
//   console.log("  - Code keys:", Array.from(employeeByCode.keys()).slice(0, 10))
//   console.log("  - Name keys:", Array.from(employeeByName.keys()).slice(0, 10))

//   // Second pass: Build children map with extensive logging
//   console.log("👥 ===== BUILDING PARENT-CHILD RELATIONSHIPS =====")
//   cleanedEmployees.forEach((emp, index) => {
//     console.log(`\n🔍 Processing employee ${index + 1}: ${emp.empName} (${emp.empCode})`)
    
//     if (emp.reportingManager) {
//       const managerIdentifier = emp.reportingManager
//       console.log(`  👤 Looking for manager: "${managerIdentifier}"`)
      
//       let managerEmployee: Employee | undefined
      
//       // Try to find manager by code first
//       managerEmployee = employeeByCode.get(managerIdentifier)
//       if (managerEmployee) {
//         console.log(`  ✅ Found manager by CODE: ${managerEmployee.empName} (${managerEmployee.empCode})`)
//       } else {
//         console.log(`  ❌ Manager not found by code, trying by name...`)
//         // Try by name
//         managerEmployee = employeeByName.get(managerIdentifier)
//         if (managerEmployee) {
//           console.log(`  ✅ Found manager by NAME: ${managerEmployee.empName} (${managerEmployee.empCode})`)
//         } else {
//           console.log(`  ❌ Manager not found by name either`)
//         }
//       }
      
//       if (managerEmployee) {
//         const managerCode = managerEmployee.empCode
//         if (!childrenByManagerCode.has(managerCode)) {
//           childrenByManagerCode.set(managerCode, [])
//           console.log(`  📝 Created new children array for manager: ${managerCode}`)
//         }
//         childrenByManagerCode.get(managerCode)!.push(emp)
//         console.log(`  ✅ Added ${emp.empName} as child of ${managerEmployee.empName}`)
//       } else {
//         console.log(`  ⚠️ Manager "${managerIdentifier}" not found for employee ${emp.empName}`)
//       }
//     } else {
//       console.log(`  🌟 No reporting manager - potential root employee`)
//     }
//   })

//   console.log("\n👥 Children relationships summary:")
//   Array.from(childrenByManagerCode.entries()).forEach(([managerCode, children]) => {
//     const manager = employeeByCode.get(managerCode)
//     console.log(`  👤 ${manager?.empName} (${managerCode}): ${children.length} direct reports`)
//     children.forEach(child => {
//       console.log(`    - ${child.empName} (${child.empCode})`)
//     })
//   })

//   // Find root employees with logging
//   console.log("\n🌳 ===== FINDING ROOT EMPLOYEES =====")
//   const rootEmployees = cleanedEmployees.filter((emp, index) => {
//     console.log(`\n🔍 Checking if ${emp.empName} is root:`)
    
//     if (!emp.reportingManager) {
//       console.log(`  ✅ ROOT: No reporting manager specified`)
//       return true
//     }
    
//     const managerExists = employeeByCode.has(emp.reportingManager) || employeeByName.has(emp.reportingManager)
//     if (!managerExists) {
//       console.log(`  ✅ ROOT: Manager "${emp.reportingManager}" not found in employee data`)
//       return true
//     }
    
//     console.log(`  ❌ NOT ROOT: Manager "${emp.reportingManager}" exists in data`)
//     return false
//   })

//   console.log("\n🌟 Root employees found:", rootEmployees.length)
//   rootEmployees.forEach(root => {
//     console.log(`  🌱 ${root.empName} (${root.empCode}) - Manager: "${root.reportingManager || 'None'}"`)
//   })

//   if (rootEmployees.length === 0) {
//     console.log("❌ NO ROOT EMPLOYEES FOUND!")
//     console.log("🔍 This might indicate circular references or data issues")
//     console.log("📊 All reporting managers mentioned:")
//     const allManagers = [...new Set(cleanedEmployees.map(emp => emp.reportingManager).filter(Boolean))]
//     allManagers.forEach(manager => {
//       const exists = employeeByCode.has(manager) || employeeByName.has(manager)
//       console.log(`  - "${manager}": ${exists ? 'EXISTS' : 'NOT FOUND'}`)
//     })
//     return []
//   }

//   // Build hierarchy recursively with logging
//   console.log("\n🏗️ ===== BUILDING HIERARCHY TREE =====")
//   function buildNode(employee: Employee, level: number = 0, path: string[] = []): HierarchyNode {
//     const currentPath = [...path, employee.empName]
//     console.log(`${'  '.repeat(level)}📦 Building node: ${employee.empName} (Level ${level})`)
    
//     // Check for circular references
//     if (path.includes(employee.empName)) {
//       console.log(`${'  '.repeat(level)}⚠️ CIRCULAR REFERENCE DETECTED: ${currentPath.join(' -> ')}`)
//       return {
//         employee,
//         level,
//         children: []
//       }
//     }
    
//     const children = childrenByManagerCode.get(employee.empCode) || []
//     console.log(`${'  '.repeat(level)}👥 Found ${children.length} children`)
    
//     if (children.length > 0) {
//       children.forEach(child => {
//         console.log(`${'  '.repeat(level + 1)}👤 Child: ${child.empName}`)
//       })
//     }
    
//     return {
//       employee,
//       level,
//       children: children.map(child => buildNode(child, level + 1, currentPath)),
//     }
//   }

//   const hierarchy = rootEmployees.map(rootEmp => {
//     console.log(`\n🌳 Building tree from root: ${rootEmp.empName}`)
//     return buildNode(rootEmp)
//   })
  
//   // Count total nodes for verification
//   const countNodes = (nodes: HierarchyNode[]): number => {
//     return nodes.reduce((count, node) => count + 1 + countNodes(node.children), 0)
//   }
  
//   const totalNodes = countNodes(hierarchy)
//   console.log("\n✅ ===== HIERARCHY BUILDING COMPLETE =====")
//   console.log("📊 Final hierarchy summary:")
//   console.log(`  - Root nodes: ${hierarchy.length}`)
//   console.log(`  - Total nodes: ${totalNodes}`)
//   console.log(`  - Input employees: ${employees.length}`)
//   console.log(`  - Processed employees: ${cleanedEmployees.length}`)
  
//   if (totalNodes !== cleanedEmployees.length) {
//     console.log("⚠️ WARNING: Node count doesn't match employee count!")
//     console.log("This might indicate missing employees in the hierarchy")
//   }
  
//   return hierarchy
// }

// export type { Employee, HierarchyNode }

// interface Employee {
//   srNo: number
//   empCode: string
//   empName: string
//   emailId: string
//   location: string
//   designation: string
//   reportingManager: string
//   department: string
// }

// interface HierarchyNode {
//   employee: Employee
//   children: HierarchyNode[]
//   level: number
// }

// // Production-ready hierarchy building function (without console logs)
// export function buildHierarchy(employees: Employee[]): HierarchyNode[] {
//   if (!employees || employees.length === 0) {
//     return []
//   }

//   // Normalize and clean data
//   const cleanedEmployees = employees.map(emp => ({
//     ...emp,
//     empCode: emp.empCode?.toString().trim() ?? "",
//     empName: emp.empName?.toString().trim() ?? "",
//     reportingManager: emp.reportingManager?.toString().trim() ?? "",
//   })).filter(emp => emp.empCode !== "")

//   // Build lookup maps
//   const employeeByCode = new Map<string, Employee>()
//   const employeeByName = new Map<string, Employee>()
//   const childrenByManagerCode = new Map<string, Employee[]>()

//   // First pass: Build lookup maps
//   cleanedEmployees.forEach(emp => {
//     employeeByCode.set(emp.empCode, emp)
//     employeeByName.set(emp.empName, emp)
//   })

//   // Second pass: Build parent-child relationships
//   cleanedEmployees.forEach(emp => {
//     if (emp.reportingManager) {
//       const managerIdentifier = emp.reportingManager
      
//       // Try to find manager by code first, then by name
//       let managerEmployee = employeeByCode.get(managerIdentifier) || employeeByName.get(managerIdentifier)
      
//       if (managerEmployee) {
//         const managerCode = managerEmployee.empCode
//         if (!childrenByManagerCode.has(managerCode)) {
//           childrenByManagerCode.set(managerCode, [])
//         }
//         childrenByManagerCode.get(managerCode)!.push(emp)
//       }
//     }
//   })

//   // Find root employees (those with no manager or manager not in dataset)
//   const rootEmployees = cleanedEmployees.filter(emp => {
//     if (!emp.reportingManager) return true
//     return !employeeByCode.has(emp.reportingManager) && !employeeByName.has(emp.reportingManager)
//   })

//   if (rootEmployees.length === 0) {
//     return []
//   }

//   // Build hierarchy recursively
//   function buildNode(employee: Employee, level: number = 0, path: string[] = []): HierarchyNode {
//     const currentPath = [...path, employee.empName]
    
//     // Prevent circular references
//     if (path.includes(employee.empName)) {
//       return {
//         employee,
//         level,
//         children: []
//       }
//     }
    
//     const children = childrenByManagerCode.get(employee.empCode) || []
    
//     return {
//       employee,
//       level,
//       children: children.map(child => buildNode(child, level + 1, currentPath)),
//     }
//   }

//   return rootEmployees.map(rootEmp => buildNode(rootEmp))
// }

// export type { Employee, HierarchyNode }

// interface Employee {
//   srNo: number
//   empCode: string
//   empName: string
//   emailId: string
//   location: string
//   designation: string
//   reportingManager: string
//   department: string
// }

// interface HierarchyNode {
//   employee: Employee
//   children: HierarchyNode[]
//   level: number
// }

// export function buildHierarchy(employees: Employee[]): HierarchyNode[] {
//   if (!employees || employees.length === 0) {
//     return []
//   }

//   // Normalize and clean data
//   const cleanedEmployees = employees.map(emp => ({
//     ...emp,
//     empCode: emp.empCode?.toString().trim() ?? "",
//     empName: emp.empName?.toString().trim() ?? "",
//     reportingManager: emp.reportingManager?.toString().trim() ?? "",
//     department: emp.department?.toString().trim() || "Unassigned",
//   })).filter(emp => emp.empCode !== "")

//   // First build the normal hierarchy
//   const normalHierarchy = buildNormalHierarchy(cleanedEmployees)
  
//   // Then wrap it with department structure
//   return wrapWithDepartments(normalHierarchy)
// }

// function buildNormalHierarchy(employees: Employee[]): HierarchyNode[] {
//   // Build lookup maps
//   const employeeByCode = new Map<string, Employee>()
//   const employeeByName = new Map<string, Employee>()
//   const childrenByManagerCode = new Map<string, Employee[]>()

//   // First pass: Build lookup maps
//   employees.forEach(emp => {
//     employeeByCode.set(emp.empCode, emp)
//     employeeByName.set(emp.empName, emp)
//   })

//   // Second pass: Build parent-child relationships
//   employees.forEach(emp => {
//     if (emp.reportingManager) {
//       const managerIdentifier = emp.reportingManager
      
//       // Try to find manager by code first, then by name
//       let managerEmployee = employeeByCode.get(managerIdentifier) || employeeByName.get(managerIdentifier)
      
//       if (managerEmployee) {
//         const managerCode = managerEmployee.empCode
//         if (!childrenByManagerCode.has(managerCode)) {
//           childrenByManagerCode.set(managerCode, [])
//         }
//         childrenByManagerCode.get(managerCode)!.push(emp)
//       }
//     }
//   })

//   // Find root employees (those with no manager or manager not in dataset)
//   const rootEmployees = employees.filter(emp => {
//     if (!emp.reportingManager) return true
//     return !employeeByCode.has(emp.reportingManager) && !employeeByName.has(emp.reportingManager)
//   })

//   if (rootEmployees.length === 0) {
//     return []
//   }

//   // Build hierarchy recursively
//   function buildNode(employee: Employee, level: number = 0, path: string[] = []): HierarchyNode {
//     const currentPath = [...path, employee.empName]
    
//     // Prevent circular references
//     if (path.includes(employee.empName)) {
//       return {
//         employee,
//         level,
//         children: []
//       }
//     }
    
//     const children = childrenByManagerCode.get(employee.empCode) || []
    
//     return {
//       employee,
//       level,
//       children: children.map(child => buildNode(child, level + 1, currentPath)),
//     }
//   }

//   return rootEmployees.map(rootEmp => buildNode(rootEmp))
// }

// function wrapWithDepartments(nodes: HierarchyNode[]): HierarchyNode[] {
//   // Group nodes by department
//   const departmentMap = new Map<string, HierarchyNode[]>()

//   nodes.forEach(node => {
//     const dept = node.employee.department
//     if (!departmentMap.has(dept)) {
//       departmentMap.set(dept, [])
//     }
//     departmentMap.get(dept)!.push(node)
//   })

//   // Create department nodes
//   const departmentNodes: HierarchyNode[] = []
  
//   departmentMap.forEach((nodes, deptName) => {
//     // Create a department node
//     const deptNode: HierarchyNode = {
//       employee: {
//         srNo: 0,
//         empCode: `DEPT_${deptName.replace(/\s+/g, '_').toUpperCase()}`,
//         empName: deptName,
//         emailId: '',
//         location: '',
//         designation: 'Department',
//         reportingManager: '',
//         department: deptName
//       },
//       children: nodes,
//       level: 0 // Department nodes are level 0
//     }
    
//     // Increment levels for all children
//     function incrementLevels(node: HierarchyNode) {
//       node.level += 1
//       node.children.forEach(incrementLevels)
//     }
    
//     nodes.forEach(incrementLevels)
    
//     departmentNodes.push(deptNode)
//   })

//   return departmentNodes
// }

// export type { Employee, HierarchyNode }

// interface Employee {
//   srNo: number
//   empCode: string
//   empName: string
//   emailId: string
//   location: string
//   designation: string
//   reportingManager: string
//   department: string
// }

// interface HierarchyNode {
//   employee: Employee
//   children: HierarchyNode[]
//   level: number
// }

// export function buildFullHierarchy(employees: Employee[]): HierarchyNode[] {
//   const departmentGroupedHierarchy = buildHierarchy(employees)

//   const rootNode: HierarchyNode = {
//     employee: {
//       srNo: 0,
//       empCode: "root",
//       empName: "ROOT",
//       emailId: "",
//       location: "",
//       designation: "Root",
//       reportingManager: "",
//       department: "ROOT"
//     },
//     level: 0,
//     children: departmentGroupedHierarchy
//   }

//   // Adjust levels for children under root
//   function incrementLevels(node: HierarchyNode) {
//     node.level += 1
//     node.children.forEach(incrementLevels)
//   }

//   departmentGroupedHierarchy.forEach(incrementLevels)

//   return [rootNode]
// }

// export function buildHierarchy(employees: Employee[]): HierarchyNode[] {
//   if (!employees || employees.length === 0) {
//     return []
//   }

//   // Normalize and clean data
//   const cleanedEmployees = employees.map(emp => ({
//     ...emp,
//     empCode: emp.empCode?.toString().trim() ?? "",
//     empName: emp.empName?.toString().trim() ?? "",
//     reportingManager: emp.reportingManager?.toString().trim() ?? "",
//     department: emp.department?.toString().trim() || "Unassigned",
//   })).filter(emp => emp.empCode !== "")

//   // First build the normal hierarchy
//   const normalHierarchy = buildNormalHierarchy(cleanedEmployees)
  
//   // Then wrap it with department structure
//   return wrapWithDepartments(normalHierarchy)
// }

// function buildNormalHierarchy(employees: Employee[]): HierarchyNode[] {
//   const employeeByCode = new Map<string, Employee>()
//   const employeeByName = new Map<string, Employee>()
//   const childrenByManagerCode = new Map<string, Employee[]>()

//   employees.forEach(emp => {
//     employeeByCode.set(emp.empCode, emp)
//     employeeByName.set(emp.empName, emp)
//   })

//   employees.forEach(emp => {
//     if (emp.reportingManager) {
//       const managerIdentifier = emp.reportingManager
//       let managerEmployee = employeeByCode.get(managerIdentifier) || employeeByName.get(managerIdentifier)

//       if (managerEmployee) {
//         const managerCode = managerEmployee.empCode
//         if (!childrenByManagerCode.has(managerCode)) {
//           childrenByManagerCode.set(managerCode, [])
//         }
//         childrenByManagerCode.get(managerCode)!.push(emp)
//       }
//     }
//   })

//   const rootEmployees = employees.filter(emp => {
//     if (!emp.reportingManager) return true
//     return !employeeByCode.has(emp.reportingManager) && !employeeByName.has(emp.reportingManager)
//   })

//   if (rootEmployees.length === 0) {
//     return []
//   }

//   function buildNode(employee: Employee, level: number = 0, path: string[] = []): HierarchyNode {
//     const currentPath = [...path, employee.empName]
//     if (path.includes(employee.empName)) {
//       return { employee, level, children: [] }
//     }

//     const children = childrenByManagerCode.get(employee.empCode) || []

//     return {
//       employee,
//       level,
//       children: children.map(child => buildNode(child, level + 1, currentPath)),
//     }
//   }

//   return rootEmployees.map(rootEmp => buildNode(rootEmp))
// }

// function wrapWithDepartments(nodes: HierarchyNode[]): HierarchyNode[] {
//   const departmentMap = new Map<string, HierarchyNode[]>()

//   nodes.forEach(node => {
//     const dept = node.employee.department
//     if (!departmentMap.has(dept)) {
//       departmentMap.set(dept, [])
//     }
//     departmentMap.get(dept)!.push(node)
//   })

//   const departmentNodes: HierarchyNode[] = []

//   departmentMap.forEach((nodes, deptName) => {
//     const deptNode: HierarchyNode = {
//       employee: {
//         srNo: 0,
//         empCode: `DEPT_${deptName.replace(/\s+/g, '_').toUpperCase()}`,
//         empName: deptName,
//         emailId: '',
//         location: '',
//         designation: 'Department',
//         reportingManager: '',
//         department: deptName
//       },
//       children: nodes,
//       level: 0
//     }

//     function incrementLevels(node: HierarchyNode) {
//       node.level += 1
//       node.children.forEach(incrementLevels)
//     }

//     nodes.forEach(incrementLevels)

//     departmentNodes.push(deptNode)
//   })

//   return departmentNodes
// }

// export type { Employee, HierarchyNode }


// interface Employee {
//   srNo: number
//   empCode: string
//   empName: string
//   emailId: string
//   location: string
//   designation: string
//   reportingManager: string
//   department: string
// }

// interface HierarchyNode {
//   employee: Employee
//   children: HierarchyNode[]
//   level: number
// }

// export function buildFullHierarchy(employees: Employee[]): HierarchyNode[] {
//   const normalHierarchy = buildNormalHierarchy(cleanAndNormalize(employees))

//   // For each root-level employee, group their children by department
//   const rootsWithDeptChildren = normalHierarchy.map(root => {
//     // Group root's children by department
//     const deptMap = new Map<string, HierarchyNode[]>()

//     root.children.forEach(childNode => {
//       const dept = childNode.employee.department || "Unassigned"
//       if (!deptMap.has(dept)) {
//         deptMap.set(dept, [])
//       }
//       deptMap.get(dept)!.push(childNode)
//     })

//     // Create department nodes under this root employee
//     const departmentNodes: HierarchyNode[] = []

//     deptMap.forEach((nodes, deptName) => {
//       nodes.forEach(incrementLevels) // increment levels of children

//       departmentNodes.push({
//         employee: {
//           srNo: 0,
//           empCode: `DEPT_${deptName.replace(/\s+/g, "_").toUpperCase()}`,
//           empName: deptName,
//           emailId: '',
//           location: '',
//           designation: 'Department',
//           reportingManager: '',
//           department: deptName,
//         },
//         children: nodes,
//         level: root.level + 1,
//       })
//     })

//     // Return root with new children as department nodes
//     return {
//       ...root,
//       children: departmentNodes,
//     }
//   })

//   return rootsWithDeptChildren
// }


// // Normalize and clean
// function cleanAndNormalize(employees: Employee[]): Employee[] {
//   return employees
//     .map(emp => ({
//       ...emp,
//       empCode: emp.empCode?.toString().trim() ?? "",
//       empName: emp.empName?.toString().trim() ?? "",
//       reportingManager: emp.reportingManager?.toString().trim() ?? "",
//       department: emp.department?.toString().trim() || "Unassigned"
//     }))
//     .filter(emp => emp.empCode !== "")
// }

// // Build basic hierarchy (no departments yet)
// function buildNormalHierarchy(employees: Employee[]): HierarchyNode[] {
//   const employeeByCode = new Map<string, Employee>()
//   const employeeByName = new Map<string, Employee>()
//   const childrenByManagerCode = new Map<string, Employee[]>()

//   employees.forEach(emp => {
//     employeeByCode.set(emp.empCode, emp)
//     employeeByName.set(emp.empName, emp)
//   })

//   employees.forEach(emp => {
//     if (emp.reportingManager) {
//       const manager = employeeByCode.get(emp.reportingManager) || employeeByName.get(emp.reportingManager)
//       if (manager) {
//         const mgrCode = manager.empCode
//         if (!childrenByManagerCode.has(mgrCode)) {
//           childrenByManagerCode.set(mgrCode, [])
//         }
//         childrenByManagerCode.get(mgrCode)!.push(emp)
//       }
//     }
//   })

//   const rootEmployees = employees.filter(emp => {
//     if (!emp.reportingManager) return true
//     return !employeeByCode.has(emp.reportingManager) && !employeeByName.has(emp.reportingManager)
//   })

//   const buildNode = (employee: Employee, level = 0, path: string[] = []): HierarchyNode => {
//     const currentPath = [...path, employee.empName]
//     if (path.includes(employee.empName)) {
//       return { employee, level, children: [] }
//     }

//     const children = childrenByManagerCode.get(employee.empCode) || []

//     return {
//       employee,
//       level,
//       children: children.map(child => buildNode(child, level + 1, currentPath))
//     }
//   }

//   return rootEmployees.map(emp => buildNode(emp))
// }

// // Increment level recursively
// function incrementLevels(node: HierarchyNode) {
//   node.level += 1
//   node.children.forEach(incrementLevels)
// }

// export type { Employee, HierarchyNode }


// interface Employee {
//   srNo: number
//   empCode: string
//   empName: string
//   emailId: string
//   location: string
//   designation: string
//   reportingManager: string
//   department: string
// }

// interface HierarchyNode {
//   employee: Employee
//   children: HierarchyNode[]
//   level: number
// }

// export function buildFullHierarchy(employees: Employee[]): HierarchyNode[] {
//   const normalHierarchy = buildNormalHierarchy(cleanAndNormalize(employees))
  
//   // Apply department grouping recursively to all nodes
//   const hierarchyWithDepts = normalHierarchy.map(root => applyDepartmentGrouping(root))
  
//   return hierarchyWithDepts
// }

// // Recursively apply department grouping to a node and all its descendants
// function applyDepartmentGrouping(node: HierarchyNode): HierarchyNode {
//   // First, recursively process all children
//   const processedChildren = node.children.map(child => applyDepartmentGrouping(child))
  
//   // If this node has no children, return as-is
//   if (processedChildren.length === 0) {
//     return { ...node, children: [] }
//   }
  
//   // Group children by department
//   const deptMap = new Map<string, HierarchyNode[]>()
  
//   processedChildren.forEach(childNode => {
//     const dept = childNode.employee.department || "Unassigned"
//     if (!deptMap.has(dept)) {
//       deptMap.set(dept, [])
//     }
//     deptMap.get(dept)!.push(childNode)
//   })
  
//   // If all children are in the same department, don't create department nodes
//   if (deptMap.size === 1) {
//     return {
//       ...node,
//       children: processedChildren
//     }
//   }
  
//   // Multiple departments - create department nodes
//   const departmentNodes: HierarchyNode[] = []
  
//   deptMap.forEach((deptChildren, deptName) => {
//     // Increment levels for all children in this department
//     const adjustedChildren = deptChildren.map(child => incrementAllLevels(child, 1))
    
//     const departmentNode: HierarchyNode = {
//       employee: {
//         srNo: 0,
//         empCode: `DEPT_${node.employee.empCode}_${deptName.replace(/\s+/g, "_").toUpperCase()}`,
//         empName: deptName,
//         emailId: '',
//         location: '',
//         designation: 'Department',
//         reportingManager: node.employee.empCode,
//         department: deptName,
//       },
//       children: adjustedChildren,
//       level: node.level + 1,
//     }
    
//     departmentNodes.push(departmentNode)
//   })
  
//   return {
//     ...node,
//     children: departmentNodes
//   }
// }

// // Helper function to increment levels recursively
// function incrementAllLevels(node: HierarchyNode, increment: number): HierarchyNode {
//   return {
//     ...node,
//     level: node.level + increment,
//     children: node.children.map(child => incrementAllLevels(child, increment))
//   }
// }

// // Alternative version - only create department nodes when there are 3+ employees OR multiple departments
// export function buildSelectiveDepartmentHierarchy(employees: Employee[]): HierarchyNode[] {
//   const normalHierarchy = buildNormalHierarchy(cleanAndNormalize(employees))
  
//   const hierarchyWithDepts = normalHierarchy.map(root => applySelectiveDepartmentGrouping(root))
  
//   return hierarchyWithDepts
// }

// function applySelectiveDepartmentGrouping(node: HierarchyNode): HierarchyNode {
//   // First, recursively process all children
//   const processedChildren = node.children.map(child => applySelectiveDepartmentGrouping(child))
  
//   if (processedChildren.length === 0) {
//     return { ...node, children: [] }
//   }
  
//   // Group children by department
//   const deptMap = new Map<string, HierarchyNode[]>()
  
//   processedChildren.forEach(childNode => {
//     const dept = childNode.employee.department || "Unassigned"
//     if (!deptMap.has(dept)) {
//       deptMap.set(dept, [])
//     }
//     deptMap.get(dept)!.push(childNode)
//   })
  
//   // Determine if we should create department nodes
//   const shouldCreateDeptNodes = deptMap.size > 1 || 
//     Array.from(deptMap.values()).some(deptChildren => deptChildren.length >= 3)
  
//   if (!shouldCreateDeptNodes) {
//     return {
//       ...node,
//       children: processedChildren
//     }
//   }
  
//   // Create department nodes
//   const departmentNodes: HierarchyNode[] = []
  
//   deptMap.forEach((deptChildren, deptName) => {
//     const adjustedChildren = deptChildren.map(child => incrementAllLevels(child, 1))
    
//     const departmentNode: HierarchyNode = {
//       employee: {
//         srNo: 0,
//         empCode: `DEPT_${node.employee.empCode}_${deptName.replace(/\s+/g, "_").toUpperCase()}`,
//         empName: deptName,
//         emailId: '',
//         location: '',
//         designation: 'Department',
//         reportingManager: node.employee.empCode,
//         department: deptName,
//       },
//       children: adjustedChildren,
//       level: node.level + 1,
//     }
    
//     departmentNodes.push(departmentNode)
//   })
  
//   return {
//     ...node,
//     children: departmentNodes
//   }
// }

// // Keep your existing helper functions unchanged
// function cleanAndNormalize(employees: Employee[]): Employee[] {
//   return employees
//     .map(emp => ({
//       ...emp,
//       empCode: emp.empCode?.toString().trim() ?? "",
//       empName: emp.empName?.toString().trim() ?? "",
//       reportingManager: emp.reportingManager?.toString().trim() ?? "",
//       department: emp.department?.toString().trim() || "Unassigned"
//     }))
//     .filter(emp => emp.empCode !== "")
// }

// function buildNormalHierarchy(employees: Employee[]): HierarchyNode[] {
//   const employeeByCode = new Map<string, Employee>()
//   const employeeByName = new Map<string, Employee>()
//   const childrenByManagerCode = new Map<string, Employee[]>()

//   employees.forEach(emp => {
//     employeeByCode.set(emp.empCode, emp)
//     employeeByName.set(emp.empName, emp)
//   })

//   employees.forEach(emp => {
//     if (emp.reportingManager) {
//       const manager = employeeByCode.get(emp.reportingManager) || employeeByName.get(emp.reportingManager)
//       if (manager) {
//         const mgrCode = manager.empCode
//         if (!childrenByManagerCode.has(mgrCode)) {
//           childrenByManagerCode.set(mgrCode, [])
//         }
//         childrenByManagerCode.get(mgrCode)!.push(emp)
//       }
//     }
//   })

//   const rootEmployees = employees.filter(emp => {
//     if (!emp.reportingManager) return true
//     return !employeeByCode.has(emp.reportingManager) && !employeeByName.has(emp.reportingManager)
//   })

//   const buildNode = (employee: Employee, level = 0, path: string[] = []): HierarchyNode => {
//     const currentPath = [...path, employee.empName]
//     if (path.includes(employee.empName)) {
//       return { employee, level, children: [] }
//     }

//     const children = childrenByManagerCode.get(employee.empCode) || []

//     return {
//       employee,
//       level,
//       children: children.map(child => buildNode(child, level + 1, currentPath))
//     }
//   }

//   return rootEmployees.map(emp => buildNode(emp))
// }

// function incrementLevels(node: HierarchyNode) {
//   node.level += 1
//   node.children.forEach(incrementLevels)
// }

// export type { Employee, HierarchyNode }

// interface Employee {
//   srNo: number
//   empCode: string
//   empName: string
//   emailId: string
//   location: string
//   designation: string
//   reportingManager: string
//   department: string
// }

// interface HierarchyNode {
//   employee: Employee
//   children: HierarchyNode[]
//   level: number
// }

// export function buildFullHierarchy(employees: Employee[]): HierarchyNode[] {
//   const normalHierarchy = buildNormalHierarchy(cleanAndNormalize(employees))
  
//   // Apply department grouping recursively to all nodes
//   const hierarchyWithDepts = normalHierarchy.map(root => applyDepartmentGrouping(root))
  
//   return hierarchyWithDepts
// }

// // Recursively apply department grouping to a node and all its descendants
// function applyDepartmentGrouping(node: HierarchyNode): HierarchyNode {
//   // First, recursively process all children
//   const processedChildren = node.children.map(child => applyDepartmentGrouping(child))
  
//   // If this node has no children, return as-is
//   if (processedChildren.length === 0) {
//     return { ...node, children: [] }
//   }
  
//   // Group children by department
//   const deptMap = new Map<string, HierarchyNode[]>()
  
//   processedChildren.forEach(childNode => {
//     const dept = childNode.employee.department || "Unassigned"
//     if (!deptMap.has(dept)) {
//       deptMap.set(dept, [])
//     }
//     deptMap.get(dept)!.push(childNode)
//   })
  
//   // Always create department nodes when there are children (like the old code)
//   const departmentNodes: HierarchyNode[] = []
  
//   deptMap.forEach((deptChildren, deptName) => {
//     // Increment levels for all children in this department
//     const adjustedChildren = deptChildren.map(child => incrementAllLevels(child, 1))
    
//     const departmentNode: HierarchyNode = {
//       employee: {
//         srNo: 0,
//         empCode: `DEPT_${node.employee.empCode}_${deptName.replace(/\s+/g, "_").toUpperCase()}`,
//         empName: deptName,
//         emailId: '',
//         location: '',
//         designation: 'Department',
//         reportingManager: node.employee.empCode,
//         department: deptName,
//       },
//       children: adjustedChildren,
//       level: node.level + 1,
//     }
    
//     departmentNodes.push(departmentNode)
//   })
  
//   return {
//     ...node,
//     children: departmentNodes
//   }
// }

// // Helper function to increment levels recursively
// function incrementAllLevels(node: HierarchyNode, increment: number): HierarchyNode {
//   return {
//     ...node,
//     level: node.level + increment,
//     children: node.children.map(child => incrementAllLevels(child, increment))
//   }
// }

// // Alternative version - only create department nodes when there are 3+ employees OR multiple departments
// export function buildSelectiveDepartmentHierarchy(employees: Employee[]): HierarchyNode[] {
//   const normalHierarchy = buildNormalHierarchy(cleanAndNormalize(employees))
  
//   const hierarchyWithDepts = normalHierarchy.map(root => applySelectiveDepartmentGrouping(root))
  
//   return hierarchyWithDepts
// }

// function applySelectiveDepartmentGrouping(node: HierarchyNode): HierarchyNode {
//   // First, recursively process all children
//   const processedChildren = node.children.map(child => applySelectiveDepartmentGrouping(child))
  
//   if (processedChildren.length === 0) {
//     return { ...node, children: [] }
//   }
  
//   // Group children by department
//   const deptMap = new Map<string, HierarchyNode[]>()
  
//   processedChildren.forEach(childNode => {
//     const dept = childNode.employee.department || "Unassigned"
//     if (!deptMap.has(dept)) {
//       deptMap.set(dept, [])
//     }
//     deptMap.get(dept)!.push(childNode)
//   })
  
//   // Determine if we should create department nodes
//   const shouldCreateDeptNodes = deptMap.size > 1 || 
//     Array.from(deptMap.values()).some(deptChildren => deptChildren.length >= 3)
  
//   if (!shouldCreateDeptNodes) {
//     return {
//       ...node,
//       children: processedChildren
//     }
//   }
  
//   // Create department nodes
//   const departmentNodes: HierarchyNode[] = []
  
//   deptMap.forEach((deptChildren, deptName) => {
//     const adjustedChildren = deptChildren.map(child => incrementAllLevels(child, 1))
    
//     const departmentNode: HierarchyNode = {
//       employee: {
//         srNo: 0,
//         empCode: `DEPT_${node.employee.empCode}_${deptName.replace(/\s+/g, "_").toUpperCase()}`,
//         empName: deptName,
//         emailId: '',
//         location: '',
//         designation: 'Department',
//         reportingManager: node.employee.empCode,
//         department: deptName,
//       },
//       children: adjustedChildren,
//       level: node.level + 1,
//     }
    
//     departmentNodes.push(departmentNode)
//   })
  
//   return {
//     ...node,
//     children: departmentNodes
//   }
// }

// // Keep your existing helper functions unchanged
// function cleanAndNormalize(employees: Employee[]): Employee[] {
//   return employees
//     .map(emp => ({
//       ...emp,
//       empCode: emp.empCode?.toString().trim() ?? "",
//       empName: emp.empName?.toString().trim() ?? "",
//       reportingManager: emp.reportingManager?.toString().trim() ?? "",
//       department: emp.department?.toString().trim() || "Unassigned"
//     }))
//     .filter(emp => emp.empCode !== "")
// }

// function buildNormalHierarchy(employees: Employee[]): HierarchyNode[] {
//   const employeeByCode = new Map<string, Employee>()
//   const employeeByName = new Map<string, Employee>()
//   const childrenByManagerCode = new Map<string, Employee[]>()

//   employees.forEach(emp => {
//     employeeByCode.set(emp.empCode, emp)
//     employeeByName.set(emp.empName, emp)
//   })

//   employees.forEach(emp => {
//     if (emp.reportingManager) {
//       const manager = employeeByCode.get(emp.reportingManager) || employeeByName.get(emp.reportingManager)
//       if (manager) {
//         const mgrCode = manager.empCode
//         if (!childrenByManagerCode.has(mgrCode)) {
//           childrenByManagerCode.set(mgrCode, [])
//         }
//         childrenByManagerCode.get(mgrCode)!.push(emp)
//       }
//     }
//   })

//   const rootEmployees = employees.filter(emp => {
//     if (!emp.reportingManager) return true
//     return !employeeByCode.has(emp.reportingManager) && !employeeByName.has(emp.reportingManager)
//   })

//   const buildNode = (employee: Employee, level = 0, path: string[] = []): HierarchyNode => {
//     const currentPath = [...path, employee.empName]
//     if (path.includes(employee.empName)) {
//       return { employee, level, children: [] }
//     }

//     const children = childrenByManagerCode.get(employee.empCode) || []

//     return {
//       employee,
//       level,
//       children: children.map(child => buildNode(child, level + 1, currentPath))
//     }
//   }

//   return rootEmployees.map(emp => buildNode(emp))
// }

// function incrementLevels(node: HierarchyNode) {
//   node.level += 1
//   node.children.forEach(incrementLevels)
// }

// export type { Employee, HierarchyNode }

// interface Employee {
//   srNo: number
//   empCode: string
//   empName: string
//   emailId: string
//   location: string
//   designation: string
//   reportingManager: string
//   department: string
// }

// interface HierarchyNode {
//   employee: Employee
//   children: HierarchyNode[]
//   level: number
// }

// export function buildFullHierarchy(employees: Employee[]): HierarchyNode[] {
//   const normalHierarchy = buildNormalHierarchy(cleanAndNormalize(employees))
  
//   // Apply department grouping only at root level (like the old code)
//   const hierarchyWithDepts = normalHierarchy.map(root => applyRootLevelDepartmentGrouping(root))
  
//   return hierarchyWithDepts
// }

// // Apply department grouping only at root level (not recursively)
// function applyRootLevelDepartmentGrouping(root: HierarchyNode): HierarchyNode {
//   // If this root has no children, return as-is
//   if (root.children.length === 0) {
//     return root
//   }
  
//   // Group root's children by department
//   const deptMap = new Map<string, HierarchyNode[]>()
  
//   root.children.forEach(childNode => {
//     const dept = childNode.employee.department || "Unassigned"
//     if (!deptMap.has(dept)) {
//       deptMap.set(dept, [])
//     }
//     deptMap.get(dept)!.push(childNode)
//   })
  
//   // Create department nodes under this root employee
//   const departmentNodes: HierarchyNode[] = []
  
//   deptMap.forEach((deptChildren, deptName) => {
//     // Increment levels for all children in this department
//     const adjustedChildren = deptChildren.map(child => incrementAllLevels(child, 1))
    
//     const departmentNode: HierarchyNode = {
//       employee: {
//         srNo: 0,
//         empCode: `DEPT_${root.employee.empCode}_${deptName.replace(/\s+/g, "_").toUpperCase()}`,
//         empName: deptName,
//         emailId: '',
//         location: '',
//         designation: 'Department',
//         reportingManager: root.employee.empCode,
//         department: deptName,
//       },
//       children: adjustedChildren,
//       level: root.level + 1,
//     }
    
//     departmentNodes.push(departmentNode)
//   })
  
//   // Return root with new children as department nodes
//   return {
//     ...root,
//     children: departmentNodes
//   }
// }

// // Helper function to increment levels recursively
// function incrementAllLevels(node: HierarchyNode, increment: number): HierarchyNode {
//   return {
//     ...node,
//     level: node.level + increment,
//     children: node.children.map(child => incrementAllLevels(child, increment))
//   }
// }

// // Alternative version - only create department nodes when there are 3+ employees OR multiple departments
// export function buildSelectiveDepartmentHierarchy(employees: Employee[]): HierarchyNode[] {
//   const normalHierarchy = buildNormalHierarchy(cleanAndNormalize(employees))
  
//   const hierarchyWithDepts = normalHierarchy.map(root => applySelectiveDepartmentGrouping(root))
  
//   return hierarchyWithDepts
// }

// function applySelectiveDepartmentGrouping(node: HierarchyNode): HierarchyNode {
//   // First, recursively process all children
//   const processedChildren = node.children.map(child => applySelectiveDepartmentGrouping(child))
  
//   if (processedChildren.length === 0) {
//     return { ...node, children: [] }
//   }
  
//   // Group children by department
//   const deptMap = new Map<string, HierarchyNode[]>()
  
//   processedChildren.forEach(childNode => {
//     const dept = childNode.employee.department || "Unassigned"
//     if (!deptMap.has(dept)) {
//       deptMap.set(dept, [])
//     }
//     deptMap.get(dept)!.push(childNode)
//   })
  
//   // Determine if we should create department nodes
//   const shouldCreateDeptNodes = deptMap.size > 1 || 
//     Array.from(deptMap.values()).some(deptChildren => deptChildren.length >= 3)
  
//   if (!shouldCreateDeptNodes) {
//     return {
//       ...node,
//       children: processedChildren
//     }
//   }
  
//   // Create department nodes
//   const departmentNodes: HierarchyNode[] = []
  
//   deptMap.forEach((deptChildren, deptName) => {
//     const adjustedChildren = deptChildren.map(child => incrementAllLevels(child, 1))
    
//     const departmentNode: HierarchyNode = {
//       employee: {
//         srNo: 0,
//         empCode: `DEPT_${node.employee.empCode}_${deptName.replace(/\s+/g, "_").toUpperCase()}`,
//         empName: deptName,
//         emailId: '',
//         location: '',
//         designation: 'Department',
//         reportingManager: node.employee.empCode,
//         department: deptName,
//       },
//       children: adjustedChildren,
//       level: node.level + 1,
//     }
    
//     departmentNodes.push(departmentNode)
//   })
  
//   return {
//     ...node,
//     children: departmentNodes
//   }
// }

// // Keep your existing helper functions unchanged
// function cleanAndNormalize(employees: Employee[]): Employee[] {
//   return employees
//     .map(emp => ({
//       ...emp,
//       empCode: emp.empCode?.toString().trim() ?? "",
//       empName: emp.empName?.toString().trim() ?? "",
//       reportingManager: emp.reportingManager?.toString().trim() ?? "",
//       department: emp.department?.toString().trim() || "Unassigned"
//     }))
//     .filter(emp => emp.empCode !== "")
// }

// function buildNormalHierarchy(employees: Employee[]): HierarchyNode[] {
//   const employeeByCode = new Map<string, Employee>()
//   const employeeByName = new Map<string, Employee>()
//   const childrenByManagerCode = new Map<string, Employee[]>()

//   employees.forEach(emp => {
//     employeeByCode.set(emp.empCode, emp)
//     employeeByName.set(emp.empName, emp)
//   })

//   employees.forEach(emp => {
//     if (emp.reportingManager) {
//       const manager = employeeByCode.get(emp.reportingManager) || employeeByName.get(emp.reportingManager)
//       if (manager) {
//         const mgrCode = manager.empCode
//         if (!childrenByManagerCode.has(mgrCode)) {
//           childrenByManagerCode.set(mgrCode, [])
//         }
//         childrenByManagerCode.get(mgrCode)!.push(emp)
//       }
//     }
//   })

//   const rootEmployees = employees.filter(emp => {
//     if (!emp.reportingManager) return true
//     return !employeeByCode.has(emp.reportingManager) && !employeeByName.has(emp.reportingManager)
//   })

//   const buildNode = (employee: Employee, level = 0, path: string[] = []): HierarchyNode => {
//     const currentPath = [...path, employee.empName]
//     if (path.includes(employee.empName)) {
//       return { employee, level, children: [] }
//     }

//     const children = childrenByManagerCode.get(employee.empCode) || []

//     return {
//       employee,
//       level,
//       children: children.map(child => buildNode(child, level + 1, currentPath))
//     }
//   }

//   return rootEmployees.map(emp => buildNode(emp))
// }

// function incrementLevels(node: HierarchyNode) {
//   node.level += 1
//   node.children.forEach(incrementLevels)
// }

// export type { Employee, HierarchyNode }

// interface Employee {
//   srNo: number
//   empCode: string
//   empName: string
//   emailId: string
//   location: string
//   designation: string
//   reportingManager: string
//   department: string
// }

// interface HierarchyNode {
//   employee: Employee
//   children: HierarchyNode[]
//   level: number
// }

// export function buildFullHierarchy(employees: Employee[]): HierarchyNode[] {
//   const normalHierarchy = buildNormalHierarchy(cleanAndNormalize(employees))
  
//   // Apply smart department grouping - only when there are multiple departments
//   const hierarchyWithDepts = normalHierarchy.map(root => applySmartDepartmentGrouping(root))
  
//   return hierarchyWithDepts
// }

// // Apply department grouping smartly - only when there are multiple departments under a node
// function applySmartDepartmentGrouping(node: HierarchyNode): HierarchyNode {
//   // First, recursively process all children
//   const processedChildren = node.children.map(child => applySmartDepartmentGrouping(child))
  
//   // If this node has no children, return as-is
//   if (processedChildren.length === 0) {
//     return { ...node, children: [] }
//   }
  
//   // Group children by department
//   const deptMap = new Map<string, HierarchyNode[]>()
  
//   processedChildren.forEach(childNode => {
//     const dept = childNode.employee.department || "Unassigned"
//     if (!deptMap.has(dept)) {
//       deptMap.set(dept, [])
//     }
//     deptMap.get(dept)!.push(childNode)
//   })
  
//   // Only create department nodes if there are multiple departments
//   if (deptMap.size <= 1) {
//     return {
//       ...node,
//       children: processedChildren
//     }
//   }
  
//   // Multiple departments - create department nodes
//   const departmentNodes: HierarchyNode[] = []
  
//   deptMap.forEach((deptChildren, deptName) => {
//     // Increment levels for all children in this department
//     const adjustedChildren = deptChildren.map(child => incrementAllLevels(child, 1))
    
//     const departmentNode: HierarchyNode = {
//       employee: {
//         srNo: 0,
//         empCode: `DEPT_${node.employee.empCode}_${deptName.replace(/\s+/g, "_").toUpperCase()}`,
//         empName: deptName,
//         emailId: '',
//         location: '',
//         designation: 'Department',
//         reportingManager: node.employee.empCode,
//         department: deptName,
//       },
//       children: adjustedChildren,
//       level: node.level + 1,
//     }
    
//     departmentNodes.push(departmentNode)
//   })
  
//   return {
//     ...node,
//     children: departmentNodes
//   }
// }

// // Helper function to increment levels recursively
// function incrementAllLevels(node: HierarchyNode, increment: number): HierarchyNode {
//   return {
//     ...node,
//     level: node.level + increment,
//     children: node.children.map(child => incrementAllLevels(child, increment))
//   }
// }

// // Alternative version - only create department nodes when there are 3+ employees OR multiple departments
// export function buildSelectiveDepartmentHierarchy(employees: Employee[]): HierarchyNode[] {
//   const normalHierarchy = buildNormalHierarchy(cleanAndNormalize(employees))
  
//   const hierarchyWithDepts = normalHierarchy.map(root => applySelectiveDepartmentGrouping(root))
  
//   return hierarchyWithDepts
// }

// function applySelectiveDepartmentGrouping(node: HierarchyNode): HierarchyNode {
//   // First, recursively process all children
//   const processedChildren = node.children.map(child => applySelectiveDepartmentGrouping(child))
  
//   if (processedChildren.length === 0) {
//     return { ...node, children: [] }
//   }
  
//   // Group children by department
//   const deptMap = new Map<string, HierarchyNode[]>()
  
//   processedChildren.forEach(childNode => {
//     const dept = childNode.employee.department || "Unassigned"
//     if (!deptMap.has(dept)) {
//       deptMap.set(dept, [])
//     }
//     deptMap.get(dept)!.push(childNode)
//   })
  
//   // Determine if we should create department nodes
//   const shouldCreateDeptNodes = deptMap.size > 1 || 
//     Array.from(deptMap.values()).some(deptChildren => deptChildren.length >= 3)
  
//   if (!shouldCreateDeptNodes) {
//     return {
//       ...node,
//       children: processedChildren
//     }
//   }
  
//   // Create department nodes
//   const departmentNodes: HierarchyNode[] = []
  
//   deptMap.forEach((deptChildren, deptName) => {
//     const adjustedChildren = deptChildren.map(child => incrementAllLevels(child, 1))
    
//     const departmentNode: HierarchyNode = {
//       employee: {
//         srNo: 0,
//         empCode: `DEPT_${node.employee.empCode}_${deptName.replace(/\s+/g, "_").toUpperCase()}`,
//         empName: deptName,
//         emailId: '',
//         location: '',
//         designation: 'Department',
//         reportingManager: node.employee.empCode,
//         department: deptName,
//       },
//       children: adjustedChildren,
//       level: node.level + 1,
//     }
    
//     departmentNodes.push(departmentNode)
//   })
  
//   return {
//     ...node,
//     children: departmentNodes
//   }
// }

// // Keep your existing helper functions unchanged
// function cleanAndNormalize(employees: Employee[]): Employee[] {
//   return employees
//     .map(emp => ({
//       ...emp,
//       empCode: emp.empCode?.toString().trim() ?? "",
//       empName: emp.empName?.toString().trim() ?? "",
//       reportingManager: emp.reportingManager?.toString().trim() ?? "",
//       department: emp.department?.toString().trim() || "Unassigned"
//     }))
//     .filter(emp => emp.empCode !== "")
// }

// function buildNormalHierarchy(employees: Employee[]): HierarchyNode[] {
//   const employeeByCode = new Map<string, Employee>()
//   const employeeByName = new Map<string, Employee>()
//   const childrenByManagerCode = new Map<string, Employee[]>()

//   employees.forEach(emp => {
//     employeeByCode.set(emp.empCode, emp)
//     employeeByName.set(emp.empName, emp)
//   })

//   employees.forEach(emp => {
//     if (emp.reportingManager) {
//       const manager = employeeByCode.get(emp.reportingManager) || employeeByName.get(emp.reportingManager)
//       if (manager) {
//         const mgrCode = manager.empCode
//         if (!childrenByManagerCode.has(mgrCode)) {
//           childrenByManagerCode.set(mgrCode, [])
//         }
//         childrenByManagerCode.get(mgrCode)!.push(emp)
//       }
//     }
//   })

//   const rootEmployees = employees.filter(emp => {
//     if (!emp.reportingManager) return true
//     return !employeeByCode.has(emp.reportingManager) && !employeeByName.has(emp.reportingManager)
//   })

//   const buildNode = (employee: Employee, level = 0, path: string[] = []): HierarchyNode => {
//     const currentPath = [...path, employee.empName]
//     if (path.includes(employee.empName)) {
//       return { employee, level, children: [] }
//     }

//     const children = childrenByManagerCode.get(employee.empCode) || []

//     return {
//       employee,
//       level,
//       children: children.map(child => buildNode(child, level + 1, currentPath))
//     }
//   }

//   return rootEmployees.map(emp => buildNode(emp))
// }

// function incrementLevels(node: HierarchyNode) {
//   node.level += 1
//   node.children.forEach(incrementLevels)
// }

// export type { Employee, HierarchyNode }

interface Employee {
  srNo: number
  empCode: string
  empName: string
  emailId: string
  location: string
  designation: string
  reportingManager: string
  department: string
}

interface HierarchyNode {
  employee: Employee
  children: HierarchyNode[]
  level: number
}

export function buildFullHierarchy(employees: Employee[]): HierarchyNode[] {
  const normalHierarchy = buildNormalHierarchy(cleanAndNormalize(employees))
  
  // Apply smart department grouping - only when there are multiple departments
  const hierarchyWithDepts = normalHierarchy.map(root => applySmartDepartmentGrouping(root))
  
  return hierarchyWithDepts
}

// Apply department grouping smartly - always at root level, then only when multiple departments
function applySmartDepartmentGrouping(node: HierarchyNode): HierarchyNode {
  // First, recursively process all children
  const processedChildren = node.children.map(child => applySmartDepartmentGrouping(child))
  
  // If this node has no children, return as-is
  if (processedChildren.length === 0) {
    return { ...node, children: [] }
  }
  
  // Group children by department
  const deptMap = new Map<string, HierarchyNode[]>()
  
  processedChildren.forEach(childNode => {
    const dept = childNode.employee.department || "Unassigned"
    if (!deptMap.has(dept)) {
      deptMap.set(dept, [])
    }
    deptMap.get(dept)!.push(childNode)
  })
  
  // Create department nodes if:
  // 1. This is a root level node (level 0), OR
  // 2. There are multiple departments
  const isRootLevel = node.level === 0
  const shouldCreateDeptNodes = isRootLevel || deptMap.size > 1
  
  if (!shouldCreateDeptNodes) {
    return {
      ...node,
      children: processedChildren
    }
  }
  
  // Create department nodes
  const departmentNodes: HierarchyNode[] = []
  
  deptMap.forEach((deptChildren, deptName) => {
    // Increment levels for all children in this department
    const adjustedChildren = deptChildren.map(child => incrementAllLevels(child, 1))
    
    const departmentNode: HierarchyNode = {
      employee: {
        srNo: 0,
        empCode: `DEPT_${node.employee.empCode}_${deptName.replace(/\s+/g, "_").toUpperCase()}`,
        empName: deptName,
        emailId: '',
        location: '',
        designation: 'Department',
        reportingManager: node.employee.empCode,
        department: deptName,
      },
      children: adjustedChildren,
      level: node.level + 1,
    }
    
    departmentNodes.push(departmentNode)
  })
  
  return {
    ...node,
    children: departmentNodes
  }
}

// Helper function to increment levels recursively
function incrementAllLevels(node: HierarchyNode, increment: number): HierarchyNode {
  return {
    ...node,
    level: node.level + increment,
    children: node.children.map(child => incrementAllLevels(child, increment))
  }
}

// Alternative version - only create department nodes when there are 3+ employees OR multiple departments
export function buildSelectiveDepartmentHierarchy(employees: Employee[]): HierarchyNode[] {
  const normalHierarchy = buildNormalHierarchy(cleanAndNormalize(employees))
  
  const hierarchyWithDepts = normalHierarchy.map(root => applySelectiveDepartmentGrouping(root))
  
  return hierarchyWithDepts
}

function applySelectiveDepartmentGrouping(node: HierarchyNode): HierarchyNode {
  // First, recursively process all children
  const processedChildren = node.children.map(child => applySelectiveDepartmentGrouping(child))
  
  if (processedChildren.length === 0) {
    return { ...node, children: [] }
  }
  
  // Group children by department
  const deptMap = new Map<string, HierarchyNode[]>()
  
  processedChildren.forEach(childNode => {
    const dept = childNode.employee.department || "Unassigned"
    if (!deptMap.has(dept)) {
      deptMap.set(dept, [])
    }
    deptMap.get(dept)!.push(childNode)
  })
  
  // Determine if we should create department nodes
  const shouldCreateDeptNodes = deptMap.size > 1 || 
    Array.from(deptMap.values()).some(deptChildren => deptChildren.length >= 3)
  
  if (!shouldCreateDeptNodes) {
    return {
      ...node,
      children: processedChildren
    }
  }
  
  // Create department nodes
  const departmentNodes: HierarchyNode[] = []
  
  deptMap.forEach((deptChildren, deptName) => {
    const adjustedChildren = deptChildren.map(child => incrementAllLevels(child, 1))
    
    const departmentNode: HierarchyNode = {
      employee: {
        srNo: 0,
        empCode: `DEPT_${node.employee.empCode}_${deptName.replace(/\s+/g, "_").toUpperCase()}`,
        empName: deptName,
        emailId: '',
        location: '',
        designation: 'Department',
        reportingManager: node.employee.empCode,
        department: deptName,
      },
      children: adjustedChildren,
      level: node.level + 1,
    }
    
    departmentNodes.push(departmentNode)
  })
  
  return {
    ...node,
    children: departmentNodes
  }
}

// Keep your existing helper functions unchanged
function cleanAndNormalize(employees: Employee[]): Employee[] {
  return employees
    .map(emp => ({
      ...emp,
      empCode: emp.empCode?.toString().trim() ?? "",
      empName: emp.empName?.toString().trim() ?? "",
      reportingManager: emp.reportingManager?.toString().trim() ?? "",
      department: emp.department?.toString().trim() || "Unassigned"
    }))
    .filter(emp => emp.empCode !== "")
}

function buildNormalHierarchy(employees: Employee[]): HierarchyNode[] {
  const employeeByCode = new Map<string, Employee>()
  const employeeByName = new Map<string, Employee>()
  const childrenByManagerCode = new Map<string, Employee[]>()

  employees.forEach(emp => {
    employeeByCode.set(emp.empCode, emp)
    employeeByName.set(emp.empName, emp)
  })

  employees.forEach(emp => {
    if (emp.reportingManager) {
      const manager = employeeByCode.get(emp.reportingManager) || employeeByName.get(emp.reportingManager)
      if (manager) {
        const mgrCode = manager.empCode
        if (!childrenByManagerCode.has(mgrCode)) {
          childrenByManagerCode.set(mgrCode, [])
        }
        childrenByManagerCode.get(mgrCode)!.push(emp)
      }
    }
  })

  const rootEmployees = employees.filter(emp => {
    if (!emp.reportingManager) return true
    return !employeeByCode.has(emp.reportingManager) && !employeeByName.has(emp.reportingManager)
  })

  const buildNode = (employee: Employee, level = 0, path: string[] = []): HierarchyNode => {
    const currentPath = [...path, employee.empName]
    if (path.includes(employee.empName)) {
      return { employee, level, children: [] }
    }

    const children = childrenByManagerCode.get(employee.empCode) || []

    return {
      employee,
      level,
      children: children.map(child => buildNode(child, level + 1, currentPath))
    }
  }

  return rootEmployees.map(emp => buildNode(emp))
}

// function incrementLevels(node: HierarchyNode) {
//   node.level += 1
//   node.children.forEach(incrementLevels)
// }

export type { Employee, HierarchyNode }