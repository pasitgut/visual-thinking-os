"use client";

import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { Inbox, Loader2, LogOut, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { ReactFlowProvider, useReactFlow } from "reactflow";
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
import { useDeviceSpec } from "@/hooks/useDeviceSpec";
import { cn } from "@/lib/utils";
import { useInboxStore } from "@/stores/useInboxStore";
import { useMobileUIStore } from "@/stores/useMobileUIStore";
import { useTaskStore } from "@/stores/useTaskStore";

const DndHandler = ({ children }: { children: React.ReactNode }) => {
  const { screenToFlowPosition } = useReactFlow();
  const { removeItem } = useInboxStore();
  const { addTask, updateNodeTitle } = useTaskStore();
  const { isTablet } = useDeviceSpec();
  const [activeItem, setActiveItem] = useState<{
    id: string;
    text: string;
  } | null>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    if (!isTablet) return;
    setActiveItem({
      id: event.active.id as string,
      text: event.active.data.current?.text || "",
    });
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveItem(null);

    if (!isTablet) return;

    if (
      over &&
      over.id === "react-flow-pane" &&
      active.data.current?.type === "inbox-item"
    ) {
      const text = active.data.current.text;
      const id = active.id as string;

      // Coordinate Transformation
      const pointerEvent = event.activatorEvent as MouseEvent | TouchEvent;
      const clientX =
        "clientX" in pointerEvent
          ? pointerEvent.clientX
          : (pointerEvent as TouchEvent).touches[0].clientX;
      const clientY =
        "clientY" in pointerEvent
          ? pointerEvent.clientY
          : (pointerEvent as TouchEvent).touches[0].clientY;

      const dropX = clientX + event.delta.x;
      const dropY = clientY + event.delta.y;

      const position = screenToFlowPosition({
        x: dropX,
        y: dropY,
      });

      // Create node at drop coordinates
      addTask({ status: "todo", type: "idea", title: text }, position);

      await removeItem(id);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {children}
      <DragOverlay dropAnimation={null}>
        {activeItem ? (
          <div className="bg-card border border-primary/30 rounded-xl p-4 shadow-2xl w-[300px] opacity-80 cursor-grabbing">
            <p className="text-sm font-medium">{activeItem.text}</p>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default function Home() {
  const { user, loading: authLoading, logout } = useAuth();
  const { initialize, isLoading: storeLoading, currentView } = useTaskStore();
  const { isTablet } = useDeviceSpec();
  const { setQuickCaptureOpen } = useMobileUIStore();
  const { isOpen: isInboxOpen, setOpen: setInboxOpen } = useInboxStore();

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
    <ReactFlowProvider>
      <DndHandler>
        <main className="flex flex-col h-screen w-screen overflow-hidden">
          {/* Header */}
          <header className="flex h-14 items-center justify-between border-b px-4 sm:px-6 bg-background z-50">
            <div className="flex items-center gap-2 sm:gap-4">
              <span className="font-bold text-lg sm:text-xl truncate max-w-[120px] sm:max-w-none">
                Visual Mindmap
              </span>
              <Separator
                orientation="vertical"
                className="h-6 hidden sm:block"
              />
              <ViewSwitcher />
            </div>

            <div className="flex items-center gap-1 sm:gap-3">
              <SyncStatus />

              <div className="flex items-center border-x px-1 sm:px-3 gap-1 sm:gap-2">
                {/* Global Quick Capture Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full text-primary hover:bg-primary/10"
                  onClick={() => setQuickCaptureOpen(true)}
                  title="Quick Capture (Alt+I)"
                >
                  <Zap className="h-5 w-5 fill-current" />
                </Button>

                {/* Global Inbox Toggle */}
                <Button
                  variant={isInboxOpen ? "default" : "ghost"}
                  size="icon"
                  className="h-9 w-9 rounded-full"
                  onClick={() => setInboxOpen(!isInboxOpen)}
                  title="Toggle Inbox"
                >
                  <Inbox className="h-5 w-5" />
                </Button>
              </div>

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

          {/* View Area - Tablet Split-Pane with Toggle Support */}
          <div className="flex-1 flex overflow-hidden bg-background relative">
            {isTablet && (
              <aside
                className={cn(
                  "border-r flex-shrink-0 transition-all duration-300 ease-in-out overflow-hidden",
                  isInboxOpen ? "w-80" : "w-0 border-none",
                )}
              >
                <div className="w-80 h-full">
                  <InboxPanel variant="persistent" />
                </div>
              </aside>
            )}

            <div className="flex-1 relative overflow-hidden">
              {renderView()}
            </div>
          </div>

          {!isTablet && <InboxPanel variant="drawer" />}
          <QuickCaptureOverlay />
        </main>
      </DndHandler>
    </ReactFlowProvider>
  );
}
