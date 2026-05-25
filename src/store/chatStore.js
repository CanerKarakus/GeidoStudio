import { create } from 'zustand';

const useChatStore = create((set, get) => ({
  isOpen: false,
  setIsOpen: (isOpen) => set({ isOpen }),
  toggleChat: () => set((state) => ({ isOpen: !state.isOpen })),
  
  userContext: null, // { name, email }
  setUserContext: (context) => set({ userContext: context }),
  
  messages: [], // { id, text, sender: 'user' | 'ai', timestamp }
  addMessage: (msg) => set((state) => ({ 
    messages: [...state.messages, { ...msg, id: Date.now(), timestamp: new Date().toISOString() }] 
  })),
  
  clearChat: () => set({ messages: [] })
}));

export default useChatStore;
