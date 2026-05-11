import {
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase/firestore";
import { TaskNode } from "@/types/task";
import { Edge } from "reactflow";

export interface BoardData {
  nodes: TaskNode[];
  edges: Edge[];
  updatedAt: number;
}

export const BoardService = {
  saveBoard: async (userId: string, nodes: TaskNode[], edges: Edge[]) => {
    // We strip the function callbacks from node data before saving to Firestore
    const serializableNodes = nodes.map((node) => ({
      ...node,
      data: {
        title: node.data.title,
        status: node.data.status,
      },
    }));

    const boardRef = doc(db, "boards", userId);
    await setDoc(boardRef, {
      nodes: serializableNodes,
      edges,
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
