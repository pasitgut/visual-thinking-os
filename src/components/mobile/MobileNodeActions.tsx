"use client";

import { Palette, Pin, PinOff, Plus, Trash2, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { NODE_REGISTRY } from "@/features/task/nodeRegistry";
import { cn } from "@/lib/utils";
import { useMobileUIStore } from "@/stores/useMobileUIStore";
import { useTaskStore } from "@/stores/useTaskStore";
import type { TaskColor, TaskType } from "@/types/task";

export const MobileNodeActions = () => {
  const { selectedNodeId, setBottomSheetOpen } = useMobileUIStore();
  const {
    nodes,
    deleteNode,
    addChild,
    updateNodeType,
    updateNodeColor,
    toggleNodePin,
  } = useTaskStore();

  const node = nodes.find((n) => n.id === selectedNodeId);
  if (!node) return null;

  const isRoot = node.id === "root";
  const nodeType = node.data.type || "child";
  const nodeColor = node.data.color || "default";

  const handleAddChild = () => {
    addChild(node.id);
    setBottomSheetOpen(false);
  };

  const handleDelete = () => {
    deleteNode(node.id);
    setBottomSheetOpen(false);
  };

  const handleTypeChange = (type: TaskType) => {
    updateNodeType(node.id, type);
  };

  const handleColorChange = (color: TaskColor) => {
    updateNodeColor(node.id, color);
  };

  const handleTogglePin = () => {
    toggleNodePin(node.id);
  };

  const colors: TaskColor[] = [
    "default",
    "blue",
    "green",
    "purple",
    "pink",
    "yellow",
  ];

  return (
    <div className="space-y-6">
      {/* Primary Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          className="h-16 flex-col gap-1 rounded-2xl border-2"
          onClick={handleAddChild}
        >
          <Plus className="h-5 w-5" />
          <span className="text-xs font-bold">Add Child</span>
        </Button>
        <Button
          variant="outline"
          className={cn(
            "h-16 flex-col gap-1 rounded-2xl border-2",
            isRoot && "opacity-50 cursor-not-allowed",
          )}
          onClick={handleDelete}
          disabled={isRoot}
        >
          <Trash2 className="h-5 w-5 text-destructive" />
          <span className="text-xs font-bold text-destructive">Delete</span>
        </Button>
      </div>

      <Separator />

      {/* Node Properties */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-muted-foreground mb-2">
          <Type className="h-4 w-4" />
          <span className="text-xs font-bold uppercase tracking-wider">
            Node Type
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {Object.values(NODE_REGISTRY)
            .filter((entry) => entry.type !== "root" && entry.type !== "parent")
            .map((entry) => (
              <Button
                key={entry.type}
                variant={nodeType === entry.type ? "default" : "outline"}
                size="sm"
                className="h-10 rounded-xl px-2 gap-2"
                onClick={() => handleTypeChange(entry.type)}
              >
                <entry.icon className="h-4 w-4" />
                <span className="text-xs truncate">{entry.label}</span>
              </Button>
            ))}
        </div>
      </div>

      <Separator />

      {/* Color Overrides */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-muted-foreground mb-2">
          <Palette className="h-4 w-4" />
          <span className="text-xs font-bold uppercase tracking-wider">
            Color Theme
          </span>
        </div>
        <div className="flex flex-wrap gap-3">
          {colors.map((color) => (
            <button
              key={color}
              onClick={() => handleColorChange(color)}
              className={cn(
                "h-10 w-10 rounded-full border-4 transition-all active:scale-90",
                color === "default" &&
                  "bg-zinc-200 border-zinc-300 dark:bg-zinc-700 dark:border-zinc-600",
                color === "blue" && "bg-blue-500 border-blue-400",
                color === "green" && "bg-emerald-500 border-emerald-400",
                color === "purple" && "bg-purple-500 border-purple-400",
                color === "pink" && "bg-pink-500 border-pink-400",
                color === "yellow" && "bg-amber-500 border-amber-400",
                nodeColor === color
                  ? "scale-110 border-primary shadow-lg ring-2 ring-primary/20"
                  : "border-transparent opacity-70",
              )}
            />
          ))}
        </div>
      </div>

      <Separator />

      {/* Metadata/Pinning */}
      {!isRoot && (
        <Button
          variant="outline"
          className="w-full h-12 rounded-2xl justify-between px-4 border-2"
          onClick={handleTogglePin}
        >
          <div className="flex items-center gap-3">
            {node.data.isPinned ? (
              <PinOff className="h-5 w-5 text-amber-500" />
            ) : (
              <Pin className="h-5 w-5" />
            )}
            <span className="font-bold">
              {node.data.isPinned ? "Unpin Node" : "Pin Node"}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            Keep position fixed
          </span>
        </Button>
      )}
    </div>
  );
};
