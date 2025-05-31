// "use client"

// import { useEffect, useRef, useState } from "react"
// import * as d3 from "d3"
// import type { Employee } from "@/lib/types"
// import { buildHierarchy } from "@/lib/buildHierarchy"

// interface ChartProps {
//   employees: Employee[]
// }

// export function Chart({ employees }: ChartProps) {
//   const svgRef = useRef<SVGSVGElement>(null)
//   const [isLoading, setIsLoading] = useState(true)
//   const [mounted, setMounted] = useState(false)

//   // Ensure component is mounted before trying to access refs
//   useEffect(() => {
//     setMounted(true)
//   }, [])

//   useEffect(() => {
//     console.log("📊 Chart useEffect triggered with employees:", employees.length)
//     console.log("🔍 SVG ref current:", !!svgRef.current)
//     console.log("🏁 Mounted:", mounted)
    
//     // Wait for component to be mounted and have valid data
//     if (!mounted || !employees.length || !svgRef.current) {
//       console.log("❌ Not ready - mounted:", mounted, "employees:", employees.length, "svgRef:", !!svgRef.current)
//       if (mounted && !employees.length) {
//         setIsLoading(false)
//       }
//       return
//     }

//     setIsLoading(true)

//     // Use setTimeout to ensure the DOM is ready and prevent blocking
//     const timeoutId = setTimeout(() => {
//       try {
//         console.log("🏗️ Building chart...")
        
//         if (!svgRef.current) {
//           console.log("❌ SVG ref lost during timeout")
//           setIsLoading(false)
//           return
//         }

//         const svg = d3.select(svgRef.current as SVGSVGElement)

//         svg.selectAll("*").remove() // Clear previous content

//         const width = 1200
//         const height = 800
//         const margin = { top: 20, right: 20, bottom: 20, left: 20 }

//         svg.attr("width", width).attr("height", height)

//         // Create zoom behavior
//         const zoom = d3
//           .zoom<SVGSVGElement, unknown>()
//           .scaleExtent([0.1, 3])
//           .on("zoom", (event) => {
//             g.attr("transform", event.transform)
//           })

//         svg.call(zoom as any)

//         const g = svg.append("g")

//         console.log("🔗 Building hierarchy...")
//         const hierarchy = buildHierarchy(employees)
//         console.log("✅ Hierarchy built:", hierarchy)

//         if (hierarchy.length === 0) {
//           console.log("⚠️ No hierarchy found")
//           setIsLoading(false)
//           return
//         }

//         // Convert to D3 hierarchy
//         const root = d3.hierarchy({
//           employee: {
//             empName: "Organization",
//             empCode: "root",
//             designation: "",
//             department: "",
//             emailId: "",
//             location: "",
//             reportingManager: "",
//             srNo: 0,
//           },
//           children: hierarchy,
//           level: -1,
//         } as any)

//         console.log("🌳 D3 hierarchy created:", root)

//         // Create tree layout
//         const treeLayout = d3
//           .tree<any>()
//           .size([width - margin.left - margin.right, height - margin.top - margin.bottom])
//           .separation((a, b) => (a.parent === b.parent ? 1 : 2))

//         const treeData = treeLayout(root)
//         console.log("📐 Tree layout applied")

//         // Create links
//         const links = g
//           .selectAll(".link")
//           .data(treeData.links().filter((d) => d.source.data.employee.empCode !== "root"))
//           .enter()
//           .append("path")
//           .attr("class", "link")
//           .attr(
//             "d",
//             d3
//               .linkVertical<any, any>()
//               .x((d) => d.x)
//               .y((d) => d.y),
//           )
//           .style("fill", "none")
//           .style("stroke", "#6b7280")
//           .style("stroke-width", "2px")

//         console.log("🔗 Links created:", links.size())

//         // Create nodes
//         const nodes = g
//           .selectAll(".node")
//           .data(treeData.descendants().filter((d) => d.data.employee.empCode !== "root"))
//           .enter()
//           .append("g")
//           .attr("class", "node")
//           .attr("transform", (d) => `translate(${d.x},${d.y})`)

//         console.log("🔘 Nodes created:", nodes.size())

//         // Add node backgrounds
//         nodes
//           .append("rect")
//           .attr("x", -120)
//           .attr("y", -40)
//           .attr("width", 240)
//           .attr("height", 80)
//           .attr("rx", 8)
//           .style("fill", (d) => (d.data.level === 0 ? "#dbeafe" : "#ffffff"))
//           .style("stroke", (d) => (d.data.level === 0 ? "#3b82f6" : "#d1d5db"))
//           .style("stroke-width", (d) => (d.data.level === 0 ? "2px" : "1px"))
//           .style("filter", "drop-shadow(0 1px 3px rgba(0, 0, 0, 0.1))")

//         // Add employee names
//         nodes
//           .append("text")
//           .attr("dy", -15)
//           .attr("text-anchor", "middle")
//           .style("font-weight", "600")
//           .style("font-size", "14px")
//           .style("fill", "#111827")
//           .text((d) => d.data.employee.empName)

//         // Add designations
//         nodes
//           .append("text")
//           .attr("dy", 0)
//           .attr("text-anchor", "middle")
//           .style("font-size", "12px")
//           .style("fill", "#6b7280")
//           .text((d) => d.data.employee.designation)

//         // Add departments
//         nodes
//           .append("text")
//           .attr("dy", 15)
//           .attr("text-anchor", "middle")
//           .style("font-size", "10px")
//           .style("fill", "#9ca3af")
//           .text((d) => d.data.employee.department)

//         // Add hover effects
//         nodes
//           .on("mouseover", function (event, d) {
//             d3.select(this).select("rect").style("stroke", "#3b82f6").style("stroke-width", "2px")
//           })
//           .on("mouseout", function (event, d) {
//             d3.select(this)
//               .select("rect")
//               .style("stroke", d.data.level === 0 ? "#3b82f6" : "#d1d5db")
//               .style("stroke-width", d.data.level === 0 ? "2px" : "1px")
//           })

