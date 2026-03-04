import React, { useState, useRef } from 'react';
import { X, Upload, Link as LinkIcon, FileText } from 'lucide-react';
import { useStore } from '../store/useStore';
import { parseFile } from '../utils/fileParser';
import { chunkText, getEmbeddings } from '../utils/ragClient';

export default function UploadModal() {
  const { addFile, setSelectedFileId, settings, updateFileStatus, updateFileChunks, isUploadModalOpen, setUploadModalOpen } = useStore();
  const [activeTab, setActiveTab] = useState<'local' | 'url'>('local');
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isUploadModalOpen) return null;

  const handleClose = () => {
    setUploadModalOpen(false);
  };

  const processRagParsing = async (fileId: string, content: string) => {
    if (!settings.ragBaseUrl || settings.ragBaseUrl.trim() === '') {
      updateFileStatus(fileId, 'waiting');
      return;
    }

    try {
      updateFileStatus(fileId, 'parsing', 5);
      
      // 1. Chunk the text (500 chars, 50 overlap)
      const textChunks = chunkText(content, 500, 50);
      
      if (textChunks.length === 0) {
        updateFileStatus(fileId, 'parsed', 100);
        return;
      }

      // 2. Process in batches to avoid payload too large
      const batchSize = 10;
      const allChunks: { text: string; embedding: number[] }[] = [];
      
      for (let i = 0; i < textChunks.length; i += batchSize) {
        const batch = textChunks.slice(i, i + batchSize);
        
        // Call actual embedding API
        const embeddings = await getEmbeddings(batch, settings);
        
        batch.forEach((text, index) => {
          allChunks.push({ text, embedding: embeddings[index] });
        });
        
        const progress = 5 + Math.floor(((i + batch.length) / textChunks.length) * 95);
        updateFileStatus(fileId, 'parsing', progress);
      }
      
      // 3. Save chunks to store
      updateFileChunks(fileId, allChunks);
      updateFileStatus(fileId, 'parsed', 100);
      
    } catch (error) {
      console.error("RAG Parsing error:", error);
      updateFileStatus(fileId, 'error');
    }
  };

  const handleLocalUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    setIsLoading(true);
    try {
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        const content = await parseFile(file);
        
        const newFileId = Math.random().toString(36).substring(7);
        const newFile = {
          id: newFileId,
          name: file.name,
          type: file.name.split('.').pop()?.toLowerCase() || 'unknown',
          content,
          status: 'waiting' as const,
        };
        
        addFile(newFile);
        setSelectedFileId(newFile.id);
        
        // Start actual RAG parsing in background
        processRagParsing(newFileId, content);
      }
      handleClose();
    } catch (error) {
      console.error('Error parsing file:', error);
      alert('解析文件失败，请确保是有效的 txt, docx 或 pdf 文件。');
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleUrlUpload = async () => {
    if (!url.trim()) return;
    
    setIsLoading(true);
    try {
      // Use allorigins to bypass CORS for client-side fetching
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
      const response = await fetch(proxyUrl);
      const data = await response.json();
      
      if (!data.contents) throw new Error('Failed to fetch URL content');
      
      // Basic HTML stripping
      const parser = new DOMParser();
      const doc = parser.parseFromString(data.contents, 'text/html');
      
      // Remove scripts, styles, navs, headers, footers
      const elementsToRemove = doc.querySelectorAll('script, style, nav, header, footer, iframe, noscript');
      elementsToRemove.forEach(el => el.remove());
      
      const content = doc.body.textContent || '';
      const cleanContent = content.replace(/\s+/g, ' ').trim();
      
      const newFileId = Math.random().toString(36).substring(7);
      const newFile = {
        id: newFileId,
        name: url.substring(0, 30) + '...',
        type: 'url',
        content: cleanContent,
        status: 'waiting' as const,
      };
      
      addFile(newFile);
      setSelectedFileId(newFile.id);
      
      // Start actual RAG parsing in background
      processRagParsing(newFileId, cleanContent);
      
      handleClose();
      setUrl('');
    } catch (error) {
      console.error('Error fetching URL:', error);
      alert('获取网页内容失败，请检查 URL 是否有效。');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-lg font-semibold text-gray-800">上传知识库文件</h2>
          <button
            onClick={handleClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-4">
          <div className="flex gap-2 mb-4 p-1 bg-gray-100 rounded-lg">
            <button
              onClick={() => setActiveTab('local')}
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'local' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              本地文件
            </button>
            <button
              onClick={() => setActiveTab('url')}
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'url' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              网页链接
            </button>
          </div>

          {activeTab === 'local' ? (
            <div className="space-y-4">
              <div 
                className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:border-[#07c160] hover:bg-green-50/30 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <FileText size={32} className="text-gray-400 mb-2" />
                <p className="text-sm font-medium text-gray-700 mb-1">点击选择文件</p>
                <p className="text-xs text-gray-500">支持 .txt, .pdf, .docx 格式</p>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleLocalUpload} 
                className="hidden" 
                accept=".txt,.pdf,.docx"
                multiple
              />
              {isLoading && <p className="text-sm text-center text-[#07c160]">正在解析文件...</p>}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <LinkIcon size={14} className="text-gray-400" />
                  网页 URL
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/article"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#07c160] focus:border-transparent outline-none transition-all text-sm"
                />
              </div>
              <button
                onClick={handleUrlUpload}
                disabled={!url.trim() || isLoading}
                className="w-full py-2.5 bg-[#07c160] hover:bg-[#06ad56] text-white rounded-lg transition-colors disabled:opacity-50 text-sm font-medium flex items-center justify-center gap-2"
              >
                {isLoading ? '正在获取并解析...' : '提取网页内容'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
