import { create } from 'zustand';
import { api } from '../api/db';

const useCmsStore = create((set) => ({
  cms: null,
  messages: [],
  isAdmin: false,
  isLoading: true,
  error: null,

  init: async () => {
    set({ isLoading: true });
    try {
      // Fetch CMS data (public) and auth status in parallel
      const [cmsData, authStatus] = await Promise.all([
        api.getCMS(),
        api.checkAuth(),
      ]);

      let msgs = [];
      if (authStatus) {
        msgs = await api.getMessages();
      }

      set({ cms: cmsData, isAdmin: authStatus, messages: msgs, isLoading: false });
    } catch (err) {
      // getCMS failing is critical — auth failing is fine (user just not logged in)
      set({ error: err.message, isLoading: false });
    }
  },

  login: async (email, password) => {
    // Throws on failure — let the UI handle the error
    await api.login(email, password);
    const msgs = await api.getMessages();
    set({ isAdmin: true, messages: msgs });
  },

  logout: async () => {
    try {
      await api.logout();
    } finally {
      // Always clear local state even if request fails
      set({ isAdmin: false, messages: [] });
    }
  },

  updateCMS: async (newData) => {
    const result = await api.updateCMS(newData);
    // Backend returns { success, data }
    set({ cms: result.data || newData });
  },

  addMessage: async (msg) => {
    // Returns { success, message } — no need to re-fetch (public action)
    await api.addMessage(msg);
  },

  deleteMessage: async (id) => {
    await api.deleteMessage(id);
    // Optimistically remove from local state
    set((state) => ({
      messages: state.messages.filter((m) => m.id !== id),
    }));
  },

  refreshMessages: async () => {
    try {
      const msgs = await api.getMessages();
      set({ messages: msgs });
    } catch { /* silent */ }
  },
}));

export default useCmsStore;
