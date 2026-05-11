import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import { InboxItem } from "@/types/task";
import { InboxService } from "@/services/inboxService";

interface InboxState {
  items: InboxItem[];
  isOpen: boolean;
  isLoading: boolean;
  setOpen: (open: boolean) => void;
  addItem: (text: string) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  loadInbox: (userId: string) => Promise<void>;
}

export const useInboxStore = create<InboxState>((set, get) => ({
  items: [],
  isOpen: false,
  isLoading: false,

  setOpen: (open: boolean) => set({ isOpen: open }),

  loadInbox: async (userId: string) => {
    set({ isLoading: true });
    try {
      const items = await InboxService.getInbox(userId);
      set({ items, isLoading: false });
    } catch (error) {
      console.error("Failed to load inbox:", error);
      set({ isLoading: false });
    }
  },

  addItem: async (text: string) => {
    const userId = (window as any).userId;
    if (!userId) return;

    const newItem: InboxItem = {
      id: uuidv4(),
      text,
      createdAt: Date.now(),
    };

    set({ items: [...get().items, newItem] });
    await InboxService.addInboxItem(userId, newItem);
  },

  removeItem: async (id: string) => {
    const userId = (window as any).userId;
    if (!userId) return;

    const itemToRemove = get().items.find(i => i.id === id);
    if (!itemToRemove) return;

    set({ items: get().items.filter(i => i.id !== id) });
    await InboxService.removeInboxItem(userId, itemToRemove);
  },
}));
