"use client";

import { X } from "lucide-react";
import { memo } from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  type EdgeProps,
  getBezierPath,
  useReactFlow,
} from "reactflow";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

import { useTaskStore } from "@/stores/useTaskStore";
import type { RelationshipType, TaskEdgeData } from "@/types/task";

const RELATIONSHIP_CONFIG: Record<
  RelationshipType,
  { label: string; color: string; dashArray?: string; icon: string }
> = {
  hierarchy: { label: "Subtask", color: "#cbd5e1", icon: "📁" },
  related_to: {
    label: "Related",
    color: "#94a3b8",
    dashArray: "5 5",
    icon: "🔗",
  },
  depends_on: { label: "Depends On", color: "#f59e0b", icon: "⏳" },
  blocks: { label: "Blocks", color: "#ef4444", icon: "🚫" },
  inspired_by: {
    label: "Inspired By",
    color: "#a855f7",
    dashArray: "2 2",
    icon: "💡",
  },
};

export const RelationshipEdge = memo((props: EdgeProps<TaskEdgeData>) => {
  const {
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerEnd,
    data,
    selected,
  } = props;

  const { setEdges } = useReactFlow();
  const updateEdgeType = useTaskStore((state) => state.updateEdgeType);

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });
  const relationshipType = data?.type || "hierarchy";
  const config =
    RELATIONSHIP_CONFIG[relationshipType as keyof typeof RELATIONSHIP_CONFIG];

  const edgeColor = selected ? "#3b82f6" : config.color;
  const isHierarchy = relationshipType === "hierarchy";

  // Explicitly define marker to ensure color sync
  const markerEndConfig = {
    type: "arrowclosed" as any,
    color: edgeColor,
    width: 20,
    height: 20,
  };

  const removeEdge = () => {
    setEdges((es) => es.filter((e) => e.id !== id));
  };

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEndConfig as any}
        style={{
          ...style,
          stroke: edgeColor,
          strokeWidth: selected ? 3 : isHierarchy ? 1.5 : 2,
          strokeDasharray: config.dashArray,
          strokeOpacity: selected ? 1 : isHierarchy ? 0.4 : 0.6,
          transition: "all 0.3s",
        }}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: "all",
          }}
          className="nodrag nopan"
        >
          <DropdownMenu>
            <DropdownMenuTrigger
              nativeButton={false}
              render={
                <div
                  className={cn(
                    "px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider shadow-md border flex items-center gap-2 transition-all cursor-pointer bg-background/90 backdrop-blur-sm hover:scale-105 active:scale-95 z-50",
                    selected
                      ? "border-primary ring-2 ring-primary/20 text-primary"
                      : "border-border text-muted-foreground hover:border-primary hover:text-primary",
                  )}
                >
                  <span className="text-sm">{config.icon}</span>
                  <span>{config.label}</span>
                  {selected && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeEdge();
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.stopPropagation();
                          removeEdge();
                        }
                      }}
                      className="ml-1 hover:text-destructive transition-colors p-0.5 rounded-full hover:bg-destructive/10"
                      title="Delete Relationship"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              }
            />
            <DropdownMenuContent align="center" side="top">
              {(
                Object.keys(RELATIONSHIP_CONFIG) as Array<
                  keyof typeof RELATIONSHIP_CONFIG
                >
              ).map((type) => (
                <DropdownMenuItem
                  key={type}
                  onClick={() => updateEdgeType(id, type)}
                  className="flex items-center gap-2"
                >
                  <span>{RELATIONSHIP_CONFIG[type].icon}</span>
                  {RELATIONSHIP_CONFIG[type].label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </EdgeLabelRenderer>
    </>
  );
});

RelationshipEdge.displayName = "RelationshipEdge";
