// LinkStyles.ts
import * as d3 from "d3"
import { HierarchyNode } from "@/lib/buildHierarchy"

export interface LinkDatum {
  source: d3.HierarchyPointNode<HierarchyNode>
  target: d3.HierarchyPointNode<HierarchyNode>
}

export interface LinkStyleConfig {
  style: 'curved' | 'straight' | 'step'
  strokeWidth: {
    default: number
    highlighted: number
  }
  colors: {
    default: string
    highlighted: string
    hover: string
  }
  opacity: {
    default: number
    dimmed: number
    highlighted: number
  }
  connectionDots: {
    enabled: boolean
    radius: number
    fill: string
    stroke: string
    strokeWidth: number
  }
  shadow: string
  animation: {
    duration: number
    easing: string
  }
}

export const defaultLinkStyleConfig: LinkStyleConfig = {
  style: 'curved',
  strokeWidth: {
    default: 2.5,
    highlighted: 3
  },
  colors: {
    default: "#94a3b8",
    highlighted: "#3b82f6",
    hover: "#3b82f6"
  },
  opacity: {
    default: 0.8,
    dimmed: 0.3,
    highlighted: 1
  },
  connectionDots: {
    enabled: true,
    radius: 4,
    fill: "#64748b",
    stroke: "#ffffff",
    strokeWidth: 2
  },
  shadow: "drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))",
  animation: {
    duration: 200,
    easing: "ease-in-out"
  }
}

export class LinkStyleManager {
  private config: LinkStyleConfig
  private nodeHeight: number

  constructor(config: LinkStyleConfig = defaultLinkStyleConfig, nodeHeight: number = 90) {
    this.config = config
    this.nodeHeight = nodeHeight
  }

  createLinkPath(d: LinkDatum): string {
    const source = d.source
    const target = d.target

    switch (this.config.style) {
      case 'curved':
        return this.createCurvedPath(source, target)
      case 'straight':
        return this.createStraightPath(source, target)
      case 'step':
        return this.createStepPath(source, target)
      default:
        return this.createCurvedPath(source, target)
    }
  }

  private createCurvedPath(source: d3.HierarchyPointNode<HierarchyNode>, target: d3.HierarchyPointNode<HierarchyNode>): string {
    const midY = (source.y + target.y) / 2
    return `M${source.x},${source.y + this.nodeHeight / 2}
            C${source.x},${midY} ${target.x},${midY} ${target.x},${target.y - this.nodeHeight / 2}`
  }

  private createStraightPath(source: d3.HierarchyPointNode<HierarchyNode>, target: d3.HierarchyPointNode<HierarchyNode>): string {
    return `M${source.x},${source.y + this.nodeHeight / 2} L${target.x},${target.y - this.nodeHeight / 2}`
  }

  private createStepPath(source: d3.HierarchyPointNode<HierarchyNode>, target: d3.HierarchyPointNode<HierarchyNode>): string {
    const midY = (source.y + target.y) / 2
    return `M${source.x},${source.y + this.nodeHeight / 2}
            L${source.x},${midY}
            L${target.x},${midY}
            L${target.x},${target.y - this.nodeHeight / 2}`
  }

  applyDefaultStyles(linkSelection: d3.Selection<SVGPathElement, LinkDatum, SVGGElement, unknown>): void {
    linkSelection
      .style("fill", "none")
      .style("stroke", this.config.colors.default)
      .style("stroke-width", this.config.strokeWidth.default + "px")
      .style("opacity", this.config.opacity.default)
      .style("filter", this.config.shadow)
  }

  applyConnectionDotStyles(dotSelection: d3.Selection<SVGCircleElement, LinkDatum, SVGGElement, unknown>): void {
    if (!this.config.connectionDots.enabled) return

    dotSelection
      .attr("r", this.config.connectionDots.radius)
      .style("fill", this.config.connectionDots.fill)
      .style("stroke", this.config.connectionDots.stroke)
      .style("stroke-width", this.config.connectionDots.strokeWidth + "px")
  }

  highlightConnectedLinks(
    linkSelection: d3.Selection<SVGPathElement, LinkDatum, SVGGElement, unknown>,
    nodeCode: string
  ): void {
    // Dim all links first
    linkSelection
      .style("opacity", this.config.opacity.dimmed)

    // Highlight connected links
    linkSelection
      .filter((link: LinkDatum) => 
        link.source.data.employee.empCode === nodeCode || 
        link.target.data.employee.empCode === nodeCode
      )
      .style("opacity", this.config.opacity.highlighted)
      .style("stroke", this.config.colors.highlighted)
      .style("stroke-width", this.config.strokeWidth.highlighted + "px")
  }

  resetLinks(linkSelection: d3.Selection<SVGPathElement, LinkDatum, SVGGElement, unknown>): void {
    linkSelection
      .style("opacity", this.config.opacity.default)
      .style("stroke", this.config.colors.default)
      .style("stroke-width", this.config.strokeWidth.default + "px")
  }

  // Add the missing attachHoverStyle method
  attachHoverStyle(
    nodeGroups: d3.Selection<SVGGElement, d3.HierarchyPointNode<HierarchyNode>, SVGGElement, unknown>,
    linkSelection: d3.Selection<SVGPathElement, LinkDatum, SVGGElement, unknown>
  ): void {
    nodeGroups
      .on("mouseenter.links", (_, d) => {
        this.highlightConnectedLinks(linkSelection, d.data.employee.empCode)
      })
      .on("mouseleave.links", () => {
        this.resetLinks(linkSelection)
      })
  }

  updateConfig(newConfig: Partial<LinkStyleConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }

  updateNodeHeight(nodeHeight: number): void {
    this.nodeHeight = nodeHeight
  }

  getConfig(): LinkStyleConfig {
    return { ...this.config }
  }
}