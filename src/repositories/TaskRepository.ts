import type { BoardData, IPersistence, ITaskRepository, ISyncService } from "@/sync/types";

export class TaskRepository implements ITaskRepository {
  constructor(
    private persistence: IPersistence,
    private syncService: ISyncService
  ) {}

  async getBoard(userId: string): Promise<BoardData | null> {
    // Try local first (Local-First principle)
    const local = await this.persistence.load(userId);
    if (local) return local;

    // Fallback to remote would happen elsewhere or here depending on strategy
    // For now, minimal implementation
    return null;
  }

  async saveBoard(userId: string, data: BoardData): Promise<void> {
    // Always save locally first
    await this.persistence.save(userId, data);
    
    // Trigger sync (Sync Layer handles background pushing)
    this.syncService.sync(userId, data).catch(() => {
      // Silently handle sync errors in repo, status is managed in syncService
    });
  }
}
