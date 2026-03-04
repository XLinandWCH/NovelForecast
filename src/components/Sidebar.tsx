import React, { useState } from 'react';
import { Upload, File, Trash2, MessageSquare, Plus } from 'lucide-react';
import { useStore } from '../store/useStore';
import UploadModal from './UploadModal';

export default function Sidebar() {
  const { 
    activeNav, 
    files, removeFile, selectedFileId, setSelectedFileId,
    sessions, activeSessionId, setActiveSessionId, addSession, removeSession
  } = useStore();
  
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  if (activeNav === 'chat') {
    return (
      <div className="flex flex-col h-full bg-[#ebebeb] border-r border-gray-300 min-w-[150px]">
        <div className="h-14 border-b border-gray-300 flex items-center justify-between px-4 bg-[#f5f5f5] overflow-hidden">
          <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">历史会话</span>
          <button 
            onClick={addSession}
            className="p-1.5 text-gray-500 hover:text-[#07c160] hover:bg-white rounded-md transition-colors flex-shrink-0"
          >
            <Plus size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {sessions.map(session => (
            <div 
              key={session.id}
              onClick={() => setActiveSessionId(session.id)}
              className={`group flex items-center justify-between p-3 cursor-pointer border-l-4 transition-colors ${
                activeSessionId === session.id 
                  ? 'border-[#07c160] bg-[#dcdcdc]' 
                  : 'border-transparent hover:bg-[#e0e0e0]'
              }`}
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <MessageSquare size={16} className={activeSessionId === session.id ? 'text-[#07c160]' : 'text-gray-500'} />
                <span className="text-sm truncate text-gray-700">{session.title}</span>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  removeSession(session.id);
                }}
                className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#ebebeb] border-r border-gray-300 min-w-[150px]">
      <div className="h-14 border-b border-gray-300 flex items-center justify-between px-4 bg-[#f5f5f5] overflow-hidden">
        <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">知识库文件</span>
      </div>
      
      <div className="p-3 border-b border-gray-300">
        <button 
          onClick={() => setIsUploadModalOpen(true)}
          className="w-full flex items-center justify-center gap-2 text-sm bg-[#07c160] hover:bg-[#06ad56] text-white px-3 py-2 rounded-md transition-colors shadow-sm"
        >
          <Upload size={16} />
          上传文件
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {files.length === 0 ? (
          <div className="p-4 text-sm text-gray-400 text-center">
            暂无文件
          </div>
        ) : (
          <div className="flex flex-col">
            {files.map(file => (
              <div 
                key={file.id}
                onClick={() => setSelectedFileId(file.id)}
                className={`group flex flex-col p-3 cursor-pointer border-l-4 transition-colors relative ${
                  selectedFileId === file.id 
                    ? 'border-[#07c160] bg-[#dcdcdc]' 
                    : 'border-transparent hover:bg-[#e0e0e0]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <File size={16} className={selectedFileId === file.id ? 'text-[#07c160]' : 'text-gray-500'} />
                    <span className="text-sm truncate text-gray-700">{file.name}</span>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(file.id);
                    }}
                    className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                
                {/* Status Indicators */}
                {file.status === 'waiting' && (
                  <span className="text-[10px] text-yellow-600 mt-1 ml-6">等待解析 (未配置 RAG)</span>
                )}
                {file.status === 'parsing' && (
                  <div className="mt-1.5 ml-6 h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#07c160] transition-all duration-300" 
                      style={{ width: `${file.progress || 0}%` }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <UploadModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)} 
      />
    </div>
  );
}
