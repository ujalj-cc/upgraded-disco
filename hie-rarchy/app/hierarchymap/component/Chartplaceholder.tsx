// "use client"

// import { useEffect, useRef, useState, useCallback } from "react"
// import * as d3 from "d3"
// //import { buildHierarchy, type Employee, type HierarchyNode } from "@/lib/buildHierarchy"
// import { buildFullHierarchy, type Employee, type HierarchyNode } from "@/lib/buildHierarchy"


// interface ChartProps {
//   employees: Employee[]
// }

// export function Chart({ employees }: ChartProps) {
//   const svgRef = useRef<SVGSVGElement>(null)
//   const containerRef = useRef<HTMLDivElement>(null)
//   const [isLoading, setIsLoading] = useState(false)
//   const [error, setError] = useState<string | null>(null)
//   const [chartConfig, setChartConfig] = useState({
//     nodeWidth: 200,
//     nodeHeight: 90,
//     horizontalSpacing: 2.2,
//     verticalSpacing: 140,
//     linkStyle: 'curved'
//   })

//   const buildChart = useCallback(() => {
//     console.log("\n🎨 ===== CHART BUILDING START =====")
//     console.log("📊 Employees received:", employees.length)
    
//     if (!employees.length) {
//       console.log("❌ No employees available - showing empty state")
//       setIsLoading(false)
//       return
//     }

//     const svgElement = svgRef.current
//     const containerElement = containerRef.current

//     if (!svgElement || !containerElement) {
//       console.log("❌ Required refs not available")
//       setIsLoading(false)
//       return
//     }

//     console.log("✅ All refs available, proceeding with chart build...")
//     setIsLoading(true)
//     setError(null)

//     try {
//       const svg = d3.select(svgElement)
//       svg.selectAll("*").remove()

//       const containerRect = containerElement.getBoundingClientRect()
//       const width = containerRect.width || 1400
//       const height = containerRect.height || 900
      
//       console.log("📐 Chart dimensions:", { width, height })

//       svg.attr("width", width).attr("height", height)

//       const g = svg.append("g").attr("class", "chart-group")

//       // Create zoom behavior
//       const zoom = d3
//         .zoom<SVGSVGElement, unknown>()
//         .scaleExtent([0.1, 4])
//         .on("zoom", (event) => {
//           g.attr("transform", event.transform)
//         })

//       svg.call(zoom)

//       console.log("🔗 Starting hierarchy building...")
//       const hierarchy = buildFullHierarchy(employees)
//       console.log("🔗 Hierarchy building complete:", hierarchy.length, "root nodes")
      
//       if (hierarchy.length === 0) {
//         console.log("❌ No hierarchy found - showing error")
//         setError("Unable to build organizational hierarchy. Check console for detailed logs.")
//         setIsLoading(false)
//         return
//       }

//       // Handle single or multiple roots
//       const rootData = hierarchy.length === 1 ? hierarchy[0] : {
//         employee: {
//           empName: "Organization",
//           empCode: "root",
//           designation: "Root",
//           department: "",
//           emailId: "",
//           location: "",
//           reportingManager: "",
//           srNo: 0,
//         },
//         children: hierarchy,
//         level: -1,
//       }

//       const root = d3.hierarchy(rootData)

//       // Calculate dynamic width based on maximum nodes at any level
//       const nodesByLevel = new Map<number, any[]>()
//       root.descendants().forEach(node => {
//         const level = node.depth
//         if (!nodesByLevel.has(level)) {
//           nodesByLevel.set(level, [])
//         }
//         nodesByLevel.get(level)!.push(node)
//       })

//       const maxNodesAtLevel = Math.max(...Array.from(nodesByLevel.values()).map(nodes => nodes.length))
//       const requiredWidth = Math.max(width, (maxNodesAtLevel * chartConfig.nodeWidth * chartConfig.horizontalSpacing) + 400)
      
