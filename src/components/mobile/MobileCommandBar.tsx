"use client";

import { Inbox, Plus, Search, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useInboxStore } from "@/stores/useInboxStore";
import { useMobileUIStore } from "@/stores/useMobileUIStore";
import { useTaskStore } from "@/stores/useTaskStore";

/**
 * MobileCommandBar
 * Bottom-anchored navigation and capture bar optimized for one-handed use.
 * Primary entry point for Search, Inbox, and Quick Capture.
 */
export const MobileCommandBar = () => {
  const { isSearchOpen, setSearchOpen } = useTaskStore();
  const { isOpen: isInboxOpen, setOpen: setInboxOpen } = useInboxStore();
  const { isQuickCaptureOpen, setQuickCaptureOpen } = useMobileUIStore();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-lg border-t pb-safe">
      <div className="flex items-center justify-around h-16 px-4 max-w-lg mx-auto">
        {/* Search Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "flex-col gap-1 h-14 w-14 rounded-xl",
            isSearchOpen && "text-primary bg-primary/10",
          )}
          onClick={() => setSearchOpen(!isSearchOpen)}
        >
          <Search className="h-6 w-6" />
          <span className="text-[10px] font-bold">Search</span>
        </Button>

        {/* Quick Capture FAB - Elevated Center */}
        <div className="relative -top-6">
          <Button
            size="icon"
            className="h-16 w-16 rounded-full shadow-2xl bg-primary hover:bg-primary/90 transition-transform active:scale-95"
            onClick={() => setQuickCaptureOpen(true)}
          >
            <Zap className="h-8 w-8 text-primary-foreground fill-current" />
          </Button>
        </div>

        {/* Inbox Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "flex-col gap-1 h-14 w-14 rounded-xl",
            isInboxOpen && "text-primary bg-primary/10",
          )}
          onClick={() => setInboxOpen(!isInboxOpen)}
        >
          <Inbox className="h-6 w-6" />
          <span className="text-[10px] font-bold">Inbox</span>
        </Button>
      </div>
    </div>
  );
};