//         // Center the chart
//         setTimeout(() => {
//           const bounds = g.node()?.getBBox()
//           if (bounds) {
//             const fullWidth = bounds.width
//             const fullHeight = bounds.height
//             const centerX = width / 2 - fullWidth / 2 - bounds.x
//             const centerY = height / 2 - fullHeight / 2 - bounds.y

//             svg.transition().call(
//               zoom.transform,
//               d3.zoomIdentity.translate(centerX, centerY).scale(0.8)
//             )
//           }
//           console.log("🎯 Chart centered and loading complete!")
//           setIsLoading(false)
//         }, 100)

//       } catch (error) {
//         console.error("❌ Error building chart:", error)
//         setIsLoading(false)
//       }
//     }, 200) // Increased timeout to give more time for DOM ready

//     return () => {
//       clearTimeout(timeoutId)
//     }
//   }, [employees, mounted]) // Added mounted to dependencies

//   if (isLoading) {
//     return (
//       <div className="h-96 flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
//           <p className="mt-2 text-gray-600">Building organizational chart...</p>
//         </div>
//       </div>
//     )
//   }

//   if (!employees.length) {
//     return (
//       <div className="h-96 flex items-center justify-center">
//         <div className="text-center text-gray-500">
//           <p>No employee data available</p>
//           <p className="text-sm">Upload a file to view the organizational chart</p>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="h-96 w-full border rounded-lg overflow-hidden bg-white relative">
//       <svg ref={svgRef} className="w-full h-full cursor-move" />
//       <div className="absolute bottom-2 left-2 text-xs text-gray-500 bg-white px-2 py-1 rounded shadow">
//         Use mouse wheel to zoom, drag to pan
//       </div>
//     </div>
//   )
// }
// "use client"

// import { useEffect, useRef, useState } from "react"
// import * as d3 from "d3"
// import type { Employee } from "@/lib/types"
// import { buildHierarchy } from "@/lib/buildHierarchy"

// interface ChartProps {
//   employees: Employee[]
// }

// export function Chart({ employees }: ChartProps) {
//   const svgRef = useRef<SVGSVGElement>(null)
//   const [isLoading, setIsLoading] = useState(false)
//   const [mounted, setMounted] = useState(false)

//   // Ensure component is mounted before trying to access refs
//   useEffect(() => {
//     setMounted(true)
//   }, [])

//   useEffect(() => {
//     console.log("📊 Chart useEffect triggered with employees:", employees.length)
//     console.log("🔍 SVG ref current:", !!svgRef.current)
//     console.log("🏁 Mounted:", mounted)
    
//     // If no employees, don't try to build chart
//     if (!employees.length) {
//       console.log("❌ No employees available")
//       setIsLoading(false)
//       return
//     }

//     // Wait for component to be mounted
//     if (!mounted) {
//       console.log("❌ Not mounted yet")
//       return
//     }

//     // Check if SVG ref is available
//     if (!svgRef.current) {
//       console.log("❌ SVG ref not available")
//       return
//     }

//     console.log("✅ SVG ref is ready, building chart...")
//     setIsLoading(true)

//     const buildChart = () => {
//       try {
//         console.log("🏗️ Building chart...")
        
//         // Double-check that SVG ref is still available
//         const svgElement = svgRef.current
//         if (!svgElement) {
//           console.log("❌ SVG ref lost during chart building")
//           setIsLoading(false)
//           return
//         }

//         const svg = d3.select(svgElement)
//         svg.selectAll("*").remove() // Clear previous content

//         const width = 1200
//         const height = 800
//         const margin = { top: 20, right: 20, bottom: 20, left: 20 }

//         svg.attr("width", width).attr("height", height)

//         // Create zoom behavior
//         const zoom = d3
//           .zoom<SVGSVGElement, unknown>()
//           .scaleExtent([0.1, 3])
//           .on("zoom", (event) => {
//             g.attr("transform", event.transform)
//           })

//         svg.call(zoom as any)

//         const g = svg.append("g")

//         console.log("🔗 Building hierarchy...")
//         const hierarchy = buildHierarchy(employees)
//         console.log("✅ Hierarchy built:", hierarchy)

//         if (hierarchy.length === 0) {
//           console.log("⚠️ No hierarchy found")
//           setIsLoading(false)
//           return
//         }

//         // Convert to D3 hierarchy
//         const root = d3.hierarchy({
//           employee: {
//             empName: "Organization",
//             empCode: "root",
//             designation: "",
//             department: "",
//             emailId: "",
//             location: "",
//             reportingManager: "",
//             srNo: 0,
//           },
//           children: hierarchy,
//           level: -1,
//         } as any)

//         console.log("🌳 D3 hierarchy created:", root)

//         // Create tree layout
//         const treeLayout = d3
//           .tree<any>()
//           .size([width - margin.left - margin.right, height - margin.top - margin.bottom])
//           .separation((a, b) => (a.parent === b.parent ? 1 : 2))

//         const treeData = treeLayout(root)
//         console.log("📐 Tree layout applied")

//         // Create links
//         const links = g
//           .selectAll(".link")
//           .data(treeData.links().filter((d) => d.source.data.employee.empCode !== "root"))
//           .enter()
//           .append("path")
//           .attr("class", "link")
//           .attr(
//             "d",
//             d3
//               .linkVertical<any, any>()
//               .x((d) => d.x)
//               .y((d) => d.y),
//           )
//           .style("fill", "none")
//           .style("stroke", "#6b7280")
//           .style("stroke-width", "2px")

//         console.log("🔗 Links created:", links.size())

//         // Create nodes
//         const nodes = g
//           .selectAll(".node")
//           .data(treeData.descendants().filter((d) => d.data.employee.empCode !== "root"))
//           .enter()
//           .append("g")
//           .attr("class", "node")
//           .attr("transform", (d) => `translate(${d.x},${d.y})`)

//         console.log("🔘 Nodes created:", nodes.size())

