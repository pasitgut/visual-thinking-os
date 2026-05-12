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

export const BoardService = {
  saveBoard: async (userId: string, nodes: TaskNode[], edges: Edge[]) => {
    // We strip all function callbacks from node data before saving to Firestore
    const serializableNodes = nodes.map((node) => {
      const cleanData = { ...node.data };

      // Remove any function values from the data object
      Object.keys(cleanData).forEach((key) => {
        if (typeof (cleanData as any)[key] === "function") {
          delete (cleanData as any)[key];
        }
      });

      return {
        ...node,
        data: cleanData,
      };
    });

    const serializableEdges = edges.map((edge) => {
      if (!edge.data) return edge;
      const cleanData = { ...edge.data };
      Object.keys(cleanData).forEach((key) => {
        if (typeof cleanData[key] === "function") {
          delete cleanData[key];
        }
      });
      return { ...edge, data: cleanData };
    });

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
