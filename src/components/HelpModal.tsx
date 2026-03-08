import React from 'react';
import { X, BookOpen, Server, Zap, Network } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HelpModal({ isOpen, onClose }: HelpModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-2 text-gray-800">
            <BookOpen className="w-5 h-5 text-blue-500" />
            <h2 className="text-lg font-semibold">使用指南与内网穿透配置</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Section 1: 基础使用 */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-semibold text-gray-800 border-b pb-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              <h3>基础使用说明</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <h4 className="font-medium text-gray-800 mb-2">1. 知识库上传</h4>
                <p>点击左侧边栏的“文件”图标，上传您的TXT小说或文档。系统会自动进行分块解析，并在后台进行向量化处理（RAG）。</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <h4 className="font-medium text-gray-800 mb-2">2. 智能对话</h4>
                <p>在右侧对话框中提问，AI 会自动检索您上传的文档内容并给出回答。您可以随时切换“对话模式”和“工作模式”。</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <h4 className="font-medium text-gray-800 mb-2">3. 视图切换</h4>
                <p>在工作模式下，您可以将 AI 的回答一键转换为“思维导图”或“关系图谱”，方便梳理小说大纲和人物关系。</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <h4 className="font-medium text-gray-800 mb-2">4. 模型设置</h4>
                <p>点击左下角的“设置”图标，配置您的 AI 大模型 API Key 以及 RAG（检索增强生成）的供应商。</p>
              </div>
            </div>
          </section>

          {/* Section 2: 本地模型与内网穿透 */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-semibold text-gray-800 border-b pb-2">
              <Network className="w-5 h-5 text-green-500" />
              <h3>如何连接本地模型 (内网穿透指南)</h3>
            </div>
            <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm mb-4">
              <strong>为什么需要内网穿透？</strong><br/>
              如果您在本地电脑上运行了 LM Studio 或 Ollama（例如地址是 <code>http://127.0.0.1:1234</code>），由于本应用运行在云端浏览器中，它是无法直接访问您电脑的 <code>127.0.0.1</code> 的。因此，我们需要使用 <strong>ngrok</strong> 将您的本地服务暴露为一个公网 HTTPS 地址。
            </div>

            <div className="space-y-6">
              {/* Step 1 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-gray-800 text-white rounded-full flex items-center justify-center font-bold">1</div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">启动本地大模型服务</h4>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    <li><strong>LM Studio:</strong> 打开 Local Server，确保端口为 <code>1234</code>，并点击 Start。</li>
                    <li><strong>Ollama:</strong> 在终端运行 <code>ollama serve</code> (默认端口 <code>11434</code>)。</li>
                  </ul>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-gray-800 text-white rounded-full flex items-center justify-center font-bold">2</div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">下载并安装 ngrok</h4>
                  <p className="text-sm text-gray-600 mb-2">前往 <a href="https://ngrok.com/download" target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">ngrok 官网</a> 注册账号并下载对应系统的客户端。</p>
                  
                  <div className="grid md:grid-cols-2 gap-4 mt-3">
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <strong className="text-sm text-gray-800 block mb-2">Windows 用户</strong>
                      <ol className="list-decimal list-inside text-xs text-gray-600 space-y-1">
                        <li>解压下载的 <code>ngrok.zip</code></li>
                        <li>双击运行 <code>ngrok.exe</code> (会打开一个黑框终端)</li>
                        <li>在终端中输入您的 Authtoken (在官网 Dashboard 可见):<br/>
                          <code className="bg-gray-200 px-1 py-0.5 rounded text-red-500">ngrok config add-authtoken 您的Token</code>
                        </li>
                      </ol>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <strong className="text-sm text-gray-800 block mb-2">Mac 用户</strong>
                      <ol className="list-decimal list-inside text-xs text-gray-600 space-y-1">
                        <li>打开终端 (Terminal)</li>
                        <li>使用 Homebrew 安装:<br/>
                          <code className="bg-gray-200 px-1 py-0.5 rounded text-red-500">brew install ngrok/ngrok/ngrok</code>
                        </li>
                        <li>配置 Authtoken:<br/>
                          <code className="bg-gray-200 px-1 py-0.5 rounded text-red-500">ngrok config add-authtoken 您的Token</code>
                        </li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-gray-800 text-white rounded-full flex items-center justify-center font-bold">3</div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">启动内网穿透</h4>
                  <p className="text-sm text-gray-600 mb-2">在终端/命令行中运行以下命令（根据您的本地服务端口）：</p>
                  <div className="bg-gray-900 text-gray-100 p-3 rounded-lg font-mono text-sm">
                    <div className="text-gray-400 text-xs mb-1"># 如果使用 LM Studio (端口 1234)</div>
                    <div>ngrok http 1234</div>
                    <div className="text-gray-400 text-xs mt-3 mb-1"># 如果使用 Ollama (端口 11434)</div>
                    <div>ngrok http 11434</div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    运行后，终端会显示类似 <code>Forwarding https://1a2b-3c4d.ngrok-free.app -&gt; http://localhost:1234</code> 的信息。
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-gray-800 text-white rounded-full flex items-center justify-center font-bold">4</div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">在应用中配置</h4>
                  <p className="text-sm text-gray-600">
                    复制上一步中生成的 <strong>https://...ngrok-free.app</strong> 地址。<br/>
                    打开本应用的 <strong>设置 -&gt; RAG 供应商</strong>，选择 <strong>Local (LM Studio)</strong>，将复制的地址填入 <strong>API Base URL</strong> 中（注意保留 <code>/v1</code> 后缀，例如：<code>https://1a2b-3c4d.ngrok-free.app/v1</code>）。
                  </p>
                </div>
              </div>

            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