//         // Add node backgrounds
//         nodes
//           .append("rect")
//           .attr("x", -120)
//           .attr("y", -40)
//           .attr("width", 240)
//           .attr("height", 80)
//           .attr("rx", 8)
//           .style("fill", (d) => (d.data.level === 0 ? "#dbeafe" : "#ffffff"))
//           .style("stroke", (d) => (d.data.level === 0 ? "#3b82f6" : "#d1d5db"))
//           .style("stroke-width", (d) => (d.data.level === 0 ? "2px" : "1px"))
//           .style("filter", "drop-shadow(0 1px 3px rgba(0, 0, 0, 0.1))")

//         // Add employee names
//         nodes
//           .append("text")
//           .attr("dy", -15)
//           .attr("text-anchor", "middle")
//           .style("font-weight", "600")
//           .style("font-size", "14px")
//           .style("fill", "#111827")
//           .text((d) => d.data.employee.empName)

//         // Add designations
//         nodes
//           .append("text")
//           .attr("dy", 0)
//           .attr("text-anchor", "middle")
//           .style("font-size", "12px")
//           .style("fill", "#6b7280")
//           .text((d) => d.data.employee.designation)

//         // Add departments
//         nodes
//           .append("text")
//           .attr("dy", 15)
//           .attr("text-anchor", "middle")
//           .style("font-size", "10px")
//           .style("fill", "#9ca3af")
//           .text((d) => d.data.employee.department)

//         // Add hover effects
//         nodes
//           .on("mouseover", function (event, d) {
//             d3.select(this).select("rect").style("stroke", "#3b82f6").style("stroke-width", "2px")
//           })
//           .on("mouseout", function (event, d) {
//             d3.select(this)
//               .select("rect")
//               .style("stroke", d.data.level === 0 ? "#3b82f6" : "#d1d5db")
//               .style("stroke-width", d.data.level === 0 ? "2px" : "1px")
//           })

//         // Center the chart
//         const centerChart = () => {
//           const bounds = g.node()?.getBBox()
//           if (bounds && svgRef.current) {
//             const fullWidth = bounds.width
//             const fullHeight = bounds.height
//             const centerX = width / 2 - fullWidth / 2 - bounds.x
//             const centerY = height / 2 - fullHeight / 2 - bounds.y

//             svg.transition().call(
//               zoom.transform,
//               d3.zoomIdentity.translate(centerX, centerY).scale(0.8)
//             )
//           }
//           console.log("🎯 Chart centered and loading complete!")
//           setIsLoading(false)
//         }

//         // Use requestAnimationFrame instead of setTimeout for better performance
//         requestAnimationFrame(centerChart)

//       } catch (error) {
//         console.error("❌ Error building chart:", error)
//         setIsLoading(false)
//       }
//     }

//     // Use requestAnimationFrame to ensure DOM is ready
//     requestAnimationFrame(buildChart)

//   }, [employees, mounted])

//   if (isLoading) {
//     return (
//       <div className="h-96 flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
//           <p className="mt-2 text-gray-600">Building organizational chart...</p>
//         </div>
//       </div>
//     )
//   }

//   if (!employees.length) {
//     return (
//       <div className="h-96 flex items-center justify-center">
//         <div className="text-center text-gray-500">
//           <p>No employee data available</p>
//           <p className="text-sm">Upload a file to view the organizational chart</p>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="h-96 w-full border rounded-lg overflow-hidden bg-white relative">
//       <svg ref={svgRef} className="w-full h-full cursor-move" />
//       <div className="absolute bottom-2 left-2 text-xs text-gray-500 bg-white px-2 py-1 rounded shadow">
//         Use mouse wheel to zoom, drag to pan
//       </div>
//     </div>
//   )
// }
// "use client"

// import { useEffect, useRef, useState, useCallback } from "react"
// import * as d3 from "d3"
// import type { Employee } from "@/lib/types"
// import { buildHierarchy } from "@/lib/buildHierarchy"

// interface ChartProps {
//   employees: Employee[]
// }

// export function Chart({ employees }: ChartProps) {
//   const svgRef = useRef<SVGSVGElement>(null)
//   const containerRef = useRef<HTMLDivElement>(null)
//   const [isLoading, setIsLoading] = useState(false)

//   const buildChart = useCallback(() => {
//     console.log("🏗️ Starting buildChart function...")
    
//     // Early return if no employees
//     if (!employees.length) {
//       console.log("❌ No employees available")
//       setIsLoading(false)
//       return
//     }

//     // Get current refs
//     const svgElement = svgRef.current
//     const containerElement = containerRef.current

//     if (!svgElement || !containerElement) {
//       console.log("❌ Required refs not available:", { 
//         svg: !!svgElement, 
//         container: !!containerElement 
//       })
//       setIsLoading(false)
//       return
//     }

//     console.log("✅ Refs available, proceeding with chart build...")
//     setIsLoading(true)

//     try {
//       const svg = d3.select(svgElement)
//       svg.selectAll("*").remove() // Clear previous content

//       const width = 1200
//       const height = 800
//       const margin = { top: 20, right: 20, bottom: 20, left: 20 }

//       svg.attr("width", width).attr("height", height)

//       // Create main group for transformations
//       const g = svg.append("g")

//       // Create zoom behavior
//       const zoom = d3
//         .zoom<SVGSVGElement, unknown>()
//         .scaleExtent([0.1, 3])
//         .on("zoom", (event) => {
//           g.attr("transform", event.transform)
//         })

//       svg.call(zoom as any)

//       console.log("🔗 Building hierarchy...")
//       const hierarchy = buildHierarchy(employees)
//       console.log("✅ Hierarchy built:", hierarchy.length, "root nodes")

//       if (hierarchy.length === 0) {
//         console.log("⚠️ No hierarchy found")
//         setIsLoading(false)
//         return
//       }

//       // Convert to D3 hierarchy
//       const root = d3.hierarchy({
//         employee: {
//           empName: "Organization",
//           empCode: "root",
//           designation: "",
//           department: "",
//           emailId: "",
//           location: "",
//           reportingManager: "",
//           srNo: 0,
//         },
//         children: hierarchy,
//         level: -1,
//       } as any)

//       console.log("🌳 D3 hierarchy created with", root.descendants().length, "total nodes")

