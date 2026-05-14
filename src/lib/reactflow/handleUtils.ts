import type { Edge, Node } from "reactflow";

const HYSTERESIS_BUFFER = 40; // Pixels to prevent flickering

/**
 * Calculates the best handles for a source and target node based on their relative positions.
 */
export const calculateBestHandles = (
  sourceNode: Node,
  targetNode: Node,
  currentSourceHandle?: string | null,
  currentTargetHandle?: string | null
): { sourceHandle: string; targetHandle: string } => {
  const sourcePos = sourceNode.position;
  const targetPos = targetNode.position;

  // Center points (approximate based on standard node sizes if dimensions not available)
  const sourceWidth = sourceNode.width ?? 200;
  const sourceHeight = sourceNode.height ?? 80;
  const targetWidth = targetNode.width ?? 200;
  const targetHeight = targetNode.height ?? 80;

  const sourceCenterX = sourcePos.x + sourceWidth / 2;
  const sourceCenterY = sourcePos.y + sourceHeight / 2;
  const targetCenterX = targetPos.x + targetWidth / 2;
  const targetCenterY = targetPos.y + targetHeight / 2;

  const dx = targetCenterX - sourceCenterX;
  const dy = targetCenterY - sourceCenterY;

  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);

  // Determine current orientation if it exists
  const isCurrentlyHorizontal = 
    currentSourceHandle?.startsWith('left') || 
    currentSourceHandle?.startsWith('right');
  
  const isCurrentlyVertical = 
    currentSourceHandle?.startsWith('top') || 
    currentSourceHandle?.startsWith('bottom');

  let useHorizontal = absDx > absDy;

  // Apply hysteresis
  if (isCurrentlyHorizontal && absDy < absDx + HYSTERESIS_BUFFER) {
    useHorizontal = true;
  } else if (isCurrentlyVertical && absDx < absDy + HYSTERESIS_BUFFER) {
    useHorizontal = false;
  }

  let sourceHandle: string;
  let targetHandle: string;

  if (useHorizontal) {
    if (dx > 0) {
      sourceHandle = "right-source";
      targetHandle = "left-target";
    } else {
      sourceHandle = "left-source";
      targetHandle = "right-target";
    }
  } else {
    if (dy > 0) {
      sourceHandle = "bottom-source";
      targetHandle = "top-target";
    } else {
      sourceHandle = "top-source";
      targetHandle = "bottom-target";
    }
  }

  return { sourceHandle, targetHandle };
};

/**
 * Updates all edges in the graph to use the most logical handles based on node positions.
 */
export const updateDynamicHandles = (nodes: Node[], edges: Edge[]): Edge[] => {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  let changed = false;

  const updatedEdges = edges.map((edge) => {
    const sourceNode = nodeMap.get(edge.source);
    const targetNode = nodeMap.get(edge.target);

    if (!sourceNode || !targetNode) return edge;

    const { sourceHandle, targetHandle } = calculateBestHandles(
      sourceNode,
      targetNode,
      edge.sourceHandle,
      edge.targetHandle
    );

    if (
      edge.sourceHandle !== sourceHandle ||
      edge.targetHandle !== targetHandle
    ) {
      changed = true;
      return {
        ...edge,
        sourceHandle,
        targetHandle,
      };
    }

    return edge;
  });

  return changed ? updatedEdges : edges;
};
