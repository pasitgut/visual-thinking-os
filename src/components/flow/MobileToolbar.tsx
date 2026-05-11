import { useReactFlow } from "reactflow";
import { Button } from "@/components/ui/button";
import { Maximize, PlusCircle, ZoomIn, ZoomOut, Inbox } from "lucide-react";
import { useTaskStore } from "@/stores/useTaskStore";
import { useInboxStore } from "@/stores/useInboxStore";
import { cn } from "@/lib/utils";

export const MobileToolbar = () => {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const { nodes, addChild } = useTaskStore();
  const { setOpen, isOpen: isInboxOpen } = useInboxStore();

  const handleFitView = () => {
    fitView({ padding: 0.2, duration: 400 });
  };

  const handleAddRoot = () => {
    // If no nodes, or to provide a quick way to add a top-level node if we ever support multi-root
    // For now, we use it to center on root or add a subtask to root if root exists
    if (nodes.length > 0) {
      const rootNode = nodes.find((n) => n.id === "root") || nodes[0];
      addChild(rootNode.id);
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 p-2 bg-background/80 backdrop-blur-md border rounded-full shadow-lg z-50 sm:hidden">
      <Button
        variant="ghost"
        size="icon"
        className={cn("h-12 w-12 rounded-full", isInboxOpen && "bg-primary text-primary-foreground")}
        onClick={() => setOpen(!isInboxOpen)}
      >
        <Inbox className="h-6 w-6" />
      </Button>

      <div className="w-[1px] h-8 bg-border mx-1" />

      <Button
        variant="ghost"
        size="icon"
        className="h-12 w-12 rounded-full"
        onClick={() => zoomIn()}
      >
        <ZoomIn className="h-6 w-6" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="h-12 w-12 rounded-full"
        onClick={() => zoomOut()}
      >
        <ZoomOut className="h-6 w-6" />
      </Button>

      <div className="w-[1px] h-8 bg-border mx-1" />

      <Button
        variant="ghost"
        size="icon"
        className="h-12 w-12 rounded-full"
        onClick={handleFitView}
      >
        <Maximize className="h-6 w-6" />
      </Button>

      <Button
        variant="primary"
        size="icon"
        className="h-12 w-12 rounded-full shadow-md"
        onClick={handleAddRoot}
      >
        <PlusCircle className="h-6 w-6 text-primary-foreground" />
      </Button>
    </div>
  );
};
