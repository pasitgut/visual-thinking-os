import type { Edge, Node } from "reactflow";

/**
 * Gets all node IDs in a subtree starting from a root node.
 * Traverses all outgoing edges.
 */
export const getSubtreeIds = (rootId: string, edges: Edge[]): Set<string> => {
  const ids = new Set<string>([rootId]);
  const queue = [rootId];

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    const children = edges
      .filter((edge) => edge.source === currentId)
      .map((edge) => edge.target);

    for (const childId of children) {
      if (!ids.has(childId)) {
        ids.add(childId);
        queue.push(childId);
      }
    }
  }

  return ids;
};

/**
 * Gets the path of node IDs from the main root to a specific node.
 */
export const getParentPath = (
  targetId: string,
  nodes: Node[],
  edges: Edge[],
): Node[] => {
  const path: Node[] = [];
  let currentId: string | undefined = targetId;

  while (currentId) {
    const currentNode = nodes.find((n) => n.id === currentId);
    if (currentNode) {
      path.unshift(currentNode);
    }

    // Find parent via any edge
    const parentEdge = edges.find((edge) => edge.target === currentId);
    currentId = parentEdge?.source;

    // Safety break to prevent infinite loops if graph has cycles
    if (path.length > 50) break;
  }

  return path;
};

/**
 * Gets node IDs that should be visible based on the progressive exploration rules.
 * Rule: Descendants of the global root ('root') are limited by depth relative to focusRootId.
 * Independent nodes (not connected to global root) are always visible.
 */
export const getVisibleNodeIdsByDepth = (
  focusRootId: string,
  allNodes: { id: string }[],
  edges: Edge[],
  globalRootId: string = "root",
  maxDepth: number = 2,
): Set<string> => {
  // 1. Find all descendants of the global root (The "Main Tree")
  const mainTreeIds = getSubtreeIds(globalRootId, edges);

  // 2. Calculate the current exploration scope (depth limited)
  const explorationScope = new Set<string>([focusRootId]);
  const scopeQueue: { id: string; depth: number }[] = [
    { id: focusRootId, depth: 0 },
  ];

  while (scopeQueue.length > 0) {
    const { id, depth } = scopeQueue.shift()!;
    if (depth < maxDepth) {
      const children = edges
        .filter(
          (e) =>
            e.source === id &&
            (e.data?.type === "hierarchy" || e.data?.type === "related"),
        )
        .map((e) => e.target);
      for (const childId of children) {
        if (!explorationScope.has(childId)) {
          explorationScope.add(childId);
          scopeQueue.push({ id: childId, depth: depth + 1 });
        }
      }
    }
  }

  // 3. Include parent for context preservation (if in main tree)
  const parentEdge = edges.find(
    (e) =>
      e.target === focusRootId &&
      (e.data?.type === "hierarchy" || e.data?.type === "related"),
  );
  if (parentEdge) {
    explorationScope.add(parentEdge.source);
  }

  // 4. Combine: Visible = (All nodes NOT in main tree) + (Nodes in exploration scope)
  const finalVisibleIds = new Set<string>();
  for (const node of allNodes) {
    if (!mainTreeIds.has(node.id) || explorationScope.has(node.id)) {
      finalVisibleIds.add(node.id);
    }
  }

  return finalVisibleIds;
};

/**
 * Checks if a node is at the rendering depth limit.
 */
export const isNodeAtDepthLimit = (
  nodeId: string,
  rootId: string,
  edges: Edge[],
  limit: number = 2,
): boolean => {
  if (nodeId === rootId) return false;

  let currentDepth = 0;
  let currentId = nodeId;

  while (currentId !== rootId) {
    const parentEdge = edges.find(
      (e) =>
        e.target === currentId &&
        (e.data?.type === "hierarchy" || e.data?.type === "related"),
    );
    if (!parentEdge) return false; // Not a descendant or detached
    currentId = parentEdge.source;
    currentDepth++;
    if (currentDepth > limit) return false;
  }

  return currentDepth === limit;
};
