"use client";

import { useEffect, useMemo, useRef } from "react";
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  MarkerType,
  MiniMap,
  useReactFlow,
} from "reactflow";
import "reactflow/dist/style.css";

import { useDroppable } from "@dnd-kit/core";
import { RelationshipEdge } from "@/components/flow/RelationshipEdge";
import { TaskNode } from "@/components/nodes/TaskNode";
import { useDeviceSpec } from "@/hooks/useDeviceSpec";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import {
  getSubtreeIds,
  getVisibleNodeIdsByDepth,
} from "@/lib/reactflow/graphUtils";
import { useMobileUIStore } from "@/stores/useMobileUIStore";
import { useTaskStore } from "@/stores/useTaskStore";
import { BrainstormOverlay } from "./BrainstormOverlay";
import { EmptyState } from "./EmptyState";
import { FocusBreadcrumbs } from "./FocusBreadcrumbs";
import { MobileToolbar } from "./MobileToolbar";
import { ProductivityToolbar } from "./ProductivityToolbar";
import { RootIndicator } from "./RootIndicator";
import { SearchPalette } from "./SearchPalette";
import { ShortcutLegend } from "./ShortcutLegend";

const BoardContent = () => {
  const { setNodeRef } = useDroppable({
    id: "react-flow-pane",
  });

  const nodeTypes = useMemo(
    () => ({
      task: TaskNode,
    }),
    [],
  );

  const edgeTypes = useMemo(
    () => ({
      relationship: RelationshipEdge,
    }),
    [],
  );

  // FINE-GRAINED SELECTORS
  const nodes = useTaskStore((s) => s.nodes);
  const edges = useTaskStore((s) => s.edges);
  const onNodesChange = useTaskStore((s) => s.onNodesChange);
  const onEdgesChange = useTaskStore((s) => s.onEdgesChange);
  const onConnect = useTaskStore((s) => s.onConnect);
  const focusNodeId = useTaskStore((s) => s.focusNodeId);
  const focusRootId = useTaskStore((s) => s.focusRootId);
  const editingNodeId = useTaskStore((s) => s.editingNodeId);
  const persistedViewport = useTaskStore((s) => s.viewport);
  const setPersistedViewport = useTaskStore((s) => s.setViewport);

  const { fitView, setCenter, getViewport, setViewport, screenToFlowPosition } =
    useReactFlow();
  const { isMobile, isTablet } = useDeviceSpec();
  const setInteractionState = useMobileUIStore((s) => s.setInteractionState);
  const setSelectedNodeId = useMobileUIStore((s) => s.setSelectedNodeId);

  // 3. Persist Viewport
  useEffect(() => {
    if (persistedViewport && persistedViewport.zoom > 0) {
      setViewport(persistedViewport);
    }
  }, [setViewport, persistedViewport]); // Run once on mount

  const onMoveEndInternal = (_event: any, viewport: any) => {
    setPersistedViewport(viewport);
    if (isMobile) {
      setInteractionState(
        useMobileUIStore.getState().selectedNodeId ? "node-selected" : "idle",
      );
    }
  };

  // 6. Drag Edge to Create Node
  const connectionNodeId = useRef<string | null>(null);
  const didConnect = useRef(false);

  const onConnectStart = (_: any, { nodeId }: any) => {
    connectionNodeId.current = nodeId;
    didConnect.current = false;
  };

  const onConnectEnd = (event: any) => {
    if (!connectionNodeId.current || didConnect.current) {
      connectionNodeId.current = null;
      return;
    }

    // Use document.elementFromPoint for accurate target detection (especially on touch)
    const clientX =
      event.clientX ??
      event.touches?.[0]?.clientX ??
      event.changedTouches?.[0]?.clientX;
    const clientY =
      event.clientY ??
      event.touches?.[0]?.clientY ??
      event.changedTouches?.[0]?.clientY;

    if (clientX !== undefined && clientY !== undefined) {
      const element = document.elementFromPoint(clientX, clientY);
      const targetIsPane = element?.classList.contains("react-flow__pane");
      const targetIsNode = element?.closest(".react-flow__node");
      const targetIsHandle = element?.closest(".react-flow__handle");

      // Only create a node if we dropped on the pane and NOT on an existing node or handle
      if (targetIsPane && !targetIsNode && !targetIsHandle) {
        const position = screenToFlowPosition({
          x: clientX,
          y: clientY,
        });

        // Offset to center the node under the cursor
        // Based on TaskNode default dimensions (approx 200x50)
        const adjustedPosition = {
          x: position.x - 100,
          y: position.y - 25,
        };

        const parentId = connectionNodeId.current;

        // Use a small timeout to ensure the node creation happens after any 
        // potential pane click events that might clear the focus
        setTimeout(() => {
          useTaskStore.getState().createNode({
            parentId,
            initialData: { type: "idea" },
            position: adjustedPosition,
          });
        }, 50);
      }
    }

    connectionNodeId.current = null;
  };

  const onConnectInternal = (params: any) => {
    didConnect.current = true;
    onConnect(params);
  };

  // 1.1 Viewport Clamping: Calculate bounds for translateExtent
  const translateExtent = useMemo(() => {
    if (nodes.length === 0) return undefined;

    let minX = Number.POSITIVE_INFINITY;
    let minY = Number.POSITIVE_INFINITY;
    let maxX = Number.NEGATIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;

    for (const node of nodes) {
      const { x, y } = node.position;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }

    // Add padding (50% of viewport approx)
    const padding = 1000;
    return [
      [minX - padding, minY - padding],
      [maxX + padding, maxY + padding],
    ] as [[number, number], [number, number]];
  }, [nodes]);

  // 1. Collapse Logic: Cull nodes whose ancestors are collapsed
  const visibleNodesAfterCollapse = useMemo(() => {
    const collapsedNodes = nodes.filter((n) => n.data.isCollapsed);
    if (collapsedNodes.length === 0) return nodes;

    const hiddenIds = new Set<string>();
    collapsedNodes.forEach((root) => {
      const descendants = getSubtreeIds(root.id, edges);
      descendants.delete(root.id); // Keep the collapsed node itself visible
      descendants.forEach((id) => hiddenIds.add(id));
    });

    return nodes.filter((n) => !hiddenIds.has(n.id));
  }, [nodes, edges]);

  const visibleEdgesAfterCollapse = useMemo(() => {
    const nodeIds = new Set(visibleNodesAfterCollapse.map((n) => n.id));
    return edges.filter((e) => nodeIds.has(e.source) && nodeIds.has(e.target));
  }, [visibleNodesAfterCollapse, edges]);

  // Progressive Exploration Rendering Logic
  const explorationNodeIds = useMemo(() => {
    return getVisibleNodeIdsByDepth(
      focusRootId,
      visibleNodesAfterCollapse,
      visibleEdgesAfterCollapse,
      "root",
      2,
    );
  }, [focusRootId, visibleNodesAfterCollapse, visibleEdgesAfterCollapse]);

  // 2. Focus Mode Logic: Filter visible nodes and edges from the ALREADY cullled list
  const visibleNodeIds = useMemo(() => {
    if (!focusNodeId) return null;
    return getSubtreeIds(focusNodeId, visibleEdgesAfterCollapse);
  }, [focusNodeId, visibleEdgesAfterCollapse]);

  const displayNodes = useMemo(() => {
    // Combine Progressive Exploration (Hard Limit) with Focus Mode (Visual Filter)
    const baseNodes = visibleNodesAfterCollapse.filter((n) =>
      explorationNodeIds.has(n.id),
    );

    // Find parent of focusRootId to de-emphasize it
    const parentEdge = edges.find(
      (e) =>
        e.target === focusRootId &&
        (e.data?.type === "hierarchy" || e.data?.type === "related"),
    );
    const parentId = parentEdge?.source;

    return baseNodes.map((node) => {
      const isVisible = focusNodeId ? visibleNodeIds?.has(node.id) : true;
      const isParent = node.id === parentId;

      const filterEffect = isMobile
        ? isVisible
          ? isParent
            ? "grayscale(1)"
            : "none"
          : "grayscale(1)"
        : isVisible
          ? isParent
            ? "blur(1px) grayscale(0.5)"
            : "none"
          : "blur(2px)";

      const opacity = isVisible ? (isParent ? 0.3 : 1) : 0.1;

      return {
        ...node,
        zIndex: isVisible ? (isParent ? 0 : 1000) : 0,
        style: {
          ...node.style,
          opacity,
          filter: filterEffect,
          pointerEvents: isVisible && !isParent ? "all" : "none",
          transition: isMobile
            ? "opacity 0.2s ease"
            : "opacity 0.4s ease, filter 0.4s ease",
        } as React.CSSProperties,
      };
    });
  }, [
    visibleNodesAfterCollapse,
    explorationNodeIds,
    visibleNodeIds,
    focusNodeId,
    isMobile,
    edges,
    focusRootId,
  ]);

  const displayEdges = useMemo(() => {
    const baseEdges = visibleEdgesAfterCollapse.filter(
      (e) =>
        explorationNodeIds.has(e.source) && explorationNodeIds.has(e.target),
    );

    if (editingNodeId) return [];
    if (!focusNodeId) return baseEdges;

    return baseEdges.filter(
      (edge) =>
        visibleNodeIds?.has(edge.source) && visibleNodeIds?.has(edge.target),
    );
  }, [
    visibleEdgesAfterCollapse,
    explorationNodeIds,
    visibleNodeIds,
    focusNodeId,
    editingNodeId,
  ]);

  // Cinematic Transition Logic
  const lastFocusRootId = useRef(focusRootId);
  useEffect(() => {
    if (focusRootId !== lastFocusRootId.current) {
      const targetNode = nodes.find((n) => n.id === focusRootId);
      if (targetNode) {
        // Required animation sequence:
        // 1. slight zoom out
        // 2. smooth pan toward selected node
        // 3. irrelevant nodes fade/de-emphasize (handled by displayNodes)
        // 4. selected node centers
        // 5. viewport zooms inward
        // 6. subtree re-renders progressively (handled by React)
        // 7. new nodes stagger/fade into place (handled by TaskNode animations)

        const performTransition = async () => {
          // 1. Slight zoom out
          const { x, y, zoom } = getViewport();

          // 2 & 4. Smooth pan and center
          setCenter(targetNode.position.x + 100, targetNode.position.y, {
            zoom: zoom * 0.8, // Slight zoom out during pan
            duration: 800,
          });

          // Wait for pan
          await new Promise((r) => setTimeout(r, 850));

          // 5. Zoom inward
          fitView({
            nodes: [
              { id: focusRootId },
              ...edges
                .filter((e) => e.source === focusRootId)
                .map((e) => ({ id: e.target })),
            ],
            duration: 1000,
            padding: isMobile ? 0.4 : 0.2,
          });
        };

        performTransition();
      }
      lastFocusRootId.current = focusRootId;
    }
  }, [focusRootId, nodes, edges, setCenter, fitView, getViewport, isMobile]);

  // Zoom-to-Thinking: Double click canvas to fitView
  const handlePaneDoubleClick = () => {
    fitView({ duration: 800, padding: 0.2 });
  };

  // 1.3 Improve Focus Mode zoom behavior: Trigger fitView ONLY once on Focus activation
  const lastFittedFocusId = useRef<string | null>(null);

  useEffect(() => {
    if (
      focusNodeId &&
      focusNodeId !== lastFittedFocusId.current &&
      visibleNodeIds
    ) {
      lastFittedFocusId.current = focusNodeId;
      const timer = setTimeout(() => {
        fitView({
          nodes: Array.from(visibleNodeIds).map((id) => ({ id })),
          padding: 0.3, // 1.3 Suggested Constraints
          duration: isMobile ? 600 : 1000, // Faster on mobile
          minZoom: 0.4,
          maxZoom: 1.2,
        });
      }, 50);
      return () => clearTimeout(timer);
    } else if (!focusNodeId) {
      lastFittedFocusId.current = null;
    }
  }, [visibleNodeIds, fitView, focusNodeId, isMobile]);

  // 4.1 Tablet Sidebar Resize Handling
  // Trigger debounced fitView when isTablet changes to ensure graph centering
  const fitViewTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (nodes.length === 0) return;

    // Clear existing timer
    if (fitViewTimerRef.current) {
      clearTimeout(fitViewTimerRef.current);
    }

    // Debounce fitView to avoid flickering during layout transitions
    fitViewTimerRef.current = setTimeout(() => {
      fitView({
        duration: 600,
        padding: isMobile || isTablet ? 0.3 : 0.1,
      });
    }, 350); // Delay slightly longer than CSS transitions

    return () => {
      if (fitViewTimerRef.current) clearTimeout(fitViewTimerRef.current);
    };
  }, [isTablet, fitView, isMobile]); // Removed nodes.length to avoid global fitView on add

  // 4.2 Creation Focus: Focus on newly created nodes
  const prevNodesCount = useRef(nodes.length);
  useEffect(() => {
    if (nodes.length > prevNodesCount.current && editingNodeId) {
      const newNode = nodes.find((n) => n.id === editingNodeId);
      if (newNode) {
        const { x, y } = newNode.position;
        const { zoom } = getViewport();

        // Center on the new node, slightly offset to account for toolbar
        setCenter(x + 100, y + 25, {
          zoom: Math.max(zoom, 0.8), // Don't zoom out if already zoomed in, but ensure at least 0.8
          duration: 800,
        });
      }
    }
    prevNodesCount.current = nodes.length;
  }, [nodes, editingNodeId, setCenter, getViewport]);

  useKeyboardShortcuts();

  const isEmpty = nodes.length === 0;

  return (
    <div ref={setNodeRef} className="w-full h-full relative">
      <ReactFlow
        nodes={displayNodes}
        edges={displayEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnectInternal}
        onConnectStart={onConnectStart}
        onConnectEnd={onConnectEnd}
        onMoveStart={() => isMobile && setInteractionState("panning")}
        onMoveEnd={onMoveEndInternal}
        onNodeDragStop={() => {
          if (isMobile) {
            setInteractionState("node-selected");
          }
        }}
        onPaneClick={(event) => {
          if (event.detail === 2) {
            handlePaneDoubleClick();
          }
          const state = useTaskStore.getState();
          state.setSelectedNodeIds([]);
          state.setEditingNodeId(null);
          if (isMobile) {
            setInteractionState("idle");
            setSelectedNodeId(null);
          }
        }}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{
          padding: isMobile ? 0.8 : 0.5,
          maxZoom: 1.0,
        }}
        minZoom={isMobile ? 0.4 : 0.2}
        maxZoom={isMobile ? 1.5 : 4}
        translateExtent={translateExtent}
        onlyRenderVisibleElements={isMobile}
        nodesDraggable={true}
        panOnDrag={true}
        edgesFocusable={true}
        connectionRadius={30}
        defaultEdgeOptions={{
          type: "relationship",
          animated: !isMobile, // Disable edge animation on mobile for performance
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 20,
            height: 20,
          },
        }}
      >
        <Background
          variant={
            focusNodeId ? BackgroundVariant.Lines : BackgroundVariant.Dots
          }
          gap={focusNodeId ? 40 : 20}
          size={1}
          className="opacity-[0.4] dark:opacity-[0.1]"
        />
        {!isMobile && <Controls />}
        {!isMobile && <MiniMap />}
      </ReactFlow>
      <ProductivityToolbar />
      <ShortcutLegend />
      <SearchPalette />
      <RootIndicator />
      <BrainstormOverlay />
      <FocusBreadcrumbs />
      {isEmpty && <EmptyState />}
      <MobileToolbar />
    </div>
  );
};

export const MindmapBoard = () => {
  return (
    <div className="w-full h-full bg-background">
      <BoardContent />
    </div>
  );
};
