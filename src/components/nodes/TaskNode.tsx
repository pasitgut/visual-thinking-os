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
import { isNodeAtDepthLimit } from "@/lib/reactflow/focusTraversal";
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

    const { 
      setEditingNodeId, 
      editingNodeId, 
      edges: allEdges, 
      focusRootId, 
      pushFocusRootId,
      updateNodeDeadline,
      updateNodeImportance,
    } = useTaskStore();
    
    const updateNodeInternals = useUpdateNodeInternals();

    const isConnecting = useStore((s) => !!s.connectionNodeId);
    const zoom = useStore((s) => s.transform[2]);
    const isMacro = zoom < 0.3;
    const isMid = zoom < 0.6;
    const isVeryZoomedOut = zoom < 0.4;

    const { isMobile } = useDeviceSpec();
    const { setInteractionState, setSelectedNodeId: setMobileSelectedNodeId } = useMobileUIStore();

    const isDimmed = editingNodeId !== null && editingNodeId !== id;
    const isDone = data.status === "done";
    const isImportant = data.isImportant;
    const deadline = data.deadline;
    const depth = data.depth ?? 0;
    const nodeType = data.type || "child";
    const nodeColor = data.color || "default";
    const registryEntry = NODE_REGISTRY[nodeType] || NODE_REGISTRY.child;
    const Icon = registryEntry.icon;

    // Calculate child count for collapse indicator
    const childrenCount = useMemo(() => {
      return allEdges.filter((e) => e.source === id && (e.data?.type === "hierarchy" || e.data?.type === "related")).length;
    }, [allEdges, id]);

    const descendantCount = useMemo(() => {
      if (!data.isCollapsed) return 0;
      const ids = getSubtreeIds(id, allEdges);
      return ids.size - 1; // Subtract self
    }, [id, allEdges, data.isCollapsed]);

    // Progressive Exploration: Depth Limit Check
    const atDepthLimit = useMemo(() => {
      return isNodeAtDepthLimit(id, focusRootId, allEdges, 2);
    }, [id, focusRootId, allEdges]);

    const handleFocusHere = (e: React.MouseEvent) => {
      e.stopPropagation();
      pushFocusRootId(id);
    };

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
      if (isEditing) {
        const focusInput = () => {
          if (textareaRef.current) {
            textareaRef.current.focus();
            textareaRef.current.select();
            // Adjust height to content
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
            return true;
          }
          return false;
        };

        // Try immediately
        if (!focusInput()) {
          // If not ready, retry with RAF and a short timeout
          const rafId = requestAnimationFrame(() => focusInput());
          const timeoutId = setTimeout(focusInput, 100);
          return () => {
            cancelAnimationFrame(rafId);
            clearTimeout(timeoutId);
          };
        }
      }
    }, [isEditing]);

    // React to global editingNodeId
    useEffect(() => {
      if (editingNodeId === id && !isEditing) {
        setIsEditing(true);
        if (isMobile) setInteractionState("editing-text");
      } else if (editingNodeId !== id && isEditing) {
        setIsEditing(false);
      }
    }, [editingNodeId, id, isEditing, isMobile, setInteractionState]);

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
            "w-full h-auto min-h-[48px] min-w-[160px] rounded-xl border-2 px-3 py-2.5 transition-all duration-300 flex flex-col gap-1 shadow-md",
            nodeColor === "default"
              ? registryEntry.className
              : COLOR_OVERRIDES[nodeColor as Exclude<TaskColor, "default">],
            selected
              ? "border-primary ring-4 ring-primary/10 scale-105 z-10"
              : "border-transparent",
            nodeType === "idea" && "border-dashed",
            isImportant && "shadow-[0_0_20px_rgba(251,191,36,0.3)] border-amber-400/50",
          )}
          onDoubleClick={handleStartEditing}
        >
          <div className="flex items-center gap-3 w-full">
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
                <Icon className={cn("h-4 w-4", isImportant && "text-amber-500 animate-pulse")} />
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
                    isImportant && "text-amber-900 dark:text-amber-100 font-bold",
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

          {/* Deadline & Meta Section */}
          {nodeType === "task" && deadline && deadline !== "No deadline" && !isMid && (
            <div className="flex items-center gap-1.5 mt-1 ml-9">
              <div className={cn(
                "px-1.5 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 border",
                deadline === "Today" ? "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800" :
                deadline === "Tomorrow" ? "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800" :
                deadline === "Overdue" ? "bg-destructive/10 text-destructive border-destructive/20" :
                "bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800/50 dark:text-zinc-400 dark:border-zinc-700"
              )}>
                <Clock className="h-2.5 w-2.5" />
                {deadline}
              </div>
            </div>
          )}
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
            ? (isMobile ? "opacity-20 grayscale-[0.8]" : "opacity-20 blur-[2px]") 
            : "opacity-100 blur-0",
          isDone && !selected && "opacity-60 grayscale-[0.4]",
          isMobile && "transition-opacity duration-200",
          isImportant && "z-20",
        )}
      >
        {isImportant && (
          <div className="absolute inset-0 -m-1 rounded-[1.2rem] bg-gradient-to-t from-amber-500/20 via-orange-500/10 to-transparent blur-xl animate-pulse -z-10" />
        )}

        {selected && !isEditing && (isHovered || isMobile) && (
          <RFNodeToolbar isVisible={true} position={Position.Top} offset={24}>
            <div>
              <NodeToolbar
                id={id}
                type={nodeType}
                color={nodeColor}
                isPinned={data.isPinned}
                isImportant={isImportant}
                deadline={deadline}
                onAddChild={() => data.onAddChild?.(id)}
                onDelete={() => data.onDelete?.(id)}
                onTypeChange={(t) => data.onTypeChange?.(id, t)}
                onColorChange={(c) => data.onColorChange?.(id, c)}
                onTogglePin={() => data.onTogglePin?.(id)}
                onToggleImportance={(imp) => updateNodeImportance(id, imp)}
                onDeadlineChange={(dl) => updateNodeDeadline(id, dl)}
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

        {renderContent()}

        {atDepthLimit && selected && !isMacro && !isEditing && (
          <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 animate-in fade-in zoom-in-50 slide-in-from-top-4 duration-300 z-[50]">
            <button
              onClick={handleFocusHere}
              className="px-5 py-2 bg-primary text-primary-foreground rounded-full text-xs font-black uppercase tracking-widest shadow-[0_10px_40px_rgba(0,0,0,0.3)] hover:scale-110 active:scale-95 transition-all flex items-center gap-2 border-2 border-background ring-4 ring-primary/20"
            >
              <span>Focus Here</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Effortless Connection Handles (Top, Bottom, Left, Right) */}
        {(["top", "bottom", "left", "right"] as const).map((pos) => {
          const position =
            pos === "top"
              ? Position.Top
              : pos === "bottom"
                ? Position.Bottom
                : pos === "left"
                  ? Position.Left
                  : Position.Right;

          const isVisible = (isHovered || selected) && !isVeryZoomedOut && !isEditing;
          
          // Position handles exactly at the center of each side
          const handleBaseStyle: React.CSSProperties = {
            width: "12px",
            height: "12px",
            backgroundColor: "var(--primary)",
            border: "2px solid white",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "scale(1)" : "scale(0.5)",
            zIndex: 100,
          };

          return (
            <div key={pos}>
              <Handle
                type="target"
                position={position}
                id={`${pos}-target`}
                className="!bg-primary hover:!scale-125 !transition-transform"
                style={{ 
                  ...handleBaseStyle,
                  pointerEvents: isEditing ? "none" : "all",
                }}
              />
              <Handle
                type="source"
                position={position}
                id={`${pos}-source`}
                className="!bg-primary hover:!scale-125 !transition-transform"
                style={{ 
                  ...handleBaseStyle,
                  pointerEvents: isConnecting || isEditing ? "none" : "all",
                }}
              />
            </div>
          );
        })}
      </div>
    );
  },
);

TaskNode.displayName = "TaskNode";
