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
} from "@/lib/reactflow/spatialEngine";
import { BoardService } from "@/services/boardService";
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
  setSearchOpen: (open: boolean) => void;
  addChild: (
    parentId: string,
    initialData?: Partial<TaskNodeData>,
    position?: { x: number; y: number },
  ) => void;
  addSibling: (nodeId: string) => void;
  addTask: (
    initialData?: Partial<TaskNodeData>,
    position?: { x: number; y: number },
  ) => void;
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

      const debouncedSave = debounce(
        async (userId: string, nodes: TaskNode[], edges: Edge[]) => {
          try {
            await BoardService.saveBoard(userId, nodes, edges);
            set({ saveStatus: "saved" });
          } catch (error) {
            console.error("Failed to save board:", error);
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
                editingNodeId:
                  selectedIds.length === 0 ? null : get().editingNodeId,
              });
            } else {
              set({ nodes: finalNodes, edges: finalEdges });
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

        initialize: async (userId: string) => {
          set({ isLoading: true });
          try {
            const board = await BoardService.loadBoard(userId);
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

          set({ saveStatus: "saving" });
          try {
            await BoardService.saveBoard(userId, get().nodes, get().edges);
            set({ saveStatus: "saved" });
          } catch (error) {
            set({ saveStatus: "error" });
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

        saveToFirestore: () => {
          const userId = getUserId();
          if (!userId) return;
          set({ saveStatus: "saving" });
          debouncedSave(userId, get().nodes, get().edges);
        },

        addChild: (
          parentId: string,
          initialData?: Partial<TaskNodeData>,
          positionOverride?: { x: number; y: number },
        ) => {
          const parentNode = get().nodes.find((n) => n.id === parentId);
          if (!parentNode) return;

          const newNodeId = uuidv4();
          const depth = (parentNode.data.depth ?? 0) + 1;
          const parentColor = parentNode.data.color;
          const color =
            parentColor && parentColor !== "default" ? parentColor : "default";
          const position =
            positionOverride ||
            getIncrementalPosition(parentNode, get().nodes, get().edges);

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

          const bestHandles = calculateBestHandles(parentNode, newNode);
          const newEdge: Edge = {
            id: `e-${parentId}-${newNodeId}`,
            source: parentId,
            target: newNodeId,
            sourceHandle: bestHandles.sourceHandle,
            targetHandle: bestHandles.targetHandle,
            data: { type: "related" },
          };

          const nextNodes = get()
            .nodes.map((n) =>
              n.id === parentId
                ? {
                    ...n,
                    data: { ...n.data, isCollapsed: false },
                    selected: false,
                  }
                : { ...n, selected: false },
            )
            .concat({ ...newNode, selected: true });

          set({
            nodes: nextNodes,
            edges: [...get().edges, newEdge],
            selectedNodeIds: [newNodeId],
            editingNodeId: initialData?.title ? null : newNodeId,
          });

          const { focusRootId, edges, pushFocusRootId } = get();
          let relativeDepth = 0;
          let currId = parentId;
          while (currId && currId !== focusRootId) {
            const edge = edges.find(
              (e) =>
                e.target === currId &&
                (e.data?.type === "hierarchy" || e.data?.type === "related"),
            );
            if (!edge) break;
            currId = edge.source;
            relativeDepth++;
          }

          if (relativeDepth === 2) {
            pushFocusRootId(parentId);
          }

          get().saveToFirestore();
        },

        addSibling: (nodeId: string) => {
          if (nodeId === "root") return;
          const parentEdge = get().edges.find((e) => e.target === nodeId);
          if (!parentEdge) {
            get().addTask();
            return;
          }
          get().addChild(parentEdge.source);
        },

        addTask: (
          initialData?: Partial<TaskNodeData>,
          position?: { x: number; y: number },
        ) => {
          const newNodeId = uuidv4();

          const newNode: TaskNode = {
            id: newNodeId,
            type: "task",
            position: position || {
              x: (Math.random() - 0.5) * 400,
              y: (Math.random() - 0.5) * 400,
            },
            data: {
              title: "",
              status: "todo",
              depth: 0,
              type: "idea",
              color: "default",
              createdAt: Date.now(),
              updatedAt: Date.now(),
              deadline: "No deadline",
              isImportant: false,
              isPinned: false,
              isCollapsed: false,
              ...initialData,
            },
          };

          const nextNodes = get()
            .nodes.map((n) => ({ ...n, selected: false }))
            .concat({ ...newNode, selected: true });

          set({
            nodes: nextNodes,
            selectedNodeIds: [newNodeId],
            editingNodeId: initialData?.title ? null : newNodeId,
          });

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
