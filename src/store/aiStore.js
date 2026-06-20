import { create } from 'zustand';

const useAiStore = create((set) => ({
  isAiModeEnabled: false,
  facePosition: { x: 0, y: 0, z: 0 },
  hasCameraPermission: null,
  setAiMode: (enabled) => set({ isAiModeEnabled: enabled }),
  setFacePosition: (pos) => set({ facePosition: pos }),
  setCameraPermission: (status) => set({ hasCameraPermission: status }),
}));

export default useAiStore;
