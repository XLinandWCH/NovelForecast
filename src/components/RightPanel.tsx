import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Settings2, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useStore, Message } from "../store/useStore";
import { streamAI } from "../utils/aiClient";
import { getEmbeddings, cosineSimilarity } from "../utils/ragClient";

export default function RightPanel() {
  const { 
    sessions, activeSessionId, addMessage, updateMessage, settings, files, 
    addFile, updateFileContent, setSelectedFileId, setLeftPanelMode, setActiveNav
  } = useStore();
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sendMode, setSendMode] = useState<'chat' | 'work'>('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeSession = sessions.find(s => s.id === activeSessionId);
  const messages = activeSession?.messages || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading || !activeSessionId) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };

    addMessage(userMessage);
    setInput("");
    setIsLoading(true);
    
    // Reset textarea height
    const textarea = document.getElementById('chat-input') as HTMLTextAreaElement;
    if (textarea) {
      textarea.style.height = 'auto';
    }

    try {
      let context = "";
      
      // Actual RAG Semantic Search
      if (settings.ragBaseUrl && settings.ragBaseUrl.trim() !== '') {
        try {
          // 1. Embed user query
          const queryEmbedding = (await getEmbeddings([input], settings))[0];
          
          // 2. Collect all chunks from all parsed files
          const allChunks: { text: string; similarity: number; fileName: string }[] = [];
          files.forEach(f => {
            if (!f.id.startsWith('pred_') && f.chunks) {
              f.chunks.forEach(c => {
                const sim = cosineSimilarity(queryEmbedding, c.embedding);
                allChunks.push({ text: c.text, similarity: sim, fileName: f.name });
              });
            }
          });
          
          // 3. Sort by similarity and take top K (e.g., top 5)
          allChunks.sort((a, b) => b.similarity - a.similarity);
          const topChunks = allChunks.slice(0, 5);
          
          if (topChunks.length > 0) {
            context = "参考资料：\n" + topChunks.map(c => `[来自文件 ${c.fileName}]:\n${c.text}`).join("\n\n");
          }
        } catch (error: any) {
          console.error("RAG Retrieval error:", error);
          
          // Add a system message to inform the user about the RAG failure
          addMessage({
            id: `sys_${Date.now()}`,
            role: "system",
            content: `[系统提示] RAG 检索失败，已降级为全文匹配。\n\n**可能的原因：**\n1. RAG 服务未启动或配置错误。\n2. 跨域 (CORS) 限制：当前网页是 HTTPS，浏览器会拦截发往 \`http://localhost\` 的请求 (Mixed Content)。\n\n**解决方法 (任选其一)：**\n- **方法 A (最简单)**：尝试将 RAG Base URL 中的 \`localhost\` 改为 \`127.0.0.1\` (部分浏览器允许此特例)。\n- **方法 B**：使用 [ngrok](https://ngrok.com/) 或 Cloudflare Tunnels 将本地服务暴露为 HTTPS 链接。\n- **方法 C**：在浏览器设置中允许当前网站的“不安全内容 (Insecure content)”。\n\n*错误详情: ${error.message}*`,
          });

          // Fallback to naive if RAG fails
          context = files.filter(f => !f.id.startsWith('pred_')).map(f => f.content).join("\n\n").substring(0, 8000);
        }
      } else {
        // Fallback to naive context if RAG not configured
        context = files.filter(f => !f.id.startsWith('pred_')).map(f => f.content).join("\n\n").substring(0, 8000);
      }

      let finalContent = '';

      if (sendMode === 'work') {
        // Create a new file in the workspace for the prediction output
        const predictionFileId = `pred_${Date.now()}`;
        addFile({
          id: predictionFileId,
          name: `预测: ${input.substring(0, 10)}...`,
          type: 'txt',
          content: '正在生成预测结果...\n\n'
        });
        
        // Switch to files view and select the new file
        setActiveNav('files');
        setSelectedFileId(predictionFileId);
        setLeftPanelMode('text');

        await streamAI([...messages, userMessage], settings, context, (chunk) => {
          finalContent = chunk;
          updateFileContent(predictionFileId, chunk);
        });

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `预测完成！结果已输出至左侧工作区文件：**预测: ${input.substring(0, 10)}...**\n\n您可以切换到“导图视图”查看结构。`,
        };
        addMessage(assistantMessage);

      } else {
        // Chat mode: stream directly to a new message
        const assistantMessageId = (Date.now() + 1).toString();
        addMessage({
          id: assistantMessageId,
          role: "assistant",
          content: "正在思考...",
        });

        await streamAI([...messages, userMessage], settings, context, (chunk) => {
          finalContent = chunk;
          updateMessage(assistantMessageId, chunk);
        });
      }

    } catch (error: any) {
      console.error("Error sending message:", error);
      addMessage({
        id: (Date.now() + 1).toString(),
        role: "system",
        content: `发送消息失败: ${error.message}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#f5f5f5]">
      {/* Header */}
      <div className="h-14 border-b border-gray-300 flex items-center justify-between px-6 bg-[#f5f5f5] flex-shrink-0">
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
          <div>
            <h2 className="text-sm font-semibold text-gray-800">
              聊天窗口
            </h2>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#07c160]"></span>
              AI: {settings.aiProvider} | RAG: {settings.ragProvider}
            </p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-4">
            <div className="w-16 h-16 bg-[#07c160] rounded-2xl flex items-center justify-center text-white shadow-md">
              <Bot size={40} />
            </div>
            <p className="text-sm">
              你好！我是小说预测助手，请在左侧上传文档，然后向我提问。
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-4 max-w-[85%] ${msg.role === "user" ? "ml-auto flex-row-reverse" : ""}`}
            >
              <div
                className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center ${
                  msg.role === "user"
                    ? "bg-blue-500 text-white"
                    : msg.role === "system"
                      ? "bg-red-500 text-white"
                      : "bg-[#07c160] text-white"
                }`}
              >
                {msg.role === "user" ? (
                  <User size={20} />
                ) : msg.role === "system" ? (
                  <Settings2 size={20} />
                ) : (
                  <Bot size={20} />
                )}
              </div>

              <div
                className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                  msg.role === "user"
                    ? "bg-[#95ec69] text-gray-900 rounded-tr-sm"
                    : msg.role === "system"
                      ? "bg-red-50 text-red-800 border border-red-200 rounded-tl-sm"
                      : "bg-white text-gray-800 rounded-tl-sm"
                }`}
              >
                {msg.role === "user" ? (
                  msg.content.split("\n").map((line, i) => (
                    <React.Fragment key={i}>
                      {line}
                      {i !== msg.content.split("\n").length - 1 && <br />}
                    </React.Fragment>
                  ))
                ) : (
                  <div className="prose prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-gray-100 prose-pre:text-gray-800">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-[#f5f5f5] border-t border-gray-300">
        <div className="bg-white rounded-xl border border-gray-300 flex flex-col p-2 focus-within:border-[#07c160] focus-within:ring-1 focus-within:ring-[#07c160] transition-all">
          <textarea
            id="chat-input"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
            }}
            onKeyDown={handleKeyDown}
            placeholder="输入您的问题，按 Enter 发送，Shift + Enter 换行..."
            className="w-full min-h-[44px] max-h-[200px] p-2 bg-transparent outline-none resize-none text-sm text-gray-800 overflow-y-auto"
            rows={1}
          />
          <div className="flex items-center justify-between mt-2 px-1">
            <select
              value={sendMode}
              onChange={(e) => setSendMode(e.target.value as 'chat' | 'work')}
              className="text-xs font-medium bg-gray-100 text-gray-600 border-none rounded-md px-2 py-1 outline-none cursor-pointer hover:bg-gray-200 transition-colors"
            >
              <option value="chat">对话模式</option>
              <option value="work">工作模式</option>
            </select>
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading || !activeSessionId}
              className="p-2 bg-[#07c160] hover:bg-[#06ad56] text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
