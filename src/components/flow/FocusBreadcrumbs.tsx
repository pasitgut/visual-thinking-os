"use client";

import React, { useMemo } from "react";
import { useTaskStore } from "@/stores/useTaskStore";
import { getParentPath } from "@/lib/reactflow/focusUtils";
import { ChevronRight, Home, Target, X } from "lucide-react";
import { cn } from "@/lib/utils";

export const FocusBreadcrumbs = () => {
  const { focusNodeId, setFocusNodeId, nodes, edges } = useTaskStore();

  const path = useMemo(() => {
    if (!focusNodeId) return [];
    return getParentPath(focusNodeId, nodes, edges);
  }, [focusNodeId, nodes, edges]);

  if (!focusNodeId) return null;

  return (
    <div className="fixed top-6 left-6 z-50 flex items-center gap-2 px-3 py-1.5 bg-background/80 backdrop-blur-md border rounded-full shadow-lg animate-in slide-in-from-left-4 duration-500">
      <button
        onClick={() => setFocusNodeId(null)}
        className="p-1.5 hover:bg-accent rounded-full transition-colors text-muted-foreground hover:text-foreground"
        title="Exit Focus Mode"
      >
        <Home className="h-4 w-4" />
      </button>

      {path.map((node, index) => (
        <React.Fragment key={node.id}>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
          <button
            onClick={() => setFocusNodeId(node.id)}
            className={cn(
              "px-2 py-1 text-xs font-medium rounded-md transition-all truncate max-w-[120px]",
              index === path.length - 1
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            )}
          >
            {(node.data as any).title || "Untitled"}
          </button>
        </React.Fragment>
      ))}

      <div className="h-4 w-[1px] bg-border mx-1" />
      
      <button
        onClick={() => setFocusNodeId(null)}
        className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-destructive hover:bg-destructive/10 rounded-md transition-colors"
      >
        <X className="h-3 w-3" />
        Exit Focus
      </button>
    </div>
  );
};
