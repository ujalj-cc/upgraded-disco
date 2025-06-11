"use client"

import { useState } from "react"
import { FileUpload } from "@/app/hierarchymap/component/FileUpload"
import { Chart } from "@/app/hierarchymap/component/Chart"
import { Controls } from "@/app/hierarchymap/component/Controls"
import type { Employee } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { FileDown } from 'lucide-react';
import { Button } from "@/components/ui/button"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"


import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"


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
    <TooltipProvider>
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
                
                <div className="flex items-center gap-4">
                  <h2 className="text-lg font-semibold p-5">Sample Excel Data Preview</h2>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Dialog>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-10 h-10 text-[#107C41] border-[#107C41] hover:bg-[#107C41]/10"
                              >
                                <FileDown className="w-5 h-5" />
                              </Button>
                            </DialogTrigger>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            <p className="text-xl">Download test excel</p>
                          </TooltipContent>
                        </Tooltip>
                                
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Download Sample Excel?</DialogTitle>
                          </DialogHeader>
                          <p className="text-sm text-gray-600">Do you want to download <strong>dummyexcel.xlsx</strong> sample file?</p>
                          <DialogFooter className="gap-2">
                            <Button variant="outline">Cancel</Button>
                            <Button
                              onClick={() => {
                                const fileUrl = "/dummyexcel.xlsx"
                                const link = document.createElement("a")
                                link.href = fileUrl
                                link.download = "dummyexcel.xlsx"
                                document.body.appendChild(link)
                                link.click()
                                document.body.removeChild(link)
                              }}
                            >
                              Download
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p className="text-xl">Download test excel</p>
                    </TooltipContent>
                  </Tooltip>
                </div>

                
<div className="overflow-x-auto rounded-lg border border-gray-300">
  <table className="min-w-full text-sm text-left text-gray-700 bg-white">
    <thead className="bg-gray-100 font-semibold">
      <tr>
        <th className="px-4 py-2 border">empCode</th>
        <th className="px-4 py-2 border">empName</th>
        <th className="px-4 py-2 border">emailId</th>
        <th className="px-4 py-2 border">location</th>
        <th className="px-4 py-2 border">designation</th>
        <th className="px-4 py-2 border">reportingManager</th>
        <th className="px-4 py-2 border">department</th>
      </tr>
    </thead>
    <tbody>
      {[
        ["1", "John Doe0", "john.doe0@somecompany.com", "Ahmedabad HQ", "CEO/Founder", "", "Management"],
        ["37251", "John Doe1", "john.doe1@somecompany.com", "Ahmedabad HQ", "Vice President", "John Doe0", "Accounts and Finance"],
        ["36970", "John Doe2", "john.doe2@somecompany.com", "Ahmedabad HQ", "CA", "John Doe0", "Accounts and Finance"],
        ["37370", "John Doe3", "john.doe3@somecompany.com", "Ahmedabad HQ", "Finance Manager", "John Doe1", "Accounts and Finance"],
        ["37272", "John Doe4", "john.doe4@somecompany.com", "Ahmedabad HQ", "Sr. Accounts Executive", "John Doe1", "Accounts and Finance"],
        ["37369", "John Doe5", "john.doe5@somecompany.com", "Ahmedabad HQ", "Sr. Account Executive", "John Doe1", "Accounts and Finance"],
        ["37359", "John Doe6", "john.doe6@somecompany.com", "Ahmedabad HQ", "Finance Executive", "John Doe3", "Accounts and Finance"],
        ["37324", "John Doe7", "john.doe7@somecompany.com", "Ahmedabad HQ", "Commercial Executive", "John Doe3", "Accounts and Finance"],
        ["37333", "John Doe8", "john.doe8@somecompany.com", "Ahmedabad HQ", "Account Executive", "John Doe4", "Accounts and Finance"],
        ["37345", "John Doe9", "john.doe9@somecompany.com", "Ahmedabad HQ", "Account Executive", "John Doe4", "Accounts and Finance"]
      ].map((row, idx) => (
        <tr key={idx}>
          {row.map((cell, i) => (
            <td key={i} className="px-4 py-2 border">{cell}</td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
</div>

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
    </TooltipProvider>
  )
}
