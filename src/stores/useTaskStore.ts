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
} from "reactflow";
import { v4 as uuidv4 } from "uuid";
import { create } from "zustand";
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
  TaskStatus,
  TaskType,
  ViewType,
} from "@/types/task";

interface TaskState {
  nodes: TaskNode[];
  edges: Edge[];
  currentView: ViewType;
  interactionMode: InteractionMode;
  focusNodeId: string | null;
  selectedNodeIds: string[];
  editingNodeId: string | null;
  isLoading: boolean;
  saveStatus: "saved" | "saving" | "error";
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  setView: (view: ViewType) => void;
  setInteractionMode: (mode: InteractionMode) => void;
  setFocusNodeId: (id: string | null) => void;
  setSelectedNodeIds: (ids: string[]) => void;
  setEditingNodeId: (id: string | null) => void;
  addChild: (parentId: string, type?: TaskType) => void;
  addTask: (status?: TaskStatus, type?: TaskType) => void;
  deleteNode: (id: string) => void;
  updateNodeTitle: (id: string, title: string) => void;
  updateNodeStatus: (id: string, status: TaskStatus) => void;
  updateNodeType: (id: string, type: TaskType) => void;
  updateNodeColor: (id: string, color: TaskColor) => void;
  updateNodeContent: (id: string, content: Partial<TaskContent>) => void;
  updateEdgeType: (id: string, type: RelationshipType) => void;
  toggleNodePin: (id: string) => void;
  initialize: (userId: string) => Promise<void>;
  createRootTask: () => void;
  createExampleBoard: () => void;
  saveToFirestore: (userId: string) => void;
  applyLayout: () => void;
  applyTemplate: (templateId: string) => void;
}

const DEFAULT_NODES: TaskNode[] = [
  {
    id: "root",
    type: "task",
    position: { x: 0, y: 0 },
    data: {
      title: "Start",
      status: "todo",
      type: "root",
      color: "default",
      depth: 0,
    } as any, // wired in initialize
  },
];