//       // Create tree layout
//       const treeLayout = d3
//         .tree<any>()
//         .size([width - margin.left - margin.right, height - margin.top - margin.bottom])
//         .separation((a, b) => (a.parent === b.parent ? 1 : 2))

//       const treeData = treeLayout(root)
//       console.log("📐 Tree layout applied")

//       // Filter out the artificial root node we created
//       const visibleNodes = treeData.descendants().filter((d) => d.data.employee.empCode !== "root")
//       const visibleLinks = treeData.links().filter((d) => d.source.data.employee.empCode !== "root")

//       console.log("👀 Visible nodes:", visibleNodes.length)
//       console.log("🔗 Visible links:", visibleLinks.length)

//       // Create links
//       const links = g
//         .selectAll(".link")
//         .data(visibleLinks)
//         .enter()
//         .append("path")
//         .attr("class", "link")
//         .attr(
//           "d",
//           d3
//             .linkVertical<any, any>()
//             .x((d) => d.x)
//             .y((d) => d.y),
//         )
//         .style("fill", "none")
//         .style("stroke", "#6b7280")
//         .style("stroke-width", "2px")

//       // Create nodes
//       const nodes = g
//         .selectAll(".node")
//         .data(visibleNodes)
//         .enter()
//         .append("g")
//         .attr("class", "node")
//         .attr("transform", (d) => `translate(${d.x},${d.y})`)

//       // Add node backgrounds
//       nodes
//         .append("rect")
//         .attr("x", -120)
//         .attr("y", -40)
//         .attr("width", 240)
//         .attr("height", 80)
//         .attr("rx", 8)
//         .style("fill", (d) => (d.data.level === 0 ? "#dbeafe" : "#ffffff"))
//         .style("stroke", (d) => (d.data.level === 0 ? "#3b82f6" : "#d1d5db"))
//         .style("stroke-width", (d) => (d.data.level === 0 ? "2px" : "1px"))
//         .style("filter", "drop-shadow(0 1px 3px rgba(0, 0, 0, 0.1))")

//       // Add employee names
//       nodes
//         .append("text")
//         .attr("dy", -15)
//         .attr("text-anchor", "middle")
//         .style("font-weight", "600")
//         .style("font-size", "14px")
//         .style("fill", "#111827")
//         .text((d) => d.data.employee.empName || "Unknown")

//       // Add designations
//       nodes
//         .append("text")
//         .attr("dy", 0)
//         .attr("text-anchor", "middle")
//         .style("font-size", "12px")
//         .style("fill", "#6b7280")
//         .text((d) => d.data.employee.designation || "")

//       // Add departments
//       nodes
//         .append("text")
//         .attr("dy", 15)
//         .attr("text-anchor", "middle")
//         .style("font-size", "10px")
//         .style("fill", "#9ca3af")
//         .text((d) => d.data.employee.department || "")

//       // Add hover effects
//       nodes
//         .on("mouseover", function (event, d) {
//           d3.select(this).select("rect").style("stroke", "#3b82f6").style("stroke-width", "2px")
//         })
//         .on("mouseout", function (event, d) {
//           d3.select(this)
//             .select("rect")
//             .style("stroke", d.data.level === 0 ? "#3b82f6" : "#d1d5db")
//             .style("stroke-width", d.data.level === 0 ? "2px" : "1px")
//         })

//       // Center and scale the chart
//       setTimeout(() => {
//         const bounds = g.node()?.getBBox()
//         if (bounds && svgRef.current) {
//           const fullWidth = bounds.width
//           const fullHeight = bounds.height
//           const centerX = width / 2 - fullWidth / 2 - bounds.x
//           const centerY = height / 2 - fullHeight / 2 - bounds.y

//           // Apply initial transform to center the chart
//           svg.call(
//             zoom.transform,
//             d3.zoomIdentity.translate(centerX, centerY).scale(0.8)
//           )
          
//           console.log("🎯 Chart centered and scaled")
//         }
//         setIsLoading(false)
//         console.log("✅ Chart build complete!")
//       }, 50)

//     } catch (error) {
//       console.error("❌ Error building chart:", error)
//       setIsLoading(false)
//     }
//   }, [employees])

//   // Effect to trigger chart building
//   useEffect(() => {
//     console.log("📊 Chart useEffect triggered with employees:", employees.length)
    
//     if (!employees.length) {
//       setIsLoading(false)
//       return
//     }

//     // Small delay to ensure DOM is ready
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
//           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
//           <p className="mt-2 text-gray-600">Building organizational chart...</p>
//         </div>
//       </div>
//     )
//   }

//   if (!employees.length) {
//     return (
//       <div className="h-96 flex items-center justify-center">
//         <div className="text-center text-gray-500">
//           <p>No employee data available</p>
//           <p className="text-sm">Upload a file to view the organizational chart</p>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div ref={containerRef} className="h-96 w-full border rounded-lg overflow-hidden bg-white relative">
//       <svg ref={svgRef} className="w-full h-full cursor-move" />
//       <div className="absolute bottom-2 left-2 text-xs text-gray-500 bg-white px-2 py-1 rounded shadow">
//         Use mouse wheel to zoom, drag to pan
//       </div>
//     </div>
//   )
// }

// "use client"

// import { useEffect, useRef, useState, useCallback } from "react"
// import * as d3 from "d3"

// interface Employee {
//   srNo: number
//   empCode: string
//   empName: string
//   emailId: string
//   location: string
//   designation: string
//   reportingManager: string
//   department: string
// }

// interface HierarchyNode {
//   employee: Employee
//   children: HierarchyNode[]
//   level: number
// }

// interface ChartProps {
//   employees: Employee[]
// }

// // Fixed hierarchy building function
// function buildHierarchy(employees: Employee[]): HierarchyNode[] {
//   console.log("🏗️ Building hierarchy for", employees.length, "employees")
  
//   if (!employees.length) {
//     return []
//   }

//   // Create maps for quick lookup
//   const employeeMap = new Map<string, Employee>()
//   const childrenMap = new Map<string, Employee[]>()

//   // Build employee map and children map
//   employees.forEach(emp => {
//     employeeMap.set(emp.empCode, emp)
    
