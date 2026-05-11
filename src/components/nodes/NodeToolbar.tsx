"use client";

import React from "react";
import { useTaskStore } from "@/stores/useTaskStore";
import { Plus, Trash2, Circle, Layers, CircleDot, Target } from "lucide-react";
import { TaskType, TaskColor } from "@/types/task";
import { cn } from "@/lib/utils";

interface NodeToolbarProps {
  id: string;
  type: TaskType;
  color: TaskColor;
  onAddChild: () => void;
  onDelete: () => void;
  onTypeChange: (type: TaskType) => void;
  onColorChange: (color: TaskColor) => void;
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

import { NODE_REGISTRY } from "@/features/task/nodeRegistry";

const TYPES: { value: TaskType; icon: any; label: string }[] = [
  { value: "task", icon: NODE_REGISTRY.task.icon, label: "Action" },
  { value: "idea", icon: NODE_REGISTRY.idea.icon, label: "Idea" },
  { value: "problem", icon: NODE_REGISTRY.problem.icon, label: "Issue" },
  { value: "decision", icon: NODE_REGISTRY.decision.icon, label: "Decision" },
  { value: "question", icon: NODE_REGISTRY.question.icon, label: "Question" },
  { value: "reference", icon: NODE_REGISTRY.reference.icon, label: "Reference" },
];

const STRUCTURAL_TYPES: { value: TaskType; icon: any; label: string }[] = [
  { value: "parent", icon: NODE_REGISTRY.parent.icon, label: "Parent" },
  { value: "child", icon: NODE_REGISTRY.child.icon, label: "General" },
];

export const NodeToolbar = ({
  id,
  type,
  color,
  onAddChild,
  onDelete,
  onTypeChange,
  onColorChange,
  isRoot,
}: NodeToolbarProps) => {
  const { focusNodeId, setFocusNodeId } = useTaskStore();
  const isFocused = focusNodeId === id;

  return (
    <div
      className="flex items-center gap-2 p-2 bg-background/95 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-300 nodrag nopan pointer-events-auto"
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Action Section */}
      <div className="flex items-center gap-1">
        <button
          className={cn(
            "flex items-center justify-center h-9 w-9 rounded-xl transition-all active:scale-95",
            isFocused
              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-110"
              : "hover:bg-primary/10 text-primary",
          )}
          onClick={(e) => {
            e.stopPropagation();
            setFocusNodeId(isFocused ? null : id);
          }}
          title={isFocused ? "Exit Focus" : "Focus on this subtree"}
        >
          <Target className="h-5 w-5" />
        </button>

        <button
          className="flex items-center justify-center h-9 w-9 rounded-xl hover:bg-primary/10 text-primary transition-all active:scale-95"
          onClick={(e) => {
            e.stopPropagation();
            onAddChild();
          }}
          title="Add Subtask"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      <div className="w-[1px] h-6 bg-zinc-200 dark:bg-zinc-800" />

      {/* Semantic Type Section */}
      <div className="flex items-center gap-1">
        {TYPES.map((t) => (
          <button
            key={t.value}
            className={cn(
              "flex items-center justify-center h-9 w-9 rounded-xl transition-all active:scale-95",
              type === t.value
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-110"
                : "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-muted-foreground",
            )}
            onClick={(e) => {
              e.stopPropagation();
              onTypeChange(t.value);
            }}
            title={t.label}
          >
            <t.icon className="h-4 w-4" />
          </button>
        ))}
      </div>

      <div className="w-[1px] h-6 bg-zinc-200 dark:bg-zinc-800" />

      {/* Structural Section */}
      {!isRoot && (
        <>
          <div className="flex items-center gap-1">
            {STRUCTURAL_TYPES.map((t) => (
              <button
                key={t.value}
                className={cn(
                  "flex items-center justify-center h-9 w-9 rounded-xl transition-all active:scale-95",
                  type === t.value
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-110"
                    : "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-muted-foreground",
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  onTypeChange(t.value);
                }}
                title={t.label}
              >
                <t.icon className="h-4 w-4" />
              </button>
            ))}
          </div>
          <div className="w-[1px] h-6 bg-zinc-200 dark:bg-zinc-800" />
        </>
      )}

      {/* Color Section */}
      <div className="flex items-center gap-1.5 px-1">
        {COLORS.map((c) => (
          <button
            key={c.value}
            className={cn(
              "h-6 w-6 rounded-full border-2 transition-all active:scale-90 hover:scale-125 shadow-sm",
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

      {!isRoot && (
        <>
          <div className="w-[1px] h-6 bg-zinc-200 dark:bg-zinc-800" />
          <button
            className="flex items-center justify-center h-9 w-9 rounded-xl hover:bg-destructive/10 text-destructive transition-all active:scale-95"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            title="Delete Task"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </>
      )}
    </div>
  );
};
