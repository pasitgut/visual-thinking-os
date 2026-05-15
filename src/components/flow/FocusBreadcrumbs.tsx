"use client";

import { ChevronLeft, ChevronRight, Home, Layers } from "lucide-react";
import React, { useMemo } from "react";
import { getParentPath } from "@/lib/reactflow/graphUtils";
import { cn } from "@/lib/utils";
import { useTaskStore } from "@/stores/useTaskStore";
import type { TaskNodeData } from "@/types/task";

export const FocusBreadcrumbs = () => {
  const {
    focusNodeId,
    setFocusNodeId,
    focusRootId,
    setFocusRootId,
    popFocusRootId,
    navigationHistory,
    nodes,
    edges,
  } = useTaskStore();

  const explorationPath = useMemo(() => {
    if (focusRootId === "root") return [];
    return getParentPath(focusRootId, nodes, edges);
  }, [focusRootId, nodes, edges]);

  const hasHistory = navigationHistory.length > 0;

  return (
    <div className="fixed top-6 left-6 z-50 flex flex-col gap-2 pointer-events-none">
      {/* Exploration Breadcrumbs (Progressive Navigation) */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-background/90 backdrop-blur-md border rounded-full shadow-lg animate-in slide-in-from-left-4 duration-500 pointer-events-auto">
        <button
          type="button"
          onClick={() => setFocusRootId("root")}
          className={cn(
            "p-1.5 hover:bg-accent rounded-full transition-colors",
            focusRootId === "root"
              ? "text-primary bg-primary/10"
              : "text-muted-foreground hover:text-foreground",
          )}
          title="Back to Global Root"
        >
          <Home className="h-4 w-4" />
        </button>

        {explorationPath.map((node, _index) => (
          <React.Fragment key={node.id}>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/30" />
            <button
              type="button"
              onClick={() => setFocusRootId(node.id)}
              className={cn(
                "px-2 py-1 text-xs font-medium rounded-md transition-all truncate max-w-[120px]",
                node.id === focusRootId
                  ? "bg-primary/10 text-primary font-bold"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent",
              )}
            >
              {(node.data as TaskNodeData).title || "Untitled"}
            </button>
          </React.Fragment>
        ))}

        {hasHistory && (
          <>
            <div className="h-4 w-[1px] bg-border mx-1" />
            <button
              type="button"
              onClick={popFocusRootId}
              className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-primary hover:bg-primary/10 rounded-md transition-colors"
              title="Go back to previous focus"
            >
              <ChevronLeft className="h-3 w-3" />
              Back
            </button>
          </>
        )}
      </div>

      {/* Focus Mode Breadcrumbs (Secondary Layer) */}
      {focusNodeId && (
        <div className="flex items-center gap-2 px-3 py-1 bg-primary text-primary-foreground rounded-full shadow-md animate-in slide-in-from-top-2 duration-300 self-start pointer-events-auto">
          <Layers className="h-3 w-3 opacity-70" />
          <span className="text-[10px] font-black uppercase tracking-widest">
            Focusing:
          </span>
          <span className="text-[10px] font-medium truncate max-w-[100px]">
            {(nodes.find((n) => n.id === focusNodeId)?.data as TaskNodeData)
              ?.title || "Selected Node"}
          </span>
          <button
            onClick={() => setFocusNodeId(null)}
            className="ml-1 p-0.5 hover:bg-white/20 rounded-full transition-colors"
          >
            <ChevronRight className="h-3 w-3 rotate-45" />
          </button>
        </div>
      )}
    </div>
  );
};
