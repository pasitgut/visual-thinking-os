"use client";

import { format } from "date-fns";
import { ArrowRight, Clock, Inbox, Layers, Trash2, X, Zap } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useInboxStore } from "@/stores/useInboxStore";
import { useTaskStore } from "@/stores/useTaskStore";
import { useMobileUIStore } from "@/stores/useMobileUIStore";
import { DraggableInboxItem } from "./DraggableInboxItem";

interface InboxPanelProps {
  variant?: "drawer" | "persistent";
}

export const InboxPanel = ({ variant = "drawer" }: InboxPanelProps) => {
  const { items, isOpen, setOpen, removeItem, loadInbox, isLoading } =
    useInboxStore();

  const { addTask, addChild, selectedNodeIds, updateNodeTitle } =
    useTaskStore();

  const { setQuickCaptureOpen } = useMobileUIStore();

  useEffect(() => {
    const userId = (window as unknown as { userId: string }).userId;
    if (userId) {
      loadInbox(userId);
    }
  }, [loadInbox]);

  const handleProcessItem = async (id: string, text: string) => {
    // Process: Convert to node
    if (selectedNodeIds.length === 1) {
      addChild(selectedNodeIds[0], "idea");
      const state = useTaskStore.getState();
      const lastNode = state.nodes[state.nodes.length - 1];
      updateNodeTitle(lastNode.id, text);
    } else {
      addTask("todo", "idea");
      const state = useTaskStore.getState();
      const lastNode = state.nodes[state.nodes.length - 1];
      updateNodeTitle(lastNode.id, text);
    }

    // Remove from inbox after processing
    await removeItem(id);
  };

  const isDrawer = variant === "drawer";

  return (
    <div
      className={cn(
        "bg-background flex flex-col transition-all duration-300 ease-in-out",
        isDrawer ? "fixed top-0 left-0 h-screen w-full sm:w-[380px] border-r z-[150] shadow-2xl transform" : "h-full w-full",
        isDrawer && (isOpen ? "translate-x-0" : "-translate-x-full"),
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-primary/5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <Inbox className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-bold text-sm uppercase tracking-widest">
              Inbox
            </h2>
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">
              Quick Thoughts
            </p>
            </div>
            </div>

            <div className="flex items-center gap-2">
          {isDrawer && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpen(false)}
              className="rounded-full hover:bg-primary/10"
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>


      {/* Item List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center space-y-4">
            <div className="p-4 bg-muted/30 rounded-full">
              <Layers className="h-8 w-8 text-muted-foreground/30" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Your inbox is empty
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1 italic">
                Use Alt+I to capture thoughts quickly from anywhere
              </p>
            </div>
          </div>
        ) : (
          items.map((item) => (
            <DraggableInboxItem key={item.id} id={item.id} text={item.text}>
              <div
                className="group bg-card border border-border/50 rounded-xl p-4 hover:border-primary/30 hover:shadow-md transition-all animate-in fade-in slide-in-from-left-2 duration-300"
              >
                <div className="flex flex-col gap-3">
                  <p className="text-sm font-medium leading-relaxed">
                    {item.text}
                  </p>

                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{format(item.createdAt, "MMM dd, HH:mm")}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        className="h-8 w-8 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        className="h-8 gap-2 px-3 text-[10px] font-bold uppercase tracking-wider rounded-lg shadow-sm"
                        onClick={() => handleProcessItem(item.id, item.text)}
                      >
                        <span>Process</span>
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </DraggableInboxItem>
          ))
        )}
      </div>

      {/* Footer / Shortcut Hint */}
      <div className="p-4 border-t bg-muted/20">
        <div className="flex items-center justify-center gap-2 py-2 px-3 bg-background/50 rounded-lg border border-border/50">
          <kbd className="px-1.5 py-0.5 rounded bg-foreground/10 text-[10px] font-mono border border-foreground/10">
            ALT + I
          </kbd>
          <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
            to quick capture
          </span>
        </div>
      </div>
    </div>
  );
};
