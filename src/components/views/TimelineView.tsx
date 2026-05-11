"use client";

import React from "react";
import { useTaskStore } from "@/stores/useTaskStore";
import { TaskNode } from "@/types/task";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { 
  Circle, 
  CircleDot, 
  CheckCircle2, 
  Clock,
  ArrowRight
} from "lucide-react";

export const TimelineView = () => {
  const { nodes } = useTaskStore();

  const sortedNodes = [...nodes].sort((a, b) => 
    (b.data.createdAt || 0) - (a.data.createdAt || 0)
  );

  const groupedByDate = sortedNodes.reduce((acc, node) => {
    const date = format(node.data.createdAt || Date.now(), "MMM dd, yyyy");
    if (!acc[date]) acc[date] = [];
    acc[date].push(node);
    return acc;
  }, {} as Record<string, TaskNode[]>);

  return (
    <div className="h-full w-full bg-background overflow-y-auto pt-24 px-6 pb-20 custom-scrollbar max-w-4xl mx-auto">
      <div className="flex flex-col gap-12">
        {Object.entries(groupedByDate).map(([date, tasks]) => (
          <div key={date} className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <div className="h-[1px] flex-1 bg-border" />
              <div className="flex items-center gap-2 bg-muted/50 px-3 py-1 rounded-full border shadow-sm">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  {date}
                </span>
              </div>
              <div className="h-[1px] flex-1 bg-border" />
            </div>

            <div className="flex flex-col gap-4">
              {tasks.map((task) => (
                <TimelineItem key={task.id} task={task} />
              ))}
            </div>
          </div>
        ))}

        {nodes.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Clock className="h-12 w-12 mb-4 opacity-20" />
            <p>No tasks yet. Start planning in Mindmap view!</p>
          </div>
        )}
      </div>
    </div>
  );
};

const TimelineItem = ({ task }: { task: TaskNode }) => {
  const statusIcon = {
    todo: <Circle className="h-4 w-4 text-muted-foreground" />,
    "in-progress": <CircleDot className="h-4 w-4 text-blue-500" />,
    done: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
  };

  return (
    <div className="group flex items-start gap-6 relative">
      <div className="text-[10px] font-mono text-muted-foreground/60 w-12 pt-1 shrink-0">
        {format(task.data.createdAt || Date.now(), "HH:mm")}
      </div>
      
      <div className="flex flex-col items-center gap-2 relative">
        <div className="z-10 bg-background border-2 border-border p-1 rounded-full group-hover:border-primary transition-colors">
          {statusIcon[task.data.status]}
        </div>
        <div className="absolute top-8 bottom-[-24px] w-[2px] bg-border group-last:hidden" />
      </div>

      <div className="flex-1 pb-8">
        <div className="flex flex-col gap-1 bg-muted/30 p-4 rounded-2xl border border-transparent hover:border-border hover:bg-muted/50 transition-all cursor-default">
          <div className="flex items-center gap-2 mb-1">
            <span className={cn(
              "text-[9px] font-bold uppercase tracking-tighter px-1.5 py-0.5 rounded border",
              task.data.type === 'root' ? "bg-blue-500/10 text-blue-600 border-blue-500/20" :
              task.data.type === 'parent' ? "bg-purple-500/10 text-purple-600 border-purple-500/20" :
              "bg-zinc-500/10 text-zinc-600 border-zinc-500/20"
            )}>
              {task.data.type}
            </span>
            <span className="text-[10px] text-muted-foreground/60 italic">
              Created
            </span>
          </div>
          <h4 className="font-semibold text-foreground/90 leading-tight">
            {task.data.title}
          </h4>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <span className="capitalize">{task.data.status}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
