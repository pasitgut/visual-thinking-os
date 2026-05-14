"use client";

import { AlertCircle, Cloud, CloudOff, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { useTaskStore } from "@/stores/useTaskStore";

export const SyncStatus = () => {
  const saveStatus = useTaskStore((state) => state.saveStatus);
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true,
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!isOnline) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-destructive/10 border border-destructive/20 animate-pulse">
        <CloudOff className="h-3.5 w-3.5 text-destructive" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-destructive/80">
          เน็ตหลุดอยู่นะ
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/30 border border-border/50">
      {saveStatus === "saving" && (
        <>
          <RefreshCw className="h-3.5 w-3.5 text-blue-500 animate-spin" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-blue-500/80">
            กำลังเซฟ...
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
            เซฟเรียบร้อย
          </span>
        </>
      )}
      {saveStatus === "error" && (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <AlertCircle className="h-3.5 w-3.5 text-destructive" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-destructive/80">
              เซฟไม่ติดแฮะ
            </span>
          </div>
          <button
            onClick={() => useTaskStore.getState().retrySync()}
            className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/20 transition-all active:scale-95 group"
            title="Retry Sync"
          >
            <RefreshCw className="h-3 w-3 group-hover:rotate-180 transition-transform duration-500" />
            <span className="text-[9px] font-bold uppercase tracking-tighter">ลองใหม่</span>
          </button>
        </div>
      )}
    </div>
  );
};