//       console.log("📊 Layout calculations:", {
//         maxNodesAtLevel,
//         requiredWidth,
//         nodesByLevel: Array.from(nodesByLevel.entries()).map(([level, nodes]) => ({ level, count: nodes.length }))
//       })

//       // Create tree layout with dynamic sizing
//       const treeLayout = d3
//         .tree<HierarchyNode>()
//         .size([requiredWidth - 200, height - 200])
//         .separation((a, b) => {
//           if (a.parent === b.parent) {
//             // Same parent - calculate based on node width and spacing
//             const nodeWidth = chartConfig.nodeWidth
//             const spacing = chartConfig.horizontalSpacing
//             const minSeparation = (nodeWidth * spacing) / 100 // D3 uses relative units
//             return Math.max(minSeparation, 1.5)
//           } else {
//             // Different parents - more space
//             const nodeWidth = chartConfig.nodeWidth
//             const spacing = chartConfig.horizontalSpacing
//             const minSeparation = (nodeWidth * spacing * 1.2) / 100
//             return Math.max(minSeparation, 2.5)
//           }
//         })

//       const treeData = treeLayout(root)

//       // Post-process to ensure minimum distances and fix overlaps
//       const levels = new Map<number, any[]>()
//       treeData.descendants().forEach(node => {
//         const level = node.depth
//         if (!levels.has(level)) {
//           levels.set(level, [])
//         }
//         levels.get(level)!.push(node)
//         // Set vertical position
//         node.y = node.depth * chartConfig.verticalSpacing + 100
//       })

//       // Fix overlaps at each level
//       levels.forEach((nodesAtLevel, level) => {
//         if (nodesAtLevel.length <= 1) return
        
//         // Sort nodes by x position
//         nodesAtLevel.sort((a, b) => a.x - b.x)
        
//         const minDistance = chartConfig.nodeWidth + 20 // Minimum distance between node centers
        
//         // Adjust positions to prevent overlaps
//         for (let i = 1; i < nodesAtLevel.length; i++) {
//           const prevNode = nodesAtLevel[i - 1]
//           const currentNode = nodesAtLevel[i]
//           const requiredDistance = minDistance
          
//           if (currentNode.x - prevNode.x < requiredDistance) {
//             const adjustment = requiredDistance - (currentNode.x - prevNode.x)
//             // Distribute the adjustment across remaining nodes
//             for (let j = i; j < nodesAtLevel.length; j++) {
//               nodesAtLevel[j].x += adjustment
//             }
//           }
//         }
        
//         // Center the level if it extends beyond container
//         const levelWidth = nodesAtLevel[nodesAtLevel.length - 1].x - nodesAtLevel[0].x
//         const containerCenter = requiredWidth / 2
//         const levelCenter = (nodesAtLevel[0].x + nodesAtLevel[nodesAtLevel.length - 1].x) / 2
//         const offset = containerCenter - levelCenter
        
//         if (Math.abs(offset) > 10) { // Only adjust if significant offset
//           nodesAtLevel.forEach(node => {
//             node.x += offset * 0.5 // Gentle centering
//           })
//         }
//       })

//       // Filter out artificial root if created
//       const visibleNodes = treeData.descendants().filter((d) => 
//         hierarchy.length === 1 || d.data.employee.empCode !== "root"
//       )
//       const visibleLinks = treeData.links().filter((d) => 
//         hierarchy.length === 1 || d.source.data.employee.empCode !== "root"
//       )

//       // Create enhanced link generator
//       const createLinkPath = (d: any) => {
//         const source = d.source
//         const target = d.target
        
