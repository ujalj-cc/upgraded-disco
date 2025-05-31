// "use client"

// import { useCallback, useState } from "react"
// import { useDropzone } from "react-dropzone"
// import { Upload, FileText, AlertCircle } from "lucide-react"
// import { parseCSV, parseJSON, validateEmployeeData } from "@/lib/dataParser"
// import type { Employee } from "@/lib/types"

// interface FileUploadProps {
//   onDataLoaded: (data: Employee[]) => void
//   onError: (error: string) => void
//   onLoading: (loading: boolean) => void
//   isLoading: boolean
// }

// export function FileUpload({ onDataLoaded, onError, onLoading, isLoading }: FileUploadProps) {
//   const [dragActive, setDragActive] = useState(false)

//   const processFile = useCallback(
//     async (file: File) => {
//       onLoading(true)

//       try {
//         const text = await file.text()
//         let employees: Employee[]

//         if (file.name.endsWith(".csv")) {
//           employees = parseCSV(text)
//         } else if (file.name.endsWith(".json")) {
//           employees = parseJSON(text)
//         } else {
//           throw new Error("Unsupported file format. Please upload a CSV or JSON file.")
//         }

//         const validationResult = validateEmployeeData(employees)
//         if (!validationResult.isValid) {
//           throw new Error(validationResult.errors.join(", "))
//         }

//         onDataLoaded(employees)
//       } catch (error) {
//         onError(error instanceof Error ? error.message : "Failed to process file")
//       } finally {
//         onLoading(false)
//       }
//     },
//     [onDataLoaded, onError, onLoading],
//   )

//   const onDrop = useCallback(
//     (acceptedFiles: File[]) => {
//       if (acceptedFiles.length > 0) {
//         processFile(acceptedFiles[0])
//       }
//     },
//     [processFile],
//   )

//   const { getRootProps, getInputProps, isDragActive } = useDropzone({
//     onDrop,
//     accept: {
//       "text/csv": [".csv"],
//       "application/json": [".json"],
//     },
//     multiple: false,
//     disabled: isLoading,
//   })

//   return (
//     <div className="w-full">
//       <div
//         {...getRootProps()}
//         className={`
//           border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
//           ${isDragActive ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:border-gray-400"}
//           ${isLoading ? "opacity-50 cursor-not-allowed" : ""}
//         `}
//       >
//         <input {...getInputProps()} />

//         <div className="space-y-4">
//           <div className="flex justify-center">
//             {isLoading ? (
//               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//             ) : (
//               <Upload className="h-12 w-12 text-gray-400" />
//             )}
//           </div>

//           <div>
//             <h3 className="text-lg font-medium text-gray-900">
//               {isLoading ? "Processing file..." : "Upload Employee Data"}
//             </h3>
//             <p className="text-gray-600 mt-1">
//               {isLoading
//                 ? "Please wait while we process your file"
//                 : "Drag and drop your CSV or JSON file here, or click to browse"}
//             </p>
//           </div>

//           {!isLoading && (
//             <div className="flex justify-center space-x-4 text-sm text-gray-500">
//               <div className="flex items-center">
//                 <FileText className="h-4 w-4 mr-1" />
//                 CSV
//               </div>
//               <div className="flex items-center">
//                 <FileText className="h-4 w-4 mr-1" />
//                 JSON
//               </div>
//             </div>
//           )}
//         </div>
//       </div>

//       <div className="mt-4 text-sm text-gray-600">
//         <div className="flex items-start space-x-2">
//           <AlertCircle className="h-4 w-4 mt-0.5 text-amber-500" />
//           <div>
//             <p className="font-medium">Required fields:</p>
//             <p>empCode, empName, designation, reportingManager, department</p>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }


"use client"

import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Upload, FileText, AlertCircle } from "lucide-react"
import * as XLSX from "xlsx"
import { parseCSV, parseJSON, validateEmployeeData } from "@/lib/dataParser"
import type { Employee } from "@/lib/types"

interface FileUploadProps {
  onDataLoaded: (data: Employee[]) => void
  onError: (error: string) => void
  onLoading: (loading: boolean) => void
  isLoading: boolean
}

export function FileUpload({ onDataLoaded, onError, onLoading, isLoading }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false)

  const processFile = useCallback(
  async (file: File) => {
    console.log("⏳ Starting file processing:", file.name)
    onLoading(true)

    try {
      let employees: Employee[]
      console.log("📂 File type:", file.type)

      if (file.name.endsWith(".csv")) {
        const text = await file.text()
        console.log("📄 CSV Text Preview:", text.slice(0, 200))
        employees = parseCSV(text)
        console.log("✅ Parsed CSV employee data:", employees)
      } else if (file.name.endsWith(".json")) {
        const text = await file.text()
        console.log("📄 JSON Text Preview:", text.slice(0, 200))
        employees = parseJSON(text)
        console.log("✅ Parsed JSON employee data:", employees)
      } else if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
        console.log("📥 Reading Excel file...")
        const arrayBuffer = await file.arrayBuffer()
        const workbook = XLSX.read(arrayBuffer, { type: "array" })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" })
        console.log("📊 Excel Sheet JSON Data:", jsonData)
        employees = jsonData as Employee[]
      } else {
        console.error("❌ Unsupported file format:", file.name)
        throw new Error("Unsupported file format. Please upload CSV, JSON or Excel file.")
      }

      const validationResult = validateEmployeeData(employees)
      console.log("🧪 Validation result:", validationResult)

      if (!validationResult.isValid) {
        console.error("❌ Validation failed:", validationResult.errors)
        throw new Error(validationResult.errors.join(", "))
      }

      console.log("📤 Calling onDataLoaded() with employees:", employees.length)
      onDataLoaded(employees)
      console.log("✅ Upload complete!")
    } catch (error) {
      console.error("🔥 Error during file processing:", error)
      onError(error instanceof Error ? error.message : "Failed to process file")
    } finally {
      console.log("🧹 Ending file processing. Resetting loading state.")
      onLoading(false)
    }
  },
  [onDataLoaded, onError, onLoading],
)


  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        processFile(acceptedFiles[0])
      }
    },
    [processFile],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/json": [".json"],
      // Add common Excel MIME types
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-excel": [".xls"],
    },
    multiple: false,
    disabled: isLoading,
  })

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:border-gray-400"}
          ${isLoading ? "opacity-50 cursor-not-allowed" : ""}
        `}
      >
        <input {...getInputProps()} />

        <div className="space-y-4">
          <div className="flex justify-center">
            {isLoading ? (
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            ) : (
              <Upload className="h-12 w-12 text-gray-400" />
            )}
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900">
              {isLoading ? "Processing file..." : "Upload Employee Data"}
            </h3>
            <p className="text-gray-600 mt-1">
              {isLoading
                ? "Please wait while we process your file"
                : "Drag and drop your CSV, JSON, or Excel file here, or click to browse"}
            </p>
          </div>

          {!isLoading && (
            <div className="flex justify-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center">
                <FileText className="h-4 w-4 mr-1" />
                CSV
              </div>
              <div className="flex items-center">
                <FileText className="h-4 w-4 mr-1" />
                JSON
              </div>
              <div className="flex items-center">
                <FileText className="h-4 w-4 mr-1" />
                Excel
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <div className="flex items-start space-x-2">
          <AlertCircle className="h-4 w-4 mt-0.5 text-amber-500" />
          <div>
            <p className="font-medium">Required fields:</p>
            <p>empCode, empName, designation, reportingManager, department</p>
          </div>
        </div>
      </div>
    </div>
  )
}
