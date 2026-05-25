import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useChatStore = create(
  persist(
    (set, get) => ({
      isOpen: false,
      isMinimized: false,
      isEnding: false,
      setIsOpen: (isOpen) => set({ isOpen }),
      setIsMinimized: (isMinimized) => set({ isMinimized }),
      setIsEnding: (isEnding) => set({ isEnding }),
      toggleChat: () => set((state) => ({ isOpen: !state.isOpen })),
      
      userContext: null, // { name, email }
      setUserContext: (context) => set({ userContext: context }),
      
      messages: [], // { id, text, sender: 'user' | 'ai', timestamp }
      addMessage: (msg) => set((state) => ({ 
        messages: [...state.messages, { ...msg, id: Date.now(), timestamp: new Date().toISOString() }] 
      })),
      
      clearChat: () => set({ 
        messages: [], 
        userContext: null, 
        isOpen: false, 
        isMinimized: false,
        isEnding: false 
      })
    }),
    {
      name: 'geido-chat-storage', // unique name for localStorage
      partialize: (state) => ({
        messages: state.messages,
        userContext: state.userContext,
        isOpen: state.isOpen,
        isMinimized: state.isMinimized
      })
    }
  )
);

export default useChatStore;
