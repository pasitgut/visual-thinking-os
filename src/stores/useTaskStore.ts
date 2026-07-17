import debounce from "lodash/debounce";
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  type Connection,
  type Edge,
  type EdgeChange,
  type NodeChange,
  type OnConnect,
  type OnEdgesChange,
  type OnNodesChange,
  type Viewport,
} from "reactflow";
import { v4 as uuidv4 } from "uuid";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { getSubtreeIds } from "@/lib/reactflow/graphUtils";
import {
  calculateBestHandles,
  updateDynamicHandles,
} from "@/lib/reactflow/handleUtils";
import { getLayoutedElements } from "@/lib/reactflow/layoutUtils";
import {
  getIncrementalPosition,
  reconcileLayout,
  spatialEngine,
} from "@/lib/reactflow/spatialEngine";
import { taskRepository, syncService, firestoreAdapter } from "@/sync/registry";
import type {
  InteractionMode,
  RelationshipType,
  TaskColor,
  TaskContent,
  TaskNode,
  TaskNodeData,
  TaskStatus,
  TaskType,
  ViewType,
} from "@/types/task";
import { useAuthStore } from "./useAuthStore";

let physicsLoopId: number | null = null;

interface TaskState {
  nodes: TaskNode[];
  edges: Edge[];
  currentView: ViewType;
  interactionMode: InteractionMode;
  focusNodeId: string | null;
  focusRootId: string;
  navigationHistory: string[];
  selectedNodeIds: string[];
  editingNodeId: string | null;
  isSearchOpen: boolean;
  recentNodeIds: string[];
  bookmarks: Record<string, { x: number; y: number; zoom: number }>;
  isLoading: boolean;
  saveStatus: "saved" | "saving" | "error";
  viewport: Viewport;
  draggingNodeId: string | null;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  setView: (view: ViewType) => void;
  setInteractionMode: (mode: InteractionMode) => void;
  setFocusNodeId: (id: string | null) => void;
  setFocusRootId: (id: string) => void;
  pushFocusRootId: (id: string) => void;
  popFocusRootId: () => void;
  setSelectedNodeIds: (ids: string[]) => void;
  setEditingNodeId: (id: string | null) => void;
  setDraggingNodeId: (id: string | null) => void;
  setSearchOpen: (open: boolean) => void;
  startPhysicsLoop: () => void;
  stopPhysicsLoop: () => void;
  createNode: (params?: {
    parentId?: string;
    siblingId?: string;
    initialData?: Partial<TaskNodeData>;
    position?: { x: number; y: number };
    skipFocus?: boolean;
  }) => void;
  deleteNode: (id: string) => void;
  deleteEdges: (ids: string[]) => void;
  updateNodeData: (id: string, data: Partial<TaskNodeData>) => void;
  // Legacy aliases for backward compatibility or specific use cases
  updateNodeTitle: (id: string, title: string) => void;
  updateNodeStatus: (id: string, status: TaskStatus) => void;
  updateNodeType: (id: string, type: TaskType) => void;
  updateNodeColor: (id: string, color: TaskColor) => void;
  updateNodeDeadline: (id: string, deadline: string) => void;
  updateNodeImportance: (id: string, isImportant: boolean) => void;
  updateNodeContent: (id: string, content: Partial<TaskContent>) => void;
  updateEdgeType: (id: string, type: RelationshipType) => void;
  toggleNodePin: (id: string) => void;
  toggleNodeCollapse: (id: string) => void;
  addToRecent: (id: string) => void;
  setBookmark: (
    key: string,
    view: { x: number; y: number; zoom: number },
  ) => void;
  setViewport: (viewport: Viewport) => void;
  initialize: (userId: string) => Promise<void>;
  retrySync: () => Promise<void>;
  createRootTask: () => void;
  createExampleBoard: () => void;
  createDesignThinkingBoard: () => void;
  createCriticalThinkingBoard: () => void;
  createSystemsThinkingBoard: () => void;
  saveToFirestore: () => void;
  applyLayout: () => void;
  selectNode: (id: string) => void;
}