//         if (chartConfig.linkStyle === 'curved') {
//           const midY = (source.y + target.y) / 2
//           return `M${source.x},${source.y + chartConfig.nodeHeight/2}
//                   C${source.x},${midY} ${target.x},${midY} ${target.x},${target.y - chartConfig.nodeHeight/2}`
//         } else if (chartConfig.linkStyle === 'straight') {
//           return `M${source.x},${source.y + chartConfig.nodeHeight/2} L${target.x},${target.y - chartConfig.nodeHeight/2}`
//         } else {
//           // Step-style connection
//           const midY = (source.y + target.y) / 2
//           return `M${source.x},${source.y + chartConfig.nodeHeight/2}
//                   L${source.x},${midY}
//                   L${target.x},${midY}
//                   L${target.x},${target.y - chartConfig.nodeHeight/2}`
//         }
//       }

//       // Draw enhanced links with arrows
//       const linkGroup = g.append("g").attr("class", "links")
      
//       linkGroup.selectAll(".link")
//         .data(visibleLinks)
//         .enter()
//         .append("path")
//         .attr("class", "link")
//         .attr("d", createLinkPath)
//         .style("fill", "none")
//         .style("stroke", "#94a3b8")
//         .style("stroke-width", "2.5px")
//         .style("opacity", 0.8)
//         .style("filter", "drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))")

//       // Add connection dots at junctions
//       linkGroup.selectAll(".connection-dot")
//         .data(visibleLinks)
//         .enter()
//         .append("circle")
//         .attr("class", "connection-dot")
//         .attr("cx", d => d.source.x)
//         .attr("cy", d => d.source.y + chartConfig.nodeHeight/2)
//         .attr("r", 4)
//         .style("fill", "#64748b")
//         .style("stroke", "#ffffff")
//         .style("stroke-width", "2px")

//       // Create nodes with improved styling
//       const nodeGroups = g
//         .selectAll(".node")
//         .data(visibleNodes)
//         .enter()
//         .append("g")
//         .attr("class", "node")
//         .attr("transform", (d) => `translate(${d.x},${d.y})`)

      
//       // Add enhanced node containers with gradient backgrounds
//       nodeGroups
//         .append("rect")
//         .attr("x", -chartConfig.nodeWidth/2)
//         .attr("y", -chartConfig.nodeHeight/2)
//         .attr("width", chartConfig.nodeWidth)
//         .attr("height", chartConfig.nodeHeight)
//         .attr("rx", 16)
//         .style("fill", (d) => {
//           // Check if this is a department node
//           if (d.data.employee.designation === 'Department') {
//             return "url(#department-gradient)"
//           }
//           const level = d.data.level
//           if (level === 0) return "url(#ceo-gradient)"
//           if (level === 1) return "url(#manager-gradient)"
//           if (level === 2) return "url(#employee-gradient)"
//           return "url(#default-gradient)"
//         })
//         .style("stroke", (d) => {
//           // Check if this is a department node
//           if (d.data.employee.designation === 'Department') {
//             return "#7c3aed"
//           }
//           const level = d.data.level
//           if (level === 0) return "#1e40af"
//           if (level === 1) return "#059669"
//           if (level === 2) return "#dc2626"
//           return "#64748b"
//         })
//         .style("stroke-width", (d) => d.data.level === 0 ? "3px" : "2px")
//         .style("filter", "drop-shadow(0 4px 12px rgba(0, 0, 0, 0.1)) drop-shadow(0 2px 4px rgba(0, 0, 0, 0.06))")
      
//       // Add gradients to SVG

      
//       const defs = svg.append("defs")
      
//       const ceoGradient = defs.append("linearGradient")
//         .attr("id", "ceo-gradient")
//         .attr("x1", "0%").attr("y1", "0%")
//         .attr("x2", "0%").attr("y2", "100%")
//       ceoGradient.append("stop").attr("offset", "0%").style("stop-color", "#dbeafe")
//       ceoGradient.append("stop").attr("offset", "100%").style("stop-color", "#ffffff")

//       const managerGradient = defs.append("linearGradient")
//         .attr("id", "manager-gradient")
//         .attr("x1", "0%").attr("y1", "0%")
//         .attr("x2", "0%").attr("y2", "100%")
//       managerGradient.append("stop").attr("offset", "0%").style("stop-color", "#dcfce7")
//       managerGradient.append("stop").attr("offset", "100%").style("stop-color", "#ffffff")

