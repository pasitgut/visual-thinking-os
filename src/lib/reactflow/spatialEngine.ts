import type { Edge, Node, XYPosition } from "reactflow";
import type { TaskNode } from "@/types/task";

// --- Math & Vector Utilities ---

export interface Vector2 {
  x: number;
  y: number;
}

export const vec = {
  add: (a: Vector2, b: Vector2): Vector2 => ({ x: a.x + b.x, y: a.y + b.y }),
  sub: (a: Vector2, b: Vector2): Vector2 => ({ x: a.x - b.x, y: a.y - b.y }),
  mul: (a: Vector2, s: number): Vector2 => ({ x: a.x * s, y: a.y * s }),
  div: (a: Vector2, s: number): Vector2 => ({ x: a.x / s, y: a.y / s }),
  len: (a: Vector2): number => Math.sqrt(a.x * a.x + a.y * a.y),
  dist: (a: Vector2, b: Vector2): number =>
    Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2),
  normalize: (a: Vector2): Vector2 => {
    const l = vec.len(a);
    return l === 0 ? { x: 0, y: 0 } : vec.div(a, l);
  },
  lerp: (a: Vector2, b: Vector2, t: number): Vector2 => ({
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
  }),
};

// --- Spatial Engine Configuration ---

export const SPATIAL_CONFIG = {
  COLLISION_PADDING: 20,
  PUSH_STRENGTH: 0.15,
  MAGNETIC_STRENGTH: 0.08,
  IDEAL_GAP: 120, // Preferred distance between nodes
  ALIGN_THRESHOLD: 15, // Snap to alignment if within 15px
  MAX_FORCE: 50,
  DAMPING: 0.85,
  LERP_FACTOR: 0.2, // Smoothness factor
};

/**
 * Calculates a position for a new child node that avoids overlapping existing siblings.
 */
export const getIncrementalPosition = (
  parentNode: Node,
  nodes: Node[],
  edges: Edge[],
  offset = { x: 260, y: 0 },
): XYPosition => {
  const siblings = nodes.filter(
    (n) =>
      n.id !== parentNode.id &&
      edges.some((e) => e.source === parentNode.id && e.target === n.id),
  );

  if (siblings.length === 0) {
    return {
      x: parentNode.position.x + offset.x,
      y: parentNode.position.y + offset.y,
    };
  }

  const siblingCount = siblings.length;
  const verticalGap = 100;
  const totalHeight = siblingCount * verticalGap;
  const startY = parentNode.position.y - totalHeight / 2;

  return {
    x: parentNode.position.x + offset.x,
    y: startY + siblingCount * verticalGap,
  };
};

/**
 * Reconciles auto-layout positions with user-pinned positions.
 */
export const reconcileLayout = (
  currentNodes: TaskNode[],
  suggestedNodes: Node[],
): TaskNode[] => {
  return currentNodes.map((node) => {
    const suggestion = suggestedNodes.find((s) => s.id === node.id);
    if (!suggestion) return node;

    if (node.data.isPinned) {
      return node;
    }

    return {
      ...node,
      position: suggestion.position,
    };
  });
};

// --- Advanced Spatial Interaction System ---

export class SpatialEngine {
  private nodeDimensions = new Map<string, { w: number; h: number }>();
  private velocities = new Map<string, Vector2>();

  /**
   * Updates internal dimension cache. Should be called when nodes are measured.
   * Default fallback to 200x60 for TaskNode.
   */
  updateDimensions(nodes: Node[]) {
    for (const node of nodes) {
      this.nodeDimensions.set(node.id, {
        w: node.width ?? 200,
        h: node.height ?? 60,
      });
    }
  }

  /**
   * Returns true if no nodes have significant velocity.
   */
  isIdle(): boolean {
    return this.velocities.size === 0;
  }

