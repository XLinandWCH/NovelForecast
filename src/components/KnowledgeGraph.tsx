import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { GraphData, GraphNode, GraphLink } from '../store/useStore';

interface KnowledgeGraphProps {
  data: GraphData;
}

export default function KnowledgeGraph({ data }: KnowledgeGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data || !data.nodes || !data.links) return;

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const g = svg.append("g");

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on("zoom", (e) => {
        g.attr("transform", e.transform);
      });

    svg.call(zoom);

    // Create a copy of the data to avoid mutating the store directly
    const nodes = data.nodes.map(d => ({ ...d })) as (d3.SimulationNodeDatum & GraphNode)[];
    const links = data.links.map(d => ({ ...d })) as (d3.SimulationLinkDatum<d3.SimulationNodeDatum & GraphNode> & GraphLink)[];

    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(150))
      .force("charge", d3.forceManyBody().strength(-400))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide().radius((d: any) => 15 + (d.val || 5)));

    // Define arrow markers for links
    svg.append("defs").selectAll("marker")
      .data(["positive", "negative", "neutral"])
      .join("marker")
      .attr("id", d => `arrow-${d}`)
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 25) // Adjust based on node radius
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("fill", d => d === 'positive' ? '#10b981' : d === 'negative' ? '#ef4444' : '#9ca3af')
      .attr("d", "M0,-5L10,0L0,5");

    // Links
    const link = g.append("g")
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke", (d: any) => d.polarity === 'positive' ? '#10b981' : d.polarity === 'negative' ? '#ef4444' : '#9ca3af')
      .attr("stroke-width", 2)
      .attr("stroke-opacity", 0.6)
      .attr("marker-end", (d: any) => `url(#arrow-${d.polarity})`);

    // Link labels
    const linkText = g.append("g")
      .selectAll("text")
      .data(links)
      .join("text")
      .text((d: any) => d.label)
      .attr("font-size", 10)
      .attr("fill", "#6b7280")
      .attr("text-anchor", "middle")
      .attr("dy", -5)
      .attr("class", "select-none pointer-events-none");

    // Nodes
    const node = g.append("g")
      .selectAll("circle")
      .data(nodes)
      .join("circle")
      .attr("r", (d: any) => 10 + (d.val || 5))
      .attr("fill", (d: any) => d.group === 1 ? '#3b82f6' : d.group === 2 ? '#ef4444' : '#10b981')
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .call(d3.drag<SVGCircleElement, any>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

    // Node labels
    const nodeText = g.append("g")
      .selectAll("text")
      .data(nodes)
      .join("text")
      .text((d: any) => d.name)
      .attr("font-size", 12)
      .attr("font-weight", "bold")
      .attr("fill", "#374151")
      .attr("dx", (d: any) => 15 + (d.val || 5))
      .attr("dy", 4)
      .attr("class", "select-none pointer-events-none");

    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      linkText
        .attr("x", (d: any) => (d.source.x + d.target.x) / 2)
        .attr("y", (d: any) => (d.source.y + d.target.y) / 2);

      node
        .attr("cx", (d: any) => d.x)
        .attr("cy", (d: any) => d.y);

      nodeText
        .attr("x", (d: any) => d.x)
        .attr("y", (d: any) => d.y);
    });

    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return () => {
      simulation.stop();
    };
  }, [data]);

  return (
    <div className="w-full h-full bg-white relative overflow-hidden">
      <svg ref={svgRef} className="w-full h-full" />
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur p-3 rounded-lg shadow-sm border border-gray-200 text-xs">
        <div className="font-semibold mb-2 text-gray-700">图例</div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#3b82f6]"></div>
            <span>主角阵营</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#ef4444]"></div>
            <span>反派阵营</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#10b981]"></div>
            <span>其他角色</span>
          </div>
          <div className="h-px bg-gray-200 my-1"></div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-[#10b981]"></div>
            <span>友好关系</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-[#ef4444]"></div>
            <span>敌对关系</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-[#9ca3af]"></div>
            <span>中立关系</span>
          </div>
        </div>
      </div>
    </div>
  );
}
