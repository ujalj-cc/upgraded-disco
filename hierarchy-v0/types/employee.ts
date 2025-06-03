export interface Employee {
  empCode: string
  empName: string
  emailId: string
  location: string
  designation: string
  reportingManager: string
  department: string
  salary: number
  joinDate: string
  phone: string
  skills: string[]
  srNo: number
}

export interface HierarchyNode {
  employee: Employee
  children: HierarchyNode[]
  level: number
  isDepartmentHead?: boolean
  departmentName?: string
}
