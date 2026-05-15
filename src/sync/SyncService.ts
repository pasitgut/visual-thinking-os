import type { BoardData, IRemoteAdapter, ISyncService } from "@/sync/types";

export class SyncService implements ISyncService {
  public status: "saved" | "saving" | "error" = "saved";
  private listeners: ((status: "saved" | "saving" | "error") => void)[] = [];

  constructor(private remote: IRemoteAdapter) {}

  async sync(userId: string, data: BoardData): Promise<void> {
    this.setStatus("saving");
    try {
      await this.remote.push(userId, data);
      this.setStatus("saved");
    } catch (error) {
      console.error("Sync failed:", error);
      this.setStatus("error");
      throw error;
    }
  }

  onStatusChange(callback: (status: "saved" | "saving" | "error") => void): void {
    this.listeners.push(callback);
  }

  private setStatus(status: "saved" | "saving" | "error") {
    this.status = status;
    for (const listener of this.listeners) {
      listener(status);
    }
  }
}
