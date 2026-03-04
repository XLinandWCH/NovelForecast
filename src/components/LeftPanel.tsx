import React from 'react';
import { FileText, Network } from 'lucide-react';
import { useStore } from '../store/useStore';
import Mindmap from './Mindmap';

export default function LeftPanel() {
  const { files, selectedFileId, leftPanelMode, setLeftPanelMode } = useStore();
  const selectedFile = files.find(f => f.id === selectedFileId);

  return (
    <div className="flex flex-col h-full bg-[#f0f0f0]">
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
        </div>
        
        {selectedFile && (
          <div className="text-sm text-gray-500 truncate max-w-[200px]">
            {selectedFile.name}
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 bg-white overflow-hidden">
        {selectedFile ? (
          leftPanelMode === 'text' ? (
            <div className="h-full overflow-y-auto p-6 prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
              {selectedFile.content}
            </div>
          ) : (
            <Mindmap content={selectedFile.content} />
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
