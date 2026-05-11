"use client";

import React, { memo, useState, useEffect, useRef } from "react";
import {
  Handle,
  Position,
  NodeProps,
  useStore,
  NodeToolbar as RFNodeToolbar,
  NodeResizer,
  useUpdateNodeInternals,
} from "reactflow";
import { Card, CardContent } from "@/components/ui/card";
import {
  CheckCircle2,
  Circle,
  Clock,
  Target,
  Folder,
  Hash,
} from "lucide-react";
import { TaskNodeData, TaskStatus, TaskColor, TaskType } from "@/types/task";
import { cn } from "@/lib/utils";
import { useTaskStore } from "@/stores/useTaskStore";
import { NodeToolbar } from "./NodeToolbar";

import { NODE_REGISTRY } from "@/features/task/nodeRegistry";

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

export const TaskNode = memo(
  ({ id, data, selected }: NodeProps<TaskNodeData>) => {
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(data.title);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const setEditingNodeId = useTaskStore((state) => state.setEditingNodeId);
    const editingNodeId = useTaskStore((state) => state.editingNodeId);
    const updateNodeInternals = useUpdateNodeInternals();

    const zoom = useStore((s) => s.transform[2]);
    const isVeryZoomedOut = zoom < 0.4;

    const isDimmed = editingNodeId !== null && editingNodeId !== id;
    const nodeType = data.type || "child";
    const nodeColor = data.color || "default";
    const registryEntry = NODE_REGISTRY[nodeType] || NODE_REGISTRY.child;
    const Icon = registryEntry.icon;

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
        textareaRef.current.select();
        // Auto-adjust height
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.height =
          textareaRef.current.scrollHeight + "px";
      }
    }, [isEditing]);

    const handleStartEditing = () => {
      setIsEditing(true);
      setEditingNodeId(id);
    };

    const handleSave = () => {
      setIsEditing(false);
      setEditingNodeId(null);
      if (title.trim() !== "" && title !== data.title) {
        data.onTitleChange?.(id, title);
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
      }
    };

    const handleStatusToggle = (e: React.MouseEvent) => {
      e.stopPropagation();
      const statuses: TaskStatus[] = ["todo", "in-progress", "done"];
      const currentIndex = statuses.indexOf(data.status);
      const nextStatus = statuses[(currentIndex + 1) % statuses.length];
      data.onStatusChange?.(id, nextStatus);
    };

    const renderContent = () => {
      const commonTextareaProps = {
        ref: textareaRef,
        value: title,
        onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => {
          setTitle(e.target.value);
          e.target.style.height = "auto";
          e.target.style.height = e.target.scrollHeight + "px";
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
              "relative w-full h-auto min-h-[100px] min-w-[240px] rounded-3xl p-6 transition-all duration-300 flex items-center gap-5 border-4 shadow-2xl overflow-hidden",
              registryEntry.className,
              selected
                ? "scale-105 border-white/40 ring-8 ring-primary/20"
                : "border-transparent",
            )}
          >
            <div className="p-3 bg-white/20 rounded-2xl flex-shrink-0">
              <Icon className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1 text-left text-white">
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
                <span
                  className="text-xl font-black tracking-tight cursor-text select-none whitespace-pre-wrap break-words w-full"
                  onDoubleClick={handleStartEditing}
                >
                  {data.title}
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
            registryEntry.className,
            selected
              ? "border-primary ring-4 ring-primary/10 scale-105 z-10"
              : "border-transparent",
            nodeType === 'idea' && "border-dashed",
          )}
        >
          <div className={cn(
            "p-1.5 rounded-lg flex-shrink-0",
            nodeType === "task" && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
            nodeType === "problem" && "bg-pink-500/10 text-pink-600 dark:text-pink-400",
            nodeType === "decision" && "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
            nodeType === "question" && "bg-sky-500/10 text-sky-600 dark:text-sky-400",
            nodeType === "reference" && "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400",
            nodeType === "idea" && "bg-amber-500/10 text-amber-600 dark:text-amber-400",
            nodeType === "child" && "bg-zinc-500/10 text-zinc-500",
            nodeType === "parent" && "bg-purple-500/10 text-purple-600 dark:text-purple-400",
          )}>
            <Icon className="h-4 w-4" />
          </div>
          
          <div className="flex-1 flex items-center gap-2">
            {!isVeryZoomedOut && nodeType === 'task' && (
              <button
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
              <span
                className={cn(
                  "text-sm font-semibold whitespace-pre-wrap break-words w-full cursor-text py-0.5 leading-relaxed",
                  data.status === "done" &&
                    "text-muted-foreground/50 line-through",
                )}
                onDoubleClick={handleStartEditing}
              >
                {data.title}
              </span>
            )}
          </div>
        </div>
      );
    };

    return (
      <div
        ref={containerRef}
        className={cn(
          "group relative transition-all duration-300 ease-in-out animate-in fade-in zoom-in-95",
          isDimmed ? "opacity-30 blur-[1px]" : "opacity-100 blur-0",
        )}
      >
        {selected && (
          <NodeResizer
            minWidth={
              nodeType === "root" ? 280 : nodeType === "parent" ? 240 : 160
            }
            minHeight={
              nodeType === "root" ? 120 : nodeType === "parent" ? 100 : 48
            }
            isVisible={selected}
            lineClassName="border-primary"
            handleClassName="h-3 w-3 bg-white border-2 border-primary rounded-full shadow-md"
          />
        )}

        {selected && !isEditing && (
          <RFNodeToolbar isVisible={true} position={Position.Top} offset={24}>
            <NodeToolbar
              id={id}
              type={nodeType}
              color={nodeColor}
              onAddChild={() => data.onAddChild?.(id)}
              onDelete={() => data.onDelete?.(id)}
              onTypeChange={(t) => data.onTypeChange?.(id, t)}
              onColorChange={(c) => data.onColorChange?.(id, c)}
              isRoot={id === "root"}
            />
          </RFNodeToolbar>
        )}

        {nodeType !== "root" && (
          <Handle
            type="target"
            position={Position.Top}
            className={cn(
              "!w-3 !h-3 !bg-primary border-2 border-background transition-all",
              (isVeryZoomedOut || (nodeType === 'idea' && !selected)) ? "opacity-0" : "opacity-100",
            )}
          />
        )}

        {renderContent()}

        <Handle
          type="source"
          position={Position.Bottom}
          className={cn(
            "!w-3 !h-3 !bg-primary border-2 border-background transition-all",
            (isVeryZoomedOut || (nodeType === 'idea' && !selected)) ? "opacity-0" : "opacity-100",
          )}
        />
      </div>
    );
  },
);

TaskNode.displayName = "TaskNode";
