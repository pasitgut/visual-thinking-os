"use client";

import {
  closestCorners,
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  DragOverlay,
  type DragStartEvent,
  defaultDropAnimationSideEffects,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { format } from "date-fns";
import {
  Calendar,
  CheckCircle2,
  Circle,
  CircleDot,
  GripVertical,
  Hash,
  MoreHorizontal,
  Plus,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { NODE_REGISTRY } from "@/features/task/nodeRegistry";
import { cn } from "@/lib/utils";
import { useTaskStore } from "@/stores/useTaskStore";
import type { TaskNode, TaskStatus } from "@/types/task";

const COLUMNS: {
  status: TaskStatus;
  label: string;
  icon: any;
  color: string;
}[] = [
  {
    status: "todo",
    label: "To Do",
    icon: Circle,
    color: "text-muted-foreground",
  },
  {
    status: "in-progress",
    label: "In Progress",
    icon: CircleDot,
    color: "text-blue-500",
  },
  {
    status: "done",
    label: "Done",
    icon: CheckCircle2,
    color: "text-emerald-500",
  },
];

export const KanbanView = () => {
  const {
    nodes,
    updateNodeStatus,
    updateNodeTitle,
    deleteNode,
    createNode,
    setSelectedNodeIds,
  } = useTaskStore();
  const [activeTask, setActiveTask] = useState<TaskNode | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const onDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.type === "Task") {
      setActiveTask(event.active.data.current.task);
    }
  };

  const onDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    const isActiveTask = active.data.current?.type === "Task";
    if (!isActiveTask) return;

    const activeTaskNode = nodes.find((n) => n.id === activeId);
    if (!activeTaskNode) return;

    // Handle dropping over another task
    const isOverTask = over.data.current?.type === "Task";
    if (isOverTask) {
      const overTask = over.data.current?.task as TaskNode;
      if (activeTaskNode.data.status !== overTask.data.status) {
        updateNodeStatus(activeId, overTask.data.status);
      }
    }

    // Handle dropping over a column container
    const isOverColumn = over.data.current?.type === "Column";
    if (isOverColumn) {
      const overStatus = over.id as TaskStatus;
      if (activeTaskNode.data.status !== overStatus) {
        updateNodeStatus(activeId, overStatus);
      }
    }
  };

  const onDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
  };

  const handleCardClick = (id: string) => {
    setSelectedNodeIds([id]);
  };

  return (
    <div className="h-full w-full dark:bg-zinc-950/50 pt-4 overflow-y-auto custom-scrollbar flex flex-col">
      <div className="px-4 sm:px-8 mb-6 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-800 dark:text-zinc-100">
            Tasks Board
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500">
            Manage your visual mindmap workflow
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm gap-2 h-9 px-3 text-xs sm:text-sm sm:h-10 sm:px-4"
            onClick={() => createNode()}
          >
            <Plus size={16} />{" "}
            <span className="hidden sm:inline">Add Task</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
      >
        <div className="flex-1 px-4 sm:px-8 pb-20">
          <div className="flex flex-nowrap gap-4 sm:gap-6 h-fit overflow-x-auto pb-6 custom-scrollbar items-start">
            {COLUMNS.map((col) => (
              <ColumnContainer
                key={col.status}
                column={col}
                tasks={nodes.filter(
                  (n) =>
                    n.data.status === col.status &&
                    n.id !== "root" &&
                    n.data.type === "task",
                )}
                onAddTask={() =>
                  createNode({ initialData: { status: col.status } })
                }
                onCardClick={handleCardClick}
              />
            ))}
          </div>
        </div>

        <DragOverlay
          dropAnimation={{
            sideEffects: defaultDropAnimationSideEffects({
              styles: {
                active: {
                  opacity: "0.4",
                },
              },
            }),
          }}
        >
          {activeTask ? (
            <KanbanCard task={activeTask} isOverlay onClick={() => {}} />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

const ColumnContainer = ({
  column,
  tasks,
  onAddTask,
  onCardClick,
}: {
  column: (typeof COLUMNS)[0];
  tasks: TaskNode[];
  onAddTask: () => void;
  onCardClick: (id: string) => void;
}) => {
  const { setNodeRef } = useSortable({
    id: column.status,
    data: {
      type: "Column",
      column,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className="flex flex-col bg-zinc-100/40 dark:bg-zinc-900/40 rounded-2xl w-[85vw] sm:w-[320px] min-w-[85vw] sm:min-w-[320px] h-fit border border-zinc-200/50 dark:border-zinc-800/50 p-3"
    >
      <div className="flex items-center justify-between p-2 mb-3">
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              "w-2 h-2 rounded-full",
              column.color.replace("text-", "bg-"),
            )}
          ></div>
          <h3 className="font-bold text-sm text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
            {column.label}
          </h3>
          <span className="text-zinc-400 dark:text-zinc-600 text-xs font-medium ml-1">
            {tasks.length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onAddTask}
            className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg text-zinc-400 transition-colors"
          >
            <Plus size={16} />
          </button>
          <button className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg text-zinc-400 transition-colors">
            <MoreHorizontal size={16} />
          </button>
        </div>
      </div>

      <div className="px-0.5 space-y-3 pb-4">
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={rectSortingStrategy}
        >
          {tasks.map((task) => (
            <KanbanCard
              key={task.id}
              task={task}
              onClick={() => onCardClick(task.id)}
            />
          ))}
        </SortableContext>
      </div>

      <button
        onClick={onAddTask}
        className="w-full mt-2 text-left text-xs font-semibold text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-white dark:hover:bg-zinc-800 p-2.5 rounded-xl flex items-center gap-2 transition-all border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 hover:shadow-sm"
      >
        <Plus size={14} /> Add new item
      </button>
    </div>
  );
};

const KanbanCard = ({
  task,
  isOverlay,
  onClick,
}: {
  task: TaskNode;
  isOverlay?: boolean;
  onClick: () => void;
}) => {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: { type: "Task", task },
  });

  const style = {
    transition: isDragging
      ? "none"
      : transition || "transform 250ms cubic-bezier(0.2, 0, 0, 1)",
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.3 : 1,
  };

  if (isDragging && !isOverlay) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="bg-zinc-200/50 dark:bg-zinc-800/50 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl h-[100px]"
      />
    );
  }

  const nodeType = task.data.type || "task";
  const registryEntry = NODE_REGISTRY[nodeType] || NODE_REGISTRY.task;
  const Icon = registryEntry.icon;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={cn(
        "bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm transition-all select-none group",
        isOverlay
          ? "z-[500] scale-105 rotate-[2deg] shadow-2xl border-primary ring-1 ring-primary/20"
          : "hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-md cursor-grab active:cursor-grabbing",
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "p-1 rounded-md",
              nodeType === "task" && "bg-emerald-500/10 text-emerald-600",
              nodeType === "problem" && "bg-pink-500/10 text-pink-600",
              nodeType === "idea" && "bg-amber-500/10 text-amber-600",
              "bg-zinc-500/10 text-zinc-500",
            )}
          >
            <Icon size={12} />
          </div>
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">
            {nodeType}
          </span>
        </div>
        <div className="text-[10px] font-mono text-zinc-400">
          {format(task.data.createdAt || Date.now(), "HH:mm")}
        </div>
      </div>

      <div className="text-sm font-semibold text-zinc-700 dark:text-zinc-200 leading-snug line-clamp-2">
        {task.data.title}
      </div>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/50">
        <div className="flex -space-x-2">
          <div className="w-5 h-5 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-white dark:border-zinc-900 flex items-center justify-center">
            <span className="text-[8px] font-bold">JD</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {task.data.content?.checklist &&
            task.data.content.checklist.length > 0 && (
              <div className="flex items-center gap-1 text-zinc-400">
                <Hash size={10} />
                <span className="text-[10px] font-bold">
                  {
                    task.data.content.checklist.filter((i) => i.completed)
                      .length
                  }
                  /{task.data.content.checklist.length}
                </span>
              </div>
            )}
          <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
        </div>
      </div>
    </div>
  );
};
