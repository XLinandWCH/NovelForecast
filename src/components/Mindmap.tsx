import React, { useEffect, useRef } from 'react';
import { Markmap } from 'markmap-view';
import { Transformer } from 'markmap-lib';

interface MindmapProps {
  content: string;
}

const transformer = new Transformer();

export default function Mindmap({ content }: MindmapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const mmRef = useRef<Markmap | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    // Initialize Markmap only once
    if (!mmRef.current) {
      mmRef.current = Markmap.create(svgRef.current, {
        autoFit: true,
        color: (node) => {
          // Custom color palette for nodes based on depth
          const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
          return colors[node.depth % colors.length];
        },
        paddingX: 16,
        spacingHorizontal: 80,
        spacingVertical: 10,
      });
    }

    // Pre-process content to ensure it's valid markdown for mindmap
    let mdContent = content;
    
    // If the content doesn't look like markdown (no # or - or *), wrap it
    if (!mdContent.includes('#') && !mdContent.includes('- ') && !mdContent.includes('* ')) {
      const lines = mdContent.split('\n').filter(l => l.trim());
      if (lines.length > 0) {
        mdContent = `# ${lines[0].substring(0, 30)}\n`;
        lines.slice(1).forEach(line => {
          mdContent += `- ${line}\n`;
        });
      } else {
        mdContent = '# 空白文档';
      }
    }

    // Transform markdown to markmap data structure
    const { root } = transformer.transform(mdContent);

    // Update data and fit to screen
    if (mmRef.current) {
      mmRef.current.setData(root);
      mmRef.current.fit();
    }
  }, [content]);

  return (
    <div className="w-full h-full overflow-hidden bg-[#f8fafc] rounded-lg border border-slate-200 relative">
      {/* Background Grid Pattern */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-50"
        style={{
          backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}
      />
      
      {/* Markmap SVG Container */}
      <svg ref={svgRef} className="w-full h-full relative z-10 text-gray-800" />
      
      {/* Floating Toolbar / Hint */}
      <div className="absolute bottom-4 right-4 z-20 bg-white/80 backdrop-blur px-3 py-1.5 rounded-lg shadow-sm border border-gray-200 text-xs text-gray-500">
        支持鼠标滚轮缩放、拖拽平移
      </div>
    </div>
  );
}
