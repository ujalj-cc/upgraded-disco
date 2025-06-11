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

export interface Employee {
  empName: string;
  empCode: string;
  designation: string;
  department: string;
  emailId: string;
  location: string;
  reportingManager: string;
  srNo: number;
}

export interface HierarchyNode {
  employee: Employee;
  children: HierarchyNode[];
  level: number;
}

export type NodeDatum = d3.HierarchyPointNode<HierarchyNode>;

export interface ChartConfig {
  nodeWidth: number;
  nodeHeight: number;
  horizontalSpacing: number;
  verticalSpacing: number;
  linkStyle: 'curved' | 'straight' | 'step';
}
