// NodeRenderer.ts
import * as d3 from "d3"
import { HierarchyNode } from "@/lib/buildHierarchy"
import { NodeStyleManager } from "./NodeStyles"
import { TooltipManager, extractTooltipData } from "./TooltipManager"
import { LinkStyleManager, LinkDatum } from "./LinkStyles"

export interface NodeInteractionCallbacks {
  onNodeClick?: (node: d3.HierarchyPointNode<HierarchyNode>) => void
  onNodeHover?: (node: d3.HierarchyPointNode<HierarchyNode>) => void
  onNodeLeave?: (node: d3.HierarchyPointNode<HierarchyNode>) => void
}

export class NodeRenderer {
  private styleManager: NodeStyleManager
  private tooltipManager: TooltipManager
  private linkStyleManager: LinkStyleManager
  private callbacks: NodeInteractionCallbacks

  constructor(
    styleManager: NodeStyleManager,
    tooltipManager: TooltipManager,
    linkStyleManager: LinkStyleManager,
    callbacks: NodeInteractionCallbacks = {}
  ) {
    this.styleManager = styleManager
    this.tooltipManager = tooltipManager
    this.linkStyleManager = linkStyleManager
    this.callbacks = callbacks
  }

  renderNodes(
    container: d3.Selection<SVGGElement, unknown, null, undefined>,
    nodes: d3.HierarchyPointNode<HierarchyNode>[],
    linkSelection: d3.Selection<SVGPathElement, LinkDatum, SVGGElement, unknown>
  ): d3.Selection<SVGGElement, d3.HierarchyPointNode<HierarchyNode>, SVGGElement, unknown> {
    const nodeGroups = container
      .selectAll<SVGGElement, d3.HierarchyPointNode<HierarchyNode>>(".node")
      .data(nodes)
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", (d) => `translate(${d.x},${d.y})`)

    // Render node containers
    this.renderNodeContainers(nodeGroups)

    // Render level indicators
    this.renderLevelIndicators(nodeGroups)

    // Render text content
    this.renderNodeText(nodeGroups)

    // Add interactions
    this.addNodeInteractions(nodeGroups, linkSelection)

    return nodeGroups
  }

  private renderNodeContainers(nodeGroups: d3.Selection<SVGGElement, d3.HierarchyPointNode<HierarchyNode>, SVGGElement, unknown>): void {
    const config = this.styleManager.getConfig()

    nodeGroups
      .append("rect")
      .attr("x", -config.width / 2)
      .attr("y", -config.height / 2)
      .attr("width", config.width)
      .attr("height", config.height)
      .attr("rx", config.borderRadius)
      .style("fill", (d) => this.styleManager.getNodeStyle(d).fill)
      .style("stroke", (d) => this.styleManager.getNodeStyle(d).stroke)
      .style("stroke-width", (d) => this.styleManager.getNodeStyle(d).strokeWidth)
      .style("filter", config.shadows.default)
  }

  private renderLevelIndicators(nodeGroups: d3.Selection<SVGGElement, d3.HierarchyPointNode<HierarchyNode>, SVGGElement, unknown>): void {
    const config = this.styleManager.getConfig()

    nodeGroups
      .append("circle")
      .attr("cx", config.levelIndicator.position.x)
      .attr("cy", config.levelIndicator.position.y)
      .attr("r", config.levelIndicator.radius)
      .style("fill", (d) => this.styleManager.getLevelIndicatorColor(d))
  }

