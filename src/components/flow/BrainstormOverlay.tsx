"use client";

import {
  ArrowRight,
  Command,
  CornerDownRight,
  Plus,
  X,
  Zap,
} from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { useTaskStore } from "@/stores/useTaskStore";

export const BrainstormOverlay = () => {
  const { interactionMode, setInteractionMode, createNode, selectedNodeIds } =
    useTaskStore();

  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (interactionMode === "brainstorm") {
        if (
          e.key === " " &&
          !isOpen &&
          document.activeElement?.tagName !== "INPUT" &&
          document.activeElement?.tagName !== "TEXTAREA"
        ) {
          e.preventDefault();
          setIsOpen(true);
        }
        if (e.key === "Escape" && isOpen) {
          setIsOpen(false);
          setInputValue("");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [interactionMode, isOpen]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  if (interactionMode !== "brainstorm") return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const title = inputValue.trim();
    if (!title) return;

    if (selectedNodeIds.length === 1) {
      createNode({
        parentId: selectedNodeIds[0],
        initialData: { title, type: "idea" },
      });
    } else {
      createNode({ initialData: { title, type: "idea" } });
    }

    setInputValue("");
  };

  return (
    <>
      {/* Brainstorm Status Indicator */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-2 bg-primary text-primary-foreground rounded-full shadow-2xl animate-in slide-in-from-bottom-4 duration-500">
        <Zap className="h-4 w-4 animate-pulse fill-current" />
        <span className="text-xs font-bold uppercase tracking-widest">
          กำลังระดมสมอง...
        </span>
        <div className="h-4 w-[1px] bg-primary-foreground/20 mx-1" />
        <div className="flex items-center gap-1.5 opacity-80">
          <kbd className="px-1.5 py-0.5 rounded bg-primary-foreground/10 text-[10px] font-mono">
            SPACE
          </kbd>
          <span className="text-[10px]">เพื่อจดไอเดีย</span>
        </div>
        <button
          type="button"
          onClick={() => setInteractionMode("standard")}
          className="ml-2 p-1 hover:bg-primary-foreground/10 rounded-full transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Capture Input Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-background/20 backdrop-blur-[2px] p-6 animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-background border shadow-2xl rounded-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <form
              onSubmit={handleSubmit}
              className="p-1 flex items-center gap-3"
            >
              <div className="p-3 bg-primary/10 rounded-xl text-primary ml-1">
                {selectedNodeIds.length === 1 ? (
                  <CornerDownRight className="h-6 w-6" />
                ) : (
                  <Plus className="h-6 w-6" />
                )}
              </div>
              <input
                ref={inputRef}
                className="flex-1 bg-transparent border-none p-4 text-xl font-medium focus:ring-0 outline-none"
                placeholder={
                  selectedNodeIds.length === 1
                    ? "เพิ่มไอเดียย่อย..."
                    : "มีไอเดียอะไรมั้ย..."
                }
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onBlur={() => {
                  if (!inputValue) setIsOpen(false);
                }}
              />
              <div className="flex items-center gap-2 pr-4">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Command className="h-3 w-3" />
                  <ArrowRight className="h-3 w-3" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  กด Enter เพื่อเซฟ
                </span>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
