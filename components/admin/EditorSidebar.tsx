"use client";

import { useEditorStore } from "@/hooks/useEditorStore";
import { GitCommit, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import CreatePoiForm from "./CreatePoiForm";

export default function EditorSidebar() {
  const { nodes, pois, selectedNodeId, deleteNode } = useEditorStore();
  const [showPoiModal, setShowPoiModal] = useState(false);

  const activeNode = nodes.find((n) => n.id === selectedNodeId);
  const linkedPoi = pois.find((p) => p.nodeId === selectedNodeId);

  if (!activeNode) {
    return (
      <aside className="flex w-[320px] flex-col items-center justify-center border-l border-border bg-background p-6 text-center text-muted-foreground">
        <GitCommit className="mb-4 h-12 w-12 opacity-20" />
        <p className="text-sm">
          Select a node on the canvas to view its properties.
        </p>
      </aside>
    );
  }

  return (
    <>
      <aside className="flex w-[320px] shrink-0 flex-col border-l border-border bg-background">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <GitCommit className="h-4 w-4 text-primary" /> Node Properties
          </h2>
          <span className="rounded bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground">
            {activeNode.id.substring(0, 8)}
          </span>
        </div>

        {/* PROPERTIES CONTENT */}
        <div className="flex-1 space-y-6 overflow-y-auto p-4">
          {/* Coordinates */}
          <div>
            <h3 className="mb-3 text-xs font-medium tracking-wider text-muted-foreground uppercase">
              Coordinates
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">X</label>
                <input
                  type="number"
                  value={activeNode.xCoordinate}
                  onChange={(e) => {
                    const newX = parseInt(e.target.value) || 0;
                    useEditorStore
                      .getState()
                      .updateNodeCoordinates(
                        activeNode.id,
                        newX,
                        activeNode.yCoordinate
                      );
                  }}
                  className="w-full rounded-md border border-border bg-background px-3 py-1.5 font-mono text-sm transition-colors outline-none focus:border-primary"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Y</label>
                <input
                  type="number"
                  value={activeNode.yCoordinate}
                  onChange={(e) => {
                    const newY = parseInt(e.target.value) || 0;
                    useEditorStore
                      .getState()
                      .updateNodeCoordinates(
                        activeNode.id,
                        activeNode.xCoordinate,
                        newY
                      );
                  }}
                  className="w-full rounded-md border border-border bg-background px-3 py-1.5 font-mono text-sm transition-colors outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* POI Info */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                Point of Interest
              </h3>
            </div>

            {linkedPoi ? (
              <div className="space-y-3 rounded-md border border-border bg-muted/50 p-3 text-sm">
                <div>
                  <span className="block font-bold">
                    {linkedPoi.translations.pl?.name || "Brak nazwy"}
                  </span>
                  <span className="text-xs text-muted-foreground uppercase">
                    {linkedPoi.category}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setShowPoiModal(true)}
                    className="flex-1 rounded border border-border bg-background py-1.5 text-xs transition-colors hover:bg-muted"
                  >
                    Edit
                  </button>

                  {/* Delete button */}
                  <button
                    onClick={() => {
                      if (
                        confirm("Are you sure you want to delete this POI?")
                      ) {
                        useEditorStore.getState().deletePoi(activeNode.id);
                      }
                    }}
                    className="rounded border border-destructive/20 bg-destructive/10 px-2 text-xs text-destructive transition-colors hover:bg-destructive/20"
                    title="Delete POI"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="rounded-md border border-dashed border-border bg-muted/20 p-3 text-center text-sm text-muted-foreground">
                  No POI attached
                </div>

                {/* Create new POI */}
                <button
                  onClick={() => setShowPoiModal(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-muted px-4 py-2 text-sm font-medium transition-colors hover:bg-muted/80"
                >
                  <Plus className="h-4 w-4" /> Create new POI
                </button>
              </div>
            )}
          </div>
        </div>

        {/* DELETE BUTTON */}
        <div className="border-t border-border p-4">
          <button
            onClick={() => deleteNode(activeNode.id)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-destructive/10 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/20"
          >
            <Trash2 className="h-4 w-4" />
            Delete Node
          </button>
        </div>
      </aside>

      {/* RENDER MODAL OUTSIDE SIDEBAR LAYOUT */}
      {showPoiModal && (
        <CreatePoiForm
          nodeId={activeNode.id}
          onClose={() => setShowPoiModal(false)}
        />
      )}
    </>
  );
}
