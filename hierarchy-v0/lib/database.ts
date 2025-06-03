import { neon } from "@neondatabase/serverless"
import type { Employee } from "@/types/employee"

const sql = neon(process.env.DATABASE_URL!)

export async function getEmployees(): Promise<Employee[]> {
  try {
    const result = await sql`
      SELECT 
        emp_code as "empCode",
        emp_name as "empName", 
        email_id as "emailId",
        location,
        designation,
        reporting_manager as "reportingManager",
        department,
        salary,
        TO_CHAR(join_date, 'MM/DD/YYYY') as "joinDate",
        phone,
        skills,
        sr_no as "srNo"
      FROM employees 
      ORDER BY sr_no ASC
    `

    return result.map((row) => ({
      empCode: row.empCode,
      empName: row.empName,
      emailId: row.emailId,
      location: row.location,
      designation: row.designation,
      reportingManager: row.reportingManager || "",
      department: row.department,
      salary: row.salary,
      joinDate: row.joinDate,
      phone: row.phone,
      skills: row.skills || [],
      srNo: row.srNo,
    }))
  } catch (error) {
    console.error("Error fetching employees:", error)
    throw new Error("Failed to fetch employees from database")
  }
}

export async function getEmployeeByCode(empCode: string): Promise<Employee | null> {
  try {
    const result = await sql`
      SELECT 
        emp_code as "empCode",
        emp_name as "empName", 
        email_id as "emailId",
        location,
        designation,
        reporting_manager as "reportingManager",
        department,
        salary,
        TO_CHAR(join_date, 'MM/DD/YYYY') as "joinDate",
        phone,
        skills,
        sr_no as "srNo"
      FROM employees 
      WHERE emp_code = ${empCode}
      LIMIT 1
    `

    if (result.length === 0) return null

    const row = result[0]
    return {
      empCode: row.empCode,
      empName: row.empName,
      emailId: row.emailId,
      location: row.location,
      designation: row.designation,
      reportingManager: row.reportingManager || "",
      department: row.department,
      salary: row.salary,
      joinDate: row.joinDate,
      phone: row.phone,
      skills: row.skills || [],
      srNo: row.srNo,
    }
  } catch (error) {
    console.error("Error fetching employee:", error)
    throw new Error("Failed to fetch employee from database")
  }
}

export async function getDepartmentStats() {
  try {
    const result = await sql`
      SELECT 
        department,
        COUNT(*) as employee_count,
        AVG(salary) as avg_salary,
        MIN(salary) as min_salary,
        MAX(salary) as max_salary
      FROM employees 
      GROUP BY department
      ORDER BY employee_count DESC
    `

    return result.map((row) => ({
      department: row.department,
      employeeCount: Number(row.employee_count),
      avgSalary: Number(row.avg_salary),
      minSalary: Number(row.min_salary),
      maxSalary: Number(row.max_salary),
    }))
  } catch (error) {
    console.error("Error fetching department stats:", error)
    throw new Error("Failed to fetch department statistics")
  }
}
