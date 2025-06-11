// components/NodeGradients.tsx


// components/NodeContainer.tsx
import * as d3 from 'd3';
import { NodeDatum, ChartConfig, HierarchyNode } from '@/lib/types';



export class NodeContainer {
  private nodeGroup: d3.Selection<SVGGElement, NodeDatum, SVGGElement, unknown>;
  private config: ChartConfig;

  constructor(nodeGroup: d3.Selection<SVGGElement, NodeDatum, SVGGElement, unknown>, config: ChartConfig) {
    this.nodeGroup = nodeGroup;
    this.config = config;
  }

  private getNodeFill(d: NodeDatum): string {
    if (d.data.employee.designation === 'Department') {
      return "url(#department-gradient)";
    }
    const level = d.data.level;
    if (level === 0) return "url(#ceo-gradient)";
    if (level === 1) return "url(#manager-gradient)";
    if (level === 2) return "url(#employee-gradient)";
    return "url(#default-gradient)";
  }

  private getNodeStroke(d: NodeDatum): string {
    if (d.data.employee.designation === 'Department') {
      return "#7c3aed";
    }
    const level = d.data.level;
    if (level === 0) return "#1e40af";
    if (level === 1) return "#059669";
    if (level === 2) return "#dc2626";
    return "#64748b";
  }

  render(): void {
    this.nodeGroup
      .append("rect")
      .attr("x", -this.config.nodeWidth / 2)
      .attr("y", -this.config.nodeHeight / 2)
      .attr("width", this.config.nodeWidth)
      .attr("height", this.config.nodeHeight)
      .attr("rx", 16)
      .style("fill", this.getNodeFill)
      .style("stroke", this.getNodeStroke)
      .style("stroke-width", (d) => d.data.level === 0 ? "3px" : "2px")
      .style("filter", "drop-shadow(0 4px 12px rgba(0, 0, 0, 0.1)) drop-shadow(0 2px 4px rgba(0, 0, 0, 0.06))");
  }
}

// components/NodeIndicator.tsx
export class NodeIndicator {
  private nodeGroup: d3.Selection<SVGGElement, NodeDatum, SVGGElement, unknown>;
  private config: ChartConfig;

  constructor(nodeGroup: d3.Selection<SVGGElement, NodeDatum, SVGGElement, unknown>, config: ChartConfig) {
    this.nodeGroup = nodeGroup;
    this.config = config;
  }

  private getIndicatorColor(d: NodeDatum): string {
    if (d.data.employee.designation === 'Department') {
      return "#7c3aed";
    }
    const level = d.data.level;
    if (level === 0) return "#1e40af";
    if (level === 1) return "#059669";
    if (level === 2) return "#dc2626";
    return "#64748b";
  }

  render(): void {
    this.nodeGroup
      .append("circle")
      .attr("cx", -this.config.nodeWidth / 2 + 20)
      .attr("cy", -this.config.nodeHeight / 2 + 20)
      .attr("r", 6)
      .style("fill", this.getIndicatorColor);
  }
}

// components/NodeText.tsx
export class NodeText {
  private nodeGroup: d3.Selection<SVGGElement, NodeDatum, SVGGElement, unknown>;
  private config: ChartConfig;

  constructor(nodeGroup: d3.Selection<SVGGElement, NodeDatum, SVGGElement, unknown>, config: ChartConfig) {
    this.nodeGroup = nodeGroup;
    this.config = config;
  }

  private truncateText(text: string, maxLength: number): string {
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  }

  renderEmployeeName(): void {
    this.nodeGroup
      .append("text")
      .attr("dy", (d) => {
        return d.data.employee.designation === 'Department' ? 0 : -20;
      })
      .attr("text-anchor", "middle")
      .style("font-weight", "700")
      .style("font-size", (d) => {
        return d.data.employee.designation === 'Department' ? "18px" : "16px";
      })
      .style("fill", "#1f2937")
      .style("letter-spacing", "0.025em")
      .text((d) => {
        if (d.data.employee.designation === 'Department') {
          return d.data.employee.department;
        }
        const name = d.data.employee.empName || "Unknown";
        return this.truncateText(name, 25);
      });
  }

  renderEmployeeCode(): void {
    this.nodeGroup
      .filter((d) => d.data.employee.designation !== 'Department')
      .append("text")
      .attr("dy", -2)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .style("fill", "#6b7280")
      .style("font-weight", "600")
      .style("letter-spacing", "0.05em")
      .text((d) => `ID: ${d.data.employee.empCode}`);
  }

  renderDesignation(): void {
    this.nodeGroup
      .filter((d) => d.data.employee.designation !== 'Department')
      .append("text")
      .attr("dy", 18)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .style("fill", "#374151")
      .style("font-weight", "500")
      .text((d) => {
        const designation = d.data.employee.designation || "";
        return this.truncateText(designation, 30);
      });
  }

