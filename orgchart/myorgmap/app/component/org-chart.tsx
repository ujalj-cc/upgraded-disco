"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import type { Employee } from "@/lib/database"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avtar"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface NodePosition {
  x: number
  y: number
  width: number
  height: number
}

interface OrgChartProps {
  employees: Employee[]
  layout: "vertical" | "horizontal"
  searchTerm: string
  selectedDepartment: string
  selectedLocation: string
  selectedDesignation: string
  scale: number
  onNodeClick: (employee: Employee) => void
  onNodeHover: (employee: Employee | null, event?: React.MouseEvent) => void
  highlightedNode: string | null
  expandedNodes: Set<string>
  onToggleExpand: (empCode: string) => void
  showMiniMap: boolean
}

export default function OrgChart({
  employees,
  layout,
  searchTerm,
  selectedDepartment,
  selectedLocation,
  selectedDesignation,
  scale,
  onNodeClick,
  onNodeHover,
  highlightedNode,
  expandedNodes,
  onToggleExpand,
  showMiniMap,
}: OrgChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [positions, setPositions] = useState<Map<string, NodePosition>>(new Map())
  const [translate, setTranslate] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  const nodeWidth = 280
  const nodeHeight = 120
  const horizontalSpacing = 60
  const verticalSpacing = 80

  // Filter employees based on search and filters
  const filteredEmployees = useCallback(() => {
    // Ensure employees is an array
    if (!employees || !Array.isArray(employees)) {
      return []
    }

    const filterEmployee = (emp: Employee): Employee | null => {
      if (!emp) return null

      const matchesSearch =
        !searchTerm ||
        emp.empName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.department.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesDepartment = !selectedDepartment || emp.department === selectedDepartment
      const matchesLocation = !selectedLocation || emp.location === selectedLocation
      const matchesDesignation = !selectedDesignation || emp.designation === selectedDesignation

      if (matchesSearch && matchesDepartment && matchesLocation && matchesDesignation) {
        const filteredChildren =
          emp.children && Array.isArray(emp.children)
            ? (emp.children.map(filterEmployee).filter(Boolean) as Employee[])
            : []
        return { ...emp, children: filteredChildren }
      }

      // If this employee doesn't match but has children that might match, include it
      const filteredChildren =
        emp.children && Array.isArray(emp.children)
          ? (emp.children.map(filterEmployee).filter(Boolean) as Employee[])
          : []
      if (filteredChildren.length > 0) {
        return { ...emp, children: filteredChildren }
      }

      return null
    }

    return employees.map(filterEmployee).filter(Boolean) as Employee[]
  }, [employees, searchTerm, selectedDepartment, selectedLocation, selectedDesignation])

  // Calculate positions for all nodes
  const calculatePositions = useCallback(() => {
    const newPositions = new Map<string, NodePosition>()

    const calculateNodePositions = (nodes: Employee[], startX: number, startY: number, level: number) => {
      let currentX = startX
      const maxY = startY

      nodes.forEach((node, index) => {
        const isExpanded = expandedNodes.has(node.empCode)

        if (layout === "vertical") {
          newPositions.set(node.empCode, {
            x: currentX,
            y: startY,
            width: nodeWidth,
            height: nodeHeight,
          })

          if (node.children && node.children.length > 0 && isExpanded) {
            const childrenWidth = node.children.length * (nodeWidth + horizontalSpacing) - horizontalSpacing
            const childStartX = currentX + (nodeWidth - childrenWidth) / 2
            const childY = startY + nodeHeight + verticalSpacing

            calculateNodePositions(node.children, childStartX, childY, level + 1)
          }

          currentX += nodeWidth + horizontalSpacing
        } else {
          // Horizontal layout
          newPositions.set(node.empCode, {
            x: startX,
            y: currentX,
            width: nodeWidth,
            height: nodeHeight,
          })

          if (node.children && node.children.length > 0 && isExpanded) {
            const childrenHeight = node.children.length * (nodeHeight + verticalSpacing) - verticalSpacing
            const childStartY = currentX + (nodeHeight - childrenHeight) / 2
            const childX = startX + nodeWidth + horizontalSpacing

            calculateNodePositions(node.children, childX, childStartY, level + 1)
          }

          currentX += nodeHeight + verticalSpacing
        }
      })

      return maxY
    }

    calculateNodePositions(filteredEmployees(), 100, 100, 0)
    setPositions(newPositions)
  }, [filteredEmployees, layout, expandedNodes])

  useEffect(() => {
    calculatePositions()
  }, [calculatePositions])

  // Handle mouse events for panning
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return
    setIsDragging(true)
    setDragStart({ x: e.clientX - translate.x, y: e.clientY - translate.y })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    setTranslate({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Center on a specific node
  const centerOnNode = useCallback(
    (empCode: string) => {
      const position = positions.get(empCode)
      if (position && containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect()
        const centerX = containerRect.width / 2
        const centerY = containerRect.height / 2

        setTranslate({
          x: centerX - (position.x + position.width / 2) * scale,
          y: centerY - (position.y + position.height / 2) * scale,
        })
      }
    },
    [positions, scale],
  )

  // Auto-center on highlighted node
  useEffect(() => {
    if (highlightedNode) {
      centerOnNode(highlightedNode)
    }
  }, [highlightedNode, centerOnNode])

  // Render connections between nodes
  const renderConnections = () => {
    const connections: React.ReactNode[] = []

    const addConnections = (nodes: Employee[]) => {
      // Add null check and ensure nodes is an array
      if (!nodes || !Array.isArray(nodes)) {
        return
      }

      nodes.forEach((node) => {
        if (node && node.children && Array.isArray(node.children) && expandedNodes.has(node.empCode)) {
          const parentPos = positions.get(node.empCode)

          node.children.forEach((child) => {
            if (!child) return

            const childPos = positions.get(child.empCode)
            if (parentPos && childPos) {
              if (layout === "vertical") {
                const startX = parentPos.x + parentPos.width / 2
                const startY = parentPos.y + parentPos.height
                const endX = childPos.x + childPos.width / 2
                const endY = childPos.y
                const midY = startY + (endY - startY) / 2

                connections.push(
                  <g key={`${node.empCode}-${child.empCode}`}>
                    <path
                      d={`M ${startX} ${startY} L ${startX} ${midY} L ${endX} ${midY} L ${endX} ${endY}`}
                      stroke="#94a3b8"
                      strokeWidth={2}
                      fill="none"
                    />
                  </g>,
                )
              } else {
                const startX = parentPos.x + parentPos.width
                const startY = parentPos.y + parentPos.height / 2
                const endX = childPos.x
                const endY = childPos.y + childPos.height / 2
                const midX = startX + (endX - startX) / 2

                connections.push(
                  <g key={`${node.empCode}-${child.empCode}`}>
                    <path
                      d={`M ${startX} ${startY} L ${midX} ${startY} L ${midX} ${endY} L ${endX} ${endY}`}
                      stroke="#94a3b8"
                      strokeWidth={2}
                      fill="none"
                    />
                  </g>,
                )
              }
            }
          })

          addConnections(node.children)
        }
      })
    }

    // Add safety check before calling addConnections
    if (filteredEmployees && Array.isArray(filteredEmployees)) {
      addConnections(filteredEmployees)
    }
    return connections
  }

  // Render employee nodes
  const renderNodes = () => {
    const nodes: React.ReactNode[] = []

    const addNodes = (employees: Employee[]) => {
      // Add null check and ensure employees is an array
      if (!employees || !Array.isArray(employees)) {
        return
      }

      employees.forEach((employee) => {
        if (!employee) return

        const position = positions.get(employee.empCode)
        if (!position) return

        const isHighlighted = highlightedNode === employee.empCode
        const hasChildren = employee.children && Array.isArray(employee.children) && employee.children.length > 0
        const isExpanded = expandedNodes.has(employee.empCode)

        nodes.push(
          <div
            key={employee.empCode}
            className="absolute cursor-pointer"
            style={{
              left: position.x,
              top: position.y,
              width: position.width,
              height: position.height,
            }}
            onClick={() => onNodeClick(employee)}
            onMouseEnter={(e) => onNodeHover(employee, e)}
            onMouseLeave={() => onNodeHover(null)}
          >
            <Card
              className={cn(
                "w-full h-full p-4 shadow-md hover:shadow-lg transition-all duration-200 border-2",
                isHighlighted ? "border-blue-500 bg-blue-50 dark:bg-blue-950" : "border-gray-200 dark:border-gray-700",
                "hover:border-blue-300",
              )}
            >
              <div className="flex items-start gap-3 h-full">
                <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                  <AvatarImage src={`/placeholder.svg?height=48&width=48`} alt={employee.empName} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                    {employee.empName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">
                    {employee.empName}
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{employee.designation}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    <Badge variant="secondary" className="text-xs">
                      {employee.department}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {employee.location}
                    </Badge>
                  </div>
                  {hasChildren && (
                    <button
                      className="mt-2 text-xs text-blue-600 hover:text-blue-800 font-medium"
                      onClick={(e) => {
                        e.stopPropagation()
                        onToggleExpand(employee.empCode)
                      }}
                    >
                      {isExpanded ? "Collapse" : "Expand"} ({employee.children!.length})
                    </button>
                  )}
                </div>
              </div>
            </Card>
          </div>,
        )

        if (employee.children && Array.isArray(employee.children) && isExpanded) {
          addNodes(employee.children)
        }
      })
    }

    // Add safety check before calling addNodes
    if (filteredEmployees && Array.isArray(filteredEmployees)) {
      addNodes(filteredEmployees)
    }
    return nodes
  }

  // Calculate canvas dimensions
  const getCanvasDimensions = () => {
    let maxX = 0,
      maxY = 0
    positions.forEach((pos) => {
      maxX = Math.max(maxX, pos.x + pos.width)
      maxY = Math.max(maxY, pos.y + pos.height)
    })
    return { width: maxX + 200, height: maxY + 200 }
  }

  const canvasDimensions = getCanvasDimensions()

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden bg-gray-50 dark:bg-gray-900"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div
        className="absolute origin-top-left"
        style={{
          transform: `scale(${scale}) translate(${translate.x}px, ${translate.y}px)`,
          width: canvasDimensions.width,
          height: canvasDimensions.height,
        }}
      >
        {/* Grid background */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        />

        {/* SVG for connections */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">{renderConnections()}</svg>

        {/* Employee nodes */}
        {renderNodes()}
      </div>

      {/* Mini map */}
      {showMiniMap && (
        <div className="absolute bottom-4 right-4 w-48 h-32 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg p-2">
          <div className="text-xs font-medium mb-1">Mini Map</div>
          <div className="w-full h-full bg-gray-100 dark:bg-gray-700 rounded relative overflow-hidden">
            {/* Simplified view of the org chart */}
            <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-500">
              Chart Overview
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
