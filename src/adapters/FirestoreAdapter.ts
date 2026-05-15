import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/firestore";
import type { BoardData, IRemoteAdapter } from "@/sync/types";

/**
 * Strips functions and undefined values for Firestore compatibility.
 */
const cleanData = (obj: any): any => {
  if (obj === null || typeof obj !== "object") {
    return obj === undefined ? null : obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(cleanData);
  }
  const result: any = {};
  for (const key in obj) {
    const value = obj[key];
    if (typeof value !== "function" && value !== undefined) {
      result[key] = cleanData(value);
    }
  }
  return result;
};

export class FirestoreAdapter implements IRemoteAdapter {
  async push(userId: string, data: BoardData): Promise<void> {
    const serializable = cleanData(data);
    const boardRef = doc(db, "boards", userId);
    await setDoc(boardRef, {
      ...serializable,
      updatedAt: Date.now(),
    });
  }

  async pull(userId: string): Promise<BoardData | null> {
    const boardRef = doc(db, "boards", userId);
    const boardSnap = await getDoc(boardRef);
    if (boardSnap.exists()) {
      return boardSnap.data() as BoardData;
    }
    return null;
  }
}