const DEFAULT_NODES: TaskNode[] = [
  {
    id: "root",
    type: "task",
    position: { x: 0, y: 0 },
    data: {
      title: "Main Idea",
      status: "todo",
      type: "root",
      color: "default",
      depth: 0,
    } as TaskNodeData,
  },
];

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => {
      const getUserId = () => useAuthStore.getState().user?.uid;

      // Listen to sync status changes from the sync layer
      syncService.onStatusChange((status) => {
        set({ saveStatus: status });
      });

      const debouncedSave = debounce(
        async (userId: string, nodes: TaskNode[], edges: Edge[]) => {
          try {
            await taskRepository.saveBoard(userId, {
              nodes,
              edges,
              updatedAt: Date.now(),
            });
          } catch (error) {
            console.error("Failed to save board through repository:", error);
            set({ saveStatus: "error" });
          }
        },
        5000,
      );

      const throttledUpdateHandles = debounce(
        (nodes: TaskNode[], edges: Edge[]) => {
          const updatedEdges = updateDynamicHandles(nodes, edges);
          if (updatedEdges !== get().edges) {
            set({ edges: updatedEdges });
          }
        },
        32,
      );

      const wireData = (nodes: TaskNode[]) =>
        nodes.map((node) => ({
          ...node,
          data: {
            ...node.data,
            depth: node.data.depth ?? 0,
            type: node.data.type ?? (node.id === "root" ? "root" : "idea"),
            createdAt: node.data.createdAt ?? Date.now(),
            updatedAt: node.data.updatedAt ?? Date.now(),
            deadline: node.data.deadline ?? "No deadline",
            isImportant: node.data.isImportant ?? false,
            isPinned: node.data.isPinned ?? false,
            isCollapsed: node.data.isCollapsed ?? false,
          },
        }));

      return {
        nodes: [],
        edges: [],
        currentView: "mindmap",
        interactionMode: "standard",
        focusNodeId: null,
        focusRootId: "root",
        navigationHistory: [],
        selectedNodeIds: [],
        editingNodeId: null,
        isSearchOpen: false,
        recentNodeIds: [],
        bookmarks: {},
        isLoading: true,
        saveStatus: "saved",
        viewport: { x: 0, y: 0, zoom: 1 },
        draggingNodeId: null,

        setView: (view: ViewType) => set({ currentView: view }),
        setInteractionMode: (mode: InteractionMode) =>
          set({ interactionMode: mode }),
        setFocusNodeId: (id: string | null) => set({ focusNodeId: id }),
        setFocusRootId: (id: string) =>
          set({ focusRootId: id, navigationHistory: [] }),
        pushFocusRootId: (id: string) =>
          set((state) => {
            if (state.focusRootId === id) return state;
            return {
              navigationHistory: [
                ...state.navigationHistory,
                state.focusRootId,
              ],
              focusRootId: id,
            };
          }),
        popFocusRootId: () =>
          set((state) => {
            if (state.navigationHistory.length === 0) return state;
            const newHistory = [...state.navigationHistory];
            const previousRootId = newHistory.pop()!;
            return {
              navigationHistory: newHistory,
              focusRootId: previousRootId,
            };
          }),
        setSearchOpen: (open: boolean) => set({ isSearchOpen: open }),

        onNodesChange: (changes: NodeChange[]) => {
          const currentNodes = get().nodes;
          const currentEdges = get().edges;
          const draggingId = get().draggingNodeId;

          // Identify dragging state changes
          const dragChange = changes.find(
            (c) => c.type === "position" && (c as any).dragging,
          ) as any;

          if (dragChange && dragChange.id !== draggingId) {
            set({ draggingNodeId: dragChange.id });
            spatialEngine.updateDimensions(currentNodes);
            get().startPhysicsLoop();
          } else if (!dragChange && draggingId) {
            // Check if user stopped dragging
            const isAnyDragging = changes.some(
              (c) => c.type === "position" && (c as any).dragging,
            );
            if (!isAnyDragging) {
              set({ draggingNodeId: null });
            }
          }

          let updatedNodes = [...currentNodes];
          const positionChanges = changes.filter(
            (c) => c.type === "position" && (c as any).dragging,
          );

          const isDragging = positionChanges.length > 0;

          if (positionChanges.length === 1) {
            const change = positionChanges[0] as any;
            const node = currentNodes.find((n) => n.id === change.id);

            if (node && change.position) {
              const dx = change.position.x - node.position.x;
              const dy = change.position.y - node.position.y;

              if (dx !== 0 || dy !== 0) {
                const subtreeIds = getSubtreeIds(node.id, currentEdges);
                subtreeIds.delete(node.id);

                if (subtreeIds.size > 0) {
                  updatedNodes = updatedNodes.map((n) => {
                    if (subtreeIds.has(n.id)) {
                      return {
                        ...n,
                        position: {
                          x: n.position.x + dx,
                          y: n.position.y + dy,
                        },
                      };
                    }
                    return n;
                  });
                }
              }
            }
          }

          const finalNodes = applyNodeChanges(
            changes,
            updatedNodes,
          ) as TaskNode[];

          if (isDragging) {
            set({ nodes: finalNodes });
            throttledUpdateHandles(finalNodes, currentEdges);
          } else {
            const finalEdges = updateDynamicHandles(finalNodes, currentEdges);
            const selectionChange = changes.find((c) => c.type === "select");

            if (selectionChange) {
              const selectedIds = finalNodes
                .filter((n) => n.selected)
                .map((n) => n.id);

              set({
                nodes: finalNodes,
                edges: finalEdges,
                selectedNodeIds: selectedIds,
                editingNodeId: get().editingNodeId,
              });
            } else {
              set({
                nodes: finalNodes,
                edges: finalEdges,
                editingNodeId: get().editingNodeId,
              });
            }
          }

          if (changes.some((c) => c.type === "position")) {
            get().saveToFirestore();
          }
        },

        onEdgesChange: (changes: EdgeChange[]) => {
          const updatedEdges = applyEdgeChanges(changes, get().edges);
          set({ edges: updatedEdges });
          get().saveToFirestore();
        },

        onConnect: (connection: Connection) => {
          if (connection.source === connection.target) return;

          let { sourceHandle, targetHandle } = connection;
          if (!sourceHandle || !targetHandle) {
            const { nodes } = get();
            const sourceNode = nodes.find((n) => n.id === connection.source);
            const targetNode = nodes.find((n) => n.id === connection.target);
            if (sourceNode && targetNode) {
              const best = calculateBestHandles(sourceNode, targetNode);
              sourceHandle = sourceHandle || best.sourceHandle;
              targetHandle = targetHandle || best.targetHandle;
            }
          }

          const updatedEdges = addEdge(
            {
              ...connection,
              sourceHandle,
              targetHandle,
              type: "relationship",
              data: { type: "related" },
            },
            get().edges,
          );
          set({ edges: updatedEdges });
          get().saveToFirestore();
        },

        setSelectedNodeIds: (ids: string[]) => {
          const nextNodes = get().nodes.map((node) => ({
            ...node,
            selected: ids.includes(node.id),
          }));
          set({ nodes: nextNodes, selectedNodeIds: ids });
        },

        selectNode: (id: string) => {
          const { nodes, edges } = get();
          const ancestors = new Set<string>();
          let currentId = id;

          while (currentId) {
            const parentEdge = edges.find(
              (e) =>
                e.target === currentId &&
                (e.data?.type === "hierarchy" || e.data?.type === "related"),
            );
            if (parentEdge) {
              ancestors.add(parentEdge.source);
              currentId = parentEdge.source;
            } else {
              break;
            }
          }

          const nextNodes = nodes.map((node) => ({
            ...node,
            selected: node.id === id,
            data: {
              ...node.data,
              isCollapsed: ancestors.has(node.id)
                ? false
                : (node.data.isCollapsed ?? false),
            },
          }));

          set({
            nodes: nextNodes,
            selectedNodeIds: [id],
            editingNodeId: null,
          });
          get().addToRecent(id);
        },

        setEditingNodeId: (id: string | null) => {
          set({ editingNodeId: id });
        },

        setDraggingNodeId: (id: string | null) => {
          set({ draggingNodeId: id });
        },

        startPhysicsLoop: () => {
          if (physicsLoopId !== null) return;

          const step = () => {
            const state = get();
            const { nodes, edges, draggingNodeId } = state;
            
            // Step the spatial engine
            const nextNodes = spatialEngine.step(nodes, draggingNodeId);
            
            if (nextNodes !== nodes) {
              set({ nodes: nextNodes });
              throttledUpdateHandles(nextNodes, edges);
              get().saveToFirestore();
            }

            // Only stop if not dragging AND physics has settled
            if (get().draggingNodeId === null && spatialEngine.isIdle()) {
              physicsLoopId = null;
              return;
            }

            physicsLoopId = requestAnimationFrame(step);
          };

          physicsLoopId = requestAnimationFrame(step);
        },

        stopPhysicsLoop: () => {
          if (physicsLoopId !== null) {
            cancelAnimationFrame(physicsLoopId);
            physicsLoopId = null;
          }
        },

        initialize: async (userId: string) => {
          set({ isLoading: true });
          try {
            // 1. Try Local-First repository
            let board = await taskRepository.getBoard(userId);
            
            // 2. Fallback to Remote pull if local is empty
            if (!board) {
              board = await firestoreAdapter.pull(userId);
              if (board) {
                // Seed local cache
                await taskRepository.saveBoard(userId, board);
              }
            }

            if (board) {
              set({
                nodes: wireData(board.nodes),
                edges: board.edges,
                isLoading: false,
              });
            } else {
              set({
                nodes: wireData(DEFAULT_NODES),
                edges: [],
                isLoading: false,
              });
            }
          } catch (error) {
            console.error("Failed to load board:", error);
            set({ isLoading: false });
          }
        },

        retrySync: async () => {
          const userId = getUserId();
          if (!userId || get().saveStatus === "saving") return;

          const now = Date.now();
          const lastRetry = (window as any).lastRetryTime || 0;
          if (now - lastRetry < 5000) return;
          (window as any).lastRetryTime = now;

          try {
            await syncService.sync(userId, {
              nodes: get().nodes,
              edges: get().edges,
              updatedAt: Date.now(),
            });
          } catch (_error) {
            // Error handled by status listener
          }
        },

        createRootTask: () => {
          set({ nodes: wireData(DEFAULT_NODES), edges: [] });
          get().saveToFirestore();
        },

        createExampleBoard: () => {
          const rootId = "root";
          const subId1 = uuidv4();
          const subId2 = uuidv4();
          const childId1 = uuidv4();
          const childId2 = uuidv4();

          const exampleNodes: TaskNode[] = [
            {
              id: rootId,
              type: "task",
              position: { x: 0, y: 0 },
              data: {
                title: "🚀 Visual Mindmap Project",
                status: "in-progress",
                depth: 0,
                type: "root",
                color: "blue",
                createdAt: Date.now(),
                updatedAt: Date.now(),
              },
            },
            {
              id: subId1,
              type: "task",
              position: { x: -150, y: 150 },
              data: {
                title: "⌨️ Workflow Optimization",
                status: "todo",
                depth: 1,
                type: "idea",
                color: "purple",
                createdAt: Date.now(),
                updatedAt: Date.now(),
              },
            },
            {
              id: subId2,
              type: "task",
              position: { x: 150, y: 150 },
              data: {
                title: "🎨 UI Polish",
                status: "todo",
                depth: 1,
                type: "idea",
                color: "pink",
                createdAt: Date.now(),
                updatedAt: Date.now(),
              },
            },
            {
              id: childId1,
              type: "task",
              position: { x: -150, y: 300 },
              data: {
                title: "Master keyboard shortcuts",
                status: "done",
                depth: 2,
                type: "idea",
                color: "default",
                createdAt: Date.now(),
                updatedAt: Date.now(),
              },
            },
            {
              id: childId2,
              type: "task",
              position: { x: 150, y: 300 },
              data: {
                title: "Implement pastel colors",
                status: "done",
                depth: 2,
                type: "idea",
                color: "green",
                createdAt: Date.now(),
                updatedAt: Date.now(),
              },
            },
          ];

          const exampleEdges: Edge[] = [
            {
              id: `e-r-s1`,
              source: rootId,
              target: subId1,
              data: { type: "related" },
            },
            {
              id: `e-r-s2`,
              source: rootId,
              target: subId2,
              data: { type: "related" },
            },
            {
              id: `e-s1-c1`,
              source: subId1,
              target: childId1,
              data: { type: "related" },
            },
            {
              id: `e-s2-c2`,
              source: subId2,
              target: childId2,
              data: { type: "related" },
            },
          ];

          set({
            nodes: wireData(exampleNodes),
            edges: exampleEdges,
            isLoading: false,
          });
          setTimeout(() => get().applyLayout(), 100);
          get().saveToFirestore();
        },

        createDesignThinkingBoard: () => {
          const rootId = "root";
          const eId = uuidv4();
          const dId = uuidv4();
          const iId = uuidv4();
          const pId = uuidv4();
          const tId = uuidv4();

          const cE1 = uuidv4();
          const cE2 = uuidv4();
          const cD1 = uuidv4();
          const cI1 = uuidv4();
          const cP1 = uuidv4();
          const cT1 = uuidv4();

          const nodes: TaskNode[] = [
            {
              id: rootId,
              type: "task",
              position: { x: 0, y: 0 },
              data: {
                title: "🚀 Design Thinking Workspace (กระบวนการคิดเชิงออกแบบ)",
                status: "in-progress",
                depth: 0,
                type: "root",
                color: "blue",
                createdAt: Date.now(),
                updatedAt: Date.now(),
              },
            },
            {
              id: eId,
              type: "task",
              position: { x: -350, y: 150 },
              data: {
                title: "1. เข้าใจผู้ใช้ (Empathize)",
                status: "todo",
                depth: 1,
                type: "empathize",
                color: "pink",
                createdAt: Date.now(),
                updatedAt: Date.now(),
              },
            },
            {
              id: cE1,
              type: "task",
              position: { x: -450, y: 280 },
              data: {
                title: "สัมภาษณ์ผู้ใช้งานหลัก 5 คน",
                status: "done",
                depth: 2,
                type: "empathize",
                color: "default",
                createdAt: Date.now(),
                updatedAt: Date.now(),
              },
            },
            {
              id: cE2,
              type: "task",
              position: { x: -250, y: 280 },
              data: {
                title: "สร้าง Empathy Map (Say/Do/Think/Feel)",
                status: "todo",
                depth: 2,
                type: "empathize",
                color: "default",
                createdAt: Date.now(),
                updatedAt: Date.now(),
              },
            },
            {
              id: dId,
              type: "task",
              position: { x: -100, y: 150 },
              data: {
                title: "2. นิยามปัญหา (Define)",
                status: "todo",
                depth: 1,
                type: "define",
                color: "yellow",
                createdAt: Date.now(),
                updatedAt: Date.now(),
              },
            },
            {
              id: cD1,
              type: "task",
              position: { x: -100, y: 280 },
              data: {
                title: "ตั้งคำถาม How Might We...? (เราจะทำอย่างไรให้...)",
                status: "todo",
                depth: 2,
                type: "define",
                color: "default",
                createdAt: Date.now(),
                updatedAt: Date.now(),
              },
            },
            {
              id: iId,
              type: "task",
              position: { x: 100, y: 150 },
              data: {
                title: "3. คิดไอเดีย (Ideate)",
                status: "todo",
                depth: 1,
                type: "ideate",
                color: "yellow",
                createdAt: Date.now(),
                updatedAt: Date.now(),
              },
            },
            {
              id: cI1,
              type: "task",
              position: { x: 100, y: 280 },
              data: {
                title: "ระดมสมองและจัดกลุ่มไอเดียด้วยฟีเจอร์ Mindmap",
                status: "todo",
                depth: 2,
                type: "ideate",
                color: "default",
                createdAt: Date.now(),
                updatedAt: Date.now(),
              },
            },
            {
              id: pId,
              type: "task",
              position: { x: 300, y: 150 },
              data: {
                title: "4. ต้นแบบ (Prototype)",
                status: "todo",
                depth: 1,
                type: "prototype",
                color: "purple",
                createdAt: Date.now(),
                updatedAt: Date.now(),
              },
            },
            {
              id: cP1,
              type: "task",
              position: { x: 300, y: 280 },
              data: {
                title: "สร้าง Figma Mockup และ User Flow อย่างง่าย",
                status: "todo",
                depth: 2,
                type: "prototype",
                color: "default",
                createdAt: Date.now(),
                updatedAt: Date.now(),
              },
            },
            {
              id: tId,
              type: "task",
              position: { x: 500, y: 150 },
              data: {
                title: "5. ทดสอบ (Test)",
                status: "todo",
                depth: 1,
                type: "test",
                color: "green",
                createdAt: Date.now(),
                updatedAt: Date.now(),
              },
            },
            {
              id: cT1,
              type: "task",
              position: { x: 500, y: 280 },
              data: {
                title: "ทำ User Testing และเก็บฟีดแบกมาปรับปรุง",
                status: "todo",
                depth: 2,
                type: "test",
                color: "default",
                createdAt: Date.now(),
                updatedAt: Date.now(),
              },
            },
          ];

          const edges: Edge[] = [
            { id: "e-root-e", source: rootId, target: eId, data: { type: "hierarchy" } },
            { id: "e-e-ce1", source: eId, target: cE1, data: { type: "hierarchy" } },
            { id: "e-e-ce2", source: eId, target: cE2, data: { type: "hierarchy" } },
            { id: "e-root-d", source: rootId, target: dId, data: { type: "hierarchy" } },
            { id: "e-d-cd1", source: dId, target: cD1, data: { type: "hierarchy" } },
            { id: "e-root-i", source: rootId, target: iId, data: { type: "hierarchy" } },
            { id: "e-i-ci1", source: iId, target: cI1, data: { type: "hierarchy" } },
            { id: "e-root-p", source: rootId, target: pId, data: { type: "hierarchy" } },
            { id: "e-p-cp1", source: pId, target: cP1, data: { type: "hierarchy" } },
            { id: "e-root-t", source: rootId, target: tId, data: { type: "hierarchy" } },
            { id: "e-t-ct1", source: tId, target: cT1, data: { type: "hierarchy" } },
          ];

          set({
            nodes: wireData(nodes),
            edges,
            isLoading: false,
          });
          setTimeout(() => get().applyLayout(), 100);
          get().saveToFirestore();
        },

        createCriticalThinkingBoard: () => {
          const rootId = "root";
          const claimId = uuidv4();
          const premAId = uuidv4();
          const premBId = uuidv4();
          const evidAId = uuidv4();
          const objId = uuidv4();
          const fallacyId = uuidv4();

          const nodes: TaskNode[] = [
            {
              id: rootId,
              type: "task",
              position: { x: 0, y: 0 },
              data: {
                title: "🤔 Critical Thinking Workspace (แผนภูมิวิเคราะห์เหตุผล)",
                status: "in-progress",
                depth: 0,
                type: "root",
                color: "blue",
                createdAt: Date.now(),
                updatedAt: Date.now(),
              },
            },
            {
              id: claimId,
              type: "task",
              position: { x: 0, y: 150 },
              data: {
                title: "ข้อสรุปหลัก (Main Claim): การทำงานแบบ Remote ช่วยเพิ่ม Productivity",
                status: "todo",
                depth: 1,
                type: "claim",
                color: "blue",
                createdAt: Date.now(),
                updatedAt: Date.now(),
              },
            },
            {
              id: premAId,
              type: "task",
              position: { x: -250, y: 300 },
              data: {
                title: "เหตุผลสนับสนุน A: พนักงานประหยัดเวลาเดินทาง",
                status: "todo",
                depth: 2,
                type: "premise",
                color: "purple",
                createdAt: Date.now(),
                updatedAt: Date.now(),
              },
            },
            {
              id: evidAId,
              type: "task",
              position: { x: -250, y: 430 },
              data: {
                title: "หลักฐาน: ผลวิจัยพบว่าพนักงานประหยัดเวลาเฉลี่ย 1.5 ชม./วัน",
                status: "todo",
                depth: 3,
                type: "evidence",
                color: "green",
                createdAt: Date.now(),
                updatedAt: Date.now(),
              },
            },
            {
              id: premBId,
              type: "task",
              position: { x: 250, y: 300 },
              data: {
                title: "เหตุผลสนับสนุน B: สภาพแวดล้อมที่บ้านเงียบสงบและมีสมาธิมากกว่า",
                status: "todo",
                depth: 2,
                type: "premise",
                color: "purple",
                createdAt: Date.now(),
                updatedAt: Date.now(),
              },
            },
            {
              id: objId,
              type: "task",
              position: { x: 0, y: 300 },
              data: {
                title: "ข้อคัดค้าน (Objection): พนักงานบางส่วนรู้สึกโดดเดี่ยวและสื่อสารช้าลง",
                status: "todo",
                depth: 2,
                type: "objection",
                color: "pink",
                createdAt: Date.now(),
                updatedAt: Date.now(),
              },
            },
            {
              id: fallacyId,
              type: "task",
              position: { x: 0, y: 430 },
              data: {
                title: "ระวังเหตุผลวิบัติ (Fallacy): คิดว่าทุกคนมีห้องทำงานส่วนตัวที่เงียบสงบ",
                status: "todo",
                depth: 3,
                type: "fallacy",
                color: "yellow",
                createdAt: Date.now(),
                updatedAt: Date.now(),
              },
            },
          ];

          const edges: Edge[] = [
            { id: "e-root-claim", source: rootId, target: claimId, data: { type: "related" } },
            { id: "e-premA-claim", source: premAId, target: claimId, data: { type: "supports" } },
            { id: "e-evidA-premA", source: evidAId, target: premAId, data: { type: "supports" } },
            { id: "e-premB-claim", source: premBId, target: claimId, data: { type: "supports" } },
            { id: "e-obj-claim", source: objId, target: claimId, data: { type: "refutes" } },
            { id: "e-fallacy-obj", source: fallacyId, target: objId, data: { type: "refutes" } },
          ];

          set({
            nodes: wireData(nodes),
            edges,
            isLoading: false,
          });
          setTimeout(() => get().applyLayout(), 100);
          get().saveToFirestore();
        },

        createSystemsThinkingBoard: () => {
          const rootId = "root";
          const stockId = uuidv4();
          const flowInId = uuidv4();
          const flowOutId = uuidv4();
          const varId = uuidv4();

          const nodes: TaskNode[] = [
            {
              id: rootId,
              type: "task",
              position: { x: 0, y: 0 },
              data: {
                title: "🔄 Systems Thinking Workspace (แผนผังระบบ Causal Loop)",
                status: "in-progress",
                depth: 0,
                type: "root",
                color: "blue",
                createdAt: Date.now(),
                updatedAt: Date.now(),
              },
            },
            {
              id: stockId,
              type: "task",
              position: { x: 0, y: 180 },
              data: {
                title: "อ่างสะสม (Stock): จำนวนพนักงานในบริษัท",
                status: "todo",
                depth: 1,
                type: "stock",
                color: "default",
                initialValue: 120,
                createdAt: Date.now(),
                updatedAt: Date.now(),
              },
            },
            {
              id: flowInId,
              type: "task",
              position: { x: -250, y: 180 },
              data: {
                title: "อัตราไหลเข้า (Flow In): อัตราการจ้างงานใหม่",
                status: "todo",
                depth: 2,
                type: "flow",
                color: "blue",
                flowRate: 5,
                createdAt: Date.now(),
                updatedAt: Date.now(),
              },
            },
            {
              id: flowOutId,
              type: "task",
              position: { x: 250, y: 180 },
              data: {
                title: "อัตราไหลออก (Flow Out): อัตราการลาออก",
                status: "todo",
                depth: 2,
                type: "flow",
                color: "pink",
                flowRate: 2,
                createdAt: Date.now(),
                updatedAt: Date.now(),
              },
            },
            {
              id: varId,
              type: "task",
              position: { x: -250, y: 300 },
              data: {
                title: "ตัวแปรเสริม (Variable): อัตราการเติบโตธุรกิจ",
                status: "todo",
                depth: 2,
                type: "variable",
                color: "purple",
                createdAt: Date.now(),
                updatedAt: Date.now(),
              },
            },
          ];

          const edges: Edge[] = [
            { id: "e-root-stock", source: rootId, target: stockId, data: { type: "related" } },
            { id: "e-flowin-stock", source: flowInId, target: stockId, data: { type: "positive_influence" } },
            { id: "e-flowout-stock", source: flowOutId, target: stockId, data: { type: "negative_influence" } },
            { id: "e-var-flowin", source: varId, target: flowInId, data: { type: "positive_influence" } },
            { id: "e-stock-flowout", source: stockId, target: flowOutId, data: { type: "positive_influence" } },
          ];

          set({
            nodes: wireData(nodes),
            edges,
            isLoading: false,
          });
          setTimeout(() => get().applyLayout(), 100);
          get().saveToFirestore();
        },

        saveToFirestore: () => {
          const userId = getUserId();
          if (!userId) return;
          set({ saveStatus: "saving" });
          debouncedSave(userId, get().nodes, get().edges);
        },

        createNode: (params = {}) => {
          const {
            parentId: explicitParentId,
            siblingId,
            initialData,
            position: posOverride,
          } = params;

          let resolvedParentId = explicitParentId;
          if (siblingId) {
            if (siblingId === "root") return;
            const parentEdge = get().edges.find((e) => e.target === siblingId);
            if (parentEdge) {
              resolvedParentId = parentEdge.source;
            }
          }

          const nodes = get().nodes;
          const edges = get().edges;
          const parentNode = resolvedParentId
            ? nodes.find((n) => n.id === resolvedParentId)
            : undefined;

          const newNodeId = uuidv4();
          let depth = 0;
          let color: TaskColor = "default";
          let position = posOverride || {
            x: (Math.random() - 0.5) * 400,
            y: (Math.random() - 0.5) * 400,
          };

          if (parentNode) {
            depth = (parentNode.data.depth ?? 0) + 1;
            const parentColor = parentNode.data.color;
            color =
              parentColor && parentColor !== "default"
                ? parentColor
                : "default";
            if (!posOverride) {
              position = getIncrementalPosition(parentNode, nodes, edges);
            }
          }

          const newNode: TaskNode = {
            id: newNodeId,
            type: "task",
            position,
            data: {
              title: "",
              status: "todo",
              depth,
              type: "idea",
              color,
              createdAt: Date.now(),
              updatedAt: Date.now(),
              deadline: "No deadline",
              isImportant: false,
              isPinned: false,
              isCollapsed: false,
              ...initialData,
            },
          };

          let newEdge: Edge | null = null;
          let nextNodes: TaskNode[] = [];

          if (parentNode) {
            const bestHandles = calculateBestHandles(parentNode, newNode);
            newEdge = {
              id: `e-${parentNode.id}-${newNodeId}`,
              source: parentNode.id,
              target: newNodeId,
              sourceHandle: bestHandles.sourceHandle,
              targetHandle: bestHandles.targetHandle,
              data: { type: "related" },
            };

            nextNodes = nodes.map((n) =>
              n.id === parentNode.id
                ? {
                    ...n,
                    data: { ...n.data, isCollapsed: false },
                    selected: false,
                  }
                : { ...n, selected: false },
            );
          } else {
            nextNodes = nodes.map((n) => ({ ...n, selected: false }));
          }

          nextNodes = nextNodes.concat({ ...newNode, selected: true });
          const nextEdges = newEdge ? [...edges, newEdge] : edges;

          const shouldFocus = !params.skipFocus && !initialData?.title;

          set({
            nodes: nextNodes,
            edges: nextEdges,
            selectedNodeIds: [newNodeId],
            editingNodeId: shouldFocus ? newNodeId : null,
          });

          if (parentNode) {
            const { focusRootId, pushFocusRootId } = get();
            let relativeDepth = 0;
            let currId = parentNode.id;
            while (currId && currId !== focusRootId) {
              const edge = nextEdges.find(
                (e) =>
                  e.target === currId &&
                  (e.data?.type === "hierarchy" || e.data?.type === "related"),
              );
              if (!edge) break;
              currId = edge.source;
              relativeDepth++;
            }

            if (relativeDepth === 2) {
              pushFocusRootId(parentNode.id);
            }
          }

          get().saveToFirestore();
        },

        deleteNode: (id: string) => {
          if (id === "root") return;
          const { nodes, edges, focusNodeId } = get();
          const parentEdge = edges.find((e) => e.target === id);
          const parentId = parentEdge?.source;
          const nodesToDelete = getSubtreeIds(id, edges);

          const nextNodes = nodes.filter((n) => !nodesToDelete.has(n.id));
          const nextEdges = edges.filter(
            (e) => !nodesToDelete.has(e.source) && !nodesToDelete.has(e.target),
          );

          let nextFocusId = focusNodeId;
          if (nodesToDelete.has(focusNodeId || "")) {
            nextFocusId = parentId || null;
          }

          set({
            nodes: nextNodes,
            edges: nextEdges,
            focusNodeId: nextFocusId,
            selectedNodeIds: parentId ? [parentId] : [],
          });

          get().saveToFirestore();
        },

        deleteEdges: (ids: string[]) => {
          const nextEdges = get().edges.filter((e) => !ids.includes(e.id));
          set({ edges: nextEdges });
          get().saveToFirestore();
        },

        updateNodeData: (id: string, data: Partial<TaskNodeData>) => {
          const nextNodes = get().nodes.map((node) =>
            node.id === id
              ? {
                  ...node,
                  data: { ...node.data, ...data, updatedAt: Date.now() },
                }
              : node,
          );
          set({ nodes: nextNodes });
          get().saveToFirestore();
        },

        updateNodeTitle: (id, title) => get().updateNodeData(id, { title }),
        updateNodeStatus: (id, status) => get().updateNodeData(id, { status }),
        updateNodeType: (id, type) => get().updateNodeData(id, { type }),
        updateNodeColor: (id, color) => get().updateNodeData(id, { color }),
        updateNodeDeadline: (id, deadline) =>
          get().updateNodeData(id, { deadline }),
        updateNodeImportance: (id, isImportant) =>
          get().updateNodeData(id, { isImportant }),
        updateNodeContent: (id, content) => {
          const node = get().nodes.find((n) => n.id === id);
          if (!node) return;
          get().updateNodeData(id, {
            content: { ...(node.data.content || {}), ...content },
          });
        },

        updateEdgeType: (id: string, type: RelationshipType) => {
          const nextEdges = get().edges.map((edge) =>
            edge.id === id ? { ...edge, data: { ...edge.data, type } } : edge,
          );
          set({ edges: nextEdges });
          get().saveToFirestore();
        },

        toggleNodePin: (id: string) => {
          const node = get().nodes.find((n) => n.id === id);
          if (!node) return;
          get().updateNodeData(id, { isPinned: !node.data.isPinned });
        },

        toggleNodeCollapse: (id: string) => {
          const node = get().nodes.find((n) => n.id === id);
          if (!node) return;
          get().updateNodeData(id, { isCollapsed: !node.data.isCollapsed });
        },

        addToRecent: (id: string) => {
          const current = get().recentNodeIds;
          if (current[0] === id) return;
          const filtered = current.filter((nodeId) => nodeId !== id);
          const next = [id, ...filtered].slice(0, 5);
          set({ recentNodeIds: next });
        },

        setBookmark: (
          key: string,
          view: { x: number; y: number; zoom: number },
        ) => {
          set((state) => ({
            bookmarks: {
              ...state.bookmarks,
              [key]: view,
            },
          }));
        },

        setViewport: (viewport: Viewport) => set({ viewport }),

        applyLayout: () => {
          const { nodes, edges } = get();
          const { nodes: suggestedNodes } = getLayoutedElements(nodes, edges);
          const layoutedNodes = reconcileLayout(nodes, suggestedNodes);
          const updatedEdges = updateDynamicHandles(layoutedNodes, edges);
          set({ nodes: layoutedNodes, edges: updatedEdges });
          get().saveToFirestore();
        },
      };
    },
    {
      name: "visual-mindmap-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        focusRootId: state.focusRootId,
        viewport: state.viewport,
        focusNodeId: state.focusNodeId,
        selectedNodeIds: state.selectedNodeIds,
        navigationHistory: state.navigationHistory,
      }),
    },
  ),
);
