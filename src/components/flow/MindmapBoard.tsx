"use client";

import { useMemo } from "react";
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  type NodeTypes,
  ReactFlowProvider,
} from "reactflow";
import "reactflow/dist/style.css";
import { TaskNode } from "@/components/nodes/TaskNode";
import { RelationshipEdge } from "@/components/flow/RelationshipEdge";
import { useTaskStore } from "@/stores/useTaskStore";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { MobileToolbar } from "./MobileToolbar";
import { useMobile } from "@/hooks/useMobile";
import { EmptyState } from "./EmptyState";
import { ProductivityToolbar } from "./ProductivityToolbar";
import { ShortcutLegend } from "./ShortcutLegend";
import { BrainstormOverlay } from "./BrainstormOverlay";
import { FocusBreadcrumbs } from "./FocusBreadcrumbs";
import { getSubtreeIds } from "@/lib/reactflow/focusUtils";
import { useReactFlow } from "reactflow";
import { useEffect } from "react";

const nodeTypes = {
  task: TaskNode,
};

const edgeTypes = {
  relationship: RelationshipEdge,
};

const BoardContent = () => {
  const { 
    nodes, 
    edges, 
    onNodesChange, 
    onEdgesChange, 
    onConnect, 
    setDetailPanelOpen,
    focusNodeId,
    setFocusNodeId
  } = useTaskStore();

  const { fitView } = useReactFlow();
  const isMobile = useMobile();

  // Focus Mode Logic: Filter visible nodes and edges
  const visibleNodeIds = useMemo(() => {
    if (!focusNodeId) return null;
    return getSubtreeIds(focusNodeId, edges);
  }, [focusNodeId, edges]);

  const displayNodes = useMemo(() => {
    if (!visibleNodeIds) return nodes;
    return nodes.map(node => ({
      ...node,
      style: { 
        ...node.style, 
        opacity: visibleNodeIds.has(node.id) ? 1 : 0.05,
        pointerEvents: visibleNodeIds.has(node.id) ? 'all' : 'none'
      } as any
    }));
  }, [nodes, visibleNodeIds]);

  const displayEdges = useMemo(() => {
    if (!visibleNodeIds) return edges;
    return edges.map(edge => ({
      ...edge,
      style: { 
        ...edge.style, 
        opacity: (visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target)) ? 1 : 0.05 
      }
    }));
  }, [edges, visibleNodeIds]);

  // Auto-fit view when focus changes
  useEffect(() => {
    if (focusNodeId && visibleNodeIds) {
      setTimeout(() => {
        fitView({ 
          nodes: Array.from(visibleNodeIds).map(id => ({ id })), 
          padding: 0.3, 
          duration: 800 
        });
      }, 50);
    }
  }, [focusNodeId, visibleNodeIds, fitView]);

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
        onNodeClick={() => setDetailPanelOpen(true)}
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
        }}
      >
        <Background
          variant={focusNodeId ? BackgroundVariant.Lines : BackgroundVariant.Dots}
          gap={focusNodeId ? 40 : 20}
          size={1}
          className="opacity-[0.4] dark:opacity-[0.1]"
        />
        {!isMobile && <Controls />}
        {!isMobile && <MiniMap />}
      </ReactFlow>
      <ProductivityToolbar />
      <ShortcutLegend />
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
