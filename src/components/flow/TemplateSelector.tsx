"use client";

import { Check, LayoutGrid } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { BOARD_TEMPLATES } from "@/features/board/templates";
import { useTaskStore } from "@/stores/useTaskStore";

export function TemplateSelector() {
  const [open, setOpen] = useState(false);
  const applyTemplate = useTaskStore((state) => state.applyTemplate);

  const handleSelectTemplate = (id: string) => {
    applyTemplate(id);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger
          render={
            <DialogTrigger
              render={
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <LayoutGrid className="h-3.5 w-3.5" />
                </Button>
              }
            />
          }
        />
        <TooltipContent side="bottom">Board Templates</TooltipContent>
      </Tooltip>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden rounded-2xl border-none shadow-2xl">
        <DialogHeader className="p-6 bg-primary/5 border-b">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <LayoutGrid className="h-6 w-6 text-primary" />
            Board Templates
          </DialogTitle>
          <DialogDescription className="text-muted-foreground/80">
            Start faster with a predefined structure for your mindmap.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-6 bg-background">
          {BOARD_TEMPLATES.map((template) => (
            <button
              type="button"
              key={template.id}
              onClick={() => handleSelectTemplate(template.id)}
              className="group relative flex flex-col items-start p-5 text-left border rounded-2xl transition-all duration-300 hover:border-primary hover:bg-primary/5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {" "}
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">
                {template.icon}
              </div>
              <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">
                {template.name}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {template.description}
              </p>
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-primary text-primary-foreground p-1 rounded-full">
                  <Check className="h-3 w-3" />
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="p-4 bg-muted/30 border-t text-center">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
            All templates will overwrite your current board
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
