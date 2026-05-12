"use client";

import {
  Command,
  Inbox,
  LayoutGrid,
  Maximize,
  Plus,
  Search,
  Zap,
} from "lucide-react";
import { useReactFlow } from "reactflow";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useInboxStore } from "@/stores/useInboxStore";
import { useTaskStore } from "@/stores/useTaskStore";
import { TemplateSelector } from "./TemplateSelector";

export const ProductivityToolbar = () => {
  const { fitView } = useReactFlow();
  const {
    applyLayout,
    createRootTask,
    addTask,
    nodes,
    interactionMode,
    setInteractionMode,
  } = useTaskStore();
  const { setOpen, isOpen: isInboxOpen } = useInboxStore();

  const handleCenter = () => {
    fitView({ padding: 0.2, duration: 400 });
  };

  const handleAddAction = () => {
    if (nodes.length === 0) {
      createRootTask();
    } else {
      addTask();
    }
  };

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
      <TooltipProvider>
        <div className="flex items-center gap-1 p-1.5 bg-background/80 backdrop-blur-md border rounded-xl shadow-lg pointer-events-auto animate-in slide-in-from-top-4 duration-500">
          <Tooltip>
            <TooltipTrigger
              className={cn(
                buttonVariants({
                  variant: isInboxOpen ? "default" : "ghost",
                  size: "icon",
                }),
                "h-9 w-9 cursor-pointer",
              )}
              onClick={() => setOpen(!isInboxOpen)}
            >
              <Inbox className="h-4 w-4" />
            </TooltipTrigger>
            <TooltipContent side="bottom">Inbox (Alt+I)</TooltipContent>
          </Tooltip>

          <Separator orientation="vertical" className="h-4 mx-1" />

          <Tooltip>
            <TooltipTrigger
              className={cn(
                buttonVariants({
                  variant:
                    interactionMode === "brainstorm" ? "default" : "ghost",
                  size: "icon",
                }),
                "h-9 w-9 cursor-pointer",
                interactionMode === "brainstorm" &&
                  "bg-primary text-primary-foreground shadow-md scale-110",
              )}
              onClick={() =>
                setInteractionMode(
                  interactionMode === "brainstorm" ? "standard" : "brainstorm",
                )
              }
            >
              <Zap
                className={cn(
                  "h-4 w-4",
                  interactionMode === "brainstorm" && "fill-current",
                )}
              />
            </TooltipTrigger>
            <TooltipContent side="bottom">Brainstorm Mode</TooltipContent>
          </Tooltip>

          <Separator orientation="vertical" className="h-4 mx-1" />

          <Tooltip>
            <TooltipTrigger
              className={cn(
                buttonVariants({ variant: "ghost", size: "icon" }),
                "h-9 w-9 cursor-pointer",
              )}
              onClick={handleAddAction}
            >
              <Plus className="h-4 w-4" />
            </TooltipTrigger>
            <TooltipContent side="bottom">Add Task</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger
              className={cn(
                buttonVariants({ variant: "ghost", size: "icon" }),
                "h-9 w-9 cursor-pointer",
              )}
              onClick={() => useTaskStore.getState().setSearchOpen(true)}
            >
              <Search className="h-4 w-4" />
            </TooltipTrigger>
            <TooltipContent side="bottom">Search (Cmd+K)</TooltipContent>
          </Tooltip>

          <Separator orientation="vertical" className="h-4 mx-1" />

          <TemplateSelector />

          <Tooltip>
            <TooltipTrigger
              className={cn(
                buttonVariants({ variant: "ghost", size: "icon" }),
                "h-9 w-9 cursor-pointer",
              )}
              onClick={applyLayout}
            >
              <LayoutGrid className="h-4 w-4" />
            </TooltipTrigger>
            <TooltipContent side="bottom">Auto Layout</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger
              className={cn(
                buttonVariants({ variant: "ghost", size: "icon" }),
                "h-9 w-9 cursor-pointer",
              )}
              onClick={handleCenter}
            >
              <Maximize className="h-4 w-4" />
            </TooltipTrigger>
            <TooltipContent side="bottom">Center Viewport</TooltipContent>
          </Tooltip>

          <Separator orientation="vertical" className="h-4 mx-1" />

          <div className="px-2 hidden sm:flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            <Command className="h-3 w-3" />
            <span>K</span>
          </div>
        </div>
      </TooltipProvider>
    </div>
  );
};
