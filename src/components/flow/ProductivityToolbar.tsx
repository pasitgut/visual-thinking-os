"use client";

import { Brain, Command, LayoutGrid, Maximize, Plus, Search, Zap } from "lucide-react";
import { useReactFlow } from "reactflow";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
    createNode,
    nodes,
    interactionMode,
    setInteractionMode,
  } = useTaskStore();
  const { setOpen, isOpen: isInboxOpen } = useInboxStore();

  const handleCenter = () => {
    fitView({ padding: 0.2, duration: 800 });
  };

  const handleAddAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (nodes.length === 0) {
      createRootTask();
    } else {
      const center = screenToFlowPosition({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      });
      createNode({ initialData: { status: "todo" }, position: center });
    }
  };

  return (
    <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
      <TooltipProvider>
        <div className="flex items-center gap-0.5 p-1 bg-background/70 backdrop-blur-lg border border-border/40 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.08)] dark:shadow-[0_15px_40px_rgba(0,0,0,0.3)] pointer-events-auto animate-in slide-in-from-top-4 duration-500">
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
              onClick={(e) => {
                e.stopPropagation();
                setInteractionMode(
                  interactionMode === "brainstorm" ? "standard" : "brainstorm",
                );
              }}
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

          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                buttonVariants({ variant: "ghost", size: "icon" }),
                "h-8 w-8 cursor-pointer text-muted-foreground hover:text-primary",
              )}
              title="Thinking Frameworks"
            >
              <Brain className="h-3.5 w-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" side="bottom" className="w-56 z-50 bg-background border border-border rounded-xl shadow-lg p-1">
              <DropdownMenuLabel className="px-2 py-1.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">Thinking Templates</DropdownMenuLabel>
              <DropdownMenuSeparator className="-mx-1 my-1 border-t border-border" />
              <DropdownMenuItem
                className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-lg hover:bg-primary/10 hover:text-primary cursor-pointer transition-colors"
                onClick={() => useTaskStore.getState().createDesignThinkingBoard()}
              >
                <span>🎨</span> Design Thinking Board
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-lg hover:bg-primary/10 hover:text-primary cursor-pointer transition-colors"
                onClick={() => useTaskStore.getState().createCriticalThinkingBoard()}
              >
                <span>🤔</span> Critical Thinking Board
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-lg hover:bg-primary/10 hover:text-primary cursor-pointer transition-colors"
                onClick={() => useTaskStore.getState().createSystemsThinkingBoard()}
              >
                <span>🔄</span> Systems Thinking Board
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Tooltip>
            <TooltipTrigger
              className={cn(
                buttonVariants({ variant: "ghost", size: "icon" }),
                "h-8 w-8 cursor-pointer",
              )}
              onClick={(e) => {
                e.stopPropagation();
                useTaskStore.getState().setSearchOpen(true);
              }}
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
