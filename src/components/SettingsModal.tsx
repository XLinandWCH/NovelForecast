import React, { useState } from "react";
import { X, Save, Server, Database, Key, Link, MessageSquareHeart } from "lucide-react";
import { useStore, Settings } from "../store/useStore";

const AI_PROVIDERS = [
  "DeepSeek",
  "GLM",
  "Qwen",
  "魔塔社区 (ModelScope)",
  "Gemini",
  "OpenAI",
  "LM Studio",
  "Ollama",
  "Custom",
];

const RAG_PROVIDERS = [
  "Nexa AI",
  "LM Studio",
  "Ollama",
  "OpenAI",
  "DeepSeek",
  "GLM",
  "Qwen",
  "魔塔社区 (ModelScope)",
  "Custom"
];

const PROVIDER_URLS: Record<string, string> = {
  "DeepSeek": "https://api.deepseek.com/v1",
  "GLM": "https://open.bigmodel.cn/api/paas/v4",
  "Qwen": "https://dashscope.aliyuncs.com/compatible-mode/v1",
  "魔塔社区 (ModelScope)": "https://api-inference.modelscope.cn/v1",
  "Gemini": "",
  "OpenAI": "https://api.openai.com/v1",
  "LM Studio": "http://localhost:1234/v1",
  "Ollama": "http://localhost:11434/v1",
  "Nexa AI": "http://localhost:8080/v1",
  "Custom": ""
};

