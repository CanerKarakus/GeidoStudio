import { create } from 'zustand';

const useAiStore = create((set) => ({
  isAiModeEnabled: false,
  isAROpen: false,
  facePosition: { x: 0, y: 0, z: 0 },
  hasCameraPermission: null,
  setAiMode: (enabled) => set({ isAiModeEnabled: enabled }),
  setAROpen: (isOpen) => set({ isAROpen: isOpen }),
  setFacePosition: (pos) => set({ facePosition: pos }),
  setCameraPermission: (status) => set({ hasCameraPermission: status }),
}));

export default useAiStore;