//     if (emp.reportingManager && emp.reportingManager.trim()) {
//       const manager = emp.reportingManager.trim()
//       if (!childrenMap.has(manager)) {
//         childrenMap.set(manager, [])
//       }
//       childrenMap.get(manager)!.push(emp)
//     }
//   })

//   console.log("📊 Employee map size:", employeeMap.size)
//   console.log("👥 Children map entries:", Array.from(childrenMap.entries()).map(([k, v]) => `${k}: ${v.length} children`))

//   // Find root employees (those whose manager is not in the employee list or is empty)
//   const rootEmployees = employees.filter(emp => {
//     const hasNoManager = !emp.reportingManager || !emp.reportingManager.trim()
//     const managerNotInData = emp.reportingManager && !employeeMap.has(emp.reportingManager.trim())
    
//     if (hasNoManager) {
//       console.log("🌟 Root employee (no manager):", emp.empName)
//     } else if (managerNotInData) {
//       console.log("🌟 Root employee (manager not in data):", emp.empName, "reports to:", emp.reportingManager)
//     }
    
//     return hasNoManager || managerNotInData
//   })

//   console.log("🌳 Root employees found:", rootEmployees.length, rootEmployees.map(e => e.empName))

//   // Build hierarchy tree recursively
//   function buildNode(employee: Employee, level: number = 0): HierarchyNode {
//     const children = childrenMap.get(employee.empCode) || []
//     console.log(`📦 Building node for ${employee.empName} at level ${level} with ${children.length} children`)
    
//     return {
//       employee,
//       children: children.map(child => buildNode(child, level + 1)),
//       level
//     }
//   }

//   const hierarchy = rootEmployees.map(rootEmp => buildNode(rootEmp))
//   console.log("✅ Hierarchy built successfully:", hierarchy.length, "root nodes")
  
//   return hierarchy
// }

// export function Chart({ employees }: ChartProps) {
//   const svgRef = useRef<SVGSVGElement>(null)
//   const containerRef = useRef<HTMLDivElement>(null)
//   const [isLoading, setIsLoading] = useState(false)

//   const buildChart = useCallback(() => {
//     console.log("🏗️ Starting buildChart function...")
    
//     // Early return if no employees
//     if (!employees.length) {
//       console.log("❌ No employees available")
//       setIsLoading(false)
//       return
//     }

//     // Get current refs
//     const svgElement = svgRef.current
//     const containerElement = containerRef.current

//     if (!svgElement || !containerElement) {
//       console.log("❌ Required refs not available:", { 
//         svg: !!svgElement, 
//         container: !!containerElement 
//       })
//       setIsLoading(false)
//       return
//     }

//     console.log("✅ Refs available, proceeding with chart build...")
//     setIsLoading(true)

//     try {
//       const svg = d3.select(svgElement)
//       svg.selectAll("*").remove() // Clear previous content

//       const width = 1200
//       const height = 800
//       const margin = { top: 20, right: 20, bottom: 20, left: 20 }

//       svg.attr("width", width).attr("height", height)

//       // Create main group for transformations
//       const g = svg.append("g")

//       // Create zoom behavior
//       const zoom = d3
//         .zoom<SVGSVGElement, unknown>()
//         .scaleExtent([0.1, 3])
//         .on("zoom", (event) => {
//           g.attr("transform", event.transform)
//         })

//       svg.call(zoom as any)

//       console.log("🔗 Building hierarchy...")
//       const hierarchy = buildHierarchy(employees)
//       console.log("✅ Hierarchy built:", hierarchy.length, "root nodes")

//       if (hierarchy.length === 0) {
//         console.log("⚠️ No hierarchy found")
//         setIsLoading(false)
//         return
//       }

//       // Create a single root for D3 if we have multiple root nodes
//       const rootData = hierarchy.length === 1 ? hierarchy[0] : {
//         employee: {
//           empName: "Organization",
//           empCode: "root",
//           designation: "",
//           department: "",
//           emailId: "",
//           location: "",
//           reportingManager: "",
//           srNo: 0,
//         },
//         children: hierarchy,
//         level: -1,
//       }

//       // Convert to D3 hierarchy
//       const root = d3.hierarchy(rootData)

//       console.log("🌳 D3 hierarchy created with", root.descendants().length, "total nodes")

//       // Create tree layout
//       const treeLayout = d3
//         .tree<any>()
//         .size([width - margin.left - margin.right, height - margin.top - margin.bottom])
//         .separation((a, b) => (a.parent === b.parent ? 1 : 2))

//       const treeData = treeLayout(root)
//       console.log("📐 Tree layout applied")

//       // Filter out the artificial root node if we created one
//       const visibleNodes = treeData.descendants().filter((d) => 
//         hierarchy.length === 1 || d.data.employee.empCode !== "root"
//       )
//       const visibleLinks = treeData.links().filter((d) => 
//         hierarchy.length === 1 || d.source.data.employee.empCode !== "root"
//       )

//       console.log("👀 Visible nodes:", visibleNodes.length)
//       console.log("🔗 Visible links:", visibleLinks.length)

//       // Create links
//       const links = g
//         .selectAll(".link")
//         .data(visibleLinks)
//         .enter()
//         .append("path")
//         .attr("class", "link")
//         .attr(
//           "d",
//           d3
//             .linkVertical<any, any>()
//             .x((d) => d.x)
//             .y((d) => d.y),
//         )
//         .style("fill", "none")
//         .style("stroke", "#6b7280")
//         .style("stroke-width", "2px")

//       // Create nodes
//       const nodes = g
//         .selectAll(".node")
//         .data(visibleNodes)
//         .enter()
//         .append("g")
//         .attr("class", "node")
//         .attr("transform", (d) => `translate(${d.x},${d.y})`)

//       // Add node backgrounds
//       nodes
//         .append("rect")
//         .attr("x", -120)
//         .attr("y", -40)
//         .attr("width", 240)
//         .attr("height", 80)
//         .attr("rx", 8)
//         .style("fill", (d) => (d.data.level === 0 ? "#dbeafe" : "#ffffff"))
//         .style("stroke", (d) => (d.data.level === 0 ? "#3b82f6" : "#d1d5db"))
//         .style("stroke-width", (d) => (d.data.level === 0 ? "2px" : "1px"))
//         .style("filter", "drop-shadow(0 1px 3px rgba(0, 0, 0, 0.1))")

