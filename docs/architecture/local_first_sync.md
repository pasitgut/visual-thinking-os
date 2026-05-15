# Local-First Sync Architecture

This document describes the refactored synchronization architecture designed for a Local-First experience.

## Architecture Layers

The system is divided into five distinct layers to ensure separation of concerns and maintainability.

### 1. UI Layer
- **Components**: React components (e.g., `MindmapBoard`, `TaskNode`).
- **Responsibility**: Render state and capture user intent.
- **Interaction**: Only talks to the **Local Store**.

### 2. Local Store (Zustand)
- **File**: `src/stores/useTaskStore.ts`
- **Responsibility**: Single source of truth for the UI. Manages transient state and triggers data operations.
- **Interaction**: Calls the **Repository** for data persistence.

### 3. Sync Layer
- **Interface**: `ISyncService` (`src/sync/types.ts`)
- **Implementation**: `SyncService` (`src/sync/SyncService.ts`)
- **Responsibility**: Orchestrates data flow between local and remote. Handles background synchronization and status tracking.
- **Interaction**: Pushes data to the **Remote Adapter**.

### 4. Repository Layer
- **Interface**: `ITaskRepository` (`src/sync/types.ts`)
- **Implementation**: `TaskRepository` (`src/repositories/TaskRepository.ts`)
- **Responsibility**: High-level data access API. Implements "Local-First" logic (write local then sync remote, read local then fallback remote).
- **Interaction**: Uses **Persistence Layer** and **Sync Layer**.

### 5. Infrastructure Layer
- **Persistence**: `LocalPersistence` (`src/persistence/LocalPersistence.ts`) - Handles `localStorage`/IndexedDB.
- **Remote Adapter**: `FirestoreAdapter` (`src/adapters/FirestoreAdapter.ts`) - Handles direct communication with Firebase.

## Dependency Flow

`UI` → `Local Store` → `TaskRepository` → `LocalPersistence`
                             ↓
                        `SyncService` → `FirestoreAdapter`

## Key Rules
- **No Direct Firestore**: UI components and the Local Store must never call Firestore directly.
- **Local-First Writes**: Data is always saved to local persistence immediately. Remote sync happens in the background.
- **Single Source of Truth**: The Zustand store remains the source of truth for all UI renders.

## Migration Notes
- `BoardService` has been deprecated and replaced by `TaskRepository`.
- `BoardData` now includes an `updatedAt` timestamp for future conflict resolution support.
- Initialization now attempts to load from `LocalPersistence` before pulling from Firestore.
