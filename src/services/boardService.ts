import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import type { Edge } from "reactflow";
import { db } from "@/lib/firebase/firestore";
import type { TaskNode } from "@/types/task";

export interface BoardData {
  nodes: TaskNode[];
  edges: Edge[];
  updatedAt: number;
}

/**
 * Recursively removes any functions or undefined values from an object to make it Firestore-serializable.
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

export const BoardService = {
  saveBoard: async (userId: string, nodes: TaskNode[], edges: Edge[]) => {
    // We strip all function callbacks and undefined values from node/edge data before saving to Firestore
    const serializableNodes = nodes.map((node) => cleanData(node));
    const serializableEdges = edges.map((edge) => cleanData(edge));

    const boardRef = doc(db, "boards", userId);
    await setDoc(boardRef, {
      nodes: serializableNodes,
      edges: serializableEdges,
      updatedAt: Date.now(),
    });
  },

  loadBoard: async (userId: string): Promise<BoardData | null> => {
    const boardRef = doc(db, "boards", userId);
    const boardSnap = await getDoc(boardRef);

    if (boardSnap.exists()) {
      return boardSnap.data() as BoardData;
    }
    return null;
  },
};
