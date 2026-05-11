import { useEffect, useCallback } from "react";
import { useTaskStore } from "@/stores/useTaskStore";
import { useReactFlow } from "reactflow";

export const useKeyboardShortcuts = () => {
  const {
    selectedNodeIds,
    addChild,
    deleteNode,
    saveToFirestore,
    nodes,
    edges,
  } = useTaskStore();

  const { setNodes, fitView } = useReactFlow();

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Guard: ignore if typing in input/textarea
      const target = event.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
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

        // Enter -> Add Child
        if (event.key === "Enter") {
          event.preventDefault();
          addChild(selectedId);
        }

        // Delete / Backspace -> Delete Node
        if (event.key === "Delete" || event.key === "Backspace") {
          event.preventDefault();
          deleteNode(selectedId);
        }

        // Tab -> Focus/Select first child node
        if (event.key === "Tab") {
          event.preventDefault();
          const childEdge = edges.find((e) => e.source === selectedId);
          if (childEdge) {
            const childId = childEdge.target;

            // Update selection in React Flow
            setNodes((nds) =>
              nds.map((node) => ({
                ...node,
                selected: node.id === childId,
              })),
            );

            // Smoothly focus the child node
            fitView({ nodes: [{ id: childId }], duration: 400, padding: 0.5 });
          }
        }
      }
    },
    [
      selectedNodeIds,
      addChild,
      deleteNode,
      saveToFirestore,
      edges,
      setNodes,
      fitView,
    ],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
};
