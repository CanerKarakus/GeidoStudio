import { create } from 'zustand';

// Module-level flag: resets on hard page refresh, persists across SPA navigation
export let splashHasShown = false;

const useUIStore = create((set) => ({
  splashReady: false,
  setSplashReady: () => {
    splashHasShown = true;
    set({ splashReady: true });
  },
}));

export default useUIStore;
