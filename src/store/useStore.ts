import { create } from "zustand";
import { persist, createJSONStorage, StateStorage } from "zustand/middleware";
import { get, set, del } from "idb-keyval";

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
}

export interface FileChunk {
  text: string;
  embedding: number[];
}

export interface FileItem {
  id: string;
  name: string;
  type: string;
  content: string;
  status?: 'waiting' | 'parsing' | 'parsed' | 'error';
  progress?: number;
  chunks?: FileChunk[];
}

export interface Settings {
  aiProvider: string;
  aiApiKey: string;
  aiBaseUrl: string;
  aiModel: string;
  ragProvider: string;
  ragApiKey: string;
  ragBaseUrl: string;
  ragModel: string;
}

interface AppState {
  sessions: ChatSession[];
  activeSessionId: string | null;
  files: FileItem[];
  settings: Settings;
  isSettingsOpen: boolean;
  isUploadModalOpen: boolean;
  leftPanelMode: "mindmap" | "text";
  selectedFileId: string | null;
  activeNav: "chat" | "files";
  isSidebarOpen: boolean;
  mobileTab: "workspace" | "chat";

  setActiveNav: (nav: "chat" | "files") => void;
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  setMobileTab: (tab: "workspace" | "chat") => void;
  addSession: () => void;
  removeSession: (id: string) => void;
  setActiveSessionId: (id: string) => void;
  addMessage: (msg: Message) => void;
  updateMessage: (id: string, content: string) => void;
  addFile: (file: FileItem) => void;
  removeFile: (id: string) => void;
  updateFileContent: (id: string, content: string) => void;
  updateFileStatus: (id: string, status: 'waiting' | 'parsing' | 'parsed' | 'error', progress?: number) => void;
  updateFileChunks: (id: string, chunks: FileChunk[]) => void;
  updateSettings: (settings: Partial<Settings>) => void;
  setSettingsOpen: (isOpen: boolean) => void;
  setUploadModalOpen: (isOpen: boolean) => void;
  setLeftPanelMode: (mode: "mindmap" | "text") => void;
  setSelectedFileId: (id: string | null) => void;
}

const initialSessionId = Date.now().toString();

const storage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return (await get(name)) || null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await set(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await del(name);
  },
};

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      sessions: [{ id: initialSessionId, title: "新会话", messages: [] }],
      activeSessionId: initialSessionId,
      files: [],
      settings: {
        aiProvider: "OpenAI",
        aiApiKey: "",
        aiBaseUrl: "https://api.openai.com/v1",
        aiModel: "gpt-4o",
        ragProvider: "Nexa AI",
        ragApiKey: "",
        ragBaseUrl: "",
        ragModel: "nexa-rag",
      },
      isSettingsOpen: false,
      isUploadModalOpen: false,
      leftPanelMode: "text",
      selectedFileId: null,
      activeNav: "files",
      isSidebarOpen: true,
      mobileTab: "chat",

      setActiveNav: (nav) => set({ activeNav: nav, isSidebarOpen: true }),
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
      setMobileTab: (tab) => set({ mobileTab: tab }),
      addSession: () =>
        set((state) => {
          const newId = Date.now().toString();
          return {
            sessions: [{ id: newId, title: "新会话", messages: [] }, ...state.sessions],
            activeSessionId: newId,
          };
        }),
      removeSession: (id) =>
        set((state) => {
          const newSessions = state.sessions.filter((s) => s.id !== id);
          if (newSessions.length === 0) {
            const newId = Date.now().toString();
            return {
              sessions: [{ id: newId, title: "新会话", messages: [] }],
              activeSessionId: newId,
            };
          }
          return {
            sessions: newSessions,
            activeSessionId:
              state.activeSessionId === id ? newSessions[0].id : state.activeSessionId,
          };
        }),
      setActiveSessionId: (id) => set({ activeSessionId: id }),
      addMessage: (msg) =>
        set((state) => ({
          sessions: state.sessions.map((s) => {
            if (s.id === state.activeSessionId) {
              const title =
                s.messages.length === 0 && msg.role === "user"
                  ? msg.content.substring(0, 15)
                  : s.title;
              return { ...s, title, messages: [...s.messages, msg] };
            }
            return s;
          }),
        })),
      updateMessage: (id, content) =>
        set((state) => ({
          sessions: state.sessions.map((s) => {
            if (s.id === state.activeSessionId) {
              return {
                ...s,
                messages: s.messages.map((m) => (m.id === id ? { ...m, content } : m)),
              };
            }
            return s;
          }),
        })),
      addFile: (file) => set((state) => ({ files: [file, ...state.files] })),
      removeFile: (id) =>
        set((state) => ({
          files: state.files.filter((f) => f.id !== id),
          selectedFileId: state.selectedFileId === id ? null : state.selectedFileId,
        })),
      updateFileContent: (id, content) =>
        set((state) => ({
          files: state.files.map((f) => (f.id === id ? { ...f, content } : f)),
        })),
      updateFileStatus: (id, status, progress) =>
        set((state) => ({
          files: state.files.map((f) => (f.id === id ? { ...f, status, progress } : f)),
        })),
      updateFileChunks: (id, chunks) =>
        set((state) => ({
          files: state.files.map((f) => (f.id === id ? { ...f, chunks } : f)),
        })),
      updateSettings: (newSettings) =>
        set((state) => ({ settings: { ...state.settings, ...newSettings } })),
      setSettingsOpen: (isOpen) => set({ isSettingsOpen: isOpen }),
      setUploadModalOpen: (isOpen) => set({ isUploadModalOpen: isOpen }),
      setLeftPanelMode: (mode) => set({ leftPanelMode: mode }),
      setSelectedFileId: (id) => set({ selectedFileId: id }),
    }),
    {
      name: 'novel-ai-storage',
      storage: createJSONStorage(() => storage),
      partialize: (state) => ({
        sessions: state.sessions,
        activeSessionId: state.activeSessionId,
        files: state.files,
        settings: state.settings,
      }),
    }
  )
);
