"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { type Employee, getEmployees, buildHierarchy, addEmployee, removeEmployee } from "@/lib/database"
import OrgChart from "@/components/org-chart"
import Toolbar from "@/components/toolbar"
import Tooltip from "@/components/tooltip"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function OrgChartApp() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [hierarchyData, setHierarchyData] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState("")
  const [selectedLocation, setSelectedLocation] = useState("")
  const [selectedDesignation, setSelectedDesignation] = useState("")
  const [scale, setScale] = useState(1)
  const [layout, setLayout] = useState<"vertical" | "horizontal">("vertical")
  const [highlightedNode, setHighlightedNode] = useState<string | null>(null)
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())
  const [showMiniMap, setShowMiniMap] = useState(false)
  const [hoveredEmployee, setHoveredEmployee] = useState<Employee | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [usingFallbackData, setUsingFallbackData] = useState(false)
  const [newEmployee, setNewEmployee] = useState({
    empCode: "",
    empName: "",
    emailId: "",
    location: "",
    designation: "",
    reportingManager: "",
    department: "",
  })

  const { toast } = useToast()

  // Load employees from database
  const loadEmployees = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getEmployees()
      setEmployees(data)
      const hierarchy = buildHierarchy(data)
      setHierarchyData(hierarchy)

      // Check if we're using fallback data
      const isDatabaseConnected = process.env.DATABASE_URL !== undefined
      setUsingFallbackData(!isDatabaseConnected)

      // Auto-expand first level
      const firstLevelNodes = new Set<string>()
      hierarchy.forEach((root) => {
        firstLevelNodes.add(root.empCode)
        if (root.children) {
          root.children.forEach((child) => firstLevelNodes.add(child.empCode))
        }
      })
      setExpandedNodes(firstLevelNodes)

      if (!isDatabaseConnected) {
        toast({
          title: "Demo Mode",
          description: "Using sample data. Connect to Neon database for full functionality.",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load employee data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadEmployees()
  }, [loadEmployees])

  // Get unique values for filters
  const departments = [...new Set(employees.map((emp) => emp.department))].sort()
  const locations = [...new Set(employees.map((emp) => emp.location))].sort()
  const designations = [...new Set(employees.map((emp) => emp.designation))].sort()

  // Handle search and highlight
  useEffect(() => {
    if (searchTerm) {
      const found = employees.find(
        (emp) =>
          emp.empName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          emp.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
          emp.department.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      if (found) {
        setHighlightedNode(found.empCode)
      }
    } else {
      setHighlightedNode(null)
    }
  }, [searchTerm, employees])

  // Toolbar handlers
  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.1, 3))
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.1, 0.3))
  const handleResetView = () => setScale(1)
  const handleFitToScreen = () => setScale(0.8)

  const handleExpandAll = () => {
    const allNodes = new Set<string>()
    const addAllNodes = (nodes: Employee[]) => {
      nodes.forEach((node) => {
        allNodes.add(node.empCode)
        if (node.children) addAllNodes(node.children)
      })
    }
    addAllNodes(hierarchyData)
    setExpandedNodes(allNodes)
  }

  const handleCollapseAll = () => {
    setExpandedNodes(new Set())
  }

  const handleToggleExpand = (empCode: string) => {
    setExpandedNodes((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(empCode)) {
        newSet.delete(empCode)
      } else {
        newSet.add(empCode)
      }
      return newSet
    })
  }

  const handleNodeClick = (employee: Employee) => {
    setHighlightedNode(employee.empCode)
  }

  const handleNodeHover = (employee: Employee | null, event?: React.MouseEvent) => {
    setHoveredEmployee(employee)
    if (event) {
      setTooltipPosition({ x: event.clientX, y: event.clientY })
    }
  }

  const handleAddEmployee = async () => {
    if (usingFallbackData) {
      toast({
        title: "Demo Mode",
        description: "Connect to Neon database to add employees",
        variant: "destructive",
      })
      return
    }

    try {
      const success = await addEmployee(newEmployee)
      if (success) {
        toast({
          title: "Success",
          description: "Employee added successfully",
        })
        setShowAddDialog(false)
        setNewEmployee({
          empCode: "",
          empName: "",
          emailId: "",
          location: "",
          designation: "",
          reportingManager: "",
          department: "",
        })
        loadEmployees()
      } else {
        toast({
          title: "Error",
          description: "Failed to add employee",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add employee",
        variant: "destructive",
      })
    }
  }

  const handleRemoveEmployee = async () => {
    if (usingFallbackData) {
      toast({
        title: "Demo Mode",
        description: "Connect to Neon database to remove employees",
        variant: "destructive",
      })
      return
    }

    if (highlightedNode) {
      try {
        const success = await removeEmployee(highlightedNode)
        if (success) {
          toast({
            title: "Success",
            description: "Employee removed successfully",
          })
          setHighlightedNode(null)
          loadEmployees()
        } else {
          toast({
            title: "Error",
            description: "Failed to remove employee",
            variant: "destructive",
          })
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to remove employee",
          variant: "destructive",
        })
      }
    }
  }

  const handleExportPDF = () => {
    // PDF export functionality would be implemented here
    toast({
      title: "Export",
      description: "PDF export functionality coming soon",
    })
  }

  const handleExportImage = () => {
    // Image export functionality would be implemented here
    toast({
      title: "Export",
      description: "Image export functionality coming soon",
    })
  }

  const handleLoadData = (type: "json" | "csv") => {
    // Data loading functionality would be implemented here
    toast({
      title: "Load Data",
      description: `${type.toUpperCase()} data loading functionality coming soon`,
    })
  }

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  // Count visible nodes
  const countVisibleNodes = (nodes: Employee[]): number => {
    let count = 0
    nodes.forEach((node) => {
      count++
      if (node.children && expandedNodes.has(node.empCode)) {
        count += countVisibleNodes(node.children)
      }
    })
    return count
  }

  const visibleNodes = countVisibleNodes(hierarchyData)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading organization chart...</div>
      </div>
    )
  }

  return (
    <div className={`flex flex-col h-screen ${isFullscreen ? "fixed inset-0 z-50 bg-white dark:bg-gray-900" : ""}`}>
      {/* Database Status Alert */}
      {usingFallbackData && (
        <Alert className="m-4 mb-0">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Demo Mode:</strong> Using sample data. To connect to your Neon database, add the DATABASE_URL
            environment variable and restart the application.
          </AlertDescription>
        </Alert>
      )}

      <Toolbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        departments={departments}
        locations={locations}
        designations={designations}
        selectedDepartment={selectedDepartment}
        selectedLocation={selectedLocation}
        selectedDesignation={selectedDesignation}
        onDepartmentChange={setSelectedDepartment}
        onLocationChange={setSelectedLocation}
        onDesignationChange={setSelectedDesignation}
        scale={scale}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetView={handleResetView}
        onFitToScreen={handleFitToScreen}
        layout={layout}
        onLayoutChange={setLayout}
        onExpandAll={handleExpandAll}
        onCollapseAll={handleCollapseAll}
        onExportPDF={handleExportPDF}
        onExportImage={handleExportImage}
        onAddNode={() => setShowAddDialog(true)}
        onRemoveNode={handleRemoveEmployee}
        onToggleFullscreen={handleToggleFullscreen}
        showMiniMap={showMiniMap}
        onToggleMiniMap={() => setShowMiniMap(!showMiniMap)}
        onLoadData={handleLoadData}
        totalNodes={employees.length}
        visibleNodes={visibleNodes}
      />

      <div className="flex-1 relative">
        <OrgChart
          employees={hierarchyData}
          layout={layout}
          searchTerm={searchTerm}
          selectedDepartment={selectedDepartment}
          selectedLocation={selectedLocation}
          selectedDesignation={selectedDesignation}
          scale={scale}
          onNodeClick={handleNodeClick}
          onNodeHover={handleNodeHover}
          highlightedNode={highlightedNode}
          expandedNodes={expandedNodes}
          onToggleExpand={handleToggleExpand}
          showMiniMap={showMiniMap}
        />

        {hoveredEmployee && <Tooltip employee={hoveredEmployee} position={tooltipPosition} />}
      </div>

      {/* Add Employee Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Employee</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="empCode">Employee Code</Label>
              <Input
                id="empCode"
                value={newEmployee.empCode}
                onChange={(e) => setNewEmployee((prev) => ({ ...prev, empCode: e.target.value }))}
                placeholder="EMP001"
              />
            </div>
            <div>
              <Label htmlFor="empName">Employee Name</Label>
              <Input
                id="empName"
                value={newEmployee.empName}
                onChange={(e) => setNewEmployee((prev) => ({ ...prev, empName: e.target.value }))}
                placeholder="John Doe"
              />
            </div>
            <div>
              <Label htmlFor="emailId">Email</Label>
              <Input
                id="emailId"
                type="email"
                value={newEmployee.emailId}
                onChange={(e) => setNewEmployee((prev) => ({ ...prev, emailId: e.target.value }))}
                placeholder="john.doe@company.com"
              />
            </div>
            <div>
              <Label htmlFor="designation">Designation</Label>
              <Input
                id="designation"
                value={newEmployee.designation}
                onChange={(e) => setNewEmployee((prev) => ({ ...prev, designation: e.target.value }))}
                placeholder="Software Engineer"
              />
            </div>
            <div>
              <Label htmlFor="department">Department</Label>
              <Select
                value={newEmployee.department}
                onValueChange={(value) => setNewEmployee((prev) => ({ ...prev, department: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Select
                value={newEmployee.location}
                onValueChange={(value) => setNewEmployee((prev) => ({ ...prev, location: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((loc) => (
                    <SelectItem key={loc} value={loc}>
                      {loc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="reportingManager">Reporting Manager</Label>
              <Select
                value={newEmployee.reportingManager}
                onValueChange={(value) =>
                  setNewEmployee((prev) => ({ ...prev, reportingManager: value === "no-manager" ? "" : value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select manager" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no-manager">No Manager</SelectItem>
                  {employees.map((emp) => (
                    <SelectItem key={emp.empCode} value={emp.empCode}>
                      {emp.empName} ({emp.empCode})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 pt-4">
              <Button onClick={handleAddEmployee} className="flex-1" disabled={usingFallbackData}>
                Add Employee
              </Button>
              <Button variant="outline" onClick={() => setShowAddDialog(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
