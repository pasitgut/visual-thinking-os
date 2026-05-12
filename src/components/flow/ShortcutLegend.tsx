"use client";

import { Keyboard, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const ShortcutLegend = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem("onboarding-shortcuts-dismissed");
    if (!dismissed) {
      const timer = setTimeout(() => setIsVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem("onboarding-shortcuts-dismissed", "true");
  };

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4 duration-500",
        "w-64 p-4 rounded-2xl bg-background/80 backdrop-blur-md border shadow-2xl",
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
            <Keyboard className="h-4 w-4" />
          </div>
          <span className="text-sm font-semibold">Pro Tips</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 rounded-full"
          onClick={handleDismiss}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>

      <div className="space-y-2.5">
        <ShortcutItem keys={["Tab"]} label="Add child" />
        <ShortcutItem keys={["Enter"]} label="Add sibling" />
        <ShortcutItem keys={["↑", "↓", "←", "→"]} label="Navigate" />
        <ShortcutItem keys={["Cmd", "K"]} label="Search nodes" />
        <ShortcutItem keys={["Alt", "1-9"]} label="Jump to bookmark" />
        <ShortcutItem keys={["Shift", "Tab"]} label="Go to parent" />
        <ShortcutItem keys={["Del"]} label="Delete node" />
      </div>

      <p className="mt-4 text-[10px] text-muted-foreground text-center italic">
        Alt+Ctrl+1-9 to set a bookmark.
      </p>
    </div>
  );
};

const ShortcutItem = ({ keys, label }: { keys: string[]; label: string }) => (
  <div className="flex items-center justify-between text-xs">
    <span className="text-muted-foreground">{label}</span>
    <div className="flex gap-1">
      {keys.map((key) => (
        <kbd
          key={key}
          className="px-1.5 py-0.5 rounded border bg-muted text-[10px] font-mono font-bold shadow-sm"
        >
          {key}
        </kbd>
      ))}
    </div>
  </div>
);