export default function SettingsModal() {
  const { isSettingsOpen, setSettingsOpen, settings, updateSettings } =
    useStore();
  const [localSettings, setLocalSettings] = React.useState<Settings>(settings);
  const [activeTab, setActiveTab] = useState<'system' | 'feedback'>('system');
  const [feedbackData, setFeedbackData] = useState({ name: '', contact: '', content: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    setLocalSettings(settings);
  }, [settings, isSettingsOpen]);

  if (!isSettingsOpen) return null;

  const handleSave = () => {
    updateSettings(localSettings);
    setSettingsOpen(false);
  };

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackData.content.trim()) return;
    
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setFeedbackData({ name: '', contact: '', content: '' });
      alert('感谢您的反馈！');
    }, 1000);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    
    setLocalSettings((prev) => {
      const newSettings = { ...prev, [name]: value };
      
      // Auto-fill base URL when provider changes
      if (name === 'aiProvider' && PROVIDER_URLS[value] !== undefined) {
        newSettings.aiBaseUrl = PROVIDER_URLS[value];
      }
      if (name === 'ragProvider' && PROVIDER_URLS[value] !== undefined) {
        newSettings.ragBaseUrl = PROVIDER_URLS[value];
      }
      
      return newSettings;
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Left Sidebar */}
        <div className="w-48 bg-gray-50 border-r border-gray-100 flex flex-col py-6">
          <div className="px-6 mb-6">
            <h2 className="text-lg font-bold text-gray-800">设置</h2>
          </div>
          <div className="flex flex-col gap-1 px-3">
            <button
              onClick={() => setActiveTab('system')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'system' 
                  ? 'bg-white text-[#07c160] shadow-sm' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Server size={18} />
              系统设置
            </button>
            <button
              onClick={() => setActiveTab('feedback')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'feedback' 
                  ? 'bg-white text-[#07c160] shadow-sm' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <MessageSquareHeart size={18} />
              应用反馈
            </button>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-white">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              {activeTab === 'system' ? (
                <><Server className="text-[#07c160]" /> 系统设置</>
              ) : (
                <><MessageSquareHeart className="text-[#07c160]" /> 应用反馈</>
              )}
            </h2>
            <button
              onClick={() => setSettingsOpen(false)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'system' ? (
              <div className="space-y-8">
                {/* AI Settings Section */}
                <section className="space-y-4">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-gray-100">
              <Server size={16} />
              AI 模型配置 (用于对话和预测)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">
                  提供商
                </label>
                <select
                  name="aiProvider"
                  value={localSettings.aiProvider}
                  onChange={handleChange}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#07c160] focus:border-transparent outline-none transition-all text-sm"
                >
                  {AI_PROVIDERS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">
                  模型名称
                </label>
                <input
                  type="text"
                  name="aiModel"
                  value={localSettings.aiModel}
                  onChange={handleChange}
                  placeholder="例如: gpt-4o, deepseek-chat"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#07c160] focus:border-transparent outline-none transition-all text-sm"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <Link size={14} className="text-gray-400" />
                  API Base URL
                </label>
                <input
                  type="text"
                  name="aiBaseUrl"
                  value={localSettings.aiBaseUrl}
                  onChange={handleChange}
                  placeholder="https://api.openai.com/v1"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#07c160] focus:border-transparent outline-none transition-all text-sm font-mono"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <Key size={14} className="text-gray-400" />
                  API Key <span className="text-xs text-gray-400 font-normal ml-1">(本地模型如 LM Studio/Ollama 可留空)</span>
                </label>
                <input
                  type="password"
                  name="aiApiKey"
                  value={localSettings.aiApiKey}
                  onChange={handleChange}
                  placeholder="sk-... (本地模型可留空)"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#07c160] focus:border-transparent outline-none transition-all text-sm font-mono"
                />
              </div>
            </div>
          </section>

          {/* RAG Settings Section */}
          <section className="space-y-4">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-gray-100">
              <Database size={16} />
              RAG 检索配置 (用于文档解析和向量化)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">
                  提供商
                </label>
                <select
                  name="ragProvider"
                  value={localSettings.ragProvider}
                  onChange={handleChange}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#07c160] focus:border-transparent outline-none transition-all text-sm"
                >
                  {RAG_PROVIDERS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                {localSettings.ragProvider === "Nexa AI" && (
                  <p className="text-xs text-[#07c160] mt-1">
                    ✓ 已选择 Nexa AI 适配
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">
                  模型名称
                </label>
                <input
                  type="text"
                  name="ragModel"
                  value={localSettings.ragModel}
                  onChange={handleChange}
                  placeholder="例如: nexa-rag-v1"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#07c160] focus:border-transparent outline-none transition-all text-sm"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <Link size={14} className="text-gray-400" />
                  API Base URL
                </label>
                <input
                  type="text"
                  name="ragBaseUrl"
                  value={localSettings.ragBaseUrl}
                  onChange={handleChange}
                  placeholder="http://localhost:8080/v1"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#07c160] focus:border-transparent outline-none transition-all text-sm font-mono"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <Key size={14} className="text-gray-400" />
                  API Key <span className="text-xs text-gray-400 font-normal ml-1">(本地模型如 LM Studio/Ollama 可留空)</span>
                </label>
                <input
                  type="password"
                  name="ragApiKey"
                  value={localSettings.ragApiKey}
                  onChange={handleChange}
                  placeholder="sk-... (本地模型可留空)"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#07c160] focus:border-transparent outline-none transition-all text-sm font-mono"
                />
              </div>
            </div>
          </section>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto">
                <form onSubmit={handleFeedbackSubmit} className="space-y-6">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">
                      您的称呼 (选填)
                    </label>
                    <input
                      type="text"
                      value={feedbackData.name}
                      onChange={(e) => setFeedbackData({...feedbackData, name: e.target.value})}
                      placeholder="如何称呼您？(例如：张三、网名)"
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#07c160] focus:border-transparent outline-none transition-all text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      您的反馈可能会被展示在"反馈精选"中，姓名会自动进行脱敏处理（如：张*三）。
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">
                      联系方式 (选填)
                    </label>
                    <input
                      type="text"
                      value={feedbackData.contact}
                      onChange={(e) => setFeedbackData({...feedbackData, contact: e.target.value})}
                      placeholder="邮箱或手机号，方便我们联系您"
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#07c160] focus:border-transparent outline-none transition-all text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">
                      反馈内容 <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      value={feedbackData.content}
                      onChange={(e) => setFeedbackData({...feedbackData, content: e.target.value})}
                      placeholder="请详细描述您遇到的问题或建议..."
                      rows={6}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#07c160] focus:border-transparent outline-none transition-all text-sm resize-none"
                    />
                  </div>
                  
                  <div className="pt-4 flex justify-end">
                    <button
                      type="submit"
                      disabled={isSubmitting || !feedbackData.content.trim()}
                      className="px-6 py-2.5 text-sm font-medium text-white bg-[#07c160] hover:bg-[#06ad56] rounded-lg transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? '提交中...' : '提交反馈'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Footer (Only for System Settings) */}
          {activeTab === 'system' && (
            <div className="p-6 border-t border-gray-100 bg-white flex justify-end gap-3">
              <button
                onClick={() => setSettingsOpen(false)}
                className="px-6 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2.5 text-sm font-medium text-white bg-[#07c160] hover:bg-[#06ad56] rounded-lg transition-colors flex items-center gap-2 shadow-sm"
              >
                <Save size={16} />
                保存设置
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
