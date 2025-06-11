// NodeStyles.ts
import * as d3 from "d3"
import { HierarchyNode } from "@/lib/buildHierarchy"

export interface NodeStyleConfig {
  width: number
  height: number
  borderRadius: number
  strokeWidth: {
    default: number
    highlighted: number
    selected: number
  }
  colors: {
    ceo: {
      fill: string
      stroke: string
      gradient: { start: string; end: string }
    }
    manager: {
      fill: string
      stroke: string
      gradient: { start: string; end: string }
    }
    employee: {
      fill: string
      stroke: string
      gradient: { start: string; end: string }
    }
    department: {
      fill: string
      stroke: string
      gradient: { start: string; end: string }
    }
    default: {
      fill: string
      stroke: string
      gradient: { start: string; end: string }
    }
  }
  typography: {
    name: {
      fontSize: string
      fontWeight: string
      color: string
      letterSpacing: string
    }
    departmentName: {
      fontSize: string
      fontWeight: string
      color: string
      letterSpacing: string
    }
    empCode: {
      fontSize: string
      fontWeight: string
      color: string
      letterSpacing: string
    }
    designation: {
      fontSize: string
      fontWeight: string
      color: string
    }
  }
  shadows: {
    default: string
    hover: string
    selected: string
  }
  levelIndicator: {
    radius: number
    position: { x: number; y: number }
  }
}

export const defaultNodeStyleConfig: NodeStyleConfig = {
  width: 200,
  height: 90,
  borderRadius: 16,
  strokeWidth: {
    default: 2,
    highlighted: 4,
    selected: 4
  },
  colors: {
    ceo: {
      fill: "url(#ceo-gradient)",
      stroke: "#1e40af",
      gradient: { start: "#dbeafe", end: "#ffffff" }
    },
    manager: {
      fill: "url(#manager-gradient)",
      stroke: "#059669",
      gradient: { start: "#dcfce7", end: "#ffffff" }
    },
    employee: {
      fill: "url(#employee-gradient)",
      stroke: "#dc2626",
      gradient: { start: "#fef2f2", end: "#ffffff" }
    },
    department: {
      fill: "url(#department-gradient)",
      stroke: "#7c3aed",
      gradient: { start: "#f3e8ff", end: "#ffffff" }
    },
    default: {
      fill: "url(#default-gradient)",
      stroke: "#64748b",
      gradient: { start: "#f8fafc", end: "#ffffff" }
    }
  },
  typography: {
    name: {
      fontSize: "16px",
      fontWeight: "700",
      color: "#1f2937",
      letterSpacing: "0.025em"
    },
    departmentName: {
      fontSize: "18px",
      fontWeight: "700",
      color: "#1f2937",
      letterSpacing: "0.025em"
    },
    empCode: {
      fontSize: "12px",
      fontWeight: "600",
      color: "#6b7280",
      letterSpacing: "0.05em"
    },
    designation: {
      fontSize: "14px",
      fontWeight: "500",
      color: "#374151"
    }
  },
  shadows: {
    default: "drop-shadow(0 4px 12px rgba(0, 0, 0, 0.1)) drop-shadow(0 2px 4px rgba(0, 0, 0, 0.06))",
    hover: "drop-shadow(0 12px 25px rgba(59, 130, 246, 0.25)) drop-shadow(0 4px 10px rgba(0, 0, 0, 0.1))",
    selected: "drop-shadow(0 8px 25px rgba(124, 58, 237, 0.25)) drop-shadow(0 4px 10px rgba(0, 0, 0, 0.1))"
  },
  levelIndicator: {
    radius: 6,
    position: { x: -90, y: -35 } // Relative to node center
  }
}

export class NodeStyleManager {
  private config: NodeStyleConfig
  private defs: d3.Selection<SVGDefsElement, unknown, null, undefined>

  constructor(svg: d3.Selection<SVGSVGElement, unknown, null, undefined>, config: NodeStyleConfig = defaultNodeStyleConfig) {
    this.config = config
    this.defs = svg.append("defs")
    this.createGradients()
  }

  private createGradients(): void {
    const gradients = [
      { id: "ceo-gradient", ...this.config.colors.ceo.gradient },
      { id: "manager-gradient", ...this.config.colors.manager.gradient },
      { id: "employee-gradient", ...this.config.colors.employee.gradient },
      { id: "department-gradient", ...this.config.colors.department.gradient },
      { id: "default-gradient", ...this.config.colors.default.gradient }
    ]

    gradients.forEach(({ id, start, end }) => {
      const gradient = this.defs.append("linearGradient")
        .attr("id", id)
        .attr("x1", "0%").attr("y1", "0%")
        .attr("x2", "0%").attr("y2", "100%")
      
      gradient.append("stop").attr("offset", "0%").style("stop-color", start)
      gradient.append("stop").attr("offset", "100%").style("stop-color", end)
    })
  }

  getNodeStyle(node: d3.HierarchyPointNode<HierarchyNode>): {
    fill: string
    stroke: string
    strokeWidth: string
  } {
    if (node.data.employee.designation === 'Department') {
      return {
        fill: this.config.colors.department.fill,
        stroke: this.config.colors.department.stroke,
        strokeWidth: this.config.strokeWidth.default + "px"
      }
    }

    const level = node.data.level
    switch (level) {
      case 0:
        return {
          fill: this.config.colors.ceo.fill,
          stroke: this.config.colors.ceo.stroke,
          strokeWidth: "3px"
        }
      case 1:
        return {
          fill: this.config.colors.manager.fill,
          stroke: this.config.colors.manager.stroke,
          strokeWidth: this.config.strokeWidth.default + "px"
        }
      case 2:
        return {
          fill: this.config.colors.employee.fill,
          stroke: this.config.colors.employee.stroke,
          strokeWidth: this.config.strokeWidth.default + "px"
        }
      default:
        return {
          fill: this.config.colors.default.fill,
          stroke: this.config.colors.default.stroke,
          strokeWidth: this.config.strokeWidth.default + "px"
        }
    }
  }

  getLevelIndicatorColor(node: d3.HierarchyPointNode<HierarchyNode>): string {
    if (node.data.employee.designation === 'Department') {
      return this.config.colors.department.stroke
    }

    const level = node.data.level
    switch (level) {
      case 0: return this.config.colors.ceo.stroke
      case 1: return this.config.colors.manager.stroke
      case 2: return this.config.colors.employee.stroke
      default: return this.config.colors.default.stroke
    }
  }

  updateConfig(newConfig: Partial<NodeStyleConfig>): void {
    this.config = { ...this.config, ...newConfig }
    // Recreate gradients if colors changed
    if (newConfig.colors) {
      this.defs.selectAll("*").remove()
      this.createGradients()
    }
  }

  getConfig(): NodeStyleConfig {
    return { ...this.config }
  }
}