//       const employeeGradient = defs.append("linearGradient")
//         .attr("id", "employee-gradient")
//         .attr("x1", "0%").attr("y1", "0%")
//         .attr("x2", "0%").attr("y2", "100%")
//       employeeGradient.append("stop").attr("offset", "0%").style("stop-color", "#fef2f2")
//       employeeGradient.append("stop").attr("offset", "100%").style("stop-color", "#ffffff")
      

//       const defaultGradient = defs.append("linearGradient")
//         .attr("id", "default-gradient")
//         .attr("x1", "0%").attr("y1", "0%")
//         .attr("x2", "0%").attr("y2", "100%")
//       defaultGradient.append("stop").attr("offset", "0%").style("stop-color", "#f8fafc")
//       defaultGradient.append("stop").attr("offset", "100%").style("stop-color", "#ffffff")
      
//       const departmentGradient = defs.append("linearGradient")
//         .attr("id", "department-gradient")
//         .attr("x1", "0%").attr("y1", "0%")
//         .attr("x2", "0%").attr("y2", "100%")
//       departmentGradient.append("stop").attr("offset", "0%").style("stop-color", "#f3e8ff")
//       departmentGradient.append("stop").attr("offset", "100%").style("stop-color", "#ffffff")
      
      
//       // Add level indicators
//       nodeGroups
//         .append("circle")
//         .attr("cx", -chartConfig.nodeWidth/2 + 20)
//         .attr("cy", -chartConfig.nodeHeight/2 + 20)
//         .attr("r", 6)
//         .style("fill", (d) => {
//           // Check if this is a department node
//           if (d.data.employee.designation === 'Department') {
//             return "#7c3aed"
//           }
//           const level = d.data.level
//           if (level === 0) return "#1e40af"
//           if (level === 1) return "#059669"
//           if (level === 2) return "#dc2626"
//           return "#64748b"
//         })

//       // Add employee names with better typography
//       nodeGroups
//   .append("text")
//   .attr("dy", (d) => {
//     // For department nodes, center the text vertically
//     if (d.data.employee.designation === 'Department') {
//       return 0 // Center vertically
//     }
//     return -20 // Normal position for employees
//   })
//   .attr("text-anchor", "middle")
//   .style("font-weight", "700")
//   .style("font-size", (d) => {
//     // Slightly larger font for department names
//     return d.data.employee.designation === 'Department' ? "18px" : "16px"
//   })
//   .style("fill", "#1f2937")
//   .style("letter-spacing", "0.025em")
//   .text((d) => {
//     // For department nodes, show only the department name
//     if (d.data.employee.designation === 'Department') {
//       return d.data.employee.department
//     }
//     // For regular employees, show employee name
//     const name = d.data.employee.empName || "Unknown"
//     return name.length > 25 ? name.substring(0, 25) + "..." : name
//   })

//       // Add employee codes with better styling
//       nodeGroups
//   .filter((d) => d.data.employee.designation !== 'Department') // Only for non-department nodes
//   .append("text")
//   .attr("dy", -2)
//   .attr("text-anchor", "middle")
//   .style("font-size", "12px")
//   .style("fill", "#6b7280")
//   .style("font-weight", "600")
//   .style("letter-spacing", "0.05em")
//   .text((d) => `ID: ${d.data.employee.empCode}`)

//       // Add designations with truncation
//       nodeGroups
//   .filter((d) => d.data.employee.designation !== 'Department') // Only for non-department nodes
//   .append("text")
//   .attr("dy", 18)
//   .attr("text-anchor", "middle")
//   .style("font-size", "14px")
//   .style("fill", "#374151")
//   .style("font-weight", "500")
//   .text((d) => {
//     const designation = d.data.employee.designation || ""
//     return designation.length > 30 ? designation.substring(0, 30) + "..." : designation
//   })

