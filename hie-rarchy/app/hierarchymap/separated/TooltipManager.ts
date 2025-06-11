// TooltipManager.ts
import * as d3 from "d3"
import { HierarchyNode } from "@/lib/buildHierarchy"

export interface TooltipConfig {
  background: string
  color: string
  padding: string
  borderRadius: string
  fontSize: string
  fontWeight: string
  maxWidth: string
  zIndex: string
  backdropFilter: string
  border: string
  boxShadow: string
  animation: {
    duration: number
    easing: string
  }
  positioning: {
    offsetX: number
    offsetY: number
  }
}

export interface TooltipData {
  empName: string
  designation: string
  department: string
  location: string
  empCode: string
  level: number
  childrenCount: number
  reportingManager?: string
  emailId?: string
}

export const defaultTooltipConfig: TooltipConfig = {
  background: "linear-gradient(135deg, rgba(17, 24, 39, 0.95), rgba(31, 41, 55, 0.95))",
  color: "white",
  padding: "16px 20px",
  borderRadius: "12px",
  fontSize: "14px",
  fontWeight: "500",
  maxWidth: "320px",
  zIndex: "1000",
  backdropFilter: "blur(16px)",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  animation: {
    duration: 200,
    easing: "ease-in-out"
  },
  positioning: {
    offsetX: 15,
    offsetY: -10
  }
}

export class TooltipManager {
  private config: TooltipConfig
  private currentTooltip: d3.Selection<HTMLDivElement, unknown, HTMLElement, unknown> | null = null

  constructor(config: TooltipConfig = defaultTooltipConfig) {
    this.config = config
  }

  show(event: MouseEvent, data: TooltipData): void {
    this.hide() // Remove any existing tooltip

    const tooltip = d3.select("body").append("div")
      .attr("class", "org-chart-tooltip")
      .style("position", "absolute")
      .style("background", this.config.background)
      .style("color", this.config.color)
      .style("padding", this.config.padding)
      .style("border-radius", this.config.borderRadius)
      .style("font-size", this.config.fontSize)
      .style("font-weight", this.config.fontWeight)
      .style("max-width", this.config.maxWidth)
      .style("pointer-events", "none")
      .style("opacity", "0")
      .style("z-index", this.config.zIndex)
      .style("backdrop-filter", this.config.backdropFilter)
      .style("border", this.config.border)
      .style("box-shadow", this.config.boxShadow)
      .html(this.generateTooltipContent(data))

    // Position tooltip
    this.positionTooltip(tooltip, event)

    // Animate in
    tooltip
      .transition()
      .duration(this.config.animation.duration)
      .style("opacity", "1")

    this.currentTooltip = tooltip
  }

  move(event: MouseEvent): void {
    if (this.currentTooltip) {
      this.positionTooltip(this.currentTooltip, event)
    }
  }

  hide(): void {
    if (this.currentTooltip) {
      this.currentTooltip
        .transition()
        .duration(this.config.animation.duration)
        .style("opacity", "0")
        .remove()
      
      this.currentTooltip = null
    }

    // Also remove any existing tooltips (fallback)
    d3.selectAll(".org-chart-tooltip").remove()
  }

  getCurrentTooltip(): d3.Selection<HTMLDivElement, unknown, HTMLElement, unknown> | null {
    return this.currentTooltip
  }

  private positionTooltip(
    tooltip: d3.Selection<HTMLDivElement, unknown, HTMLElement, unknown>, 
    event: MouseEvent
  ): void {
    const tooltipNode = tooltip.node()
    if (tooltipNode) {
      const rect = tooltipNode.getBoundingClientRect()
      const x = event.pageX + this.config.positioning.offsetX
      const y = event.pageY + this.config.positioning.offsetY

      // Adjust position if tooltip would go off screen
      const adjustedX = x + rect.width > window.innerWidth ? 
        event.pageX - rect.width - this.config.positioning.offsetX : x
      const adjustedY = y + rect.height > window.innerHeight ? 
        event.pageY - rect.height - this.config.positioning.offsetY : y

      tooltip
        .style("left", adjustedX + "px")
        .style("top", adjustedY + "px")
    }
  }

  private generateTooltipContent(data: TooltipData): string {
    const sections: string[] = []

    // Main info section
    sections.push(`
      <div style="font-weight: 700; margin-bottom: 8px; color: #f3f4f6; font-size: 16px;">
        ${this.escapeHtml(data.empName)}
      </div>
    `)

    // Role and department
    if (data.designation && data.designation !== 'Department') {
      sections.push(`
        <div style="margin-bottom: 6px; color: #d1d5db; font-weight: 600;">
          ${this.escapeHtml(data.designation)}
        </div>
      `)
    }

    if (data.department) {
      sections.push(`
        <div style="margin-bottom: 6px; color: #d1d5db;">
          📍 ${this.escapeHtml(data.department)}
        </div>
      `)
    }

    // Location
    if (data.location) {
      sections.push(`
        <div style="margin-bottom: 6px; color: #9ca3af;">
          🌍 ${this.escapeHtml(data.location)}
        </div>
      `)
    }

    // Contact info
    if (data.emailId) {
      sections.push(`
        <div style="margin-bottom: 6px; color: #9ca3af; font-size: 12px;">
          ✉️ ${this.escapeHtml(data.emailId)}
        </div>
      `)
    }

    // Reporting info
    if (data.reportingManager) {
      sections.push(`
        <div style="margin-bottom: 6px; color: #9ca3af; font-size: 12px;">
          👤 Reports to: ${this.escapeHtml(data.reportingManager)}
        </div>
      `)
    }

    // Footer with stats
    sections.push(`
      <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(255, 255, 255, 0.1); color: #9ca3af; font-size: 12px;">
        Level: ${data.level} • Children: ${data.childrenCount} • ID: ${this.escapeHtml(data.empCode)}
      </div>
    `)

    return sections.join('')
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }

  updateConfig(newConfig: Partial<TooltipConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }

  getConfig(): TooltipConfig {
    return { ...this.config }
  }
}

// Utility function to extract tooltip data from hierarchy node
export function extractTooltipData(node: d3.HierarchyPointNode<HierarchyNode>): TooltipData {
  return {
    empName: node.data.employee.empName || "Unknown",
    designation: node.data.employee.designation || "",
    department: node.data.employee.department || "",
    location: node.data.employee.location || "",
    empCode: node.data.employee.empCode || "",
    level: node.data.level,
    childrenCount: node.children ? node.children.length : 0,
    reportingManager: node.data.employee.reportingManager || "",
    emailId: node.data.employee.emailId || ""
  }
}