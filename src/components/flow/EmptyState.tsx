import { Keyboard, MousePointer2, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BOARD_TEMPLATES } from "@/features/board/templates";
import { useTaskStore } from "@/stores/useTaskStore";

export const EmptyState = () => {
  const createRootTask = useTaskStore((state) => state.createRootTask);
  const applyTemplate = useTaskStore((state) => state.applyTemplate);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/50 backdrop-blur-[2px] z-10 overflow-auto py-12">
      <div className="max-w-2xl w-full p-8 text-center space-y-10 animate-in fade-in zoom-in duration-500">
        <div className="space-y-3">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Design your mindmap
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Start with a blank canvas or choose a template to jumpstart your
            project organization.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            size="lg"
            onClick={createRootTask}
            className="w-full sm:w-auto gap-2 rounded-full px-10 h-12 shadow-lg hover:shadow-xl transition-all font-bold text-base"
          >
            <PlusCircle className="h-5 w-5" />
            Start Blank Board
          </Button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 justify-center">
            <div className="h-px w-12 bg-border" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
              Or start with a template
            </span>
            <div className="h-px w-12 bg-border" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {BOARD_TEMPLATES.map((template) => (
              <button
                type="button"
                key={template.id}
                onClick={() => applyTemplate(template.id)}
                className="group flex flex-col items-center p-4 bg-card border rounded-2xl transition-all duration-300 hover:border-primary hover:bg-primary/5 hover:shadow-md"
              >
                <span className="text-2xl mb-2 group-hover:scale-125 transition-transform duration-300">
                  {template.icon}
                </span>
                <span className="text-[10px] font-bold text-muted-foreground group-hover:text-primary transition-colors text-center uppercase tracking-wider">
                  {template.name.split(" ")[0]}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 pt-6 max-w-md mx-auto">
          <div className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-card/50 border shadow-sm">
            <Keyboard className="h-5 w-5 text-muted-foreground" />
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
              Keyboard
            </div>
            <div className="text-xs space-y-1.5 text-foreground/80">
              <p className="flex items-center gap-1.5 justify-center">
                <kbd className="px-1.5 py-0.5 rounded border bg-muted text-[10px] font-mono">
                  Enter
                </kbd>
                <span>Add Child</span>
              </p>
              <p className="flex items-center gap-1.5 justify-center">
                <kbd className="px-1.5 py-0.5 rounded border bg-muted text-[10px] font-mono">
                  Tab
                </kbd>
                <span>Focus Child</span>
              </p>
            </div>
          </div>
          <div className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-card/50 border shadow-sm">
            <MousePointer2 className="h-5 w-5 text-muted-foreground" />
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
              Mouse
            </div>
            <div className="text-xs space-y-1.5 text-foreground/80">
              <p>Double-click to edit</p>
              <p>Drag to move nodes</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
