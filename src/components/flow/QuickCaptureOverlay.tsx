"use client";

import React, { useState, useEffect, useRef } from "react";
import { useInboxStore } from "@/stores/useInboxStore";
import { 
  Inbox, 
  X, 
  ArrowRight,
  Command,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

export const QuickCaptureOverlay = () => {
  const { addItem, isOpen: isPanelOpen } = useInboxStore();
  
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Use Alt+I for Inbox Capture
      if (e.altKey && e.key.toLowerCase() === "i") {
        e.preventDefault();
        setIsOpen(true);
      }
      
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
        setInputValue("");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    await addItem(inputValue.trim());
    setInputValue("");
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-background/40 backdrop-blur-md p-6 animate-in fade-in duration-300">
      <div className="w-full max-w-xl bg-card border border-primary/20 shadow-[0_0_50px_-12px_rgba(0,0,0,0.3)] rounded-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-300">
        <div className="bg-primary/5 px-6 py-3 border-b border-primary/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
              <Inbox className="h-4 w-4" />
            </div>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary/70">Quick Capture to Inbox</span>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-1.5 hover:bg-primary/10 rounded-full transition-colors text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-2">
          <div className="flex items-center gap-3 px-4 py-4">
            <input
              ref={inputRef}
              className="flex-1 bg-transparent border-none text-2xl font-light focus:ring-0 outline-none placeholder:text-muted-foreground/40"
              placeholder="What's on your mind?"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onBlur={() => {
                if (!inputValue) setIsOpen(false);
              }}
            />
          </div>
          
          <div className="px-6 py-4 bg-muted/30 border-t border-border/50 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 opacity-50">
                <kbd className="px-1.5 py-0.5 rounded bg-foreground/10 text-[10px] font-mono border border-foreground/10">ESC</kbd>
                <span className="text-[10px] uppercase font-bold tracking-wider">to close</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Save to Inbox</span>
              <div className="p-1.5 bg-primary text-primary-foreground rounded-lg">
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