export const useTaskStore = create<TaskState>((set, get) => {
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
        type: node.data.type ?? (node.id === "root" ? "root" : "task"),
        createdAt: node.data.createdAt ?? Date.now(),
        updatedAt: node.data.updatedAt ?? Date.now(),
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
      },
    }));

  return {
    nodes: [],
    edges: [],
    currentView: "mindmap",
    interactionMode: "standard",
    focusNodeId: null,
    selectedNodeIds: [],
    editingNodeId: null,
    isLoading: true,
    saveStatus: "saved",

    setView: (view: ViewType) => set({ currentView: view }),
    setInteractionMode: (mode: InteractionMode) =>
      set({ interactionMode: mode }),
    setFocusNodeId: (id: string | null) => set({ focusNodeId: id }),

    onNodesChange: (changes: NodeChange[]) => {
      const currentNodes = get().nodes;
      const updatedNodes = applyNodeChanges(
        changes,
        currentNodes,
      ) as TaskNode[];
      set({ nodes: updatedNodes });

      if (changes.some((c) => c.type === "select")) {
        const selectedIds = updatedNodes
          .filter((n) => n.selected)
          .map((n) => n.id);
        set({
          selectedNodeIds: selectedIds,
          editingNodeId: null,
        });
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
      const updatedEdges = addEdge(
        { ...connection, type: "relationship", data: { type: "hierarchy" } },
        get().edges,
      );
      set({ edges: updatedEdges });
      const userId = (window as any).userId;
      if (userId) get().saveToFirestore(userId);
    },

    setSelectedNodeIds: (ids: string[]) => {
      set({ selectedNodeIds: ids });
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
            onAddChild: function (parentId: string): void {
              throw new Error("Function not implemented.");
            },
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
            type: "task",
            color: "purple",
            createdAt: Date.now(),
            updatedAt: Date.now(),
            onAddChild: function (parentId: string): void {
              throw new Error("Function not implemented.");
            },
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
            type: "task",
            color: "pink",
            createdAt: Date.now(),
            updatedAt: Date.now(),
            onAddChild: function (parentId: string): void {
              throw new Error("Function not implemented.");
            },
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
            type: "task",
            color: "default",
            createdAt: Date.now(),
            updatedAt: Date.now(),
            onAddChild: function (parentId: string): void {
              throw new Error("Function not implemented.");
            },
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
            type: "task",
            color: "green",
            createdAt: Date.now(),
            updatedAt: Date.now(),
            onAddChild: function (parentId: string): void {
              throw new Error("Function not implemented.");
            },
          },
        },
      ];

      const exampleEdges: Edge[] = [
        {
          id: `e-r-s1`,
          source: rootId,
          target: subId1,
          data: { type: "hierarchy" },
        },
        {
          id: `e-r-s2`,
          source: rootId,
          target: subId2,
          data: { type: "hierarchy" },
        },
        {
          id: `e-s1-c1`,
          source: subId1,
          target: childId1,
          data: { type: "hierarchy" },
        },
        {
          id: `e-s2-c2`,
          source: subId2,
          target: childId2,
          data: { type: "hierarchy" },
        },
      ];

      set({
        nodes: wireData(exampleNodes),
        edges: exampleEdges,
        isLoading: false,
      });
      setTimeout(() => get().applyLayout(), 100);
      if (userId) get().saveToFirestore(userId);
    },

    applyTemplate: (templateId: string) => {
      const {
        BOARD_TEMPLATES,
        prepareTemplate,
      } = require("@/features/board/templates");
      const template = BOARD_TEMPLATES.find((t: any) => t.id === templateId);
      if (!template) return;

      const { nodes: templateNodes, edges: templateEdges } =
        prepareTemplate(template);
      const userId = (window as any).userId;

      set({
        nodes: wireData(templateNodes),
        edges: templateEdges.map((e: any) => ({
          ...e,
          data: { type: "hierarchy" },
        })),
        isLoading: false,
      });

      setTimeout(() => get().applyLayout(), 100);
      if (userId) get().saveToFirestore(userId);
    },

    saveToFirestore: (userId: string) => {
      set({ saveStatus: "saving" });
      debouncedSave(userId, get().nodes, get().edges);
    },

    addChild: (parentId: string, typeOverride?: TaskType) => {
      const parentNode = get().nodes.find((n) => n.id === parentId);
      if (!parentNode) return;

      const newNodeId = uuidv4();
      const depth = (parentNode.data.depth ?? 0) + 1;
      const type =
        typeOverride ||
        (get().interactionMode === "brainstorm" ? "idea" : "task");

      // Use Intelligent Spatial Placement
      const position = getIncrementalPosition(parentNode, get().nodes);

      const newNode: TaskNode = {
        id: newNodeId,
        type: "task",
        position,
        data: {
          title: "New Task",
          status: "todo",
          depth,
          type,
          color: "default",
          createdAt: Date.now(),
          updatedAt: Date.now(),
          isPinned: false, // New nodes are auto-positioned initially
          onAddChild: (id) => get().addChild(id),
          onDelete: (id) => get().deleteNode(id),
          onTitleChange: (id, title) => get().updateNodeTitle(id, title),
          onStatusChange: (id, status) => get().updateNodeStatus(id, status),
          onTypeChange: (id, type) => get().updateNodeType(id, type),
          onColorChange: (id, color) => get().updateNodeColor(id, color),
        },
      };

      const newEdge: Edge = {
        id: `e-${parentId}-${newNodeId}`,
        source: parentId,
        target: newNodeId,
        data: { type: "hierarchy" },
      };
      const nextNodes = get()
        .nodes.map((n) => ({ ...n, selected: false }))
        .concat({ ...newNode, selected: true });
      set({
        nodes: nextNodes,
        edges: [...get().edges, newEdge],
        selectedNodeIds: [newNodeId],
      });

      const userId = (window as any).userId;
      if (userId) get().saveToFirestore(userId);
    },

    addTask: (status: TaskStatus = "todo", typeOverride?: TaskType) => {
      const newNodeId = uuidv4();
      const type =
        typeOverride ||
        (get().interactionMode === "brainstorm" ? "idea" : "task");

      const newNode: TaskNode = {
        id: newNodeId,
        type: "task",
        position: {
          x: Math.random() * 400,
          y: Math.random() * 400,
        },
        data: {
          title: "New Task",
          status,
          depth: 0,
          type,
          color: "default",
          createdAt: Date.now(),
          updatedAt: Date.now(),
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
      });

      const userId = (window as any).userId;
      if (userId) get().saveToFirestore(userId);
    },

    deleteNode: (id: string) => {
      if (id === "root") return;
      const { nodes, edges } = get();
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
      set({ nodes: nextNodes, edges: nextEdges });
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

    applyLayout: () => {
      const { nodes, edges } = get();
      const { nodes: suggestedNodes } =
        require("@/lib/reactflow/layoutUtils").getLayoutedElements(
          nodes,
          edges,
        );

      // Use Soft Layout Reconciliation
      const layoutedNodes = reconcileLayout(nodes, suggestedNodes);

      set({ nodes: layoutedNodes });
      const userId = (window as any).userId;
      if (userId) get().saveToFirestore(userId);
    },
  };
});