//       // Add employee names
//       nodes
//         .append("text")
//         .attr("dy", -15)
//         .attr("text-anchor", "middle")
//         .style("font-weight", "600")
//         .style("font-size", "14px")
//         .style("fill", "#111827")
//         .text((d) => d.data.employee.empName || "Unknown")

//       // Add designations
//       nodes
//         .append("text")
//         .attr("dy", 0)
//         .attr("text-anchor", "middle")
//         .style("font-size", "12px")
//         .style("fill", "#6b7280")
//         .text((d) => d.data.employee.designation || "")

//       // Add departments
//       nodes
//         .append("text")
//         .attr("dy", 15)
//         .attr("text-anchor", "middle")
//         .style("font-size", "10px")
//         .style("fill", "#9ca3af")
//         .text((d) => d.data.employee.department || "")

//       // Add hover effects
//       nodes
//         .on("mouseover", function (event, d) {
//           d3.select(this).select("rect").style("stroke", "#3b82f6").style("stroke-width", "2px")
//         })
//         .on("mouseout", function (event, d) {
//           d3.select(this)
//             .select("rect")
//             .style("stroke", d.data.level === 0 ? "#3b82f6" : "#d1d5db")
//             .style("stroke-width", d.data.level === 0 ? "2px" : "1px")
//         })

//       // Center and scale the chart
//       setTimeout(() => {
//         const bounds = g.node()?.getBBox()
//         if (bounds && svgRef.current) {
//           const fullWidth = bounds.width
//           const fullHeight = bounds.height
//           const centerX = width / 2 - fullWidth / 2 - bounds.x
//           const centerY = height / 2 - fullHeight / 2 - bounds.y

//           // Apply initial transform to center the chart
//           svg.call(
//             zoom.transform,
//             d3.zoomIdentity.translate(centerX, centerY).scale(0.8)
//           )
          
//           console.log("🎯 Chart centered and scaled")
//         }
//         setIsLoading(false)
//         console.log("✅ Chart build complete!")
//       }, 50)

//     } catch (error) {
//       console.error("❌ Error building chart:", error)
//       setIsLoading(false)
//     }
//   }, [employees])

//   // Effect to trigger chart building
//   useEffect(() => {
//     console.log("📊 Chart useEffect triggered with employees:", employees.length)
    
//     if (!employees.length) {
//       setIsLoading(false)
//       return
//     }

//     // Small delay to ensure DOM is ready
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
//           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
//           <p className="mt-2 text-gray-600">Building organizational chart...</p>
//         </div>
//       </div>
//     )
//   }

//   if (!employees.length) {
//     return (
//       <div className="h-96 flex items-center justify-center">
//         <div className="text-center text-gray-500">
//           <p>No employee data available</p>
//           <p className="text-sm">Upload a file to view the organizational chart</p>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div ref={containerRef} className="h-96 w-full border rounded-lg overflow-hidden bg-white relative">
//       <svg ref={svgRef} className="w-full h-full cursor-move" />
//       <div className="absolute bottom-2 left-2 text-xs text-gray-500 bg-white px-2 py-1 rounded shadow">
//         Use mouse wheel to zoom, drag to pan
//       </div>
//     </div>
//   )
// }

"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import * as d3 from "d3"

interface Employee {
  srNo: number
  empCode: string
  empName: string
  emailId: string
  location: string
  designation: string
  reportingManager: string
  department: string
}

interface HierarchyNode {
  employee: Employee
  children: HierarchyNode[]
  level: number
}

interface ChartProps {
  employees: Employee[]
}

// Fixed hierarchy building function
function buildHierarchy(employees: Employee[]): HierarchyNode[] {
  console.log("🏗️ Building hierarchy for", employees.length, "employees")
  
  if (!employees.length) {
    return []
  }

  // Create maps for quick lookup
  const employeeByCode = new Map<string, Employee>()
  const employeeByName = new Map<string, Employee>()
  const childrenByManagerCode = new Map<string, Employee[]>()

  // First pass: Build lookup maps
  employees.forEach(emp => {
    const empCode = emp.empCode.toString().trim()
    const empName = emp.empName.toString().trim()
    
    employeeByCode.set(empCode, emp)
    employeeByName.set(empName, emp)
  })

  console.log("📊 Employee maps built - By Code:", employeeByCode.size, "By Name:", employeeByName.size)

  // Second pass: Build children map by finding manager's employee code
  employees.forEach(emp => {
    if (emp.reportingManager && emp.reportingManager.trim()) {
      const managerIdentifier = emp.reportingManager.trim()
      let managerEmployee: Employee | undefined
      
      // Try to find manager by code first, then by name
      managerEmployee = employeeByCode.get(managerIdentifier) || employeeByName.get(managerIdentifier)
      
      if (managerEmployee) {
        const managerCode = managerEmployee.empCode.toString().trim()
        if (!childrenByManagerCode.has(managerCode)) {
          childrenByManagerCode.set(managerCode, [])
        }
        childrenByManagerCode.get(managerCode)!.push(emp)
        
        console.log(`👥 Added ${emp.empName} as child of ${managerEmployee.empName} (${managerCode})`)
      } else {
        console.log(`⚠️ Manager "${managerIdentifier}" not found for employee ${emp.empName}`)
      }
    }
  })

  console.log("👥 Children map entries:", Array.from(childrenByManagerCode.entries()).map(([k, v]) => `${k}: ${v.length} children`))

  // Find root employees (those whose manager is not in the employee list or is empty)
  const rootEmployees = employees.filter(emp => {
    const hasNoManager = !emp.reportingManager || !emp.reportingManager.trim()
    
    if (hasNoManager) {
      console.log("🌟 Root employee (no manager):", emp.empName)
      return true
    }
    
    const managerIdentifier = emp.reportingManager.trim()
    const managerExists = employeeByCode.has(managerIdentifier) || employeeByName.has(managerIdentifier)
    
    if (!managerExists) {
      console.log("🌟 Root employee (manager not in data):", emp.empName, "reports to:", managerIdentifier)
      return true
    }
    
    return false
  })

  console.log("🌳 Root employees found:", rootEmployees.length, rootEmployees.map(e => e.empName))

  // Build hierarchy tree recursively
  function buildNode(employee: Employee, level: number = 0): HierarchyNode {
    const empCode = employee.empCode.toString().trim()
    const children = childrenByManagerCode.get(empCode) || []
    
    if (level <= 2) {
      console.log(`📦 Building node for ${employee.empName} at level ${level} with ${children.length} children`)
    }
    
    return {
      employee,
      children: children.map(child => buildNode(child, level + 1)),
      level
    }
  }

  const hierarchy = rootEmployees.map(rootEmp => buildNode(rootEmp))
  console.log("✅ Hierarchy built successfully:", hierarchy.length, "root nodes")
  
  // Log total nodes for verification
  const countNodes = (nodes: HierarchyNode[]): number => {
    return nodes.reduce((count, node) => count + 1 + countNodes(node.children), 0)
  }
  
  const totalNodes = countNodes(hierarchy)
  console.log("📊 Total nodes in hierarchy:", totalNodes)
  
  return hierarchy
}

