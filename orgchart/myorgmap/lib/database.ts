import { neon } from "@neondatabase/serverless"

// Check if DATABASE_URL is available
const DATABASE_URL = process.env.DATABASE_URL

let sql: any = null

if (DATABASE_URL) {
  sql = neon(DATABASE_URL)
} else {
  console.warn("DATABASE_URL not found. Using fallback data.")
}

export interface Employee {
  empCode: string
  empName: string
  emailId: string
  location: string
  designation: string
  reportingManager: string | null
  department: string
  children?: Employee[]
}

// Fallback sample data when database is not available
const fallbackEmployees: Employee[] = [
  {
    empCode: "CEO001",
    empName: "Eleanor Roosevelt",
    emailId: "eleanor.roosevelt@company.com",
    location: "New York",
    designation: "Chief Executive Officer",
    reportingManager: null,
    department: "Executive",
  },
  {
    empCode: "CTO001",
    empName: "Marcus Chen",
    emailId: "marcus.chen@company.com",
    location: "San Francisco",
    designation: "Chief Technology Officer",
    reportingManager: "CEO001",
    department: "Technology",
  },
  {
    empCode: "CFO001",
    empName: "Sophia Williams",
    emailId: "sophia.williams@company.com",
    location: "New York",
    designation: "Chief Financial Officer",
    reportingManager: "CEO001",
    department: "Finance",
  },
  {
    empCode: "CMO001",
    empName: "James Wilson",
    emailId: "james.wilson@company.com",
    location: "Los Angeles",
    designation: "Chief Marketing Officer",
    reportingManager: "CEO001",
    department: "Marketing",
  },
  {
    empCode: "CPO001",
    empName: "Alexandra Peterson",
    emailId: "alexandra.peterson@company.com",
    location: "Chicago",
    designation: "Chief People Officer",
    reportingManager: "CEO001",
    department: "Human Resources",
  },
  {
    empCode: "VPE001",
    empName: "Sarah Johnson",
    emailId: "sarah.johnson@company.com",
    location: "San Francisco",
    designation: "VP of Engineering",
    reportingManager: "CTO001",
    department: "Engineering",
  },
  {
    empCode: "VPI001",
    empName: "John Adams",
    emailId: "john.adams@company.com",
    location: "Seattle",
    designation: "VP of Infrastructure",
    reportingManager: "CTO001",
    department: "Infrastructure",
  },
  {
    empCode: "FD001",
    empName: "Robert Brown",
    emailId: "robert.brown@company.com",
    location: "New York",
    designation: "Finance Director",
    reportingManager: "CFO001",
    department: "Finance",
  },
  {
    empCode: "MD001",
    empName: "Elizabeth Clark",
    emailId: "elizabeth.clark@company.com",
    location: "Los Angeles",
    designation: "Marketing Director",
    reportingManager: "CMO001",
    department: "Marketing",
  },
  {
    empCode: "HRD001",
    empName: "William Thompson",
    emailId: "william.thompson@company.com",
    location: "Chicago",
    designation: "HR Director",
    reportingManager: "CPO001",
    department: "Human Resources",
  },
  {
    empCode: "EM001",
    empName: "Michael Green",
    emailId: "michael.green@company.com",
    location: "San Francisco",
    designation: "Engineering Manager",
    reportingManager: "VPE001",
    department: "Engineering",
  },
  {
    empCode: "EM002",
    empName: "Jessica Taylor",
    emailId: "jessica.taylor@company.com",
    location: "Austin",
    designation: "Engineering Manager",
    reportingManager: "VPE001",
    department: "Engineering",
  },
  {
    empCode: "IM001",
    empName: "Patricia Morris",
    emailId: "patricia.morris@company.com",
    location: "Seattle",
    designation: "Infrastructure Manager",
    reportingManager: "VPI001",
    department: "Infrastructure",
  },
  {
    empCode: "SA001",
    empName: "Jennifer Lopez",
    emailId: "jennifer.lopez@company.com",
    location: "New York",
    designation: "Senior Accountant",
    reportingManager: "FD001",
    department: "Finance",
  },
  {
    empCode: "MM001",
    empName: "Daniel Lee",
    emailId: "daniel.lee@company.com",
    location: "Los Angeles",
    designation: "Marketing Manager",
    reportingManager: "MD001",
    department: "Marketing",
  },
  {
    empCode: "HRM001",
    empName: "Mia Jackson",
    emailId: "mia.jackson@company.com",
    location: "Chicago",
    designation: "HR Manager",
    reportingManager: "HRD001",
    department: "Human Resources",
  },
  {
    empCode: "SD001",
    empName: "Aisha Patel",
    emailId: "aisha.patel@company.com",
    location: "San Francisco",
    designation: "Senior Developer",
    reportingManager: "EM001",
    department: "Engineering",
  },
  {
    empCode: "SD002",
    empName: "David Kim",
    emailId: "david.kim@company.com",
    location: "Austin",
    designation: "Senior Developer",
    reportingManager: "EM002",
    department: "Engineering",
  },
  {
    empCode: "QA001",
    empName: "Carlos Rodriguez",
    emailId: "carlos.rodriguez@company.com",
    location: "Austin",
    designation: "Senior QA Engineer",
    reportingManager: "EM002",
    department: "Quality Assurance",
  },
  {
    empCode: "DE001",
    empName: "Thomas Wilson",
    emailId: "thomas.wilson@company.com",
    location: "Seattle",
    designation: "DevOps Engineer",
    reportingManager: "IM001",
    department: "Infrastructure",
  },
  {
    empCode: "JD001",
    empName: "Ryan Cooper",
    emailId: "ryan.cooper@company.com",
    location: "San Francisco",
    designation: "Junior Developer",
    reportingManager: "SD001",
    department: "Engineering",
  },
  {
    empCode: "JD002",
    empName: "Emma Mitchell",
    emailId: "emma.mitchell@company.com",
    location: "San Francisco",
    designation: "Junior Developer",
    reportingManager: "SD001",
    department: "Engineering",
  },
  {
    empCode: "QAE001",
    empName: "Linda Hayes",
    emailId: "linda.hayes@company.com",
    location: "Austin",
    designation: "QA Engineer",
    reportingManager: "QA001",
    department: "Quality Assurance",
  },
  {
    empCode: "MS001",
    empName: "Olivia Martinez",
    emailId: "olivia.martinez@company.com",
    location: "Los Angeles",
    designation: "Marketing Specialist",
    reportingManager: "MM001",
    department: "Marketing",
  },
]