  render(): void {
    this.renderEmployeeName();
    this.renderEmployeeCode();
    this.renderDesignation();
  }
}

// components/NodeInteractions.tsx
interface D3MouseEvent extends MouseEvent {
  pageX: number;
  pageY: number;
}

export class NodeInteractions {
  private nodeGroup: d3.Selection<SVGGElement, NodeDatum, SVGGElement, unknown>;
  private chartGroup: d3.Selection<SVGGElement, unknown, null, undefined>;

  constructor(
    nodeGroup: d3.Selection<SVGGElement, NodeDatum, SVGGElement, unknown>,
    chartGroup: d3.Selection<SVGGElement, unknown, null, undefined>
  ) {
    this.nodeGroup = nodeGroup;
    this.chartGroup = chartGroup;
  }

  private createTooltip(d: NodeDatum, event: D3MouseEvent): void {
    const tooltip = d3.select("body").append("div")
      .attr("class", "org-chart-tooltip")
      .style("position", "absolute")
      .style("background", "linear-gradient(135deg, rgba(17, 24, 39, 0.95), rgba(31, 41, 55, 0.95))")
      .style("color", "white")
      .style("padding", "16px 20px")
      .style("border-radius", "12px")
      .style("font-size", "14px")
      .style("font-weight", "500")
      .style("pointer-events", "none")
      .style("opacity", 0)
      .style("z-index", "1000")
      .style("backdrop-filter", "blur(16px)")
      .style("border", "1px solid rgba(255, 255, 255, 0.1)")
      .style("box-shadow", "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)")
      .html(`
        <div style="font-weight: 700; margin-bottom: 8px; color: #f3f4f6; font-size: 16px;">${d.data.employee.empName}</div>
        <div style="margin-bottom: 6px; color: #d1d5db; font-weight: 600;">${d.data.employee.designation}</div>
        <div style="margin-bottom: 6px; color: #d1d5db;">${d.data.employee.department}</div>
        <div style="margin-bottom: 6px; color: #9ca3af;">${d.data.employee.location}</div>
        <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(255, 255, 255, 0.1); color: #9ca3af; font-size: 12px;">
          Level: ${d.data.level} • Children: ${d.children ? d.children.length : 0}
        </div>
      `);
    
    tooltip.transition()
      .duration(200)
      .style("opacity", 1)
      .style("left", (event.pageX + 15) + "px")
      .style("top", (event.pageY - 10) + "px");
  }

private highlightConnectedPaths(d: NodeDatum): void {
  const empCode = d.data.employee.empCode;

  this.chartGroup
    .selectAll<SVGPathElement, d3.HierarchyPointLink<HierarchyNode>>(".link")
    .style("opacity", 0.3)
    .filter((link) =>
      link.source.data.employee.empCode === empCode ||
      link.target.data.employee.empCode === empCode
    )
    .style("opacity", 1)
    .style("stroke", "#3b82f6")
    .style("stroke-width", "3px");
}




  private resetConnectedPaths(): void {
    this.chartGroup.selectAll(".link")
      .style("opacity", 0.8)
      .style("stroke", "#94a3b8")
      .style("stroke-width", "2.5px");
  }

  private getNodeStrokeColor(d: NodeDatum): string {
    if (d.data.employee.designation === 'Department') {
      return "#7c3aed";
    }
    const level = d.data.level;
    if (level === 0) return "#1e40af";
    if (level === 1) return "#059669";
    if (level === 2) return "#dc2626";
    return "#64748b";
  }

render(): void {
  this.nodeGroup
    .style("cursor", "pointer")
    .on("mouseover", (event: D3MouseEvent, d: NodeDatum) => {
      // Highlight the node
      d3.select(event.currentTarget as SVGGElement).select("rect")
        .style("stroke", "#3b82f6")
        .style("stroke-width", "4px")
        .style("filter", "drop-shadow(0 12px 25px rgba(59, 130, 246, 0.25)) drop-shadow(0 4px 10px rgba(0, 0, 0, 0.1))")
        .transition()
        .duration(200)
        .style("transform", "scale(1.02)");

      this.highlightConnectedPaths(d);
      this.createTooltip(d, event);
    })
    .on("mouseout", (event: D3MouseEvent, d: NodeDatum) => {
      // Reset node styling
      d3.select(event.currentTarget as SVGGElement).select("rect")
        .style("stroke", this.getNodeStrokeColor(d))
        .style("stroke-width", d.data.level === 0 ? "3px" : "2px")
        .style("filter", "drop-shadow(0 4px 12px rgba(0, 0, 0, 0.1)) drop-shadow(0 2px 4px rgba(0, 0, 0, 0.06))")
        .style("transform", "scale(1)");

      this.resetConnectedPaths();
      d3.selectAll(".org-chart-tooltip").remove();
    })
    .on("click", (event: D3MouseEvent) => {
      // Reset all nodes
      d3.selectAll<SVGRectElement, NodeDatum>(".node rect")
        .style("stroke", (d) => {
          const level = d.data.level;
          if (level === 0) return "#1e40af";
          if (level === 1) return "#059669";
          if (level === 2) return "#dc2626";
          return "#64748b";
        })
        .style("stroke-width", (d) => (d.data.level === 0 ? "3px" : "2px"));

      // Highlight selected node
      d3.select(event.currentTarget as SVGGElement).select("rect")
        .style("stroke", "#7c3aed")
        .style("stroke-width", "4px")
        .style("filter", "drop-shadow(0 8px 25px rgba(124, 58, 237, 0.25)) drop-shadow(0 4px 10px rgba(0, 0, 0, 0.1))");
    });
}

}

