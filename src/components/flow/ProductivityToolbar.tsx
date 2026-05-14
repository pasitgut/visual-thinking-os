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

export const ProductivityToolbar = () => {
  const { fitView, getViewport, screenToFlowPosition } = useReactFlow();
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
    fitView({ padding: 0.2, duration: 800 });
  };

  const handleAddAction = () => {
    if (nodes.length === 0) {
      createRootTask();
    } else {
      const center = screenToFlowPosition({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      });
      addTask({ status: "todo" }, center);
    }
  };

  return (
    <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
      <TooltipProvider>
        <div className="flex items-center gap-0.5 p-1 bg-background/80 backdrop-blur-md border rounded-xl shadow-lg pointer-events-auto animate-in slide-in-from-top-4 duration-500">
          <Tooltip>
            <TooltipTrigger
              className={cn(
                buttonVariants({
                  variant:
                    interactionMode === "brainstorm" ? "default" : "ghost",
                  size: "icon",
                }),
                "h-8 w-8 cursor-pointer",
                interactionMode === "brainstorm" &&
                  "bg-primary text-primary-foreground shadow-md scale-105",
              )}
              onClick={() =>
                setInteractionMode(
                  interactionMode === "brainstorm" ? "standard" : "brainstorm",
                )
              }
            >
              <Zap
                className={cn(
                  "h-3.5 w-3.5",
                  interactionMode === "brainstorm" && "fill-current",
                )}
              />
            </TooltipTrigger>
            <TooltipContent side="bottom">Brainstorm Mode</TooltipContent>
          </Tooltip>

          <Separator orientation="vertical" className="h-3 mx-1" />

          <Tooltip>
            <TooltipTrigger
              className={cn(
                buttonVariants({ variant: "ghost", size: "icon" }),
                "h-8 w-8 cursor-pointer",
              )}
              onClick={handleAddAction}
            >
              <Plus className="h-3.5 w-3.5" />
            </TooltipTrigger>
            <TooltipContent side="bottom">Add Task</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger
              className={cn(
                buttonVariants({ variant: "ghost", size: "icon" }),
                "h-8 w-8 cursor-pointer",
              )}
              onClick={() => useTaskStore.getState().setSearchOpen(true)}
            >
              <Search className="h-3.5 w-3.5" />
            </TooltipTrigger>
            <TooltipContent side="bottom">Search (Cmd+K)</TooltipContent>
          </Tooltip>

          <Separator orientation="vertical" className="h-3 mx-1" />

          <Tooltip>
            <TooltipTrigger
              className={cn(
                buttonVariants({ variant: "ghost", size: "icon" }),
                "h-8 w-8 cursor-pointer",
              )}
              onClick={applyLayout}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </TooltipTrigger>
            <TooltipContent side="bottom">Auto Layout</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger
              className={cn(
                buttonVariants({ variant: "ghost", size: "icon" }),
                "h-8 w-8 cursor-pointer",
              )}
              onClick={handleCenter}
            >
              <Maximize className="h-3.5 w-3.5" />
            </TooltipTrigger>
            <TooltipContent side="bottom">Center Viewport</TooltipContent>
          </Tooltip>

          <Separator orientation="vertical" className="h-3 mx-1" />

          <div className="px-2 hidden sm:flex items-center gap-1.5 text-[9px] font-medium text-muted-foreground uppercase tracking-wider">
            <Command className="h-2.5 w-2.5" />
            <span>K</span>
          </div>
        </div>
      </TooltipProvider>
    </div>
  );
};
