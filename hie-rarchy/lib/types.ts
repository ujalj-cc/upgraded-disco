export interface Employee {
  srNo: number
  empCode: string
  empName: string
  emailId: string
  location: string
  designation: string
  reportingManager: string
  department: string
}

export interface HierarchyNode {
  employee: Employee
  children: HierarchyNode[]
  level: number
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}
