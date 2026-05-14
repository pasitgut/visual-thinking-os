"use client";

import type * as React from "react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useDeviceSpec } from "@/hooks/useDeviceSpec";

interface BottomSheetContainerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  snapPoints?: (string | number)[];
  activeSnapPoint?: string | number | null;
  setActiveSnapPoint?: (snapPoint: string | number | null) => void;
}

/**
 * BottomSheetContainer
 * A reusable mobile-only container for contextual actions and details.
 * Leverages Shadcn UI (Vaul) for native-feeling gestures and snap points.
 */
export const BottomSheetContainer = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  snapPoints,
  activeSnapPoint,
  setActiveSnapPoint,
}: BottomSheetContainerProps) => {
  const { isMobile } = useDeviceSpec();

  // Ensure this component is only functional on mobile/tablet touch devices
  // as per the implementation plan, though it can render on desktop if needed.
  // We'll keep it simple and let the consumer control visibility.

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      snapPoints={snapPoints}
      activeSnapPoint={activeSnapPoint}
      setActiveSnapPoint={setActiveSnapPoint}
      shouldScaleBackground={true}
    >
      <DrawerContent className="pb-safe">
        <div className="mx-auto w-full max-w-lg">
          {(title || description) && (
            <DrawerHeader className="text-left border-b pb-4 mb-2">
              {title && (
                <DrawerTitle className="text-lg font-bold">{title}</DrawerTitle>
              )}
              {description && (
                <DrawerDescription className="text-sm text-muted-foreground">
                  {description}
                </DrawerDescription>
              )}
            </DrawerHeader>
          )}

          <div className="px-4 py-2 overflow-y-auto max-h-[70vh]">
            {children}
          </div>

          {/* Bottom padding for safe area / thumb clearance */}
          <div className="h-8" />
        </div>
      </DrawerContent>
    </Drawer>
  );
};
