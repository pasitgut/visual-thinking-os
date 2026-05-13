"use client";

import { useEffect, useMemo, useRef } from "react";
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  MarkerType,
  MiniMap,
  ReactFlowProvider,
  useReactFlow,
} from "reactflow";
import "reactflow/dist/style.css";

import { RelationshipEdge } from "@/components/flow/RelationshipEdge";
import { TaskNode } from "@/components/nodes/TaskNode";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useDeviceSpec } from "@/hooks/useDeviceSpec";
import { getSubtreeIds } from "@/lib/reactflow/focusUtils";
import { useTaskStore } from "@/stores/useTaskStore";
import { useMobileUIStore } from "@/stores/useMobileUIStore";
import { BrainstormOverlay } from "./BrainstormOverlay";
import { EmptyState } from "./EmptyState";
import { FocusBreadcrumbs } from "./FocusBreadcrumbs";
import { MobileToolbar } from "./MobileToolbar";
import { ProductivityToolbar } from "./ProductivityToolbar";
import { ShortcutLegend } from "./ShortcutLegend";
import { SearchPalette } from "./SearchPalette";
import { RootIndicator } from "./RootIndicator";
import { QuickCaptureOverlay } from "./QuickCaptureOverlay";
import { BottomSheetContainer } from "@/components/mobile/BottomSheetContainer";
import { MobileNodeActions } from "@/components/mobile/MobileNodeActions";

import { useDroppable } from "@dnd-kit/core";

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

  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    focusNodeId,
  } = useTaskStore();
  const { fitView } = useReactFlow();
  const { isMobile, isTablet } = useDeviceSpec();
  const {
    interactionState,
    setInteractionState,
    selectedNodeId,
    setSelectedNodeId,
    isBottomSheetOpen,
    setBottomSheetOpen,
  } = useMobileUIStore();

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
    return edges.filter(
      (e) => nodeIds.has(e.source) && nodeIds.has(e.target),
    );
  }, [visibleNodesAfterCollapse, edges]);

  // 2. Focus Mode Logic: Filter visible nodes and edges from the ALREADY cullled list
  const visibleNodeIds = useMemo(() => {
    if (!focusNodeId) return null;
    return getSubtreeIds(focusNodeId, visibleEdgesAfterCollapse);
  }, [focusNodeId, visibleEdgesAfterCollapse]);

  const displayNodes = useMemo(() => {
    const baseNodes = visibleNodesAfterCollapse;
    if (!focusNodeId) return baseNodes;
    return baseNodes.map((node) => {
      const isVisible = visibleNodeIds?.has(node.id);
      
      // 1.2 Replace Blur with Grayscale on Mobile
      const filterEffect = isMobile 
        ? (isVisible ? "none" : "grayscale(1)") 
        : (isVisible ? "none" : "blur(2px)");

      return {
        ...node,
        zIndex: isVisible ? 1000 : 0,
        style: {
          ...node.style,
          opacity: isVisible ? 1 : 0.1,
          filter: filterEffect,
          pointerEvents: isVisible ? "all" : "none",
          transition: isMobile 
            ? "opacity 0.2s ease" // Faster transition on mobile
            : "opacity 0.4s ease, filter 0.4s ease",
        } as React.CSSProperties,
      };
    });
  }, [visibleNodesAfterCollapse, visibleNodeIds, focusNodeId, isMobile]);

  const displayEdges = useMemo(() => {
    const baseEdges = visibleEdgesAfterCollapse;
    if (!focusNodeId) return baseEdges;
    
    // 1.2 Hide unrelated edges in Focus Mode
    return baseEdges.filter((edge) => 
      visibleNodeIds?.has(edge.source) && visibleNodeIds?.has(edge.target)
    );
  }, [visibleEdgesAfterCollapse, visibleNodeIds, focusNodeId]);

  // Zoom-to-Thinking: Double click canvas to fitView
  const handlePaneDoubleClick = () => {
    fitView({ duration: 800, padding: 0.2 });
  };

  // 1.3 Improve Focus Mode zoom behavior: Trigger fitView ONLY once on Focus activation
  const lastFittedFocusId = useRef<string | null>(null);
  
  useEffect(() => {
    if (focusNodeId && focusNodeId !== lastFittedFocusId.current && visibleNodeIds) {
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
  }, [isTablet, fitView, nodes.length, isMobile]);

  useKeyboardShortcuts();

  const isEmpty = nodes.length === 0;

  return (
    <div ref={setNodeRef} className="w-full h-full relative">
      <ReactFlow
        nodes={displayNodes}
        edges={displayEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onMoveStart={() => isMobile && setInteractionState("panning")}
        onMoveEnd={() => {
          if (isMobile) {
            setInteractionState(useMobileUIStore.getState().selectedNodeId ? "node-selected" : "idle");
          }
        }}
        onNodeDragStop={() => {
          if (isMobile) {
            setInteractionState("node-selected");
          }
        }}
        onPaneClick={(event) => {
          if (event.detail === 2) {
            handlePaneDoubleClick();
          }
          useTaskStore.getState().setSelectedNodeIds([]);
          if (isMobile) {
            setInteractionState("idle");
            setSelectedNodeId(null);
          }
        }}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{
          padding: isMobile ? 0.3 : 0.1,
          maxZoom: 1.5,
        }}
        minZoom={isMobile ? 0.4 : 0.2}
        maxZoom={isMobile ? 1.5 : 4}
        translateExtent={translateExtent}
        onlyRenderVisibleElements={isMobile}
        nodesDraggable={true}
        panOnDrag={true}
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
      <QuickCaptureOverlay />
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
