import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db } from "@/lib/firebase/firestore";
import { InboxItem } from "@/types/task";

export const InboxService = {
  getInbox: async (userId: string): Promise<InboxItem[]> => {
    const inboxRef = doc(db, "inbox", userId);
    const snap = await getDoc(inboxRef);
    if (snap.exists()) {
      return (snap.data().items as InboxItem[]) || [];
    }
    return [];
  },

  addInboxItem: async (userId: string, item: InboxItem) => {
    const inboxRef = doc(db, "inbox", userId);
    const snap = await getDoc(inboxRef);
    
    if (!snap.exists()) {
      await setDoc(inboxRef, { items: [item] });
    } else {
      await updateDoc(inboxRef, {
        items: arrayUnion(item)
      });
    }
  },

  removeInboxItem: async (userId: string, item: InboxItem) => {
    const inboxRef = doc(db, "inbox", userId);
    await updateDoc(inboxRef, {
      items: arrayRemove(item)
    });
  },

  clearInbox: async (userId: string) => {
    const inboxRef = doc(db, "inbox", userId);
    await setDoc(inboxRef, { items: [] });
  }
};
