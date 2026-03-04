/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Panel, Group, Separator } from "react-resizable-panels";
import { Settings, MessageSquare, FileText } from "lucide-react";
import { useStore } from "./store/useStore";
import Sidebar from "./components/Sidebar";
import LeftPanel from "./components/LeftPanel";
import RightPanel from "./components/RightPanel";
import SettingsModal from "./components/SettingsModal";

export default function App() {
  const { setSettingsOpen, activeNav, setActiveNav, isSidebarOpen, toggleSidebar } = useStore();

  const handleNavClick = (nav: 'chat' | 'files') => {
    if (activeNav === nav) {
      toggleSidebar();
    } else {
      setActiveNav(nav);
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#f5f5f5] text-gray-800 font-sans overflow-hidden">
      {/* Sidebar / Navigation */}
      <div className="w-16 bg-[#2e2e2e] flex flex-col items-center py-6 gap-6 z-20 shadow-lg">
        <div className="w-10 h-10 bg-[#07c160] rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-md overflow-hidden">
          {/* 
            TODO: 替换为您自己的 AI 图标图片。
            您可以将图片放在 public 目录下（例如 public/ai-logo.png），
            然后将 src 修改为 "/ai-logo.png"。
            如果图片加载失败，会显示默认的 "AI" 文字。
          */}
          <img 
            src="/ai-logo.png" 
            alt="AI" 
            className="w-full h-full object-cover"
            onError={(e) => {
              // 如果图片加载失败，回退到显示文字
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement!.innerText = 'AI';
            }}
          />
        </div>

        <div className="flex flex-col gap-4 mt-4 flex-1">
          <button 
            onClick={() => handleNavClick('chat')}
            className={`p-3 transition-colors rounded-xl ${activeNav === 'chat' && isSidebarOpen ? 'text-[#07c160] bg-white/10' : 'text-gray-400 hover:text-[#07c160] hover:bg-white/5'}`}
            title="历史会话"
          >
            <MessageSquare size={24} />
          </button>
          <button 
            onClick={() => handleNavClick('files')}
            className={`p-3 transition-colors rounded-xl ${activeNav === 'files' && isSidebarOpen ? 'text-[#07c160] bg-white/10' : 'text-gray-400 hover:text-[#07c160] hover:bg-white/5'}`}
            title="知识库文件"
          >
            <FileText size={24} />
          </button>
        </div>

        <button
          onClick={() => setSettingsOpen(true)}
          className="p-3 text-gray-400 hover:text-white transition-colors rounded-xl hover:bg-white/5 mt-auto"
          title="设置"
        >
          <Settings size={24} />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Fixed Sidebar Panel */}
        <div 
          className={`h-full bg-[#ebebeb] border-r border-gray-300 transition-all duration-300 ease-in-out flex-shrink-0 z-10 ${
            isSidebarOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full opacity-0 overflow-hidden'
          }`}
        >
          <div className="w-64 h-full">
            <Sidebar />
          </div>
        </div>

        <Group orientation="horizontal" className="flex-1 h-full">
          {/* Left Panel: Console / Mindmap */}
          <Panel
            defaultSize={45}
            minSize={20}
            className="bg-[#f0f0f0] border-r border-gray-300 flex flex-col"
          >
            <LeftPanel />
          </Panel>

          {/* Resizer */}
          <Separator className="w-1 bg-gray-300 hover:bg-[#07c160] transition-colors cursor-col-resize" />

          {/* Right Panel: Chat */}
          <Panel
            defaultSize={55}
            minSize={20}
            className="bg-[#f5f5f5] flex flex-col"
          >
            <RightPanel />
          </Panel>
        </Group>
      </div>

      {/* Settings Modal */}
      <SettingsModal />
    </div>
  );
}
