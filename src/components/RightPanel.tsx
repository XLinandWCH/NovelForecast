import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Settings2, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useStore, Message } from "../store/useStore";
import { streamAI } from "../utils/aiClient";

export default function RightPanel() {
  const { 
    sessions, activeSessionId, addMessage, settings, files, 
    addFile, updateFileContent, setSelectedFileId, setLeftPanelMode, setActiveNav
  } = useStore();
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
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

      // Simple RAG context: concatenate all file contents (truncate if too long)
      const context = files
        .filter(f => !f.id.startsWith('pred_')) // Don't include previous predictions in context to avoid loop
        .map((f) => f.content)
        .join("\n\n")
        .substring(0, 8000); // 8000 chars limit for simple RAG

      let finalContent = '';
      
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
      <div className="h-14 border-b border-gray-300 flex items-center justify-between px-6 bg-[#f5f5f5]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#07c160] rounded-full flex items-center justify-center text-white">
            <Bot size={18} />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-800">
              小说预测助手
            </h2>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#07c160]"></span>
              {settings.aiProvider} | {settings.ragProvider}
            </p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-4">
            <Bot size={48} className="text-gray-300" />
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
                  msg.content.split("\\n").map((line, i) => (
                    <React.Fragment key={i}>
                      {line}
                      {i !== msg.content.split("\\n").length - 1 && <br />}
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

        {isLoading && (
          <div className="flex gap-4 max-w-[85%]">
            <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center bg-[#07c160] text-white">
              <Bot size={20} />
            </div>
            <div className="p-4 rounded-2xl bg-white text-gray-500 rounded-tl-sm flex items-center gap-2 shadow-sm">
              <Loader2 size={16} className="animate-spin" />
              <span className="text-sm">正在思考...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-[#f5f5f5] border-t border-gray-300">
        <div className="bg-white rounded-xl border border-gray-300 flex items-end p-2 focus-within:border-[#07c160] focus-within:ring-1 focus-within:ring-[#07c160] transition-all">
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
            className="flex-1 min-h-[44px] max-h-[200px] p-2 bg-transparent outline-none resize-none text-sm text-gray-800 overflow-y-auto"
            rows={1}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading || !activeSessionId}
            className="p-2 m-1 bg-[#07c160] hover:bg-[#06ad56] text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
