"use client";

import { Flame, Pin, PinOff, Plus, Target, Trash2, type LucideIcon } from "lucide-react";
import { NODE_REGISTRY } from "@/features/task/nodeRegistry";
import { cn } from "@/lib/utils";
import { useTaskStore } from "@/stores/useTaskStore";
import type { TaskColor, TaskType } from "@/types/task";

import { useDeviceSpec } from "@/hooks/useDeviceSpec";

interface NodeToolbarProps {
  id: string;
  type: TaskType;
  color: TaskColor;
  isPinned?: boolean;
  isImportant?: boolean;
  onAddChild: () => void;
  onDelete: () => void;
  onTypeChange: (type: TaskType) => void;
  onColorChange: (color: TaskColor) => void;
  onTogglePin: () => void;
  onToggleImportance: (isImportant: boolean) => void;
  isRoot?: boolean;
}

const COLORS: { value: TaskColor; class: string }[] = [
  {
    value: "default",
    class: "bg-zinc-200 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700",
  },
  { value: "blue", class: "bg-blue-400 dark:bg-blue-500 border-blue-500" },
  {
    value: "green",
    class: "bg-emerald-400 dark:bg-emerald-500 border-emerald-500",
  },
  {
    value: "purple",
    class: "bg-purple-400 dark:bg-purple-500 border-purple-500",
  },
  { value: "pink", class: "bg-pink-400 dark:bg-pink-500 border-pink-500" },
  { value: "yellow", class: "bg-amber-400 dark:bg-amber-500 border-amber-500" },
];

const TYPES: { value: TaskType; icon: LucideIcon; label: string }[] = [
  { value: "task", icon: NODE_REGISTRY.task.icon, label: "Action" },
  { value: "idea", icon: NODE_REGISTRY.idea.icon, label: "Idea" },
  { value: "problem", icon: NODE_REGISTRY.problem.icon, label: "Issue" },
  { value: "decision", icon: NODE_REGISTRY.decision.icon, label: "Decision" },
  { value: "question", icon: NODE_REGISTRY.question.icon, label: "Question" },
  {
    value: "reference",
    icon: NODE_REGISTRY.reference.icon,
    label: "Reference",
  },
];

export const NodeToolbar = ({
  id,
  type,
  color,
  onAddChild,
  onDelete,
  onTypeChange,
  onColorChange,
  onTogglePin,
  onToggleImportance,
  isRoot,
  isPinned,
  isImportant,
}: NodeToolbarProps) => {
  const { focusNodeId, setFocusNodeId } = useTaskStore();
  const { isMobile } = useDeviceSpec();
  const isFocused = focusNodeId === id;

  const btnClass = isMobile ? "h-10 w-10" : "h-8 w-8";
  const iconClass = isMobile ? "h-5 w-5" : "h-4 w-4";

  return (
    <div
      role="presentation"
      className={cn(
        "flex items-center gap-1 p-1 bg-background/95 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-300 nodrag nopan pointer-events-auto max-w-[90vw] overflow-x-auto custom-scrollbar",
        isMobile && "gap-2 p-1.5"
      )}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Action Section */}
      <div className="flex items-center gap-1">
        {!isRoot && (
          <button
            type="button"
            className={cn(
              "flex items-center justify-center rounded-lg transition-all active:scale-95",
              btnClass,
              isFocused
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105"
                : "hover:bg-primary/10 text-primary",
            )}
            onClick={(e) => {
              e.stopPropagation();
              setFocusNodeId(isFocused ? null : id);
            }}
            title={isFocused ? "Exit Focus" : "Focus on this subtree"}
          >
            <Target className={iconClass} />
          </button>
        )}

        <button
          type="button"
          className={cn(
            "flex items-center justify-center rounded-lg hover:bg-primary/10 text-primary transition-all active:scale-95",
            btnClass
          )}
          onClick={(e) => {
            e.stopPropagation();
            onAddChild();
          }}
          title="Add Subtask"
        >
          <Plus className={iconClass} />
        </button>

        {!isRoot && (
          <button
            type="button"
            className={cn(
              "flex items-center justify-center rounded-lg transition-all active:scale-95",
              btnClass,
              isPinned
                ? "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 shadow-sm shadow-amber-200/50"
                : "hover:bg-amber-50 text-amber-500/60",
            )}
            onClick={(e) => {
              e.stopPropagation();
              onTogglePin();
            }}
            title={isPinned ? "Unpin Node" : "Pin Node Position"}
          >
            {isPinned ? (
              <PinOff className={iconClass} />
            ) : (
              <Pin className={iconClass} />
            )}
          </button>
        )}
      </div>

      {!isRoot && (
        <>
          <div className="w-[1px] h-5 bg-zinc-200 dark:bg-zinc-800 mx-0.5" />

          {/* Semantic Type Section */}
          <div className="flex items-center gap-1">
            {TYPES.map((t) => (
              <button
                type="button"
                key={t.value}
                className={cn(
                  "flex items-center justify-center rounded-lg transition-all active:scale-95",
                  btnClass,
                  type === t.value
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105"
                    : "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-muted-foreground",
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  onTypeChange(t.value);
                }}
                title={t.label}
              >
                <t.icon className={iconClass} />
              </button>
            ))}
          </div>

          <div className="w-[1px] h-5 bg-zinc-200 dark:bg-zinc-800 mx-0.5" />

          {/* Color Section */}
          <div className={cn("flex items-center gap-1 px-1", isMobile && "gap-2")}>
            {COLORS.map((c) => (
              <button
                type="button"
                key={c.value}
                className={cn(
                  "rounded-full border-2 transition-all active:scale-90 hover:scale-125 shadow-sm",
                  isMobile ? "h-7 w-7" : "h-5 w-5",
                  color === c.value
                    ? "ring-2 ring-primary ring-offset-2 dark:ring-offset-zinc-950 scale-110"
                    : "border-transparent",
                  c.class,
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  onColorChange(c.value);
                }}
                title={`Color: ${c.value}`}
              />
            ))}
          </div>

          <div className="w-[1px] h-5 bg-zinc-200 dark:bg-zinc-800 mx-0.5" />
          
          {/* Importance Toggle */}
          <button
            type="button"
            className={cn(
              "flex items-center justify-center rounded-lg transition-all active:scale-95",
              btnClass,
              isImportant
                ? "bg-amber-500 text-white shadow-lg shadow-amber-500/30 scale-105"
                : "hover:bg-amber-500/10 text-amber-500/60",
            )}
            onClick={(e) => {
              e.stopPropagation();
              onToggleImportance(!isImportant);
            }}
            title={isImportant ? "Mark as Normal" : "Mark as Important"}
          >
            <Flame className={cn(iconClass, isImportant && "animate-pulse")} />
          </button>

          <div className="w-[1px] h-5 bg-zinc-200 dark:bg-zinc-800 mx-0.5" />
          <button
            type="button"
            className={cn(
              "flex items-center justify-center rounded-lg hover:bg-destructive/10 text-destructive transition-all active:scale-95",
              btnClass
            )}
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            title="Delete Task"
          >
            <Trash2 className={iconClass} />
          </button>
        </>
      )}
    </div>
  );
};
