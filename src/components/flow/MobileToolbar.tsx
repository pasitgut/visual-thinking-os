"use client";

import { Inbox, Maximize, Search, Zap, ZoomIn, ZoomOut } from "lucide-react";
import { useReactFlow } from "reactflow";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useInboxStore } from "@/stores/useInboxStore";
import { useMobileUIStore } from "@/stores/useMobileUIStore";
import { useTaskStore } from "@/stores/useTaskStore";

/**
 * Unified Mobile Floating Toolbar
 * กลับมาใช้ดีไซน์ทรง Floating แคปซูล (Pill Style) ตามที่ผู้ใช้ชอบ
 * โดยรวมทุกปุ่มไว้ในแถบเดียว และลอยอยู่เหนือขอบล่าง
 */
export const MobileToolbar = () => {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const { isSearchOpen, setSearchOpen } = useTaskStore();
  const { isOpen: isInboxOpen, setOpen: setInboxOpen } = useInboxStore();
  const { setQuickCaptureOpen } = useMobileUIStore();

  const handleFitView = () => {
    fitView({ padding: 0.3, duration: 400 });
  };

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 sm:hidden flex items-center gap-1.5 p-1.5 bg-background/70 backdrop-blur-xl border shadow-2xl rounded-full transition-all duration-300">
      {/* Search */}
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "h-12 w-12 rounded-full",
          isSearchOpen && "bg-primary text-primary-foreground",
        )}
        onClick={() => setSearchOpen(!isSearchOpen)}
      >
        <Search className="h-5 w-5" />
      </Button>

      {/* Zoom Out */}
      <Button
        variant="ghost"
        size="icon"
        className="h-12 w-12 rounded-full"
        onClick={() => zoomOut()}
      >
        <ZoomOut className="h-5 w-5" />
      </Button>

      {/* Quick Capture (Zap) - ปุ่มกลางเด่นแบบ Floating */}
      <Button
        size="icon"
        className="h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 transition-transform active:scale-90"
        onClick={() => setQuickCaptureOpen(true)}
      >
        <Zap className="h-7 w-7 text-primary-foreground fill-current" />
      </Button>

      {/* Zoom In / Fit View (Long press or alternate) */}
      <Button
        variant="ghost"
        size="icon"
        className="h-12 w-12 rounded-full"
        onClick={() => zoomIn()}
        onDoubleClick={handleFitView}
      >
        <ZoomIn className="h-5 w-5" />
      </Button>

      {/* Inbox */}
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "h-12 w-12 rounded-full relative",
          isInboxOpen && "bg-primary text-primary-foreground",
        )}
        onClick={() => setInboxOpen(!isInboxOpen)}
      >
        <Inbox className="h-5 w-5" />
        {/* ตัวอย่าง badge อนาคต */}
        <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border border-background hidden" />
      </Button>
    </div>
  );
};
