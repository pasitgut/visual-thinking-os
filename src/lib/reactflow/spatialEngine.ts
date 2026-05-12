import type { Edge, Node, XYPosition } from "reactflow";
import type { TaskNode } from "@/types/task";

/**
 * Calculates a position for a new child node that avoids overlapping existing siblings.
 * Uses a sector-based approach relative to the parent's current position.
 */
export const getIncrementalPosition = (
  parentNode: Node,
  nodes: Node[],
  edges: Edge[],
  offset = { x: 260, y: 0 }, // Slightly larger horizontal gap
): XYPosition => {
  const siblings = nodes.filter(
    (n) =>
      n.id !== parentNode.id && // Not the parent itself
      edges.some(e => e.source === parentNode.id && e.target === n.id) // Is a child of this parent
  );

  // If no siblings, place at the default offset
  if (siblings.length === 0) {
    return {
      x: parentNode.position.x + offset.x,
      y: parentNode.position.y + offset.y,
    };
  }

  // Find the max vertical extent of existing siblings to place the next one below/above
  const siblingCount = siblings.length;
  const verticalGap = 100; // Consistent vertical gap
  
  // Center siblings vertically around the parent
  const totalHeight = (siblingCount) * verticalGap;
  const startY = parentNode.position.y - (totalHeight / 2);
  
  return {
    x: parentNode.position.x + offset.x,
    y: startY + siblingCount * verticalGap,
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
