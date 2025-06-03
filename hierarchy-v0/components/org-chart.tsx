"use client"

import { useEffect, useRef, useState } from "react"
import * as d3 from "d3"
import { Button } from "@/components/ui/button"
import { Download, ZoomIn, ZoomOut, RotateCcw, Maximize2, AlertCircle } from "lucide-react"
import { buildHierarchy } from "@/lib/hierarchy"
import { downloadPDF } from "@/lib/pdf-export"
import jsPDF from "jspdf"
import type { Employee } from "@/types/employee"

interface OrgChartProps {
  employees: Employee[]
  onNodeClick: (employee: Employee) => void
  onNodeToggle: (empCode: string) => void
  expandedNodes: Set<string>
  searchTerm: string
}

export function OrgChart({ employees, onNodeClick, onNodeToggle, expandedNodes, searchTerm }: OrgChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isFullWidth, setIsFullWidth] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadError, setDownloadError] = useState<string | null>(null)

  const departmentColors = {
    Management: "#3b82f6",
    Engineering: "#10b981",
    Sales: "#f59e0b",
    Marketing: "#ef4444",
    HR: "#8b5cf6",
    Finance: "#06b6d4",
    Operations: "#84cc16",
    Legal: "#6366f1",
    IT: "#14b8a6",
    Design: "#f97316",
  }

  // Helper function to count direct reports
  const getDirectReportsCount = (employeeName: string) => {
    return employees.filter((emp) => emp.reportingManager === employeeName).length
  }

  // Helper function to safely generate path strings
  const generateSafePath = (sourceX: number, sourceY: number, targetX: number, targetY: number) => {
    if (!isFinite(sourceX) || !isFinite(sourceY) || !isFinite(targetX) || !isFinite(targetY)) {
      return "M0,0 L0,0"
    }

    const midY = sourceY + (targetY - sourceY) * 0.6
    const controlPoint1X = sourceX
    const controlPoint1Y = midY
    const controlPoint2X = targetX
    const controlPoint2Y = midY

    return `M${sourceX},${sourceY} C${controlPoint1X},${controlPoint1Y} ${controlPoint2X},${controlPoint2Y} ${targetX},${targetY}`
  }

  // Helper function to safely get department color
  const getDepartmentColor = (department: string) => {
    return departmentColors[department as keyof typeof departmentColors] || "#94a3b8"
  }

  // Custom layout function to distribute nodes properly
  const customLayout = (root: d3.HierarchyNode<any>, width: number, height: number) => {
    const nodeWidth = 170
    const nodeHeight = 70
    const verticalSpacing = 140 // Increased for department labels
    const minHorizontalSpacing = 50

    // Calculate positions level by level
    const levels: d3.HierarchyNode<any>[][] = []

    root.each((node) => {
      const level = node.depth
      if (!levels[level]) levels[level] = []
      levels[level].push(node)
    })

    // Position root node (CEO)
    root.x = width / 2
    root.y = 80

    // Position each level
    levels.forEach((levelNodes, levelIndex) => {
      if (levelIndex === 0) return // Skip root

      const nodeCount = levelNodes.length
      const availableWidth = width - 200 // Leave margins

      // Calculate optimal spacing
      const totalNodeWidth = nodeCount * nodeWidth
      const totalSpacingNeeded = (nodeCount - 1) * minHorizontalSpacing
      const remainingSpace = availableWidth - totalNodeWidth - totalSpacingNeeded

      // Distribute remaining space evenly
      const extraSpacing = Math.max(0, remainingSpace / Math.max(nodeCount - 1, 1))
      const actualSpacing = minHorizontalSpacing + extraSpacing

      // Calculate starting position to center the level
      const totalLevelWidth = totalNodeWidth + (nodeCount - 1) * actualSpacing
      const startX = (width - totalLevelWidth) / 2 + nodeWidth / 2

      // Position nodes in this level
      levelNodes.forEach((node, index) => {
        node.x = startX + index * (nodeWidth + actualSpacing)
        node.y = 80 + levelIndex * verticalSpacing
      })
    })

    return root
  }

  useEffect(() => {
    if (!employees.length) return

    const svg = d3.select(svgRef.current)
    const container = containerRef.current
    if (!container) return

    setIsLoading(true)

    try {
      // Clear previous content
      svg.selectAll("*").remove()

      // Use maximum available width
      const width = isFullWidth ? Math.max(window.innerWidth - 100, 1400) : Math.max(container.clientWidth, 1000)
      const height = 1000

      svg.attr("width", width).attr("height", height)

      // Create gradient definitions for links
      const defs = svg.append("defs")

      // Create gradients with safe IDs
      const gradients = [
        { id: "linkGradient1", colors: ["#3b82f6", "#06b6d4"] },
        { id: "linkGradient2", colors: ["#10b981", "#84cc16"] },
        { id: "linkGradient3", colors: ["#f59e0b", "#ef4444"] },
        { id: "linkGradient4", colors: ["#8b5cf6", "#6366f1"] },
      ]

      gradients.forEach((grad) => {
        const gradient = defs
          .append("linearGradient")
          .attr("id", grad.id)
          .attr("gradientUnits", "userSpaceOnUse")
          .attr("x1", "0%")
          .attr("y1", "0%")
          .attr("x2", "0%")
          .attr("y2", "100%")

        gradient.append("stop").attr("offset", "0%").attr("stop-color", grad.colors[0]).attr("stop-opacity", 0.8)
        gradient.append("stop").attr("offset", "100%").attr("stop-color", grad.colors[1]).attr("stop-opacity", 0.6)
      })

      // Add node gradient
      const nodeGradient = defs
        .append("linearGradient")
        .attr("id", "nodeGradient")
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "0%")
        .attr("y2", "100%")

      nodeGradient.append("stop").attr("offset", "0%").attr("stop-color", "#ffffff").attr("stop-opacity", 1)
      nodeGradient.append("stop").attr("offset", "100%").attr("stop-color", "#f8fafc").attr("stop-opacity", 1)

      // Create glow filter for links
      const filter = defs
        .append("filter")
        .attr("id", "glow")
        .attr("x", "-50%")
        .attr("y", "-50%")
        .attr("width", "200%")
        .attr("height", "200%")

      filter.append("feGaussianBlur").attr("stdDeviation", "3").attr("result", "coloredBlur")

      const feMerge = filter.append("feMerge")
      feMerge.append("feMergeNode").attr("in", "coloredBlur")
      feMerge.append("feMergeNode").attr("in", "SourceGraphic")

      const g = svg.append("g").attr("class", "chart-group")

      // Create zoom behavior
      const zoom = d3
        .zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.1, 4])
        .on("zoom", (event) => {
          g.attr("transform", event.transform.toString())
        })

      svg.call(zoom)

      // Build hierarchy
      const hierarchy = buildHierarchy(employees)
      if (!hierarchy.length) {
        setIsLoading(false)
        return
      }

      const root = d3.hierarchy(hierarchy[0])

      // Apply custom layout instead of d3.tree()
      const layoutRoot = customLayout(root, width, height)

      // Get all nodes and links
      const allNodes = layoutRoot.descendants()
      const allLinks = layoutRoot.links()

      // Validate data
      const validNodes = allNodes.filter((d) => isFinite(d.x) && isFinite(d.y))
      const validLinks = allLinks.filter(
        (d) => isFinite(d.source.x) && isFinite(d.source.y) && isFinite(d.target.x) && isFinite(d.target.y),
      )

      console.log(`Layout complete: ${validNodes.length} nodes, ${validLinks.length} links`)

      // Group nodes by level for debugging
      const nodesByLevel = validNodes.reduce(
        (acc, node) => {
          const level = node.depth
          if (!acc[level]) acc[level] = []
          acc[level].push(node)
          return acc
        },
        {} as Record<number, typeof validNodes>,
      )

      console.log(
        "Nodes by level:",
        Object.keys(nodesByLevel).map(
          (level) => `Level ${level}: ${nodesByLevel[Number.parseInt(level)].length} nodes`,
        ),
      )

      // Create link groups for advanced styling
      const linkGroups = g.selectAll(".link-group").data(validLinks).enter().append("g").attr("class", "link-group")

      // Create main curved links with safe path generation
      const links = linkGroups
        .append("path")
        .attr("class", "main-link")
        .attr("d", (d) => {
          const sourceX = d.source.x || 0
          const sourceY = (d.source.y || 0) + 35
          const targetX = d.target.x || 0
          const targetY = (d.target.y || 0) - 35

          return generateSafePath(sourceX, sourceY, targetX, targetY)
        })
        .style("fill", "none")
        .style("stroke", (d, i) => `url(#linkGradient${(i % 4) + 1})`)
        .style("stroke-width", "2px")
        .style("opacity", 0)

      // Create shadow/background links for depth effect
      linkGroups
        .append("path")
        .attr("class", "shadow-link")
        .attr("d", (d) => {
          const sourceX = (d.source.x || 0) + 1
          const sourceY = (d.source.y || 0) + 36
          const targetX = (d.target.x || 0) + 1
          const targetY = (d.target.y || 0) - 34

          return generateSafePath(sourceX, sourceY, targetX, targetY)
        })
        .style("fill", "none")
        .style("stroke", "#000000")
        .style("stroke-width", "2px")
        .style("opacity", 0.08)

      // Animate links with staggered timing
      links
        .transition()
        .duration(1000)
        .delay((d, i) => i * 30)
        .style("opacity", 0.8)

      // Add interactive link highlighting
      linkGroups
        .style("cursor", "pointer")
        .on("mouseover", function (event, d) {
          d3.select(this)
            .select(".main-link")
            .transition()
            .duration(200)
            .style("stroke-width", "4px")
            .style("opacity", 1)

          // Highlight connected nodes
          g.selectAll(".node")
            .filter((node: any) => node === d.source || node === d.target)
            .select("rect")
            .transition()
            .duration(200)
            .style("stroke-width", "3px")
        })
        .on("mouseout", function (event, d) {
          d3.select(this)
            .select(".main-link")
            .transition()
            .duration(200)
            .style("stroke-width", "2px")
            .style("opacity", 0.8)

          // Reset node highlighting
          g.selectAll(".node").select("rect").transition().duration(200).style("stroke-width", "2px")
        })

      // Create sophisticated node groups
      const nodeGroups = g
        .selectAll(".node")
        .data(validNodes)
        .enter()
        .append("g")
        .attr("class", "node")
        .attr("transform", (d) => `translate(${d.x || 0},${d.y || 0})`)
        .style("opacity", 0)

      // Add department labels for department heads
      nodeGroups
        .filter((d) => d.data.isDepartmentHead && d.data.departmentName)
        .append("text")
        .attr("class", "dept-label")
        .attr("y", -50)
        .attr("text-anchor", "middle")
        .style("font-weight", "700")
        .style("font-size", "12px")
        .style("fill", (d) => getDepartmentColor(d.data.employee.department))
        .style("font-family", "system-ui, -apple-system, sans-serif")
        .text((d) => d.data.departmentName || d.data.employee.department)

      // Add department label background
      nodeGroups
        .filter((d) => d.data.isDepartmentHead && d.data.departmentName)
        .insert("rect", ".dept-label")
        .attr("class", "dept-label-bg")
        .attr("x", -60)
        .attr("y", -62)
        .attr("width", 120)
        .attr("height", 20)
        .attr("rx", 10)
        .style("fill", (d) => getDepartmentColor(d.data.employee.department))
        .style("fill-opacity", 0.1)
        .style("stroke", (d) => getDepartmentColor(d.data.employee.department))
        .style("stroke-width", "1px")

      // Create node background with advanced styling
      nodeGroups
        .append("rect")
        .attr("class", "node-bg")
        .attr("x", -85)
        .attr("y", -35)
        .attr("width", 170)
        .attr("height", 70)
        .attr("rx", 12)
        .style("fill", "url(#nodeGradient)")
        .style("stroke", (d) => getDepartmentColor(d.data.employee.department))
        .style("stroke-width", "2px")
        .style("filter", "drop-shadow(0 2px 8px rgba(0, 0, 0, 0.1))")

      // Department indicator with animation
      nodeGroups
        .append("rect")
        .attr("class", "dept-indicator")
        .attr("x", -85)
        .attr("y", -35)
        .attr("width", 0)
        .attr("height", 4)
        .attr("rx", 2)
        .style("fill", (d) => getDepartmentColor(d.data.employee.department))
        .transition()
        .duration(800)
        .delay((d, i) => i * 50)
        .attr("width", 170)

      // Employee name with better typography
      nodeGroups
        .append("text")
        .attr("class", "emp-name")
        .attr("y", -15)
        .attr("text-anchor", "middle")
        .style("font-weight", "600")
        .style("font-size", "13px")
        .style("fill", "#1e293b")
        .style("font-family", "system-ui, -apple-system, sans-serif")
        .text((d) => {
          const name = d.data.employee.empName || "Unknown"
          return name.length > 16 ? name.substring(0, 16) + "..." : name
        })

      // Job title with subtle styling
      nodeGroups
        .append("text")
        .attr("class", "emp-title")
        .attr("y", 0)
        .attr("text-anchor", "middle")
        .style("font-size", "10px")
        .style("fill", "#64748b")
        .style("font-family", "system-ui, -apple-system, sans-serif")
        .text((d) => {
          const title = d.data.employee.designation || "Employee"
          return title.length > 20 ? title.substring(0, 20) + "..." : title
        })

      // Direct reports count with icon
      nodeGroups
        .append("text")
        .attr("class", "reports-count")
        .attr("y", 18)
        .attr("text-anchor", "middle")
        .style("font-size", "9px")
        .style("font-weight", "600")
        .style("fill", (d) => getDepartmentColor(d.data.employee.department))
        .style("font-family", "system-ui, -apple-system, sans-serif")
        .text((d) => {
          const count = getDirectReportsCount(d.data.employee.empName)
          if (count === 0) return ""
          return count === 1 ? "1 direct report" : `${count} direct reports`
        })

      // Team size indicator (small circle with number for managers)
      nodeGroups
        .filter((d) => getDirectReportsCount(d.data.employee.empName) > 0)
        .append("circle")
        .attr("class", "team-indicator")
        .attr("cx", 65)
        .attr("cy", -25)
        .attr("r", 10)
        .style("fill", (d) => getDepartmentColor(d.data.employee.department))
        .style("stroke", "#ffffff")
        .style("stroke-width", "2px")

      nodeGroups
        .filter((d) => getDirectReportsCount(d.data.employee.empName) > 0)
        .append("text")
        .attr("class", "team-count")
        .attr("x", 65)
        .attr("y", -21)
        .attr("text-anchor", "middle")
        .style("font-size", "8px")
        .style("font-weight", "700")
        .style("fill", "#ffffff")
        .style("font-family", "system-ui, -apple-system, sans-serif")
        .text((d) => getDirectReportsCount(d.data.employee.empName))

      // Advanced search highlighting
      if (searchTerm) {
        nodeGroups
          .selectAll(".node-bg")
          .style("stroke-width", (d) => {
            const employee = d.data.employee
            const matches =
              (employee.empName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
              (employee.designation || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
              (employee.department || "").toLowerCase().includes(searchTerm.toLowerCase())
            return matches ? "4px" : "2px"
          })
          .style("stroke", (d) => {
            const employee = d.data.employee
            const matches =
              (employee.empName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
              (employee.designation || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
              (employee.department || "").toLowerCase().includes(searchTerm.toLowerCase())
            return matches ? "#ef4444" : getDepartmentColor(d.data.employee.department)
          })
      }

      // Sophisticated node interactions
      nodeGroups
        .style("cursor", "pointer")
        .on("mouseover", function (event, d) {
          // Node hover effects
          d3.select(this)
            .select(".node-bg")
            .transition()
            .duration(200)
            .style("stroke-width", "3px")
            .style("filter", "drop-shadow(0 4px 12px rgba(0, 0, 0, 0.15))")

          // Highlight connected links
          g.selectAll(".link-group")
            .filter((link: any) => link.source === d || link.target === d)
            .select(".main-link")
            .transition()
            .duration(200)
            .style("stroke-width", "4px")
            .style("opacity", 1)

          // Enhanced tooltip
          const directReports = getDirectReportsCount(d.data.employee.empName)
          const tooltip = d3
            .select("body")
            .append("div")
            .attr("class", "tooltip")
            .style("position", "absolute")
            .style("background", "#1e293b")
            .style("color", "white")
            .style("padding", "12px 16px")
            .style("border-radius", "8px")
            .style("font-size", "12px")
            .style("pointer-events", "none")
            .style("opacity", 0)
            .style("z-index", "1000")
            .style("box-shadow", "0 4px 12px rgba(0, 0, 0, 0.3)")
            .html(`
              <div style="font-weight: 600; margin-bottom: 4px;">${d.data.employee.empName || "Unknown"}</div>
              <div style="color: #cbd5e1; font-size: 11px; margin-bottom: 2px;">${d.data.employee.designation || "Employee"}</div>
              <div style="color: #cbd5e1; font-size: 11px; margin-bottom: 2px;">${d.data.employee.department || "Unknown"}</div>
              ${directReports > 0 ? `<div style="color: #10b981; font-size: 10px; margin-top: 4px;">👥 Manages ${directReports} ${directReports === 1 ? "person" : "people"}</div>` : ""}
              <div style="color: #cbd5e1; font-size: 10px; margin-top: 4px;">${d.data.employee.emailId || "No email"}</div>
            `)

          tooltip
            .transition()
            .duration(200)
            .style("opacity", 1)
            .style("left", event.pageX + 10 + "px")
            .style("top", event.pageY - 10 + "px")
        })
        .on("mouseout", function (event, d) {
          d3.select(this)
            .select(".node-bg")
            .transition()
            .duration(200)
            .style("stroke-width", "2px")
            .style("filter", "drop-shadow(0 2px 8px rgba(0, 0, 0, 0.1))")

          // Reset link highlighting
          g.selectAll(".link-group").select(".main-link").transition().duration(200).style("stroke-width", "2px")

          d3.selectAll(".tooltip").remove()
        })
        .on("click", function (event, d) {
          onNodeClick(d.data.employee)

          // Advanced selection effect
          nodeGroups.selectAll(".node-bg").style("stroke-width", "2px")
          d3.select(this).select(".node-bg").style("stroke-width", "4px").style("stroke", "#3b82f6")
        })

      // Sophisticated animation sequence
      nodeGroups
        .transition()
        .duration(600)
        .delay((d, i) => i * 40)
        .style("opacity", 1)

      // Auto-center with smooth animation
      setTimeout(() => {
        const bounds = g.node()?.getBBox()
        if (bounds && isFinite(bounds.width) && isFinite(bounds.height)) {
          const centerX = width / 2 - bounds.width / 2 - bounds.x
          const centerY = 50
          const scale = Math.min((width - 100) / bounds.width, (height - 100) / bounds.height, 1) * 0.9

          if (isFinite(centerX) && isFinite(centerY) && isFinite(scale)) {
            svg
              .transition()
              .duration(800)
              .call(zoom.transform, d3.zoomIdentity.translate(centerX, centerY).scale(scale))
          }
        }
      }, 100)

      setIsLoading(false)
    } catch (error) {
      console.error("Error building chart:", error)
      setIsLoading(false)
    }
  }, [employees, searchTerm, expandedNodes, isFullWidth])

  const handleZoomIn = () => {
    const svg = d3.select(svgRef.current)
    svg
      .transition()
      .duration(300)
      .call(d3.zoom<SVGSVGElement, unknown>().scaleBy as any, 1.5)
  }

  const handleZoomOut = () => {
    const svg = d3.select(svgRef.current)
    svg
      .transition()
      .duration(300)
      .call(d3.zoom<SVGSVGElement, unknown>().scaleBy as any, 1 / 1.5)
  }

  const handleReset = () => {
    const svg = d3.select(svgRef.current)
    svg
      .transition()
      .duration(500)
      .call(d3.zoom<SVGSVGElement, unknown>().transform as any, d3.zoomIdentity)
  }

  const toggleFullWidth = () => {
    setIsFullWidth(!isFullWidth)
  }

  const handleDownloadPDF = async () => {
    if (!containerRef.current || isDownloading) return

    setIsDownloading(true)
    setDownloadError(null)

    try {
      // Create a direct download link for testing
      const directDownloadButton = document.createElement("button")
      directDownloadButton.textContent = "Direct Download"
      directDownloadButton.style.position = "fixed"
      directDownloadButton.style.bottom = "20px"
      directDownloadButton.style.left = "20px"
      directDownloadButton.style.zIndex = "9999"
      directDownloadButton.style.padding = "10px"
      directDownloadButton.style.background = "#3b82f6"
      directDownloadButton.style.color = "white"
      directDownloadButton.style.border = "none"
      directDownloadButton.style.borderRadius = "4px"
      directDownloadButton.style.cursor = "pointer"

      directDownloadButton.onclick = async () => {
        try {
          // Create a simple PDF directly
          const pdf = new jsPDF({
            orientation: "landscape",
            unit: "mm",
            format: "a4",
          })

          pdf.text("Organizational Chart Test Download", 20, 20)
          pdf.text("If you can see this PDF, the download works!", 20, 30)

          // Try to download
          pdf.save("test-download.pdf")

          // Remove the button after successful download
          document.body.removeChild(directDownloadButton)
        } catch (err) {
          console.error("Direct download failed:", err)
          alert("Download failed. Please check console for details.")
        }
      }

      document.body.appendChild(directDownloadButton)

      // Proceed with normal download
      await downloadPDF(containerRef.current, "organizational-chart.pdf")
    } catch (error) {
      console.error("Failed to download PDF:", error)
      setDownloadError("Failed to download. Try the direct download button or check your browser settings.")
    } finally {
      setIsDownloading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center bg-white rounded-lg border">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Building organizational chart...</p>
        </div>
      </div>
    )
  }

  if (!employees.length) {
    return (
      <div className="h-96 flex items-center justify-center bg-white rounded-lg border">
        <div className="text-center text-gray-500">
          <p>No employees match your current filters</p>
          <p className="text-sm">Try adjusting your search or department filter</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg border shadow-sm ${isFullWidth ? "fixed inset-4 z-50" : ""}`}>
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Organization Structure</h3>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={toggleFullWidth}>
            <Maximize2 className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleZoomIn}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleZoomOut}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownloadPDF} disabled={isDownloading}>
            <Download className="h-4 w-4 mr-2" />
            {isDownloading ? "Generating..." : "Download PDF"}
          </Button>
        </div>
      </div>

      {downloadError && (
        <div className="p-3 bg-red-50 border-b border-red-100 flex items-center gap-2 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {downloadError}
        </div>
      )}

      <div ref={containerRef} className="relative overflow-hidden" data-employee-count={employees.length}>
        <svg
          ref={svgRef}
          className="w-full cursor-move"
          style={{
            background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
            height: isFullWidth ? "calc(100vh - 120px)" : "1000px",
          }}
        />

        <div className="absolute bottom-4 left-4 text-xs text-gray-500 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-sm border">
          <div className="flex items-center gap-4">
            <span>🖱️ Drag to pan</span>
            <span>🔍 Scroll to zoom</span>
            <span>👆 Click nodes for details</span>
            <span>🔗 Hover links to highlight</span>
          </div>
        </div>

        <div className="absolute top-4 right-4 text-xs text-gray-500 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-sm border">
          Showing {employees.length} employees • {isFullWidth ? "Full Width Mode" : "Standard View"}
        </div>
      </div>
    </div>
  )
}
