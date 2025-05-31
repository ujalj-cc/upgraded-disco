"use client"

import { useState } from "react"
import { FileUpload } from "@/app/hierarchymap/component/FileUpload"
import { Chart } from "@/app/hierarchymap/component/Chart"
import { Controls } from "@/app/hierarchymap/component/Controls"
import type { Employee } from "@/lib/types"
import { Card } from "@/components/ui/card"

export default function Home() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDataLoaded = (data: Employee[]) => {
    setEmployees(data)
    setError(null)
  }

  const handleError = (errorMessage: string) => {
    setError(errorMessage)
    setEmployees([])
  }

  const handleLoading = (loading: boolean) => {
    setIsLoading(loading)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Organizational Chart Builder</h1>
          <p className="text-gray-600 mt-1">Upload employee data to generate interactive organizational charts</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {employees.length === 0 ? (
          <div className="space-y-6">
            <Card className="p-8">
              <FileUpload
                onDataLoaded={handleDataLoaded}
                onError={handleError}
                onLoading={handleLoading}
                isLoading={isLoading}
              />
            </Card>

            {error && (
              <Card className="p-4 border-red-200 bg-red-50">
                <div className="text-red-800">
                  <h3 className="font-medium">Error processing file</h3>
                  <p className="text-sm mt-1">{error}</p>
                </div>
              </Card>
            )}

            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Sample Data Format</h2>
              <div className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
                <pre className="text-sm">
                  {`CSV Format:
srNo,empCode,empName,emailId,location,designation,reportingManager,department
1,CEO001,John Smith,john.smith@company.com,New York,CEO,,Executive
2,VP001,Sarah Johnson,sarah.johnson@company.com,New York,VP Engineering,CEO001,Engineering

JSON Format:
[
  {
    "srNo": 1,
    "empCode": "CEO001",
    "empName": "John Smith",
    "emailId": "john.smith@company.com",
    "location": "New York",
    "designation": "CEO",
    "reportingManager": "",
    "department": "Executive"
  }
]`}
                </pre>
              </div>
            </Card>
          </div>
        ) : (
          <div className="space-y-4">
            <Controls employees={employees} />
            <Card className="p-4">
              <Chart employees={employees} />
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
