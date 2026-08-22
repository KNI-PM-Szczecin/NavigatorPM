"use client";

import { useEffect } from "react";
import { useEditorStore } from "./useEditorStore";

export function useHotkeys() {
  const {
    setActiveTool,
    selectedNodeId,
    setSelectedNode,
    deleteNode,
    cancelEdgeDrawing,
  } = useEditorStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case "v":
          setActiveTool("SELECT");
          break;
        case "n":
          setActiveTool("ADD_NODE");
          break;
        case "e":
          setActiveTool("DRAW_EDGE");
          break;
        case "escape":
          setSelectedNode(null);
          cancelEdgeDrawing();
          setActiveTool("SELECT");
          break;
        case "delete":
        case "backspace":
          if (selectedNodeId) {
            deleteNode(selectedNodeId);
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    setActiveTool,
    selectedNodeId,
    setSelectedNode,
    deleteNode,
    cancelEdgeDrawing,
  ]);
}
