"use client";

import { ArrowRight, Inbox, X, Zap } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { useDeviceSpec } from "@/hooks/useDeviceSpec";
import { cn } from "@/lib/utils";
import { useInboxStore } from "@/stores/useInboxStore";
import { useMobileUIStore } from "@/stores/useMobileUIStore";

/**
 * QuickCaptureOverlay
 * A distraction-free, fullscreen (on mobile) overlay for rapid thought capture.
 * Routes captured content directly to the Inbox store.
 */
export const QuickCaptureOverlay = () => {
  const { addItem } = useInboxStore();
  const { isQuickCaptureOpen, setQuickCaptureOpen } = useMobileUIStore();
  const { isMobile } = useDeviceSpec();

  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Desktop Shortcut Support (Alt + I)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === "i") {
        e.preventDefault();
        setQuickCaptureOpen(true);
      }

      if (e.key === "Escape" && isQuickCaptureOpen) {
        setQuickCaptureOpen(false);
        setInputValue("");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isQuickCaptureOpen, setQuickCaptureOpen]);

  // Auto-focus input when opened
  useEffect(() => {
    if (isQuickCaptureOpen) {
      // Small timeout to ensure the keyboard pops up on mobile
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isQuickCaptureOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    await addItem(inputValue.trim());
    setInputValue("");
    setQuickCaptureOpen(false);
  };

  const handleClose = () => {
    setQuickCaptureOpen(false);
    setInputValue("");
  };

  if (!isQuickCaptureOpen) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[300] flex flex-col bg-background/60 backdrop-blur-xl animate-in fade-in duration-300",
        isMobile ? "p-0" : "items-center justify-center p-6",
      )}
    >
      <div
        className={cn(
          "bg-card border-primary/10 shadow-2xl flex flex-col overflow-hidden",
          isMobile
            ? "w-full h-full rounded-none pt-safe pb-safe"
            : "w-full max-w-2xl rounded-3xl border animate-in zoom-in-95 slide-in-from-bottom-8",
        )}
      >
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl text-primary">
              <Zap className="h-5 w-5 fill-current" />
            </div>
            <div>
              <h2 className="text-sm font-bold uppercase tracking-widest text-foreground/80">
                จดด่วน
              </h2>
              <p className="text-[10px] text-muted-foreground uppercase font-medium">
                ส่งไปเก็บใน Inbox
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-3 hover:bg-muted rounded-full transition-colors"
          >
            <X className="h-6 w-6 text-muted-foreground" />
          </button>
        </div>

        {/* Input Area */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
          <div className="flex-1 flex items-center px-8 py-12">
            <input
              ref={inputRef}
              className={cn(
                "w-full bg-transparent border-none focus:ring-0 outline-none placeholder:text-muted-foreground/30 font-light tracking-tight transition-all",
                isMobile ? "text-3xl" : "text-4xl",
              )}
              placeholder="มีไอเดียอะไรมั้ย? พิมพ์เลย..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              autoComplete="off"
            />
          </div>

          {/* Action Area */}
          <div
            className={cn(
              "px-6 py-6 border-t border-border/50 bg-muted/20 flex items-center justify-between",
              isMobile && "pb-safe",
            )}
          >
            {/* Desktop Hints */}
            {!isMobile && (
              <div className="flex items-center gap-4 opacity-40">
                <div className="flex items-center gap-1.5">
                  <kbd className="px-1.5 py-0.5 rounded bg-foreground/10 text-[10px] font-mono border border-foreground/10">
                    ESC
                  </kbd>
                  <span className="text-[10px] uppercase font-bold">ยกเลิก</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <kbd className="px-1.5 py-0.5 rounded bg-foreground/10 text-[10px] font-mono border border-foreground/10">
                    ENTER
                  </kbd>
                  <span className="text-[10px] uppercase font-bold">บันทึก</span>
                </div>
              </div>
            )}

            {isMobile && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Inbox className="h-4 w-4" />
                <span className="text-xs font-medium italic">
                  กำลังเซฟลง Inbox...
                </span>
              </div>
            )}

            {/* Primary Action Button */}
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className={cn(
                "group flex items-center gap-3 px-6 py-3 rounded-2xl font-bold transition-all active:scale-95 disabled:opacity-30 disabled:grayscale",
                "bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-primary/40",
              )}
            >
              <span className="text-sm">จดเลย!</span>
              <div className="p-1 bg-white/20 rounded-md group-hover:translate-x-1 transition-transform">
                <ArrowRight className="h-4 w-4" />
              </div>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
