"use client";

import { useEffect, useMemo } from "react";
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
import { useMobile } from "@/hooks/useMobile";
import { getSubtreeIds } from "@/lib/reactflow/focusUtils";
import { useTaskStore } from "@/stores/useTaskStore";
import { BrainstormOverlay } from "./BrainstormOverlay";
import { EmptyState } from "./EmptyState";
import { FocusBreadcrumbs } from "./FocusBreadcrumbs";
import { MobileToolbar } from "./MobileToolbar";
import { ProductivityToolbar } from "./ProductivityToolbar";
import { ShortcutLegend } from "./ShortcutLegend";
import { SearchPalette } from "./SearchPalette";
import { RootIndicator } from "./RootIndicator";

const BoardContent = () => {
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
  const isMobile = useMobile();

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
      return {
        ...node,
        zIndex: isVisible ? 1000 : 0,
        style: {
          ...node.style,
          opacity: isVisible ? 1 : 0.1,
          filter: isVisible ? "none" : "blur(2px)",
          pointerEvents: isVisible ? "all" : "none",
          transition: "opacity 0.4s ease, filter 0.4s ease",
        } as React.CSSProperties,
      };
    });
  }, [visibleNodesAfterCollapse, visibleNodeIds, focusNodeId]);

  const displayEdges = useMemo(() => {
    const baseEdges = visibleEdgesAfterCollapse;
    if (!focusNodeId) return baseEdges;
    return baseEdges.map((edge) => {
      const isVisible =
        visibleNodeIds?.has(edge.source) && visibleNodeIds?.has(edge.target);
      return {
        ...edge,
        zIndex: isVisible ? 500 : 0,
        style: {
          ...edge.style,
          opacity: isVisible ? 1 : 0.05,
          filter: isVisible ? "none" : "blur(1px)",
          transition: "opacity 0.4s ease, filter 0.4s ease",
        },
      };
    });
  }, [visibleEdgesAfterCollapse, visibleNodeIds, focusNodeId]);

  // Zoom-to-Thinking: Double click canvas to fitView
  const handlePaneDoubleClick = () => {
    fitView({ duration: 800, padding: 0.2 });
  };

  // Auto-fit view when focus changes
  useEffect(() => {
    if (focusNodeId && visibleNodeIds) {
      const timer = setTimeout(() => {
        fitView({
          nodes: Array.from(visibleNodeIds).map((id) => ({ id })),
          padding: 0.4, // Increased padding for better breathing room
          duration: 1000, // Slightly longer duration for "calm" glide
        });
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [visibleNodeIds, fitView, focusNodeId]);

  useKeyboardShortcuts();

  const isEmpty = nodes.length === 0;

  return (
    <>
      <ReactFlow
        nodes={displayNodes}
        edges={displayEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onPaneClick={(event) => {
          if (event.detail === 2) {
            handlePaneDoubleClick();
          }
          useTaskStore.getState().setSelectedNodeIds([]);
        }}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{
          padding: isMobile ? 0.3 : 0.1,
          maxZoom: 1.5,
        }}
        minZoom={0.2}
        maxZoom={4}
        defaultEdgeOptions={{
          type: "relationship",
          animated: true,
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
    </>
  );
};

export const MindmapBoard = () => {
  return (
    <div className="w-full h-full bg-background">
      <ReactFlowProvider>
        <BoardContent />
      </ReactFlowProvider>
    </div>
  );
};
