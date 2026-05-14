"use client";

import { ChevronDown, Columns3, type LucideIcon, Network } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useTaskStore } from "@/stores/useTaskStore";
import type { ViewType } from "@/types/task";

const VIEWS: { type: ViewType; label: string; icon: LucideIcon }[] = [
  { type: "mindmap", label: "Mindmap", icon: Network },
  { type: "kanban", label: "Kanban", icon: Columns3 },
];

export const ViewSwitcher = () => {
  const { currentView, setView } = useTaskStore();

  const activeView = VIEWS.find((v) => v.type === currentView) || VIEWS[0];

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "h-9 px-2 bg-transparent hover:bg-accent transition-all rounded-lg gap-2 font-medium cursor-pointer",
          )}
        >
          <activeView.icon className="h-4 w-4 text-primary" />
          <span className="text-sm">{activeView.label}</span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="min-w-[180px] rounded-xl p-1.5 shadow-xl border-none ring-1 ring-foreground/5"
        >
          {VIEWS.map((view) => (
            <DropdownMenuItem
              key={view.type}
              onClick={() => setView(view.type)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors",
                currentView === view.type
                  ? "bg-primary/10 text-primary font-bold"
                  : "hover:bg-accent text-muted-foreground",
              )}
            >
              <view.icon
                className={cn(
                  "h-4 w-4",
                  currentView === view.type
                    ? "text-primary"
                    : "text-muted-foreground",
                )}
              />
              <span>{view.label}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