//       // Add enhanced hover effects
//       nodeGroups
//         .style("cursor", "pointer")
//         .on("mouseover", function (event, d) {
//           // Highlight the node
//           d3.select(this).select("rect")
//             .style("stroke", "#3b82f6")
//             .style("stroke-width", "4px")
//             .style("filter", "drop-shadow(0 12px 25px rgba(59, 130, 246, 0.25)) drop-shadow(0 4px 10px rgba(0, 0, 0, 0.1))")
//             .transition()
//             .duration(200)
//             .style("transform", "scale(1.02)")

//           // Highlight connected paths
//           g.selectAll(".link")
//             .style("opacity", 0.3)
//             .filter((link: any) => 
//               link.source.data.employee.empCode === d.data.employee.empCode || 
//               link.target.data.employee.empCode === d.data.employee.empCode
//             )
//             .style("opacity", 1)
//             .style("stroke", "#3b82f6")
//             .style("stroke-width", "3px")

//           // Create enhanced tooltip
//           const tooltip = d3.select("body").append("div")
//             .attr("class", "tooltip")
//             .style("position", "absolute")
//             .style("background", "linear-gradient(135deg, rgba(17, 24, 39, 0.95), rgba(31, 41, 55, 0.95))")
//             .style("color", "white")
//             .style("padding", "16px 20px")
//             .style("border-radius", "12px")
//             .style("font-size", "14px")
//             .style("font-weight", "500")
//             .style("pointer-events", "none")
//             .style("opacity", 0)
//             .style("z-index", "1000")
//             .style("backdrop-filter", "blur(16px)")
//             .style("border", "1px solid rgba(255, 255, 255, 0.1)")
//             .style("box-shadow", "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)")
//             .html(`
//               <div style="font-weight: 700; margin-bottom: 8px; color: #f3f4f6; font-size: 16px;">${d.data.employee.empName}</div>
//               <div style="margin-bottom: 6px; color: #d1d5db; font-weight: 600;">${d.data.employee.designation}</div>
//               <div style="margin-bottom: 6px; color: #d1d5db;">${d.data.employee.department}</div>
//               <div style="margin-bottom: 6px; color: #9ca3af;">${d.data.employee.location}</div>
//               <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(255, 255, 255, 0.1); color: #9ca3af; font-size: 12px;">
//                 Level: ${d.data.level} • Children: ${d.children ? d.children.length : 0}
//               </div>
//             `)
          
//           tooltip.transition()
//             .duration(200)
//             .style("opacity", 1)
//             .style("left", (event.pageX + 15) + "px")
//             .style("top", (event.pageY - 10) + "px")
//         })
//         .on("mouseout", function (event, d) {
//           // Reset node styling
//           d3.select(this).select("rect")
//             .style("stroke", () => {
//               const level = d.data.level
//               if (level === 0) return "#1e40af"
//               if (level === 1) return "#059669"
//               if (level === 2) return "#dc2626"
//               return "#64748b"
//             })
//             .style("stroke-width", (d) => (d as any).data.level === 0 ? "3px" : "2px")
//             .style("filter", "drop-shadow(0 4px 12px rgba(0, 0, 0, 0.1)) drop-shadow(0 2px 4px rgba(0, 0, 0, 0.06))")
//             .style("transform", "scale(1)")

//           // Reset link styling
//           g.selectAll(".link")
//             .style("opacity", 0.8)
//             .style("stroke", "#94a3b8")
//             .style("stroke-width", "2.5px")
          
//           d3.selectAll(".tooltip").remove()
//         })
//         .on("click", function (event, d) {
//           // Reset all nodes
//           d3.selectAll(".node rect")
//             .style("stroke", (n: any) => {
//               const level = n.data.level
//               if (level === 0) return "#1e40af"
//               if (level === 1) return "#059669"
//               if (level === 2) return "#dc2626"
//               return "#64748b"
//             })
//             .style("stroke-width", (n: any) => n.data.level === 0 ? "3px" : "2px")

