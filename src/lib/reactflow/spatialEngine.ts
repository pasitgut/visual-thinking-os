import type { Node, XYPosition } from "reactflow";
import type { TaskNode } from "@/types/task";

/**
 * Calculates a position for a new child node that avoids overlapping existing siblings.
 * Uses a sector-based approach relative to the parent's current position.
 */
export const getIncrementalPosition = (
  parentNode: Node,
  existingNodes: Node[],
  offset = { x: 250, y: 0 }, // Default horizontal mindmap flow
): XYPosition => {
  const siblings = existingNodes.filter(
    (n) =>
      n.parentNode === parentNode.id ||
      (n.data && n.data.parentId === parentNode.id),
  );

  if (siblings.length === 0) {
    return {
      x: parentNode.position.x + offset.x,
      y: parentNode.position.y + offset.y,
    };
  }

  // Calculate the average spread of siblings
  const siblingCount = siblings.length;
  const spread = 120; // Vertical gap between siblings
  const startY =
    parentNode.position.y - (siblingCount * spread) / 2 + spread / 2;

  // Find the next available "slot"
  return {
    x: parentNode.position.x + offset.x,
    y: startY + siblingCount * spread,
  };
};

/**
 * Reconciles auto-layout positions with user-pinned positions.
 * If a node is pinned, it stays where the user put it.
 * If not, it moves towards the suggested layout position.
 */
export const reconcileLayout = (
  currentNodes: TaskNode[],
  suggestedNodes: Node[],
): TaskNode[] => {
  return currentNodes.map((node) => {
    const suggestion = suggestedNodes.find((s) => s.id === node.id);
    if (!suggestion) return node;

    // If node is pinned by user, keep current position
    if (node.data.isPinned) {
      return node;
    }

    // Otherwise, accept the suggestion
    return {
      ...node,
      position: suggestion.position,
    };
  });
};
