import { create } from "zustand";

export type MobileInteractionState =
  | "idle"
  | "panning"
  | "node-selected"
  | "editing-text"
  | "dragging-node";

interface MobileUIState {
  // Selection State
  selectedNodeId: string | null;

  // Interaction State Machine
  interactionState: MobileInteractionState;

  // Overlay Visibility
  isBottomSheetOpen: boolean;
  isQuickCaptureOpen: boolean;

  // Actions
  setSelectedNodeId: (id: string | null) => void;
  setInteractionState: (state: MobileInteractionState) => void;
  setBottomSheetOpen: (isOpen: boolean) => void;
  setQuickCaptureOpen: (isOpen: boolean) => void;
  
  // Helpers
  resetMobileUI: () => void;
}

export const useMobileUIStore = create<MobileUIState>((set) => ({
  // Initial State
  selectedNodeId: null,
  interactionState: "idle",
  isBottomSheetOpen: false,
  isQuickCaptureOpen: false,

  // Actions
  setSelectedNodeId: (id) => set({ selectedNodeId: id }),
  
  setInteractionState: (state) => set({ interactionState: state }),
  
  setBottomSheetOpen: (isOpen) => set({ isBottomSheetOpen: isOpen }),
  
  setQuickCaptureOpen: (isOpen) => set({ isQuickCaptureOpen: isOpen }),

  resetMobileUI: () => set({
    selectedNodeId: null,
    interactionState: "idle",
    isBottomSheetOpen: false,
    isQuickCaptureOpen: false,
  }),
}));
