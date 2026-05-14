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
import { persist, createJSONStorage } from "zustand/middleware";
import {
  getIncrementalPosition,
  reconcileLayout,
} from "@/lib/reactflow/spatialEngine";
import { updateDynamicHandles, calculateBestHandles } from "@/lib/reactflow/handleUtils";
import { getLayoutedElements } from "@/lib/reactflow/layoutUtils";
import { getSubtreeIds } from "@/lib/reactflow/focusUtils";
import { BoardService } from "@/services/boardService";
import type {
  InteractionMode,
  RelationshipType,
  TaskColor,
  TaskContent,
  TaskNode,
  TaskStatus,
  TaskType,
  ViewType,
} from "@/types/task";

interface TaskState {
// ... rest of imports and interface ...
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
  addChild: (parentId: string, type?: TaskType, position?: { x: number; y: number }) => void;
  addSibling: (nodeId: string) => void;
  addTask: (status?: TaskStatus, type?: TaskType, position?: { x: number; y: number }) => void;
  deleteNode: (id: string) => void;
  deleteEdges: (ids: string[]) => void;
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
  setBookmark: (key: string, view: { x: number; y: number; zoom: number }) => void;
  setViewport: (viewport: Viewport) => void;
  initialize: (userId: string) => Promise<void>;
  retrySync: () => Promise<void>;
  createRootTask: () => void;
  createExampleBoard: () => void;
  saveToFirestore: (userId: string) => void;
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
    } as any, // wired in initialize
  },
];

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => {
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
        2000,
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
            onAddChild: (id: string) => get().addChild(id),
            onDelete: (id: string) => get().deleteNode(id),
            onTitleChange: (id: string, title: string) =>
              get().updateNodeTitle(id, title),
            onStatusChange: (id: string, status: TaskStatus) =>
              get().updateNodeStatus(id, status),
            onTypeChange: (id: string, type: TaskType) =>
              get().updateNodeType(id, type),
            onColorChange: (id: string, color: TaskColor) =>
              get().updateNodeColor(id, color),
            onContentChange: (id: string, content: Partial<TaskContent>) =>
              get().updateNodeContent(id, content),
            onTogglePin: (id: string) => get().toggleNodePin(id),
            onToggleCollapse: (id: string) => get().toggleNodeCollapse(id),
            onDeadlineChange: (id: string, deadline: string) => get().updateNodeDeadline(id, deadline),
            onToggleImportance: (id: string, isImportant: boolean) => get().updateNodeImportance(id, isImportant),
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
        setFocusRootId: (id: string) => set({ focusRootId: id, navigationHistory: [] }),
        pushFocusRootId: (id: string) => set((state) => {
          if (state.focusRootId === id) return state;
          return {
            navigationHistory: [...state.navigationHistory, state.focusRootId],
            focusRootId: id
          };
        }),
        popFocusRootId: () => set((state) => {
          if (state.navigationHistory.length === 0) return state;
          const newHistory = [...state.navigationHistory];
          const previousRootId = newHistory.pop()!;
          return {
            navigationHistory: newHistory,
            focusRootId: previousRootId
          };
        }),
        setSearchOpen: (open: boolean) => set({ isSearchOpen: open }),

        onNodesChange: (changes: NodeChange[]) => {
          const currentNodes = get().nodes;
          const currentEdges = get().edges;

          let updatedNodes = [...currentNodes];
          
          const positionChanges = changes.filter(
            (c) => c.type === "position" && c.dragging,
          );

          if (positionChanges.length === 1) {
            const change = positionChanges[0] as any;
            const node = currentNodes.find((n) => n.id === change.id);
            
            if (node && change.position) {
              const dx = change.position.x - node.position.x;
              const dy = change.position.y - node.position.y;
              
              if (dx !== 0 || dy !== 0) {
                const subtreeIds = getSubtreeIds(node.id, currentEdges);
                subtreeIds.delete(node.id);

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

          const finalNodes = applyNodeChanges(changes, updatedNodes) as TaskNode[];
          
          let finalEdges = currentEdges;
          if (changes.some((c) => c.type === "position")) {
            finalEdges = updateDynamicHandles(finalNodes, currentEdges);
          }

          const selectionChange = changes.find((c) => c.type === "select");
          
          if (selectionChange) {
            const selectedIds = finalNodes
              .filter((n) => n.selected)
              .map((n) => n.id);
            
            set({
              nodes: finalNodes,
              edges: finalEdges,
              selectedNodeIds: selectedIds,
              editingNodeId: selectedIds.length === 0 ? null : get().editingNodeId,
            });
          } else {
            set({ nodes: finalNodes, edges: finalEdges });
          }

          if (changes.some((c) => c.type === "position")) {
            const userId = (window as any).userId;
            if (userId) get().saveToFirestore(userId);
          }
        },

        onEdgesChange: (changes: EdgeChange[]) => {
          const updatedEdges = applyEdgeChanges(changes, get().edges);
          set({ edges: updatedEdges });
          const userId = (window as any).userId;
          if (userId) get().saveToFirestore(userId);
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
          const userId = (window as any).userId;
          if (userId) get().saveToFirestore(userId);
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
            const parentEdge = edges.find((e) => e.target === currentId && (e.data?.type === "hierarchy" || e.data?.type === "related"));
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
              isCollapsed: ancestors.has(node.id) ? false : node.data.isCollapsed,
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
          (window as any).userId = userId;

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
          const userId = (window as any).userId;
          if (!userId || get().saveStatus === "saving") return;

          // Simple cooldown check
          const now = Date.now();
          const lastRetry = (window as any).lastRetryTime || 0;
          if (now - lastRetry < 5000) {
            console.log("Retry cooldown active");
            return;
          }
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
          const userId = (window as any).userId;
          set({ nodes: wireData(DEFAULT_NODES), edges: [] });
          if (userId) get().saveToFirestore(userId);
        },

        createExampleBoard: () => {
          const userId = (window as any).userId;
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
                onAddChild: () => {},
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
                onAddChild: () => {},
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
                onAddChild: () => {},
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
                onAddChild: () => {},
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
                onAddChild: () => {},
              },
            },
          ];

          const exampleEdges: Edge[] = [
            { id: `e-r-s1`, source: rootId, target: subId1, data: { type: "related" } },
            { id: `e-r-s2`, source: rootId, target: subId2, data: { type: "related" } },
            { id: `e-s1-c1`, source: subId1, target: childId1, data: { type: "related" } },
            { id: `e-s2-c2`, source: subId2, target: childId2, data: { type: "related" } },
          ];

          set({
            nodes: wireData(exampleNodes),
            edges: exampleEdges,
            isLoading: false,
          });
          setTimeout(() => get().applyLayout(), 100);
          if (userId) get().saveToFirestore(userId);
        },

        saveToFirestore: (userId: string) => {
          set({ saveStatus: "saving" });
          debouncedSave(userId, get().nodes, get().edges);
        },

        addChild: (parentId: string, typeOverride?: TaskType, positionOverride?: { x: number; y: number }) => {
          const parentNode = get().nodes.find((n) => n.id === parentId);
          if (!parentNode) return;

          const newNodeId = uuidv4();
          const depth = (parentNode.data.depth ?? 0) + 1;
          const type = typeOverride || "idea";
          
          const parentColor = parentNode.data.color;
          const color = (parentColor && parentColor !== "default") ? parentColor : "default";

          const position = positionOverride || getIncrementalPosition(parentNode, get().nodes, get().edges);

          const newNode: TaskNode = {
            id: newNodeId,
            type: "task",
            position,
            data: {
              title: "",
              status: "todo",
              depth,
              type,
              color,
              createdAt: Date.now(),
              updatedAt: Date.now(),
              deadline: "No deadline",
              isImportant: false,
              isPinned: false,
              onAddChild: (id) => get().addChild(id),
              onDelete: (id) => get().deleteNode(id),
              onTitleChange: (id, title) => get().updateNodeTitle(id, title),
              onStatusChange: (id, status) => get().updateNodeStatus(id, status),
              onTypeChange: (id, type) => get().updateNodeType(id, type),
              onColorChange: (id, color) => get().updateNodeColor(id, color),
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
                ? { ...n, data: { ...n.data, isCollapsed: false }, selected: false }
                : { ...n, selected: false },
            )
            .concat({ ...newNode, selected: true });
          
          set({
            nodes: nextNodes,
            edges: [...get().edges, newEdge],
            selectedNodeIds: [newNodeId],
            editingNodeId: newNodeId,
          });

          const { focusRootId, edges, pushFocusRootId } = get();
          let relativeDepth = 0;
          let currId = parentId;
          while (currId && currId !== focusRootId) {
            const edge = edges.find(e => e.target === currId && (e.data?.type === "hierarchy" || e.data?.type === "related"));
            if (!edge) break;
            currId = edge.source;
            relativeDepth++;
          }

          if (relativeDepth === 2) {
            pushFocusRootId(parentId);
          }

          const userId = (window as any).userId;
          if (userId) get().saveToFirestore(userId);
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

        addTask: (status: TaskStatus = "todo", typeOverride?: TaskType, position?: { x: number; y: number }) => {
          const newNodeId = uuidv4();
          const type = typeOverride || "idea";

          const newNode: TaskNode = {
            id: newNodeId,
            type: "task",
            position: position || {
              x: (Math.random() - 0.5) * 400,
              y: (Math.random() - 0.5) * 400,
            },
            data: {
              title: "",
              status,
              depth: 0,
              type,
              color: "default",
              createdAt: Date.now(),
              updatedAt: Date.now(),
              deadline: "No deadline",
              isImportant: false,
              isPinned: false,
              onAddChild: (id) => get().addChild(id),
              onDelete: (id) => get().deleteNode(id),
              onTitleChange: (id, title) => get().updateNodeTitle(id, title),
              onStatusChange: (id, status) => get().updateNodeStatus(id, status),
              onTypeChange: (id, type) => get().updateNodeType(id, type),
              onColorChange: (id, color) => get().updateNodeColor(id, color),
            },
          };

          const nextNodes = get()
            .nodes.map((n) => ({ ...n, selected: false }))
            .concat({ ...newNode, selected: true });
          
          set({
            nodes: nextNodes,
            selectedNodeIds: [newNodeId],
            editingNodeId: newNodeId,
          });

          const userId = (window as any).userId;
          if (userId) get().saveToFirestore(userId);
        },

        deleteNode: (id: string) => {
          if (id === "root") return;
          const { nodes, edges, focusNodeId } = get();
          
          const parentEdge = edges.find((e) => e.target === id);
          const parentId = parentEdge?.source;

          const nodesToDelete = new Set<string>([id]);
          const queue = [id];
          while (queue.length > 0) {
            const currentId = queue.shift()!;
            for (const edge of edges) {
              if (edge.source === currentId && !nodesToDelete.has(edge.target)) {
                nodesToDelete.add(edge.target);
                queue.push(edge.target);
              }
            }
          }
          
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
          
          const userId = (window as any).userId;
          if (userId) get().saveToFirestore(userId);
        },

        deleteEdges: (ids: string[]) => {
          const nextEdges = get().edges.filter((e) => !ids.includes(e.id));
          set({ edges: nextEdges });
          const userId = (window as any).userId;
          if (userId) get().saveToFirestore(userId);
        },

        updateNodeTitle: (id: string, title: string) => {
          if (id === "root") return;
          const nextNodes = get().nodes.map((node) =>
            node.id === id
              ? { ...node, data: { ...node.data, title, updatedAt: Date.now() } }
              : node,
          );
          set({ nodes: nextNodes });
          const userId = (window as any).userId;
          if (userId) get().saveToFirestore(userId);
        },

        updateNodeStatus: (id: string, status: TaskStatus) => {
          const nextNodes = get().nodes.map((node) =>
            node.id === id
              ? { ...node, data: { ...node.data, status, updatedAt: Date.now() } }
              : node,
          );
          set({ nodes: nextNodes });
          const userId = (window as any).userId;
          if (userId) get().saveToFirestore(userId);
        },

        updateNodeType: (id: string, type: TaskType) => {
          const nextNodes = get().nodes.map((node) =>
            node.id === id
              ? { ...node, data: { ...node.data, type, updatedAt: Date.now() } }
              : node,
          );
          set({ nodes: nextNodes });
          const userId = (window as any).userId;
          if (userId) get().saveToFirestore(userId);
        },

        updateNodeColor: (id: string, color: TaskColor) => {
          const nextNodes = get().nodes.map((node) =>
            node.id === id
              ? { ...node, data: { ...node.data, color, updatedAt: Date.now() } }
              : node,
          );
          set({ nodes: nextNodes });
          const userId = (window as any).userId;
          if (userId) get().saveToFirestore(userId);
        },

        updateNodeDeadline: (id: string, deadline: string) => {
          const nextNodes = get().nodes.map((node) =>
            node.id === id
              ? { ...node, data: { ...node.data, deadline, updatedAt: Date.now() } }
              : node,
          );
          set({ nodes: nextNodes });
          const userId = (window as any).userId;
          if (userId) get().saveToFirestore(userId);
        },

        updateNodeImportance: (id: string, isImportant: boolean) => {
          const nextNodes = get().nodes.map((node) =>
            node.id === id
              ? { ...node, data: { ...node.data, isImportant, updatedAt: Date.now() } }
              : node,
          );
          set({ nodes: nextNodes });
          const userId = (window as any).userId;
          if (userId) get().saveToFirestore(userId);
        },

        updateNodeContent: (id: string, content: Partial<TaskContent>) => {
          const nextNodes = get().nodes.map((node) =>
            node.id === id
              ? {
                  ...node,
                  data: {
                    ...node.data,
                    content: { ...(node.data.content || {}), ...content },
                    updatedAt: Date.now(),
                  },
                }
              : node,
          );
          set({ nodes: nextNodes });
          const userId = (window as any).userId;
          if (userId) get().saveToFirestore(userId);
        },

        updateEdgeType: (id: string, type: RelationshipType) => {
          const nextEdges = get().edges.map((edge) =>
            edge.id === id ? { ...edge, data: { ...edge.data, type } } : edge,
          );
          set({ edges: nextEdges });
          const userId = (window as any).userId;
          if (userId) get().saveToFirestore(userId);
        },

        toggleNodePin: (id: string) => {
          const nextNodes = get().nodes.map((node) =>
            node.id === id
              ? { ...node, data: { ...node.data, isPinned: !node.data.isPinned } }
              : node,
          );
          set({ nodes: nextNodes });
          const userId = (window as any).userId;
          if (userId) get().saveToFirestore(userId);
        },

        toggleNodeCollapse: (id: string) => {
          const nextNodes = get().nodes.map((node) =>
            node.id === id
              ? {
                  ...node,
                  data: {
                    ...node.data,
                    isCollapsed: !node.data.isCollapsed,
                  },
                }
              : node,
          );
          set({ nodes: nextNodes });
          const userId = (window as any).userId;
          if (userId) get().saveToFirestore(userId);
        },

        addToRecent: (id: string) => {
          const current = get().recentNodeIds;
          if (current[0] === id) return;

          const filtered = current.filter((nodeId) => nodeId !== id);
          const next = [id, ...filtered].slice(0, 5);
          set({ recentNodeIds: next });
        },

        setBookmark: (key: string, view: { x: number; y: number; zoom: number }) => {
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
          const userId = (window as any).userId;
          if (userId) get().saveToFirestore(userId);
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
    }
  )
);
