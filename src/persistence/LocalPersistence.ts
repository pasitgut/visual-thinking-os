import type { BoardData, IPersistence } from "@/sync/types";

const STORAGE_KEY_PREFIX = "visual-mindmap-local-";

export class LocalPersistence implements IPersistence {
  async save(userId: string, data: BoardData): Promise<void> {
    localStorage.setItem(
      `${STORAGE_KEY_PREFIX}${userId}`,
      JSON.stringify(data)
    );
  }

  async load(userId: string): Promise<BoardData | null> {
    const item = localStorage.getItem(`${STORAGE_KEY_PREFIX}${userId}`);
    if (!item) return null;
    try {
      return JSON.parse(item) as BoardData;
    } catch (e) {
      console.error("Failed to parse local data", e);
      return null;
    }
  }
}
