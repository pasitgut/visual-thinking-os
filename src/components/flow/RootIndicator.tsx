"use client";

import { Home } from "lucide-react";
import { useEffect, useState } from "react";
import { useReactFlow, useStore } from "reactflow";
import { Button } from "@/components/ui/button";

export const RootIndicator = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { setCenter, getNodes } = useReactFlow();

  // Track viewport transform to determine if root is visible
  const transform = useStore((s) => s.transform);
  const width = useStore((s) => s.width);
  const height = useStore((s) => s.height);

  useEffect(() => {
    const rootNode = getNodes().find((n) => n.id === "root");
    if (!rootNode) return;

    // Convert root position to screen coordinates
    const [x, y, zoom] = transform;
    const screenX = rootNode.position.x * zoom + x;
    const screenY = rootNode.position.y * zoom + y;

    // Check if root is within viewport bounds (with some margin)
    const margin = 100;
    const isOffScreen =
      screenX < -margin ||
      screenX > width + margin ||
      screenY < -margin ||
      screenY > height + margin;

    setIsVisible(isOffScreen);
  }, [transform, width, height, getNodes]);

  const handleReturnHome = () => {
    const rootNode = getNodes().find((n) => n.id === "root");
    if (rootNode) {
      setCenter(rootNode.position.x, rootNode.position.y, {
        duration: 800,
        zoom: 1,
      });
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <Button
        variant="secondary"
        size="sm"
        className="rounded-full shadow-lg border bg-background/80 backdrop-blur-md gap-2 px-4 hover:scale-105 active:scale-95 transition-all"
        onClick={handleReturnHome}
      >
        <Home className="h-4 w-4" />
        <span className="text-xs font-medium">Return to Start</span>
      </Button>
    </div>
  );
};