//           // Highlight selected node
//           d3.select(this).select("rect")
//             .style("stroke", "#7c3aed")
//             .style("stroke-width", "4px")
//             .style("filter", "drop-shadow(0 8px 25px rgba(124, 58, 237, 0.25)) drop-shadow(0 4px 10px rgba(0, 0, 0, 0.1))")
//         })

//       // Center and scale the chart with dynamic bounds
//       setTimeout(() => {
//         const bounds = g.node()?.getBBox()
//         if (bounds) {
//           const fullWidth = bounds.width
//           const fullHeight = bounds.height
          
//           // Calculate scale to fit content
//           const scaleX = (width - 100) / fullWidth
//           const scaleY = (height - 100) / fullHeight
//           const optimalScale = Math.min(scaleX, scaleY, 1.2) // Allow slight zoom out
          
//           // Center the content
//           const centerX = (width - fullWidth * optimalScale) / 2 - bounds.x * optimalScale
//           const centerY = (height - fullHeight * optimalScale) / 2 - bounds.y * optimalScale
          
//           console.log("🎯 Chart centering:", {
//             bounds: { width: fullWidth, height: fullHeight },
//             scale: optimalScale,
//             center: { x: centerX, y: centerY }
//           })
          
//           svg.call(
//             zoom.transform,
//             d3.zoomIdentity.translate(centerX, centerY).scale(optimalScale)
//           )
//         }
//       }, 200)

//       console.log("✅ ===== CHART BUILDING COMPLETE =====")
//       setIsLoading(false)

//     } catch (error) {
//       console.error("❌ ===== CHART BUILD ERROR =====")
//       console.error("Error details:", error)
//       setError(error instanceof Error ? error.message : "Failed to build chart")
//       setIsLoading(false)
//     }
//   }, [employees, chartConfig])

//   useEffect(() => {
//     if (employees.length === 0) {
//       setIsLoading(false)
//       return
//     }

//     const timeoutId = setTimeout(() => {
//       buildChart()
//     }, 100)

//     return () => {
//       clearTimeout(timeoutId)
//     }
//   }, [employees, buildChart])

//   if (isLoading) {
//     return (
//       <div className="h-96 flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
//           <p className="mt-4 text-gray-700 font-medium">Building organizational chart...</p>
//           <p className="mt-1 text-sm text-gray-500">This may take a moment</p>
//         </div>
//       </div>
//     )
//   }

//   if (error) {
//     return (
//       <div className="h-96 flex items-center justify-center">
//         <div className="text-center max-w-md mx-auto p-6 bg-red-50 rounded-lg border border-red-200">
//           <div className="text-red-600 mb-4">
//             <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//             </svg>
//           </div>
//           <p className="font-semibold text-red-800 mb-2">Error building chart</p>
//           <p className="text-sm text-red-600 mb-3">{error}</p>
//           <p className="text-xs text-red-500">Check browser console for detailed logs</p>
//         </div>
//       </div>
//     )
//   }