  /**
   * Calculates the next set of positions for all nodes based on physics.
   * Only nodes near the dragged node or with existing velocity are updated for performance.
   */
  step(
    nodes: TaskNode[],
    draggingNodeId: string | null,
    deltaTime = 16,
  ): TaskNode[] {
    const draggedNode = draggingNodeId
      ? nodes.find((n) => n.id === draggingNodeId)
      : null;
    if (!draggedNode && this.velocities.size === 0) return nodes;

    const updatedNodes = [...nodes];
    const forces = new Map<string, Vector2>();

    // 1. Calculate Collision Forces (Push Away)
    for (let i = 0; i < nodes.length; i++) {
      const nodeA = nodes[i];
      const dimA = this.nodeDimensions.get(nodeA.id) || { w: 200, h: 60 };

      for (let j = i + 1; j < nodes.length; j++) {
        const nodeB = nodes[j];
        const dimB = this.nodeDimensions.get(nodeB.id) || { w: 200, h: 60 };

        const overlapForce = this.calculateOverlapForce(
          nodeA,
          dimA,
          nodeB,
          dimB,
        );

        if (overlapForce) {
          // If one is dragged, the other takes the full force
          if (nodeA.id === draggingNodeId) {
            this.addForce(forces, nodeB.id, overlapForce);
          } else if (nodeB.id === draggingNodeId) {
            this.addForce(forces, nodeA.id, vec.mul(overlapForce, -1));
          } else {
            // Both move apart equally
            this.addForce(forces, nodeA.id, vec.mul(overlapForce, -0.5));
            this.addForce(forces, nodeB.id, vec.mul(overlapForce, 0.5));
          }
        }
      }
    }

    // 2. Calculate Magnetic Forces (Alignment & Spacing)
    if (draggedNode) {
      const dimDragged = this.nodeDimensions.get(draggedNode.id) || {
        w: 200,
        h: 60,
      };

      for (const node of nodes) {
        if (node.id === draggingNodeId) continue;
        const dimOther = this.nodeDimensions.get(node.id) || { w: 200, h: 60 };

        const magneticForce = this.calculateMagneticForce(
          draggedNode,
          dimDragged,
          node,
          dimOther,
        );
        if (magneticForce) {
          // Magnetic force pulls/pushes the dragged node slightly for feedback
          // but mostly affects the neighborhood for stable layout
          this.addForce(forces, draggingNodeId!, magneticForce);
        }
      }
    }

    // 3. Apply Forces and Integrate Velocity
    let hasChanges = false;
    for (let i = 0; i < updatedNodes.length; i++) {
      const node = updatedNodes[i];
      // Dragged node position is controlled by user, we don't apply physics to its position directly
      // but we use it as a source of forces.
      if (node.id === draggingNodeId) continue;

      const force = forces.get(node.id) || { x: 0, y: 0 };
      let vel = this.velocities.get(node.id) || { x: 0, y: 0 };

      // Update velocity: v = (v + f) * damping
      vel = vec.add(vel, force);
      vel = vec.mul(vel, SPATIAL_CONFIG.DAMPING);

      if (vec.len(vel) < 0.05) {
        this.velocities.delete(node.id);
        continue;
      }

      this.velocities.set(node.id, vel);

      // Smoothly move node: pos = pos + velocity (lerped for premium feel)
      const targetPos = vec.add(node.position, vel);
      updatedNodes[i] = {
        ...node,
        position: vec.lerp(node.position, targetPos, SPATIAL_CONFIG.LERP_FACTOR),
      };
      hasChanges = true;
    }

    return hasChanges ? updatedNodes : nodes;
  }

  private addForce(forces: Map<string, Vector2>, id: string, force: Vector2) {
    const current = forces.get(id) || { x: 0, y: 0 };
    forces.set(id, vec.add(current, force));
  }

  private calculateOverlapForce(
    a: Node,
    dimA: { w: number; h: number },
    b: Node,
    dimB: { w: number; h: number },
  ): Vector2 | null {
    const padding = SPATIAL_CONFIG.COLLISION_PADDING;

    // Center coordinates
    const ca = { x: a.position.x + dimA.w / 2, y: a.position.y + dimA.h / 2 };
    const cb = { x: b.position.x + dimB.w / 2, y: b.position.y + dimB.h / 2 };

    const dx = cb.x - ca.x;
    const dy = cb.y - ca.y;

    const minDistanceX = dimA.w / 2 + dimB.w / 2 + padding;
    const minDistanceY = dimA.h / 2 + dimB.h / 2 + padding;

    const overlapX = minDistanceX - Math.abs(dx);
    const overlapY = minDistanceY - Math.abs(dy);

    if (overlapX > 0 && overlapY > 0) {
      // Overlap detected. Push in the direction of least resistance.
      if (overlapX < overlapY) {
        return {
          x: (dx > 0 ? 1 : -1) * overlapX * SPATIAL_CONFIG.PUSH_STRENGTH,
          y: 0,
        };
      } else {
        return {
          x: 0,
          y: (dy > 0 ? 1 : -1) * overlapY * SPATIAL_CONFIG.PUSH_STRENGTH,
        };
      }
    }

    return null;
  }

  private calculateMagneticForce(
    dragged: Node,
    dimD: { w: number; h: number },
    other: Node,
    dimO: { w: number; h: number },
  ): Vector2 | null {
    const dist = vec.dist(dragged.position, other.position);
    if (dist > 400) return null; // Only nearby nodes

    const force: Vector2 = { x: 0, y: 0 };

    // 1. Horizontal Alignment
    const dy = Math.abs(dragged.position.y - other.position.y);
    if (dy < SPATIAL_CONFIG.ALIGN_THRESHOLD) {
      force.y = (other.position.y - dragged.position.y) * SPATIAL_CONFIG.MAGNETIC_STRENGTH;
    }

    // 2. Vertical Alignment
    const dx = Math.abs(dragged.position.x - other.position.x);
    if (dx < SPATIAL_CONFIG.ALIGN_THRESHOLD) {
      force.x = (other.position.x - dragged.position.x) * SPATIAL_CONFIG.MAGNETIC_STRENGTH;
    }

    // 3. Ideal Spacing (Magnetic Gaps)
    // If nodes are close to the IDEAL_GAP, pull them toward it
    const ideal = SPATIAL_CONFIG.IDEAL_GAP;
    const gapThreshold = 30;

    // Check horizontal gap
    const hGap = Math.abs(dx) - (dimD.w / 2 + dimO.w / 2);
    if (Math.abs(hGap - ideal) < gapThreshold) {
      const dir = dragged.position.x < other.position.x ? 1 : -1;
      const error = hGap - ideal;
      force.x -= dir * error * SPATIAL_CONFIG.MAGNETIC_STRENGTH;
    }

    return force.x !== 0 || force.y !== 0 ? force : null;
  }
}

export const spatialEngine = new SpatialEngine();
