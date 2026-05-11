"use client";

import React from "react";
import { useTaskStore } from "@/stores/useTaskStore";
import { TaskNode } from "@/types/task";
import { cn } from "@/lib/utils";
import { 
  ChevronRight, 
  ChevronDown, 
  Circle, 
  CircleDot, 
  CheckCircle2,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const DocumentView = () => {
  const { nodes, edges, updateNodeTitle, addChild, addTask } = useTaskStore();

  const buildTree = (parentId: string | null): any[] => {
    const childEdges = edges.filter((e) => 
      e.data?.type === 'hierarchy' && 
      (parentId === null ? !edges.some(e2 => e2.target === e.source) : e.source === parentId)
    );

    // If parentId is null, we look for root nodes (nodes with no incoming hierarchy edges)
    if (parentId === null) {
      const allHierarchyTargets = new Set(edges.filter(e => e.data?.type === 'hierarchy').map(e => e.target));
      const rootNodes = nodes.filter(n => !allHierarchyTargets.has(n.id));
      
      return rootNodes.map(node => ({
        ...node,
        children: buildTree(node.id)
      }));
    }

    const childNodeIds = edges
      .filter(e => e.source === parentId && e.data?.type === 'hierarchy')
      .map(e => e.target);

    return nodes
      .filter(n => childNodeIds.includes(n.id))
      .map(node => ({
        ...node,
        children: buildTree(node.id)
      }));
  };

  const tree = buildTree(null);

  return (
    <div className="h-full w-full bg-background overflow-y-auto pt-24 px-6 pb-20 custom-scrollbar max-w-4xl mx-auto">
      <div className="flex flex-col gap-1">
        {tree.map((item) => (
          <DocumentItem 
            key={item.id} 
            item={item} 
            level={0} 
            onTitleChange={updateNodeTitle}
            onAddChild={addChild}
          />
        ))}
        {nodes.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            <p>No tasks found.</p>
          </div>
        )}
        <div className="mt-8 border-t pt-4">
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-2 text-muted-foreground hover:text-primary"
            onClick={() => addTask()}
          >
            <Plus className="h-4 w-4" />
            Add New Task
          </Button>
        </div>
      </div>
    </div>
  );
};

const DocumentItem = ({ 
  item, 
  level, 
  onTitleChange,
  onAddChild 
}: { 
  item: any; 
  level: number; 
  onTitleChange: (id: string, title: string) => void;
  onAddChild: (id: string) => void;
}) => {
  const [expanded, setExpanded] = React.useState(true);
  const hasChildren = item.children && item.children.length > 0;

  const statusIcon = {
    todo: <Circle className="h-3.5 w-3.5 text-muted-foreground" />,
    "in-progress": <CircleDot className="h-3.5 w-3.5 text-blue-500" />,
    done: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />,
  };

  return (
    <div className="flex flex-col">
      <div 
        className={cn(
          "group flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-muted/50 transition-colors cursor-default",
          level === 0 ? "mt-4" : ""
        )}
        style={{ paddingLeft: `${level * 24 + 8}px` }}
      >
        <div className="flex items-center gap-1 w-6 shrink-0">
          {hasChildren ? (
            <button 
              onClick={() => setExpanded(!expanded)}
              className="p-0.5 hover:bg-muted rounded transition-colors"
            >
              {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
          ) : (
            <div className="h-4 w-4" />
          )}
        </div>

        <div className="shrink-0">
          {statusIcon[item.data.status as keyof typeof statusIcon]}
        </div>

        <input
          className={cn(
            "flex-1 bg-transparent border-none p-0 focus:ring-0 outline-none",
            level === 0 ? "font-bold text-lg" : level === 1 ? "font-semibold text-base" : "text-sm"
          )}
          value={item.data.title}
          onChange={(e) => onTitleChange(item.id, e.target.value)}
          placeholder="Untitled Task"
        />

        <Button 
          variant="ghost" 
          size="icon-sm" 
          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => onAddChild(item.id)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {expanded && hasChildren && (
        <div className="flex flex-col">
          {item.children.map((child: any) => (
            <DocumentItem 
              key={child.id} 
              item={child} 
              level={level + 1} 
              onTitleChange={onTitleChange}
              onAddChild={onAddChild}
            />
          ))}
        </div>
      )}
    </div>
  );
};