// components/ConnectionLines.tsx
interface LinkDatum {
  source: d3.HierarchyPointNode<HierarchyNode>;
  target: d3.HierarchyPointNode<HierarchyNode>;
}

export class ConnectionLines {
  private chartGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
  private config: ChartConfig;

  constructor(
    chartGroup: d3.Selection<SVGGElement, unknown, null, undefined>,
    config: ChartConfig
  ) {
    this.chartGroup = chartGroup;
    this.config = config;
  }

  private createLinkPath = (d: LinkDatum): string => {
    const source = d.source;
    const target = d.target;

    if (this.config.linkStyle === 'curved') {
      const midY = (source.y + target.y) / 2;
      return `M${source.x},${source.y + this.config.nodeHeight / 2}
              C${source.x},${midY} ${target.x},${midY} ${target.x},${target.y - this.config.nodeHeight / 2}`;
    } else if (this.config.linkStyle === 'straight') {
      return `M${source.x},${source.y + this.config.nodeHeight / 2} L${target.x},${target.y - this.config.nodeHeight / 2}`;
    } else {
      // Step-style connection
      const midY = (source.y + target.y) / 2;
      return `M${source.x},${source.y + this.config.nodeHeight / 2}
              L${source.x},${midY}
              L${target.x},${midY}
              L${target.x},${target.y - this.config.nodeHeight / 2}`;
    }
  };

  renderLinks(links: LinkDatum[]): void {
    const linkGroup = this.chartGroup.append("g").attr("class", "links");
    
    linkGroup.selectAll(".link")
      .data(links)
      .enter()
      .append("path")
      .attr("class", "link")
      .attr("d", this.createLinkPath)
      .style("fill", "none")
      .style("stroke", "#94a3b8")
      .style("stroke-width", "2.5px")
      .style("opacity", 0.8)
      .style("filter", "drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))");
  }

  renderConnectionDots(links: LinkDatum[]): void {
    const linkGroup = this.chartGroup.select(".links");
    
    linkGroup.selectAll(".connection-dot")
      .data(links)
      .enter()
      .append("circle")
      .attr("class", "connection-dot")
      .attr("cx", d => d.source.x)
      .attr("cy", d => d.source.y + this.config.nodeHeight / 2)
      .attr("r", 4)
      .style("fill", "#64748b")
      .style("stroke", "#ffffff")
      .style("stroke-width", "2px");
  }

  render(links: LinkDatum[]): void {
    this.renderLinks(links);
    this.renderConnectionDots(links);
  }
}

// components/OrganizationalNode.tsx
export class OrganizationalNode {
  private nodeGroup: d3.Selection<SVGGElement, NodeDatum, SVGGElement, unknown>;
  private chartGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
  private config: ChartConfig;

  constructor(
    nodeGroup: d3.Selection<SVGGElement, NodeDatum, SVGGElement, unknown>,
    chartGroup: d3.Selection<SVGGElement, unknown, null, undefined>,
    config: ChartConfig
  ) {
    this.nodeGroup = nodeGroup;
    this.chartGroup = chartGroup;
    this.config = config;
  }

  render(): void {
    // Render node container
    const nodeContainer = new NodeContainer(this.nodeGroup, this.config);
    nodeContainer.render();

    // Render level indicator
    const nodeIndicator = new NodeIndicator(this.nodeGroup, this.config);
    nodeIndicator.render();

    // Render text elements
    const nodeText = new NodeText(this.nodeGroup, this.config);
    nodeText.render();

    // Add interactions
    const nodeInteractions = new NodeInteractions(this.nodeGroup, this.chartGroup);
    nodeInteractions.render();
  }
}