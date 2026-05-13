"use client";

import { CheckCircle2, ChevronDown, ChevronRight, Circle, Clock, Pin } from "lucide-react";
import type React from "react";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import {
  Handle,
  type NodeProps,
  Position,
  NodeToolbar as RFNodeToolbar,
  useStore,
  useUpdateNodeInternals,
} from "reactflow";
import { NODE_REGISTRY } from "@/features/task/nodeRegistry";
import { cn } from "@/lib/utils";
import { useTaskStore } from "@/stores/useTaskStore";
import { useDeviceSpec } from "@/hooks/useDeviceSpec";
import { useMobileUIStore } from "@/stores/useMobileUIStore";
import { useLongPress } from "@/hooks/useLongPress";
import { getSubtreeIds } from "@/lib/reactflow/focusUtils";
import type {
  TaskColor,
  TaskNodeData,
  TaskStatus,
} from "@/types/task";
import { NodeToolbar } from "./NodeToolbar";

const StatusIcon = ({
  status,
  size = "h-5 w-5",
}: {
  status: TaskStatus;
  size?: string;
}) => {
  switch (status) {
    case "done":
      return (
        <CheckCircle2
          className={cn(size, "text-emerald-600 dark:text-emerald-400")}
        />
      );
    case "in-progress":
      return <Clock className={cn(size, "text-blue-600 dark:text-blue-400")} />;
    default:
      return <Circle className={cn(size, "text-muted-foreground/40")} />;
  }
};

const COLOR_OVERRIDES: Record<Exclude<TaskColor, "default">, string> = {
  blue: "border-blue-400 bg-blue-50 text-blue-700 dark:border-blue-700/50 dark:bg-blue-900/20 dark:text-blue-300",
  green:
    "border-emerald-400 bg-emerald-50 text-emerald-700 dark:border-emerald-700/50 dark:bg-emerald-900/20 dark:text-emerald-300",
  purple:
    "border-purple-400 bg-purple-50 text-purple-700 dark:border-purple-700/50 dark:bg-purple-900/20 dark:text-purple-300",
  pink: "border-pink-400 bg-pink-50 text-pink-700 dark:border-pink-700/50 dark:bg-pink-900/20 dark:text-pink-300",
  yellow:
    "border-amber-400 bg-amber-50 text-amber-700 dark:border-amber-700/50 dark:bg-amber-900/20 dark:text-amber-300",
};

const ROOT_COLOR_OVERRIDES: Record<Exclude<TaskColor, "default">, string> = {
  blue: "bg-blue-600 border-blue-400",
  green: "bg-emerald-600 border-emerald-400",
  purple: "bg-purple-600 border-purple-400",
  pink: "bg-pink-600 border-pink-400",
  yellow: "bg-amber-500 border-amber-400",
};

