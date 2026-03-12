import React, { useState } from 'react';
import { FileText, Network, Share2, Loader2, RefreshCw } from 'lucide-react';
import { useStore } from '../store/useStore';
import Mindmap from './Mindmap';
import KnowledgeGraph from './KnowledgeGraph';
import { generateGraphData } from '../utils/aiClient';

export default function LeftPanel() {
  const { files, selectedFileId, leftPanelMode, setLeftPanelMode, graphData, setGraphData, settings } = useStore();
  const [isGeneratingGraph, setIsGeneratingGraph] = useState(false);
  const selectedFile = files.find(f => f.id === selectedFileId);

  const handleGenerateGraph = async () => {
    if (!selectedFile) return;
    setIsGeneratingGraph(true);
    try {
      const data = await generateGraphData(selectedFile.content, settings);
      if (data && data.nodes && data.links) {
        setGraphData(data);
      } else {
        alert('生成的图谱数据格式不正确');
      }
    } catch (error: any) {
      alert(`生成图谱失败: ${error.message}`);
    } finally {
      setIsGeneratingGraph(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full min-w-0 bg-[#f0f0f0] overflow-hidden">
      {/* Header */}
      <div className="h-14 border-b border-gray-300 flex items-center justify-between px-4 bg-[#f5f5f5]">
            <div className="flex bg-gray-200 rounded-lg p-1">
              <button
                onClick={() => setLeftPanelMode('text')}
                className={`px-3 py-1 text-sm rounded-md transition-colors flex items-center gap-2 ${
                  leftPanelMode === 'text' ? 'bg-white shadow-sm text-[#07c160]' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <FileText size={16} />
                文本视图
              </button>
              <button
                onClick={() => setLeftPanelMode('mindmap')}
                className={`px-3 py-1 text-sm rounded-md transition-colors flex items-center gap-2 ${
                  leftPanelMode === 'mindmap' ? 'bg-white shadow-sm text-[#07c160]' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Network size={16} />
                导图视图
              </button>
              <button
                onClick={() => setLeftPanelMode('graph')}
                className={`px-3 py-1 text-sm rounded-md transition-colors flex items-center gap-2 ${
                  leftPanelMode === 'graph' ? 'bg-white shadow-sm text-[#07c160]' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Share2 size={16} />
                关系图谱
              </button>
            </div>
            
            {selectedFile && (
              <div className="text-sm text-gray-500 truncate max-w-[200px]">
                {selectedFile.name}
              </div>
            )}
          </div>

          {/* Content Area */}
          <div className="flex-1 bg-white overflow-hidden relative">
            {selectedFile ? (
              leftPanelMode === 'text' ? (
                <div className="h-full overflow-y-auto p-6 prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
                  {selectedFile.content}
                </div>
              ) : leftPanelMode === 'mindmap' ? (
                <Mindmap content={selectedFile.content} />
              ) : (
                <div className="h-full flex flex-col">
                  {!graphData ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-4 text-gray-500">
                      <Share2 size={48} className="text-gray-300" />
                      <p>尚未生成人物关系图谱</p>
                      <button
                        onClick={handleGenerateGraph}
                        disabled={isGeneratingGraph}
                        className="flex items-center gap-2 px-4 py-2 bg-[#07c160] hover:bg-[#06ad56] text-white rounded-md transition-colors disabled:opacity-50"
                      >
                        {isGeneratingGraph ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                        {isGeneratingGraph ? '正在分析文本生成图谱...' : '基于当前文本生成图谱'}
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="absolute top-4 right-4 z-10">
                        <button
                          onClick={handleGenerateGraph}
                          disabled={isGeneratingGraph}
                          className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-md shadow-sm transition-colors text-sm disabled:opacity-50"
                        >
                          {isGeneratingGraph ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                          重新生成
                        </button>
                      </div>
                      <KnowledgeGraph data={graphData} />
                    </>
                  )}
                </div>
              )
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 flex-col gap-4">
                <FileText size={48} className="text-gray-300" />
                <p>请在左侧选择或上传一个文件以查看内容</p>
              </div>
            )}
          </div>
    </div>
  );
}
