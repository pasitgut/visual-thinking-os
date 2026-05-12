"use client";

import { AlertCircle, Cloud, RefreshCw } from "lucide-react";
import { useTaskStore } from "@/stores/useTaskStore";

export const SyncStatus = () => {
  const saveStatus = useTaskStore((state) => state.saveStatus);

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/30 border border-border/50">
      {saveStatus === "saving" && (
        <>
          <RefreshCw className="h-3.5 w-3.5 text-blue-500 animate-spin" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-blue-500/80">
            Saving...
          </span>
        </>
      )}
      {saveStatus === "saved" && (
        <>
          <div className="relative">
            <Cloud className="h-3.5 w-3.5 text-emerald-500" />
            <div className="absolute -bottom-0.5 -right-0.5 bg-background rounded-full p-0.5">
              <div className="h-1 w-1 bg-emerald-500 rounded-full" />
            </div>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500/80">
            Synced
          </span>
        </>
      )}
      {saveStatus === "error" && (
        <>
          <AlertCircle className="h-3.5 w-3.5 text-destructive" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-destructive/80">
            Sync Error
          </span>
        </>
      )}
    </div>
  );
};