//   if (!employees.length) {
//     return (
//       <div className="h-96 flex items-center justify-center">
//         <div className="text-center max-w-md mx-auto p-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
//           <div className="text-gray-400 mb-4">
//             <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
//             </svg>
//           </div>
//           <p className="text-gray-600 font-medium mb-2">No employee data available</p>
//           <p className="text-sm text-gray-500">Upload a file to view the organizational chart</p>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="space-y-4">
//       {/* Control Panel */}
//       <div className="bg-white p-4 rounded-lg border shadow-sm">
//         <h4 className="font-semibold text-gray-800 mb-3">Chart Customization</h4>
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Node Width</label>
//             <input
//               type="range"
//               min="200"
//               max="400"
//               value={chartConfig.nodeWidth}
//               onChange={(e) => setChartConfig(prev => ({ ...prev, nodeWidth: parseInt(e.target.value) }))}
//               className="w-full"
//             />
//             <span className="text-xs text-gray-500">{chartConfig.nodeWidth}px</span>
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Horizontal Spacing</label>
//             <input
//               type="range"
//               min="1.5"
//               max="4"
//               step="0.1"
//               value={chartConfig.horizontalSpacing}
//               onChange={(e) => setChartConfig(prev => ({ ...prev, horizontalSpacing: parseFloat(e.target.value) }))}
//               className="w-full"
//             />
//             <span className="text-xs text-gray-500">{chartConfig.horizontalSpacing}x</span>
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Vertical Spacing</label>
//             <input
//               type="range"
//               min="100"
//               max="250"
//               value={chartConfig.verticalSpacing}
//               onChange={(e) => setChartConfig(prev => ({ ...prev, verticalSpacing: parseInt(e.target.value) }))}
//               className="w-full"
//             />
//             <span className="text-xs text-gray-500">{chartConfig.verticalSpacing}px</span>
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Connection Style</label>
//             <select
//               value={chartConfig.linkStyle}
//               onChange={(e) => setChartConfig(prev => ({ ...prev, linkStyle: e.target.value }))}
//               className="w-full text-sm border border-gray-300 rounded-md px-2 py-1"
//             >
//               <option value="curved">Curved</option>
//               <option value="straight">Straight</option>
//               <option value="step">Step</option>
//             </select>
//           </div>
//         </div>
//       </div>

//       {/* Chart Container */}
//       <div id="org-chart" ref={containerRef} className="h-[800px] w-full border rounded-lg overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-white relative shadow-lg">
//         <svg ref={svgRef} className="w-full h-full cursor-move" />
        
//         {/* Enhanced Controls */}
        

//         {/* Stats Panel */}
//         // Replace the commented Stats Panel section with this:

// {/* Department Stats Panel */}
// <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-6 py-4 rounded-xl shadow-xl border border-gray-200 w-72">
//   <div className="text-sm text-gray-700 space-y-3">
//     <div className="font-bold text-gray-900 text-base border-b pb-2 border-gray-300">
//       📊 Department Overview
//     </div>
//     <div className="flex justify-between text-sm">
//       <span>Total Employees</span>
//       <span className="font-semibold text-gray-900">{employees.length}</span>
//     </div>

//     {/* Top Departments */}
//     <div className="space-y-2">
//       {(() => {
//         const departmentStats = employees.reduce((acc, emp) => {
//           const dept = emp.department || 'Unassigned';
//           acc[dept] = (acc[dept] || 0) + 1;
//           return acc;
//         }, {} as Record<string, number>);

//         const sortedDepts = Object.entries(departmentStats)
//           .sort(([, a], [, b]) => b - a)
//           .slice(0, 5);

//         return sortedDepts.map(([dept, count], index) => (
//           <div key={dept} className="flex items-center justify-between">
//             <div className="flex items-center gap-2">
//               <div
//                 className="w-3 h-3 rounded-full"
//                 style={{
//                   backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index % 5],
//                 }}
//               ></div>
//               <span className="truncate max-w-[130px]" title={dept}>
//                 {dept.length > 15 ? dept.slice(0, 15) + '…' : dept}
//               </span>
//             </div>
//             <span className="font-semibold text-gray-800">{count}</span>
//           </div>
//         ));
//       })()}
//     </div>

//     {/* Extra Departments Note */}
//     {(() => {
//       const departmentCount = Object.keys(
//         employees.reduce((acc, emp) => {
//           const dept = emp.department || 'Unassigned';
//           acc[dept] = (acc[dept] || 0) + 1;
//           return acc;
//         }, {} as Record<string, number>)
//       ).length;

//       if (departmentCount > 5) {
//         return (
//           <div className="text-xs text-gray-500 pt-2 border-t border-gray-200">
//             +{departmentCount - 5} more departments
//           </div>
//         );
//       }
//       return null;
//     })()}
//   </div>
// </div>

//       </div>
//     </div>
//   )
// }