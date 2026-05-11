import { Edge, Node } from "reactflow";

/**
 * Gets all node IDs in a subtree starting from a root node.
 */
export const getSubtreeIds = (rootId: string, edges: Edge[]): Set<string> => {
  const ids = new Set<string>([rootId]);
  const queue = [rootId];

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    // Only traverse hierarchy edges for focus mode
    const children = edges
      .filter((edge) => edge.source === currentId && edge.data?.type === 'hierarchy')
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
  edges: Edge[]
): Node[] => {
  const path: Node[] = [];
  let currentId: string | undefined = targetId;

  while (currentId) {
    const currentNode = nodes.find((n) => n.id === currentId);
    if (currentNode) {
      path.unshift(currentNode);
    }

    // Find parent via hierarchy edge
    const parentEdge = edges.find(
      (edge) => edge.target === currentId && edge.data?.type === 'hierarchy'
    );
    currentId = parentEdge?.source;
    
    // Safety break to prevent infinite loops if graph has cycles
    if (path.length > 50) break;
  }

  return path;
};