export async function getEmployees(): Promise<Employee[]> {
  if (!sql) {
    console.log("Using fallback employee data")
    return fallbackEmployees
  }

  try {
    const employees = await sql`
      SELECT empCode, empName, emailId, location, designation, reportingManager, department
      FROM employees
      ORDER BY empName
    `
    return employees as Employee[]
  } catch (error) {
    console.error("Error fetching employees from database:", error)
    console.log("Falling back to sample data")
    return fallbackEmployees
  }
}

export async function addEmployee(employee: Omit<Employee, "children">): Promise<boolean> {
  if (!sql) {
    console.warn("Database not available. Cannot add employee.")
    return false
  }

  try {
    await sql`
      INSERT INTO employees (empCode, empName, emailId, location, designation, reportingManager, department)
      VALUES (${employee.empCode}, ${employee.empName}, ${employee.emailId}, ${employee.location}, ${employee.designation}, ${employee.reportingManager}, ${employee.department})
    `
    return true
  } catch (error) {
    console.error("Error adding employee:", error)
    return false
  }
}

export async function removeEmployee(empCode: string): Promise<boolean> {
  if (!sql) {
    console.warn("Database not available. Cannot remove employee.")
    return false
  }

  try {
    await sql`DELETE FROM employees WHERE empCode = ${empCode}`
    return true
  } catch (error) {
    console.error("Error removing employee:", error)
    return false
  }
}

export function buildHierarchy(employees: Employee[]): Employee[] {
  const employeeMap = new Map<string, Employee>()
  const roots: Employee[] = []

  // Create a map of all employees
  employees.forEach((emp) => {
    employeeMap.set(emp.empCode, { ...emp, children: [] })
  })

  // Build the hierarchy
  employees.forEach((emp) => {
    const employee = employeeMap.get(emp.empCode)!

    if (emp.reportingManager) {
      const manager = employeeMap.get(emp.reportingManager)
      if (manager) {
        manager.children = manager.children || []
        manager.children.push(employee)
      } else {
        // Manager not found, treat as root
        roots.push(employee)
      }
    } else {
      // No reporting manager, this is a root
      roots.push(employee)
    }
  })

  return roots
}