  private renderNodeText(nodeGroups: d3.Selection<SVGGElement, d3.HierarchyPointNode<HierarchyNode>, SVGGElement, unknown>): void {
    const config = this.styleManager.getConfig()

    // Employee names
    nodeGroups
      .append("text")
      .attr("dy", (d) => d.data.employee.designation === 'Department' ? 0 : -20)
      .attr("text-anchor", "middle")
      .style("font-weight", (d) => d.data.employee.designation === 'Department' ? 
        config.typography.departmentName.fontWeight : config.typography.name.fontWeight)
      .style("font-size", (d) => d.data.employee.designation === 'Department' ? 
        config.typography.departmentName.fontSize : config.typography.name.fontSize)
      .style("fill", (d) => d.data.employee.designation === 'Department' ? 
        config.typography.departmentName.color : config.typography.name.color)
      .style("letter-spacing", (d) => d.data.employee.designation === 'Department' ? 
        config.typography.departmentName.letterSpacing : config.typography.name.letterSpacing)
      .text((d) => {
        if (d.data.employee.designation === 'Department') {
          return d.data.employee.department
        }
        const name = d.data.employee.empName || "Unknown"
        return name.length > 25 ? name.substring(0, 25) + "..." : name
      })

    // Employee codes (only for non-department nodes)
    nodeGroups
      .filter((d) => d.data.employee.designation !== 'Department')
      .append("text")
      .attr("dy", -2)
      .attr("text-anchor", "middle")
      .style("font-size", config.typography.empCode.fontSize)
      .style("fill", config.typography.empCode.color)
      .style("font-weight", config.typography.empCode.fontWeight)
      .style("letter-spacing", config.typography.empCode.letterSpacing)
      .text((d) => `ID: ${d.data.employee.empCode}`)

    // Designations (only for non-department nodes)
    nodeGroups
      .filter((d) => d.data.employee.designation !== 'Department')
      .append("text")
      .attr("dy", 18)
      .attr("text-anchor", "middle")
      .style("font-size", config.typography.designation.fontSize)
      .style("fill", config.typography.designation.color)
      .style("font-weight", config.typography.designation.fontWeight)
      .text((d) => {
        const designation = d.data.employee.designation || ""
        return designation.length > 30 ? designation.substring(0, 30) + "..." : designation
      })
  }

  private addNodeInteractions(
    nodeGroups: d3.Selection<SVGGElement, d3.HierarchyPointNode<HierarchyNode>, SVGGElement, unknown>,
    linkSelection: d3.Selection<SVGPathElement, LinkDatum, SVGGElement, unknown>
  ): void {
    const { onNodeClick, onNodeHover, onNodeLeave } = this.callbacks

    nodeGroups
      .style("cursor", "pointer")
      .on("mouseover", (event, d) => {
        const data = extractTooltipData(d)
        this.tooltipManager.show(event, data)
        onNodeHover?.(d)
      })
      .on("mousemove", (event) => {
        // Only move tooltip if it exists, don't recreate it
        if (this.tooltipManager.getCurrentTooltip()) {
          this.tooltipManager.move(event)
        }
      })
      .on("mouseleave", (event, d) => {
        this.tooltipManager.hide()
        onNodeLeave?.(d)
      })
      .on("click", (event, d) => {
        // Prevent event bubbling
        event.stopPropagation()
        onNodeClick?.(d)
      })

    // Attach hover styles for links
    this.linkStyleManager.attachHoverStyle(nodeGroups, linkSelection)
  }

  // Method to update node positions (useful for animations)
  updateNodePositions(
    nodeGroups: d3.Selection<SVGGElement, d3.HierarchyPointNode<HierarchyNode>, SVGGElement, unknown>,
    duration: number = 500
  ): void {
    nodeGroups
      .transition()
      .duration(duration)
      .attr("transform", (d) => `translate(${d.x},${d.y})`)
  }

  // Method to update node styles (useful for theme changes)
  updateNodeStyles(
    nodeGroups: d3.Selection<SVGGElement, d3.HierarchyPointNode<HierarchyNode>, SVGGElement, unknown>
  ): void {
    const config = this.styleManager.getConfig()

    // Update node containers
    nodeGroups.select("rect")
      .style("fill", (d) => this.styleManager.getNodeStyle(d).fill)
      .style("stroke", (d) => this.styleManager.getNodeStyle(d).stroke)
      .style("stroke-width", (d) => this.styleManager.getNodeStyle(d).strokeWidth)

    // Update level indicators
    nodeGroups.select("circle")
      .style("fill", (d) => this.styleManager.getLevelIndicatorColor(d))

    // Update text colors
    nodeGroups.selectAll<SVGTextElement, d3.HierarchyPointNode<HierarchyNode>>("text")
      .style("fill", (d, i, nodes) => {
        const textElement = d3.select(nodes[i])
        if (textElement.attr("dy") === "0" || textElement.attr("dy") === "-20") {
          // Name text
          return d.data.employee.designation === 'Department' ? 
            config.typography.departmentName.color : config.typography.name.color
        } else if (textElement.attr("dy") === "-2") {
          // Employee code text
          return config.typography.empCode.color
        } else {
          // Designation text
          return config.typography.designation.color
        }
      })
  }

  // Cleanup method
  cleanup(): void {
    this.tooltipManager.hide()
    d3.selectAll(".node").remove()
  }
}