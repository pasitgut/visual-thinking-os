"use client";

import { Loader2, LogOut } from "lucide-react";
import { useEffect } from "react";
import { InboxPanel } from "@/components/flow/InboxPanel";
import { MindmapBoard } from "@/components/flow/MindmapBoard";
import { QuickCaptureOverlay } from "@/components/flow/QuickCaptureOverlay";
import { SyncStatus } from "@/components/layout/SyncStatus";
import { ViewSwitcher } from "@/components/layout/ViewSwitcher";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { KanbanView } from "@/components/views/KanbanView";
import { LoginButton } from "@/features/auth/components/LoginButton";
import { useAuth } from "@/hooks/useAuth";
import { useTaskStore } from "@/stores/useTaskStore";

export default function Home() {
  const { user, loading: authLoading, logout } = useAuth();
  const { initialize, isLoading: storeLoading, currentView } = useTaskStore();

  useEffect(() => {
    if (user) {
      initialize(user.uid);
    }
  }, [user, initialize]);

  if (authLoading || (user && storeLoading)) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center gap-6 bg-background">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Visual Mindmap</h1>
          <p className="text-muted-foreground">
            Manage your tasks visually and hierarchically.
          </p>
        </div>
        <LoginButton />
      </div>
    );
  }

  const renderView = () => {
    switch (currentView) {
      case "mindmap":
        return <MindmapBoard />;
      case "kanban":
        return <KanbanView />;
      default:
        return <MindmapBoard />;
    }
  };

  return (
    <main className="flex flex-col h-screen w-screen overflow-hidden">
      {/* Header */}
      <header className="flex h-14 items-center justify-between border-b px-4 sm:px-6 bg-background z-50">
        <div className="flex items-center gap-4">
          <span className="font-bold text-lg sm:text-xl truncate max-w-[120px] sm:max-w-none">
            Visual Mindmap
          </span>
          <Separator orientation="vertical" className="h-6 hidden sm:block" />
          <ViewSwitcher />
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <SyncStatus />
          <span className="text-sm text-muted-foreground hidden lg:inline-block">
            {user.email}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="gap-2 px-2 sm:px-3"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </header>

      {/* View Area */}
      <div className="flex-1 relative overflow-hidden bg-background">
        {renderView()}
      </div>

      <InboxPanel />
      <QuickCaptureOverlay />
    </main>
  );
}
