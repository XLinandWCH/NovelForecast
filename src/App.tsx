/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from "react";
import { Panel, Group, Separator } from "react-resizable-panels";
import { Settings, MessageSquare, FileText, Menu, X, HelpCircle, Star } from "lucide-react";
import { useStore } from "./store/useStore";
import Sidebar from "./components/Sidebar";
import LeftPanel from "./components/LeftPanel";
import RightPanel from "./components/RightPanel";
import SettingsModal from "./components/SettingsModal";
import UploadModal from "./components/UploadModal";
import HelpModal from "./components/HelpModal";
import FeedbackShowcase from "./components/FeedbackShowcase";

export default function App() {
  const { setSettingsOpen, activeNav, setActiveNav, isSidebarOpen, toggleSidebar, setSidebarOpen, mobileTab, setMobileTab, showFeedbackShowcase, setShowFeedbackShowcase } = useStore();
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    // Initial check
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setSidebarOpen]);

  const handleNavClick = (nav: 'chat' | 'files') => {
    if (activeNav === nav) {
      toggleSidebar();
    } else {
      setActiveNav(nav);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-[#f5f5f5] text-gray-800 font-sans overflow-hidden">
      {/* Mobile Header */}
      <div className="md:hidden h-14 bg-[#2e2e2e] flex items-center justify-between px-4 z-30 shadow-md flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 flex items-center justify-center">
            <img 
              src="/ai-logo.png" 
              alt="AI" 
              className="w-full h-full object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement!.innerText = 'AI';
              }}
            />
          </div>
          <span className="text-white font-medium">AI 助手</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setIsHelpOpen(true)} className="p-2 text-gray-300 hover:text-white">
            <HelpCircle size={20} />
          </button>
          <button onClick={() => setSettingsOpen(true)} className="p-2 text-gray-300 hover:text-white">
            <Settings size={20} />
          </button>
          <button onClick={toggleSidebar} className="p-2 text-gray-300 hover:text-white">
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Desktop Sidebar / Navigation */}
      <div className="hidden md:flex w-16 bg-[#2e2e2e] flex-col items-center py-6 gap-6 z-20 shadow-lg flex-shrink-0">
        <div className="w-10 h-10 flex items-center justify-center">
          <img 
            src="/ai-logo.png" 
            alt="AI" 
            className="w-full h-full object-contain"
            onError={(e) => {
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

        <div className="flex flex-col gap-4 mt-auto">
          <button
            onClick={() => setShowFeedbackShowcase(!showFeedbackShowcase)}
            className={`p-3 transition-colors rounded-xl ${showFeedbackShowcase ? 'text-[#07c160] bg-white/10' : 'text-gray-400 hover:text-[#07c160] hover:bg-white/5'}`}
            title="反馈精选"
          >
            <Star size={24} />
          </button>
          <button
            onClick={() => setIsHelpOpen(true)}
            className="p-3 text-gray-400 hover:text-white transition-colors rounded-xl hover:bg-white/5"
            title="使用指南"
          >
            <HelpCircle size={24} />
          </button>
          <button
            onClick={() => setSettingsOpen(true)}
            className="p-3 text-gray-400 hover:text-white transition-colors rounded-xl hover:bg-white/5"
            title="设置"
          >
            <Settings size={24} />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative flex-col md:flex-row">
        {/* Fixed Sidebar Panel (Desktop & Mobile Overlay) */}
        <div 
          className={`absolute md:relative h-full bg-[#ebebeb] border-r border-gray-300 transition-all duration-300 ease-in-out flex-shrink-0 z-20 ${
            isSidebarOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full opacity-0 overflow-hidden'
          }`}
        >
          <div className="w-64 h-full">
            <Sidebar />
          </div>
        </div>

        {/* Mobile Overlay Background */}
        {isSidebarOpen && (
          <div 
            className="md:hidden absolute inset-0 bg-black/20 z-10"
            onClick={toggleSidebar}
          />
        )}

        {/* Mobile Tab Switcher */}
        <div className="md:hidden flex bg-white border-b border-gray-200 flex-shrink-0">
          <button 
            onClick={() => setMobileTab('chat')}
            className={`flex-1 py-3 text-sm font-medium text-center transition-colors ${mobileTab === 'chat' ? 'text-[#07c160] border-b-2 border-[#07c160]' : 'text-gray-500'}`}
          >
            对话区
          </button>
          <button 
            onClick={() => setMobileTab('workspace')}
            className={`flex-1 py-3 text-sm font-medium text-center transition-colors ${mobileTab === 'workspace' ? 'text-[#07c160] border-b-2 border-[#07c160]' : 'text-gray-500'}`}
          >
            工作区
          </button>
        </div>

        {/* Desktop Resizable Panels */}
        <div className="hidden md:flex flex-1 h-full">
          <Group orientation="horizontal" className="flex-1 h-full">
            <Panel defaultSize={45} minSize={20} className="bg-[#f0f0f0] border-r border-gray-300 flex flex-col">
              <LeftPanel />
            </Panel>
            <Separator className="w-1 bg-gray-300 hover:bg-[#07c160] transition-colors cursor-col-resize" />
            <Panel defaultSize={55} minSize={20} className="bg-[#f5f5f5] flex flex-col">
              <RightPanel />
            </Panel>
          </Group>
        </div>

        {/* Mobile Panels (Toggled by Tabs) */}
        <div className="md:hidden flex-1 flex flex-col overflow-hidden relative">
          <div className={`absolute inset-0 flex flex-col transition-opacity duration-200 ${mobileTab === 'chat' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
            <RightPanel />
          </div>
          <div className={`absolute inset-0 flex flex-col transition-opacity duration-200 ${mobileTab === 'workspace' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
            <LeftPanel />
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      <SettingsModal />
      <UploadModal />
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
      
      {/* Feedback Showcase Overlay */}
      {showFeedbackShowcase && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col">
          <FeedbackShowcase />
        </div>
      )}
    </div>
  );
}
