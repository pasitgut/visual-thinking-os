import { FirestoreAdapter } from "@/adapters/FirestoreAdapter";
import { LocalPersistence } from "@/persistence/LocalPersistence";
import { TaskRepository } from "@/repositories/TaskRepository";
import { SyncService } from "@/sync/SyncService";

// Infrastructure
export const firestoreAdapter = new FirestoreAdapter();
export const localPersistence = new LocalPersistence();

// Domain Services
export const syncService = new SyncService(firestoreAdapter);
export const taskRepository = new TaskRepository(localPersistence, syncService);
