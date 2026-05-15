import type { Edge } from "reactflow";
import type { TaskNode } from "@/types/task";

export interface BoardData {
  nodes: TaskNode[];
  edges: Edge[];
  updatedAt: number;
}

/**
 * Persistence Layer: Handles local storage of data.
 */
export interface IPersistence {
  save(userId: string, data: BoardData): Promise<void>;
  load(userId: string): Promise<BoardData | null>;
}

/**
 * Remote Adapter: Infrastructure layer for external services (e.g., Firestore).
 */
export interface IRemoteAdapter {
  push(userId: string, data: BoardData): Promise<void>;
  pull(userId: string): Promise<BoardData | null>;
}

/**
 * Sync Service: Orchestrates data flow between local and remote.
 */
export interface ISyncService {
  sync(userId: string, data: BoardData): Promise<void>;
  status: "saved" | "saving" | "error";
  onStatusChange(callback: (status: "saved" | "saving" | "error") => void): void;
}

/**
 * Repository: Higher-level abstraction for domain data access.
 */
export interface ITaskRepository {
  getBoard(userId: string): Promise<BoardData | null>;
  saveBoard(userId: string, data: BoardData): Promise<void>;
}
