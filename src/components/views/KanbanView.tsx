"use client";

import React from "react";
import { useTaskStore } from "@/stores/useTaskStore";
import { TaskNode, TaskStatus } from "@/types/task";
import { 
  Circle, 
  CircleDot, 
  CheckCircle2, 
  Plus, 
  MoreVertical,
  GripVertical 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const COLUMNS: { status: TaskStatus; label: string; icon: any; color: string }[] = [
  { status: "todo", label: "To Do", icon: Circle, color: "text-muted-foreground" },
  { status: "in-progress", label: "In Progress", icon: CircleDot, color: "text-blue-500" },
  { status: "done", label: "Done", icon: CheckCircle2, color: "text-emerald-500" },
];

export const KanbanView = () => {
  const { nodes, updateNodeStatus, updateNodeTitle, deleteNode, addTask } = useTaskStore();

  const getTasksByStatus = (status: TaskStatus) => {
    return nodes.filter((n) => n.data.status === status);
  };

  return (
    <div className="flex h-full w-full gap-6 p-6 overflow-x-auto bg-muted/30 pt-20">
      {COLUMNS.map((column) => (
        <div key={column.status} className="flex flex-col w-80 shrink-0 gap-4">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <column.icon className={cn("h-4 w-4", column.color)} />
              <h3 className="font-bold text-sm uppercase tracking-wider">{column.label}</h3>
              <span className="bg-muted px-2 py-0.5 rounded-full text-[10px] font-bold">
                {getTasksByStatus(column.status).length}
              </span>
            </div>
            <Button 
              variant="ghost" 
              size="icon-sm" 
              className="h-7 w-7"
              onClick={() => addTask(column.status)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex flex-col gap-3 h-full overflow-y-auto pb-10 custom-scrollbar">
            {getTasksByStatus(column.status).map((task) => (
              <KanbanCard 
                key={task.id} 
                task={task} 
                onStatusChange={updateNodeStatus}
                onTitleChange={updateNodeTitle}
                onDelete={deleteNode}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const KanbanCard = ({ 
  task, 
  onStatusChange, 
  onTitleChange, 
  onDelete 
}: { 
  task: TaskNode; 
  onStatusChange: (id: string, status: TaskStatus) => void;
  onTitleChange: (id: string, title: string) => void;
  onDelete: (id: string) => void;
}) => {
  return (
    <Card className="group relative p-4 bg-background border shadow-sm hover:shadow-md transition-all rounded-xl border-l-4 border-l-primary/40 hover:border-l-primary">
      <div className="flex items-start gap-3">
        <div className="mt-1 cursor-grab active:cursor-grabbing text-muted-foreground/30 group-hover:text-muted-foreground/60 transition-colors">
          <GripVertical className="h-4 w-4" />
        </div>
        <div className="flex-1 flex flex-col gap-2">
          <input
            className="bg-transparent border-none p-0 font-medium text-sm focus:ring-0 w-full"
            value={task.data.title}
            onChange={(e) => onTitleChange(task.id, e.target.value)}
          />
          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center gap-1">
              <span className={cn(
                "px-2 py-0.5 rounded-md text-[10px] font-bold uppercase",
                task.data.type === 'root' ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
                task.data.type === 'parent' ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" :
                "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
              )}>
                {task.data.type}
              </span>
            </div>
            <Button 
              variant="ghost" 
              size="icon-sm" 
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/10"
              onClick={() => onDelete(task.id)}
            >
              <Plus className="h-3 w-3 rotate-45" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
