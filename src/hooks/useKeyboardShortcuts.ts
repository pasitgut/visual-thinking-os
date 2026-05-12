import { useCallback, useEffect } from "react";
import { useReactFlow } from "reactflow";
import { useTaskStore } from "@/stores/useTaskStore";

export const useKeyboardShortcuts = () => {
  const {
    selectedNodeIds,
    addChild,
    addSibling,
    deleteNode,
    saveToFirestore,
    selectNode,
    setEditingNodeId,
    nodes,
    edges,
  } = useTaskStore();

  const { setNodes, fitView, setCenter } = useReactFlow();

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Guard: ignore if typing in input/textarea
      const target = event.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        // Still allow Escape to blur
        if (event.key === "Escape") {
          target.blur();
        }
        return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const modifierKey = isMac ? event.metaKey : event.ctrlKey;

      // Cmd/Ctrl + S -> Manual Save
      if (modifierKey && event.key === "s") {
        event.preventDefault();
        const userId = (window as any).userId;
        if (userId) saveToFirestore(userId);
        return;
      }

      // Actions that require a selected node
      if (selectedNodeIds.length === 1) {
        const selectedId = selectedNodeIds[0];
        const selectedNode = nodes.find((n) => n.id === selectedId);

        // Tab -> Create Child
        if (event.key === "Tab" && !event.shiftKey) {
          event.preventDefault();
          const parentNode = nodes.find(n => n.id === selectedId);
          addChild(selectedId);
          
          setTimeout(() => {
            const state = useTaskStore.getState();
            const newNodeId = state.selectedNodeIds[0];
            const newNode = state.nodes.find((n) => n.id === newNodeId);
            if (newNode && parentNode) {
              // Smart Framing: Center on the centroid of parent and child
              const centerX = (parentNode.position.x + newNode.position.x) / 2;
              const centerY = (parentNode.position.y + newNode.position.y) / 2;
              setCenter(centerX, centerY, {
                duration: 600, // Slightly slower for context preservation
              });
            }
          }, 50);
          return;
        }

        // Enter -> Create Sibling (or Start Editing if already selected)
        if (event.key === "Enter") {
          event.preventDefault();
          if (selectedId === "root") {
            addChild(selectedId);
          } else {
            addSibling(selectedId);
          }
          
          setTimeout(() => {
            const state = useTaskStore.getState();
            const newNodeId = state.selectedNodeIds[0];
            const newNode = state.nodes.find((n) => n.id === newNodeId);
            if (newNode) {
              // For siblings, we can just center on the new node or midpoint between sibling and parent
              // Let's stick to centering on the new node for now as it's cleaner for siblings
              setCenter(newNode.position.x, newNode.position.y, {
                duration: 600,
              });
            }
          }, 50);
          return;
        }

        // Delete / Backspace -> Delete Node
        if (event.key === "Delete" || event.key === "Backspace") {
          event.preventDefault();
          // Select parent before deleting
          const parentEdge = edges.find((e) => e.target === selectedId);
          if (parentEdge) {
            selectNode(parentEdge.source);
          }
          deleteNode(selectedId);
          return;
        }

        // Shift + Tab -> Navigate to Parent
        if (event.key === "Tab" && event.shiftKey) {
          event.preventDefault();
          const parentEdge = edges.find((e) => e.target === selectedId);
          if (parentEdge) {
            const parentId = parentEdge.source;
            selectNode(parentId);
            const parentNode = nodes.find((n) => n.id === parentId);
            if (parentNode) {
              setCenter(parentNode.position.x, parentNode.position.y, {
                duration: 400,
              });
            }
          }
          return;
        }

        // Arrow Key Navigation
        if (
          ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(
            event.key,
          )
        ) {
          event.preventDefault();

          let targetId: string | null = null;

          if (event.key === "ArrowRight") {
            // Go to first child
            const childEdge = edges.find((e) => e.source === selectedId);
            if (childEdge) targetId = childEdge.target;
          } else if (event.key === "ArrowLeft") {
            // Go to parent
            const parentEdge = edges.find((e) => e.target === selectedId);
            if (parentEdge) targetId = parentEdge.source;
          } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            // Go to next/prev sibling
            const parentEdge = edges.find((e) => e.target === selectedId);
            if (parentEdge) {
              const siblings = edges
                .filter((e) => e.source === parentEdge.source)
                .map((e) => e.target);
              const currentIndex = siblings.indexOf(selectedId);
              if (event.key === "ArrowDown") {
                targetId = siblings[(currentIndex + 1) % siblings.length];
              } else {
                targetId =
                  siblings[(currentIndex - 1 + siblings.length) % siblings.length];
              }
            }
          }

          if (targetId) {
            selectNode(targetId);
            const targetNode = nodes.find((n) => n.id === targetId);
            if (targetNode) {
              // Ensure the node is in view
              setCenter(targetNode.position.x, targetNode.position.y, {
                duration: 300,
              });
            }
          }
        }
      }
    },
    [
      selectedNodeIds,
      addChild,
      addSibling,
      deleteNode,
      saveToFirestore,
      selectNode,
      nodes,
      edges,
      setNodes,
      fitView,
      setCenter,
    ],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
};
