"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { ReactNode } from "react";

interface DraggableInboxItemProps {
  id: string;
  text: string;
  children: ReactNode;
}

export const DraggableInboxItem = ({ id, text, children }: DraggableInboxItemProps) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: id,
    data: {
      type: "inbox-item",
      text: text,
    },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    zIndex: isDragging ? 1000 : undefined,
    opacity: isDragging ? 0.5 : undefined,
    cursor: "grab",
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="touch-none">
      {children}
    </div>
  );
};
