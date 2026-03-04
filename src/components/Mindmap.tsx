import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface MindmapProps {
  content: string;
}

interface TreeNode {
  name: string;
  children?: TreeNode[];
}

// Simple parser to convert text into a tree structure
const parseTextToTree = (text: string): TreeNode => {
  const lines = text.split('\\n').filter(line => line.trim() !== '');
  if (lines.length === 0) return { name: 'Empty' };

  const root: TreeNode = { name: '文档大纲', children: [] };
  
  let currentH1: TreeNode | null = null;
  let currentH2: TreeNode | null = null;
  let currentH3: TreeNode | null = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('# ')) {
      currentH1 = { name: trimmed.replace('# ', '').substring(0, 30), children: [] };
      root.children!.push(currentH1);
      currentH2 = null;
      currentH3 = null;
    } else if (trimmed.startsWith('## ')) {
      currentH2 = { name: trimmed.replace('## ', '').substring(0, 30), children: [] };
      if (currentH1) {
        currentH1.children!.push(currentH2);
      } else {
        root.children!.push(currentH2);
      }
      currentH3 = null;
    } else if (trimmed.startsWith('### ')) {
      currentH3 = { name: trimmed.replace('### ', '').substring(0, 30), children: [] };
      if (currentH2) {
        currentH2.children!.push(currentH3);
      } else if (currentH1) {
        currentH1.children!.push(currentH3);
      } else {
        root.children!.push(currentH3);
      }
    } else if (trimmed.length > 0) {
      // It's a paragraph
      const textNode = { name: trimmed.substring(0, 20) + (trimmed.length > 20 ? '...' : '') };
      if (currentH3) {
        if (currentH3.children!.length < 5) currentH3.children!.push(textNode);
      } else if (currentH2) {
        if (currentH2.children!.length < 5) currentH2.children!.push(textNode);
      } else if (currentH1) {
        if (currentH1.children!.length < 5) currentH1.children!.push(textNode);
      } else {
        if (root.children!.length < 10) root.children!.push(textNode);
      }
    }
  }

  // If no markdown headings were found, fallback to chunking
  if (root.children!.length === 0 || (root.children!.length > 0 && !root.children![0].children)) {
    root.name = lines[0].substring(0, 30) + (lines[0].length > 30 ? '...' : '');
    root.children = [];
    const chunks = [];
    let currentChunk = '';
    for (let i = 1; i < lines.length; i++) {
      currentChunk += lines[i] + ' ';
      if (currentChunk.length > 100 || i === lines.length - 1) {
        chunks.push(currentChunk.trim());
        currentChunk = '';
      }
    }

    chunks.slice(0, 10).forEach((chunk, index) => {
      root.children!.push({
        name: `段落 ${index + 1}`,
        children: [{ name: chunk.substring(0, 40) + (chunk.length > 40 ? '...' : '') }]
      });
    });

    if (chunks.length > 10) {
      root.children!.push({ name: `...还有 ${chunks.length - 10} 个段落` });
    }
  }

  return root;
};

export default function Mindmap({ content }: MindmapProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !content) return;

    const data = parseTextToTree(content);

    const width = svgRef.current.clientWidth || 800;
    const height = svgRef.current.clientHeight || 600;
    const margin = { top: 20, right: 120, bottom: 20, left: 120 };

    // Clear previous
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const root = d3.hierarchy(data);
    const treeLayout = d3.tree<TreeNode>().size([height - margin.top - margin.bottom, width - margin.left - margin.right]);
    
    treeLayout(root);

    // Links
    svg.selectAll('.link')
      .data(root.links())
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('fill', 'none')
      .attr('stroke', '#ccc')
      .attr('stroke-width', 1.5)
      .attr('d', d3.linkHorizontal<d3.HierarchyPointLink<TreeNode>, d3.HierarchyPointNode<TreeNode>>()
        .x(d => d.y)
        .y(d => d.x)
      );

    // Nodes
    const node = svg.selectAll('.node')
      .data(root.descendants())
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.y},${d.x})`);

    node.append('circle')
      .attr('r', 6)
      .attr('fill', d => d.children ? '#07c160' : '#999')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);

    node.append('text')
      .attr('dy', 3)
      .attr('x', d => d.children ? -10 : 10)
      .style('text-anchor', d => d.children ? 'end' : 'start')
      .style('font-size', '12px')
      .style('fill', '#333')
      .text(d => d.data.name)
      .clone(true).lower()
      .attr('stroke', 'white')
      .attr('stroke-width', 3);

    // Add zoom capabilities
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 2])
      .on('zoom', (event) => {
        svg.attr('transform', event.transform);
      });

    d3.select(svgRef.current).call(zoom);

  }, [content]);

  return (
    <div className="w-full h-full overflow-hidden bg-white">
      <svg ref={svgRef} className="w-full h-full cursor-move" />
    </div>
  );
}