export const TaskNode = memo(
  ({ id, data, selected }: NodeProps<TaskNodeData>) => {
    const [isEditing, setIsEditing] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);
    const [title, setTitle] = useState(data.title);

    const handleMouseEnter = () => {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
      setIsHovered(true);
    };

    const handleMouseLeave = () => {
      hoverTimerRef.current = setTimeout(() => {
        setIsHovered(false);
      }, 300); // Buffer to reach the toolbar
    };
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const setEditingNodeId = useTaskStore((state) => state.setEditingNodeId);
    const editingNodeId = useTaskStore((state) => state.editingNodeId);
    const updateNodeInternals = useUpdateNodeInternals();

    const zoom = useStore((s) => s.transform[2]);
    const isMacro = zoom < 0.3;
    const isMid = zoom < 0.6;
    const isVeryZoomedOut = zoom < 0.4;

    const { isMobile } = useDeviceSpec();
    const { setInteractionState, setSelectedNodeId: setMobileSelectedNodeId } = useMobileUIStore();

    const isDimmed = editingNodeId !== null && editingNodeId !== id;
    const isDone = data.status === "done";
    const depth = data.depth ?? 0;
    const nodeType = data.type || "child";
    const nodeColor = data.color || "default";
    const registryEntry = NODE_REGISTRY[nodeType] || NODE_REGISTRY.child;
    const Icon = registryEntry.icon;

    // Calculate child count for collapse indicator
    const allEdges = useTaskStore((s) => s.edges);
    const childrenCount = useMemo(() => {
      return allEdges.filter((e) => e.source === id && e.data?.type === "hierarchy").length;
    }, [allEdges, id]);

    const descendantCount = useMemo(() => {
      if (!data.isCollapsed) return 0;
      const ids = getSubtreeIds(id, allEdges);
      return ids.size - 1; // Subtract self
    }, [id, allEdges, data.isCollapsed]);

    // Sync handle positions when size changes automatically
    useEffect(() => {
      if (!containerRef.current) return;

      const resizeObserver = new ResizeObserver(() => {
        updateNodeInternals(id);
      });

      resizeObserver.observe(containerRef.current);

      return () => {
        resizeObserver.disconnect();
      };
    }, [id, updateNodeInternals]);

    useEffect(() => {
      setTitle(data.title);
    }, [data.title]);

    useEffect(() => {
      if (isEditing && textareaRef.current) {
        textareaRef.current.focus();
        // Use a small timeout to ensure focus and selection happen after render
        const timeoutId = setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.focus();
            textareaRef.current.select();
            // Auto-adjust height
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
          }
        }, 50);
        return () => clearTimeout(timeoutId);
      }
    }, [isEditing]);

    // React to global editingNodeId
    useEffect(() => {
      if (editingNodeId === id && !isEditing) {
        setIsEditing(true);
      } else if (editingNodeId !== id && isEditing) {
        setIsEditing(false);
      }
    }, [editingNodeId, id, isEditing]);

    const handleStartEditing = () => {
      if (nodeType === "root") return;
      setIsEditing(true);
      setEditingNodeId(id);
      if (isMobile) setInteractionState("editing-text");
    };

    const handleSave = () => {
      setIsEditing(false);
      setEditingNodeId(null);
      if (isMobile) setInteractionState("node-selected");
      
      const trimmedTitle = title.trim();
      if (trimmedTitle !== "" && trimmedTitle !== data.title) {
        data.onTitleChange?.(id, trimmedTitle);
      } else if (trimmedTitle === "" && data.title === "") {
        // If it was a new node and title is still empty, maybe we should delete it?
        // For now, let's just set a placeholder or keep it empty
        data.onTitleChange?.(id, "Untitled");
      } else {
        setTitle(data.title);
      }
    };

    const onKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSave();
      }
      if (e.key === "Escape") {
        setIsEditing(false);
        setEditingNodeId(null);
        setTitle(data.title);
        if (isMobile) setInteractionState("node-selected");
      }
    };

    const handleStatusToggle = (e: React.MouseEvent) => {
      e.stopPropagation();
      const statuses: TaskStatus[] = ["todo", "in-progress", "done"];
      const currentIndex = statuses.indexOf(data.status);
      const nextStatus = statuses[(currentIndex + 1) % statuses.length];
      data.onStatusChange?.(id, nextStatus);
    };

    const handleToggleCollapse = (e: React.MouseEvent) => {
      e.stopPropagation();
      data.onToggleCollapse?.(id);
    };

    const renderContent = () => {
      if (isMacro && !isEditing) {
        // Macro Level: Minimal color-coded block
        return (
          <div
            className={cn(
              "w-full h-full min-h-[32px] min-w-[32px] rounded-lg border-2 transition-all duration-300 shadow-sm",
              nodeColor === "default"
                ? registryEntry.className
                : nodeType === "root" 
                  ? ROOT_COLOR_OVERRIDES[nodeColor as Exclude<TaskColor, "default">]
                  : COLOR_OVERRIDES[nodeColor as Exclude<TaskColor, "default">],
              selected && "ring-4 ring-primary/30 border-primary"
            )}
          />
        );
      }

      const commonTextareaProps = {
        ref: textareaRef,
        value: title,
        onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => {
          setTitle(e.target.value);
          e.target.style.height = "auto";
          e.target.style.height = `${e.target.scrollHeight}px`;
        },
        onBlur: handleSave,
        onKeyDown: onKeyDown,
        className:
          "h-auto py-0 px-0 focus-visible:ring-0 border-none shadow-none bg-transparent w-full text-inherit resize-none overflow-hidden outline-none",
      };

      if (nodeType === "root") {
        return (
          <div
            className={cn(
              "relative w-full h-auto min-h-[100px] min-w-[240px] rounded-3xl transition-all duration-300 flex items-center gap-5 border-4 shadow-2xl overflow-hidden text-white",
              isMid ? "p-4" : "p-6",
              nodeColor === "default"
                ? registryEntry.className
                : ROOT_COLOR_OVERRIDES[
                    nodeColor as Exclude<TaskColor, "default">
                  ],
              selected
                ? "scale-105 border-white/40 ring-8 ring-primary/20"
                : "border-transparent",
            )}
            onDoubleClick={handleStartEditing}
          >
            {!isMid && (
              <div className="p-3 bg-white/20 rounded-2xl flex-shrink-0">
                <Icon className="h-8 w-8 text-white" />
              </div>
            )}
            <div className="flex-1 text-left">
              {isEditing ? (
                <textarea
                  {...commonTextareaProps}
                  className={cn(
                    commonTextareaProps.className,
                    "text-xl font-black placeholder:text-white/50",
                  )}
                  rows={1}
                />
              ) : (
                <span className={cn(
                  "tracking-tight cursor-default select-none whitespace-pre-wrap break-words w-full transition-all duration-300",
                  depth === 0 ? "text-xl font-black" : depth === 1 ? "text-lg font-extrabold" : "text-base font-bold",
                  isDone && "text-white/60"
                )}>
                  {data.title || "Start"}
                </span>
              )}
            </div>
          </div>
        );
      }

      // Semantic Types Rendering
      return (
        <div
          className={cn(
            "w-full h-auto min-h-[48px] min-w-[160px] rounded-xl border-2 px-3 py-2.5 transition-all duration-300 flex items-center gap-3 shadow-md",
            nodeColor === "default"
              ? registryEntry.className
              : COLOR_OVERRIDES[nodeColor as Exclude<TaskColor, "default">],
            selected
              ? "border-primary ring-4 ring-primary/10 scale-105 z-10"
              : "border-transparent",
            nodeType === "idea" && "border-dashed",
          )}
          onDoubleClick={handleStartEditing}
        >
          {!isMid && (
            <div
              className={cn(
                "p-1.5 rounded-lg flex-shrink-0",
                nodeColor !== "default"
                  ? "bg-black/5 dark:bg-white/5"
                  : cn(
                      nodeType === "task" &&
                        "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                      nodeType === "problem" &&
                        "bg-pink-500/10 text-pink-600 dark:text-pink-400",
                      nodeType === "decision" &&
                        "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
                      nodeType === "question" &&
                        "bg-sky-500/10 text-sky-600 dark:text-sky-400",
                      nodeType === "reference" &&
                        "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400",
                      nodeType === "idea" &&
                        "bg-amber-500/10 text-amber-600 dark:text-amber-400",
                      nodeType === "child" && "bg-zinc-500/10 text-zinc-500",
                      nodeType === "parent" &&
                        "bg-purple-500/10 text-purple-600 dark:text-purple-400",
                    ),
              )}
            >
              <Icon className="h-4 w-4" />
            </div>
          )}

          <div className="flex-1 flex items-center gap-2">
            {!isMid && nodeType === "task" && (
              <button
                type="button"
                onClick={handleStatusToggle}
                className="hover:scale-110 active:scale-90 transition-transform flex-shrink-0"
              >
                <StatusIcon status={data.status} size="h-4 w-4" />
              </button>
            )}
            {isEditing ? (
              <textarea
                {...commonTextareaProps}
                className={cn(
                  commonTextareaProps.className,
                  "text-sm font-semibold",
                )}
                rows={1}
              />
            ) : (
              <div
                className={cn(
                  "whitespace-pre-wrap break-words w-full cursor-text py-0.5 leading-relaxed transition-all duration-300",
                  depth === 1 ? "text-base font-bold" : "text-sm font-semibold",
                  isDone && !isMid && "text-muted-foreground/40 line-through grayscale",
                  !data.title && "text-muted-foreground/30",
                )}
              >
                {data.title || "New Node"}
              </div>
            )}

            {childrenCount > 0 && !isMid && (
              <button
                type="button"
                onClick={handleToggleCollapse}
                className="ml-auto p-0.5 rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-muted-foreground flex items-center gap-1"
              >
                {data.isCollapsed ? (
                  <>
                    <div className="bg-primary/10 text-primary text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                      +{descendantCount}
                    </div>
                    <ChevronRight className="h-4 w-4" />
                  </>
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
            )}
          </div>
        </div>
      );
    };

    return (
      <div
        ref={containerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onContextMenu={(e) => isMobile && e.preventDefault()}
        className={cn(
          "group relative transition-all duration-300 ease-in-out animate-in fade-in zoom-in-95",
          isDimmed 
            ? (isMobile ? "opacity-30 grayscale-[0.5]" : "opacity-30 blur-[1px]") 
            : "opacity-100 blur-0",
          isDone && !selected && "opacity-60 grayscale-[0.4]",
          isMobile && "transition-opacity duration-200" // Faster opacity transition on mobile
        )}
      >
        {/* {selected && (
          <NodeResizer
            minWidth={
              nodeType === "root" ? 280 : 160
            }
            minHeight={
              nodeType === "root" ? 120 : 48
            }
            isVisible={selected}
            lineClassName="border-primary"
            handleClassName="h-3 w-3 bg-white border-2 border-primary rounded-full shadow-md"
          />
        )} */}

        {selected && !isEditing && (isHovered || isMobile) && (
          <RFNodeToolbar isVisible={true} position={Position.Top} offset={24}>
            <div>
              <NodeToolbar
                id={id}
                type={nodeType}
                color={nodeColor}
                isPinned={data.isPinned}
                onAddChild={() => data.onAddChild?.(id)}
                onDelete={() => data.onDelete?.(id)}
                onTypeChange={(t) => data.onTypeChange?.(id, t)}
                onColorChange={(c) => data.onColorChange?.(id, c)}
                onTogglePin={() => data.onTogglePin?.(id)}
                isRoot={id === "root"}
              />
            </div>
          </RFNodeToolbar>
        )}

        {data.isPinned && !selected && (
          <div className="absolute -top-2 -right-2 bg-amber-500 text-white p-1 rounded-full shadow-lg z-20 animate-in zoom-in-50 duration-300">
            <Pin className="h-2.5 w-2.5 fill-current" />
          </div>
        )}

        {nodeType !== "root" && (
          <Handle
            type="target"
            position={Position.Top}
            className={cn(
              "!w-3 !h-3 !bg-primary border-2 border-background transition-all",
              (isVeryZoomedOut || (nodeType === "idea" && !selected) || (!isHovered && !selected))
                ? "opacity-0"
                : "opacity-100",
            )}
          />
        )}

        {renderContent()}

        <Handle
          type="source"
          position={Position.Bottom}
          className={cn(
            "!w-3 !h-3 !bg-primary border-2 border-background transition-all",
            (isVeryZoomedOut || (nodeType === "idea" && !selected) || (!isHovered && !selected))
              ? "opacity-0"
              : "opacity-100",
          )}
        />
      </div>
    );
  },
);

TaskNode.displayName = "TaskNode";
