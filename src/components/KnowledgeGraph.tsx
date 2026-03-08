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
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(180))
      .force("charge", d3.forceManyBody().strength(-800))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide().radius((d: any) => 25 + (d.val || 5) * 1.5));

    // Define arrow markers for links
    svg.append("defs").selectAll("marker")
      .data(["positive", "negative", "neutral"])
      .join("marker")
      .attr("id", d => `arrow-${d}`)
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 32) // Adjusted for larger nodes
      .attr("refY", 0)
      .attr("markerWidth", 5)
      .attr("markerHeight", 5)
      .attr("orient", "auto")
      .append("path")
      .attr("fill", d => d === 'positive' ? '#10b981' : d === 'negative' ? '#ef4444' : '#9ca3af')
      .attr("d", "M0,-5L10,0L0,5");

    // Add glow filter for protagonist
    const defs = svg.select("defs");
    const filter = defs.append("filter")
      .attr("id", "glow")
      .attr("x", "-20%")
      .attr("y", "-20%")
      .attr("width", "140%")
      .attr("height", "140%");
    
    filter.append("feGaussianBlur")
      .attr("stdDeviation", "5")
      .attr("result", "blur");
    
    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "blur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    // Links (using paths for curved lines)
    const link = g.append("g")
      .selectAll("path")
      .data(links)
      .join("path")
      .attr("fill", "none")
      .attr("stroke", (d: any) => d.polarity === 'positive' ? '#10b981' : d.polarity === 'negative' ? '#ef4444' : '#9ca3af')
      .attr("stroke-width", (d: any) => d.polarity === 'positive' ? 2.5 : 1.5)
      .attr("stroke-opacity", 0.6)
      .attr("marker-end", (d: any) => `url(#arrow-${d.polarity})`)
      .attr("class", "link-path transition-opacity duration-200");

    // Link labels background
    const linkLabelBg = g.append("g")
      .selectAll("rect")
      .data(links)
      .join("rect")
      .attr("fill", "white")
      .attr("fill-opacity", 0.8)
      .attr("rx", 4)
      .attr("ry", 4)
      .attr("class", "link-label-bg transition-opacity duration-200");

    // Link labels
    const linkText = g.append("g")
      .selectAll("text")
      .data(links)
      .join("text")
      .text((d: any) => d.label)
      .attr("font-size", 11)
      .attr("font-weight", "500")
      .attr("fill", (d: any) => d.polarity === 'positive' ? '#059669' : d.polarity === 'negative' ? '#b91c1c' : '#4b5563')
      .attr("text-anchor", "middle")
      .attr("dy", 4)
      .attr("class", "select-none pointer-events-none link-text transition-opacity duration-200");

    // Nodes
    const nodeGroup = g.append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .attr("class", "node-group cursor-pointer")
      .call(d3.drag<SVGGElement, any>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

    // Node circles
    nodeGroup.append("circle")
      .attr("r", (d: any) => d.group === 1 ? 25 + (d.val || 10) : 15 + (d.val || 5))
      .attr("fill", (d: any) => {
        switch(d.group) {
          case 1: return '#3b82f6'; // Protagonist (Blue)
          case 2: return '#ef4444'; // Villain (Red)
          case 3: return '#8b5cf6'; // Important Support (Purple)
          default: return '#10b981'; // Normal Character (Green)
        }
      })
      .attr("stroke", (d: any) => d.group === 1 ? '#bfdbfe' : '#ffffff')
      .attr("stroke-width", (d: any) => d.group === 1 ? 4 : 2)
      .attr("filter", (d: any) => d.group === 1 ? "url(#glow)" : null)
      .attr("class", "transition-all duration-200");

    // Node labels
    nodeGroup.append("text")
      .text((d: any) => d.name)
      .attr("font-size", (d: any) => d.group === 1 ? 16 : 13)
      .attr("font-weight", (d: any) => d.group === 1 ? "bold" : "600")
      .attr("fill", "#1f2937")
      .attr("text-anchor", "middle")
      .attr("dy", (d: any) => d.group === 1 ? 45 + (d.val || 10) : 30 + (d.val || 5))
      .attr("class", "select-none pointer-events-none drop-shadow-sm");

    // Interactive Hover Effects
    nodeGroup.on("mouseover", function(event, d: any) {
      // Dim all nodes and links
      nodeGroup.style("opacity", 0.2);
      link.style("opacity", 0.1);
      linkLabelBg.style("opacity", 0.1);
      linkText.style("opacity", 0.1);

      // Highlight connected nodes and links
      const connectedNodeIds = new Set([d.id]);
      
      link.filter((l: any) => {
        if (l.source.id === d.id || l.target.id === d.id) {
          connectedNodeIds.add(l.source.id);
          connectedNodeIds.add(l.target.id);
          return true;
        }
        return false;
      }).style("opacity", 1).attr("stroke-width", 3);

      linkLabelBg.filter((l: any) => l.source.id === d.id || l.target.id === d.id).style("opacity", 0.9);
      linkText.filter((l: any) => l.source.id === d.id || l.target.id === d.id).style("opacity", 1).attr("font-weight", "bold");

      nodeGroup.filter((n: any) => connectedNodeIds.has(n.id))
        .style("opacity", 1)
        .select("circle")
        .attr("stroke", "#fbbf24")
        .attr("stroke-width", 4);
        
      d3.select(this).select("circle").attr("stroke", "#f59e0b").attr("stroke-width", 5);
    })
    .on("mouseout", function() {
      // Restore all
      nodeGroup.style("opacity", 1).select("circle")
        .attr("stroke", (d: any) => d.group === 1 ? '#bfdbfe' : '#ffffff')
        .attr("stroke-width", (d: any) => d.group === 1 ? 4 : 2);
        
      link.style("opacity", 0.6).attr("stroke-width", (d: any) => d.polarity === 'positive' ? 2.5 : 1.5);
      linkLabelBg.style("opacity", 0.8);
      linkText.style("opacity", 1).attr("font-weight", "500");
    });

    simulation.on("tick", () => {
      // Curved links
      link.attr("d", (d: any) => {
        const dx = d.target.x - d.source.x;
        const dy = d.target.y - d.source.y;
        const dr = Math.sqrt(dx * dx + dy * dy) * 1.5; // Curve radius
        return `M${d.source.x},${d.source.y}A${dr},${dr} 0 0,1 ${d.target.x},${d.target.y}`;
      });

      // Position link labels at the center of the curve
      const getPointOnArc = (d: any) => {
        const dx = d.target.x - d.source.x;
        const dy = d.target.y - d.source.y;
        const dr = Math.sqrt(dx * dx + dy * dy) * 1.5;
        // Approximation for label position on the curve
        return {
          x: (d.source.x + d.target.x) / 2 + dy * 0.15,
          y: (d.source.y + d.target.y) / 2 - dx * 0.15
        };
      };

      linkText
        .attr("x", (d: any) => getPointOnArc(d).x)
        .attr("y", (d: any) => getPointOnArc(d).y);

      linkLabelBg
        .attr("x", (d: any) => getPointOnArc(d).x - (d.label.length * 6))
        .attr("y", (d: any) => getPointOnArc(d).y - 10)
        .attr("width", (d: any) => d.label.length * 12)
        .attr("height", 16);

      nodeGroup.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
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
    <div className="w-full h-full bg-[#fafafa] relative overflow-hidden rounded-lg">
      <svg ref={svgRef} className="w-full h-full" />
      
      {/* Legend */}
      <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-md p-4 rounded-xl shadow-lg border border-gray-100 text-sm">
        <div className="font-bold mb-3 text-gray-800 flex items-center gap-2">
          <span className="w-1.5 h-4 bg-[#07c160] rounded-full"></span>
          图谱图例
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[#3b82f6] shadow-[0_0_8px_rgba(59,130,246,0.6)] border-2 border-blue-200"></div>
            <span className="font-medium text-gray-700">主角</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[#ef4444] border-2 border-white shadow-sm"></div>
            <span className="text-gray-600">反派</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[#8b5cf6] border-2 border-white shadow-sm"></div>
            <span className="text-gray-600">重要配角</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[#10b981] border-2 border-white shadow-sm"></div>
            <span className="text-gray-600">普通角色</span>
          </div>
          <div className="col-span-2 h-px bg-gray-100 my-1"></div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-0.5 bg-[#10b981]"></div>
            <span className="text-gray-600 text-xs">友好/亲密</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-0.5 bg-[#ef4444]"></div>
            <span className="text-gray-600 text-xs">敌对/仇恨</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-0.5 bg-[#9ca3af]"></div>
            <span className="text-gray-600 text-xs">中立/复杂</span>
          </div>
        </div>
      </div>
    </div>
  );
}