export function Chart({ employees }: ChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(false)

  const buildChart = useCallback(() => {
    console.log("🏗️ Starting buildChart function...")
    
    // Early return if no employees
    if (!employees.length) {
      console.log("❌ No employees available")
      setIsLoading(false)
      return
    }

    // Get current refs
    const svgElement = svgRef.current
    const containerElement = containerRef.current

    if (!svgElement || !containerElement) {
      console.log("❌ Required refs not available:", { 
        svg: !!svgElement, 
        container: !!containerElement 
      })
      setIsLoading(false)
      return
    }

    console.log("✅ Refs available, proceeding with chart build...")
    setIsLoading(true)

    try {
      const svg = d3.select(svgElement)
      svg.selectAll("*").remove() // Clear previous content

      const width = 1400
      const height = 900
      const margin = { top: 40, right: 40, bottom: 40, left: 40 }

      svg.attr("width", width).attr("height", height)

      // Create main group for transformations
      const g = svg.append("g")

      // Create zoom behavior
      const zoom = d3
        .zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.1, 3])
        .on("zoom", (event) => {
          g.attr("transform", event.transform)
        })

      svg.call(zoom)

      console.log("🔗 Building hierarchy...")
      const hierarchy = buildHierarchy(employees)
      console.log("✅ Hierarchy built:", hierarchy.length, "root nodes")

      if (hierarchy.length === 0) {
        console.log("⚠️ No hierarchy found - showing error message")
        
        // Show error message in the chart
        g.append("text")
          .attr("x", width / 2)
          .attr("y", height / 2)
          .attr("text-anchor", "middle")
          .style("font-size", "18px")
          .style("fill", "#ef4444")
          .text("Unable to build organizational hierarchy")
        
        g.append("text")
          .attr("x", width / 2)
          .attr("y", height / 2 + 30)
          .attr("text-anchor", "middle")
          .style("font-size", "14px")
          .style("fill", "#6b7280")
          .text("Check console for detailed error information")
          
        setIsLoading(false)
        return
      }

      // Create a single root for D3 if we have multiple root nodes
      const rootData = hierarchy.length === 1 ? hierarchy[0] : {
        employee: {
          empName: "Organization",
          empCode: "root",
          designation: "Root",
          department: "",
          emailId: "",
          location: "",
          reportingManager: "",
          srNo: 0,
        },
        children: hierarchy,
        level: -1,
      }

      // Convert to D3 hierarchy
      const root = d3.hierarchy(rootData)

      console.log("🌳 D3 hierarchy created with", root.descendants().length, "total nodes")

      // Create tree layout with better spacing
      const treeLayout = d3
        .tree<HierarchyNode>()
        .size([width - margin.left - margin.right, height - margin.top - margin.bottom])
        .separation((a, b) => {
          // More space between nodes at the same level
          return a.parent === b.parent ? 1.2 : 1.5
        })

      const treeData = treeLayout(root)
      console.log("📐 Tree layout applied")

      // Filter out the artificial root node if we created one
      const visibleNodes = treeData.descendants().filter((d) => 
        hierarchy.length === 1 || d.data.employee.empCode !== "root"
      )
      const visibleLinks = treeData.links().filter((d) => 
        hierarchy.length === 1 || d.source.data.employee.empCode !== "root"
      )

      console.log("👀 Visible nodes:", visibleNodes.length)
      console.log("🔗 Visible links:", visibleLinks.length)

      // Create the link generator with proper types
      const linkGenerator = d3
        .linkVertical<d3.HierarchyPointLink<HierarchyNode>, d3.HierarchyPointNode<HierarchyNode>>()
        .x(d => d.x)
        .y(d => d.y)

      // Create links with curved paths
      const links = g
        .selectAll(".link")
        .data(visibleLinks)
        .enter()
        .append("path")
        .attr("class", "link")
        .attr("d", linkGenerator)
        .style("fill", "none")
        .style("stroke", "#6b7280")
        .style("stroke-width", "2px")
        .style("opacity", 0.7)

      // Create nodes
      const nodes = g
        .selectAll(".node")
        .data(visibleNodes)
        .enter()
        .append("g")
        .attr("class", "node")
        .attr("transform", (d) => `translate(${d.x},${d.y})`)

      // Add node backgrounds with level-based colors
      nodes
        .append("rect")
        .attr("x", -140)
        .attr("y", -45)
        .attr("width", 280)
        .attr("height", 90)
        .attr("rx", 10)
        .style("fill", (d) => {
          const level = d.data.level
          if (level === 0) return "#dbeafe" // Blue for top level
          if (level === 1) return "#fef3c7" // Yellow for second level
          if (level === 2) return "#d1fae5" // Green for third level
          return "#ffffff" // White for others
        })
        .style("stroke", (d) => {
          const level = d.data.level
          if (level === 0) return "#3b82f6"
          if (level === 1) return "#f59e0b"
          if (level === 2) return "#10b981"
          return "#d1d5db"
        })
        .style("stroke-width", (d) => (d.data.level <= 2 ? "2px" : "1px"))
        .style("filter", "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))")

      // Add employee names
      nodes
        .append("text")
        .attr("dy", -20)
        .attr("text-anchor", "middle")
        .style("font-weight", "700")
        .style("font-size", "15px")
        .style("fill", "#111827")
        .text((d) => d.data.employee.empName || "Unknown")

      // Add employee codes
      nodes
        .append("text")
        .attr("dy", -5)
        .attr("text-anchor", "middle")
        .style("font-size", "11px")
        .style("fill", "#6b7280")
        .text((d) => `(${d.data.employee.empCode})`)

      // Add designations
      nodes
        .append("text")
        .attr("dy", 10)
        .attr("text-anchor", "middle")
        .style("font-size", "13px")
        .style("font-weight", "600")
        .style("fill", "#374151")
        .text((d) => d.data.employee.designation || "")

      // Add departments
      nodes
        .append("text")
        .attr("dy", 25)
        .attr("text-anchor", "middle")
        .style("font-size", "11px")
        .style("fill", "#9ca3af")
        .text((d) => d.data.employee.department || "")

      // Add hover effects
      nodes
        .on("mouseover", function (event, d: d3.HierarchyPointNode<HierarchyNode>) {
          d3.select(this).select("rect")
            .style("stroke", "#ef4444")
            .style("stroke-width", "3px")
            .style("filter", "drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2))")
          
          // Show tooltip-like info
          const tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("position", "absolute")
            .style("background", "rgba(0, 0, 0, 0.8)")
            .style("color", "white")
            .style("padding", "8px")
            .style("border-radius", "4px")
            .style("font-size", "12px")
            .style("pointer-events", "none")
            .style("opacity", 0)
            .style("z-index", "1000")
            .html(`
              <strong>${d.data.employee.empName}</strong><br/>
              ${d.data.employee.designation}<br/>
              ${d.data.employee.department}<br/>
              ${d.data.employee.location}
            `)
          
          tooltip.transition()
            .duration(200)
            .style("opacity", 1)
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 10) + "px")
        })
        .on("mouseout", function (event, d: d3.HierarchyPointNode<HierarchyNode>) {
          d3.select(this).select("rect")
            .style("stroke", () => {
              const level = d.data.level
              if (level === 0) return "#3b82f6"
              if (level === 1) return "#f59e0b"
              if (level === 2) return "#10b981"
              return "#d1d5db"
            })
            .style("stroke-width", () => (d.data.level <= 2 ? "2px" : "1px"))
            .style("filter", "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))")
          
          d3.selectAll(".tooltip").remove()
        })

      // Add click effects for better interaction
      nodes.on("click", function (event, d: d3.HierarchyPointNode<HierarchyNode>) {
  console.log("🖱️ Clicked:", d.data.employee)

  // Optional: Highlight the selected node
  d3.selectAll(".node rect")
    .style("stroke", (n: any) => {
      const level = n.data.level
      if (level === 0) return "#3b82f6"
      if (level === 1) return "#f59e0b"
      if (level === 2) return "#10b981"
      return "#d1d5db"
    })
    .style("stroke-width", (n: any) => (n.data.level <= 2 ? "2px" : "1px"))

  d3.select(this).select("rect")
    .style("stroke", "#6366f1")
    .style("stroke-width", "3px")

  // Optional: Scroll to center (if your container is scrollable)
  // containerElement.scrollTo({ top: d.y - height / 2, left: d.x - width / 2, behavior: "smooth" })
})
      nodes
        .style("cursor", "pointer")
        .on("click", function (event, d: d3.HierarchyPointNode<HierarchyNode>) {
          console.log("👤 Clicked employee:", d.data.employee.empName)
        })

      // Center and scale the chart
      setTimeout(() => {
        const bounds = g.node()?.getBBox()
        if (bounds && svgRef.current) {
          const fullWidth = bounds.width
          const fullHeight = bounds.height
          const centerX = width / 2 - fullWidth / 2 - bounds.x
          const centerY = height / 2 - fullHeight / 2 - bounds.y

          // Calculate optimal scale to fit the chart
          const scaleX = (width - 100) / fullWidth
          const scaleY = (height - 100) / fullHeight
          const optimalScale = Math.min(scaleX, scaleY, 1) // Don't scale up beyond 100%

          // Apply initial transform to center and scale the chart
          svg.call(
            zoom.transform,
            d3.zoomIdentity.translate(centerX, centerY).scale(optimalScale * 0.8)
          )
          
          console.log("🎯 Chart centered and scaled")
        }
        setIsLoading(false)
        console.log("✅ Chart build complete!")
      }, 100)

    } catch (error) {
      console.error("❌ Error building chart:", error)
      setIsLoading(false)
    }
  }, [employees])

  // Effect to trigger chart building
  useEffect(() => {
    console.log("📊 Chart useEffect triggered with employees:", employees.length)
    
    if (!employees.length) {
      setIsLoading(false)
      return
    }

    // Small delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      buildChart()
    }, 100)

    return () => {
      clearTimeout(timeoutId)
    }
  }, [employees, buildChart])

  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Building organizational chart...</p>
        </div>
      </div>
    )
  }

  if (!employees.length) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <p>No employee data available</p>
          <p className="text-sm">Upload a file to view the organizational chart</p>
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="h-[600px] w-full border rounded-lg overflow-hidden bg-white relative">
      <svg ref={svgRef} className="w-full h-full cursor-move" />
      <div className="absolute bottom-2 left-2 text-xs text-gray-500 bg-white px-2 py-1 rounded shadow">
        Use mouse wheel to zoom, drag to pan • Hover over nodes for details • Click nodes for interaction
      </div>
      <div className="absolute top-2 right-2 text-xs text-gray-500 bg-white px-2 py-1 rounded shadow">
        Total Employees: {employees.length}
      </div>
    </div>
  )
}