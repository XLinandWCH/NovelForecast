# AI 小说预测助手 (AI Novel Prediction Assistant)

这是一个基于 React + Vite 构建的极简风格（类微信 UI）的 AI 小说预测与创作辅助工具。它采用了左右分栏的布局，左侧为沉浸式的工作区（支持文本与思维导图视图），右侧为 AI 对话控制台。

## 🌟 核心功能

1. **多模型支持 (AI & RAG)**
   - 支持接入多种大模型 API，包括但不限于：Gemini, OpenAI, DeepSeek, GLM, Qwen, 魔塔社区 (ModelScope)。
   - 完美支持本地大模型部署方案：**LM Studio**, **Ollama**, **Nexa AI**。
   - 可以在设置中独立配置对话模型和 RAG（检索增强生成）模型。

2. **知识库管理**
   - 支持上传 `.txt`, `.docx`, `.pdf` 格式的文件。
   - 自动解析文件内容并提取为 RAG 上下文，让 AI 基于您的设定进行预测。

3. **流式预测与工作区联动**
   - **沉浸式创作**：向 AI 发送预测指令后，结果不会挤在聊天气泡中，而是会自动在左侧工作区新建一个文件，并以**流式（打字机效果）**实时输出。
   - **实时思维导图**：在 AI 输出的同时，切换到“导图视图”，可以实时看到基于 Markdown 标题结构生成的思维导图树。

4. **极简 UI 设计**
   - 采用灰+绿的极简配色。
   - 左侧菜单栏支持折叠/展开，工作区面板宽度可自由拖拽。
   - 聊天输入框支持自动拉伸和 `Shift + Enter` 换行。

## 🚀 部署与运行 (Cloudflare Pages 推荐)

本项目完全基于前端技术栈（React + Vite），没有后端依赖，非常适合部署到 **Cloudflare Pages** 或 Vercel 等静态托管平台。

### 本地开发

1. 克隆项目并安装依赖：
   ```bash
   npm install
   ```
2. 启动开发服务器：
   ```bash
   npm run dev
   ```

### 部署到 Cloudflare Pages

1. 在项目根目录运行构建命令：
   ```bash
   npm run build
   ```
2. 构建完成后，会生成一个 `dist` 文件夹。
3. 登录 Cloudflare 控制台，进入 "Pages" -> "Create a project" -> "Direct Upload"。
4. 将 `dist` 文件夹上传即可完成部署。

*注意：由于这是一个纯前端 SPA（单页应用），如果您在 Cloudflare 上遇到路由 404 问题，请在 `public` 目录下创建一个名为 `_redirects` 的文件，内容为 `/* /index.html 200`。*

## 🔧 API 设置说明

点击左下角的齿轮图标进入设置：

- **提供商**：选择您使用的 API 厂商。
- **模型名称**：填写具体的模型版本号（如 `gpt-4o`, `deepseek-chat`, `qwen-max`）。
- **API Base URL**：
  - OpenAI/DeepSeek 等通常为 `https://api.xxx.com/v1`
  - 本地 LM Studio 通常为 `http://localhost:1234/v1`
  - 本地 Ollama 通常为 `http://localhost:11434/v1`
- **API Key**：您的密钥。**对于本地运行的模型（如 LM Studio, Ollama, Nexa AI），此项可以留空。**
