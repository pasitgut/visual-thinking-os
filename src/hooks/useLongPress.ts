import { useCallback, useRef } from "react";

interface LongPressOptions {
  onLongPress: (event: React.TouchEvent | React.MouseEvent) => void;
  onClick?: (event: React.TouchEvent | React.MouseEvent) => void;
  threshold?: number;
  moveThreshold?: number;
}

export const useLongPress = ({
  onLongPress,
  onClick,
  threshold = 500,
  moveThreshold = 10,
}: LongPressOptions) => {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startPosRef = useRef<{ x: number; y: number } | null>(null);
  const isLongPressTriggered = useRef(false);

  const start = useCallback(
    (event: React.TouchEvent | React.MouseEvent) => {
      // Avoid triggering on right-click
      if ("button" in event && event.button !== 0) return;

      const x = "touches" in event ? event.touches[0].clientX : event.clientX;
      const y = "touches" in event ? event.touches[0].clientY : event.clientY;

      startPosRef.current = { x, y };
      isLongPressTriggered.current = false;

      timerRef.current = setTimeout(() => {
        onLongPress(event);
        isLongPressTriggered.current = true;
      }, threshold);
    },
    [onLongPress, threshold]
  );

  const cancel = useCallback(
    (event: React.TouchEvent | React.MouseEvent) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }

      if (!isLongPressTriggered.current && onClick) {
        // Simple heuristic: if we moved very little, it's a click
        if (startPosRef.current) {
          const x = "touches" in event ? event.changedTouches[0].clientX : event.clientX;
          const y = "touches" in event ? event.changedTouches[0].clientY : event.clientY;
          
          const dist = Math.sqrt(
            Math.pow(x - startPosRef.current.x, 2) + 
            Math.pow(y - startPosRef.current.y, 2)
          );

          if (dist < moveThreshold) {
            onClick(event);
          }
        }
      }

      startPosRef.current = null;
    },
    [onClick, moveThreshold]
  );

  const move = useCallback(
    (event: React.TouchEvent | React.MouseEvent) => {
      if (startPosRef.current && timerRef.current) {
        const x = "touches" in event ? event.touches[0].clientX : event.clientX;
        const y = "touches" in event ? event.touches[0].clientY : event.clientY;

        const dist = Math.sqrt(
          Math.pow(x - startPosRef.current.x, 2) + 
          Math.pow(y - startPosRef.current.y, 2)
        );

        if (dist > moveThreshold) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
      }
    },
    [moveThreshold]
  );

  return {
    onMouseDown: (e: React.MouseEvent) => start(e),
    onMouseUp: (e: React.MouseEvent) => cancel(e),
    onMouseMove: (e: React.MouseEvent) => move(e),
    onMouseLeave: (e: React.MouseEvent) => cancel(e),
    onTouchStart: (e: React.TouchEvent) => start(e),
    onTouchEnd: (e: React.TouchEvent) => cancel(e),
    onTouchMove: (e: React.TouchEvent) => move(e),
  };
};
