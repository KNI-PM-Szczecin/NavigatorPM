"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useEditorStore } from "@/hooks/useEditorStore";
import { Node } from "@/types/map";
import {
  GitCommit,
  MapPin,
  Maximize,
  MousePointer2,
  Tag,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { MouseEvent, useRef, useState } from "react";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";

export default function EditorCanvas() {
  const {
    nodes,
    edges,
    floors,
    activeFloorId,
    selectedNodeId,
    activeTool,
    drawingEdgeFromId,
    addNode,
    deleteEdge,
    setSelectedNode,
    setActiveTool,
    handleNodeClickForEdge,
  } = useEditorStore();

  const canvasRef = useRef<HTMLDivElement>(null);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isWeightVisible, setIsWeightVisible] = useState(true);
  const [currentScale, setCurrentScale] = useState(1);
  const [svgDimensions, setSvgDimensions] = useState({
    width: 2000,
    height: 1500,
  });

  const [edgeToDeleteId, setEdgeToDeleteId] = useState<string | null>(null);

  const activeFloor = floors.find((f) => f.id === activeFloorId);
  const floorNodes = nodes.filter((n) => n.floorId === activeFloorId);
  const floorEdges = edges.filter(
    (e) =>
      floorNodes.some((n) => n.id === e.nodeAId) &&
      floorNodes.some((n) => n.id === e.nodeBId)
  );

  const handleNodeClick = (e: MouseEvent, nodeId: string) => {
    e.stopPropagation();
    if (activeTool === "DRAW_EDGE") {
      handleNodeClickForEdge(nodeId);
    } else {
      setSelectedNode(nodeId);
    }
  };

  return (
    <div className="relative flex-1 overflow-hidden bg-slate-50 dark:bg-[#0a0a0a]">
      {" "}
      <TransformWrapper
        initialScale={1}
        minScale={1}
        maxScale={10}
        panning={{ disabled: activeTool !== "SELECT" }}
        wheel={{
          step: 0.01,
        }}
        onTransform={(e: { state: { scale: number } }) => {
          setCurrentScale(e.state.scale);
        }}
      >
        {({ zoomIn, zoomOut, resetTransform }) => {
          const handleCanvasClick = (e: MouseEvent<HTMLDivElement>) => {
            if (!activeFloorId) {
              setErrorMessage("Select or Create Floor Before creating node!");
              return;
            }

            if (activeTool !== "ADD_NODE" || !canvasRef.current) return;

            const rect = canvasRef.current.getBoundingClientRect();

            const newNode: Node = {
              id: `n_${Date.now()}`,
              floorId: activeFloorId,
              xCoordinate: Math.round((e.clientX - rect.left) / currentScale),
              yCoordinate: Math.round((e.clientY - rect.top) / currentScale),
              type: "CORRIDOR",
            };

            addNode(newNode);
            setSelectedNode(newNode.id);
            // setActiveTool("SELECT");
          };

          return (
            <>
              <TransformComponent
                wrapperStyle={{ width: "100%", height: "100%" }}
              >
                <div
                  ref={canvasRef}
                  onClick={handleCanvasClick}
                  className={`relative origin-top-left bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px] ${
                    activeTool === "SELECT"
                      ? "cursor-grab active:cursor-grabbing"
                      : activeTool === "ADD_NODE"
                        ? "cursor-crosshair"
                        : "cursor-default"
                  }`}
                  style={{
                    width: `${svgDimensions.width}px`,
                    height: `${svgDimensions.height}px`,
                  }}
                >
                  {/* TŁO MAPY */}
                  {activeFloor?.mapImageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={activeFloor.mapImageUrl}
                      alt="Plan piętra"
                      onLoad={(e) => {
                        const img = e.currentTarget;
                        if (img.naturalWidth && img.naturalHeight) {
                          setSvgDimensions({
                            width: img.naturalWidth,
                            height: img.naturalHeight,
                          });
                        }
                      }}
                      className="pointer-events-none absolute top-0 left-0 max-w-none opacity-80 dark:invert"
                      draggable={false}
                    />
                  )}

                  {/* Edge map (SVG) */}
                  <svg className="absolute inset-0 z-10 h-full w-full">
                    {floorEdges.map((edge) => {
                      const nodeA = floorNodes.find(
                        (n) => n.id === edge.nodeAId
                      );
                      const nodeB = floorNodes.find(
                        (n) => n.id === edge.nodeBId
                      );
                      if (!nodeA || !nodeB) return null;

                      const midX = (nodeA.xCoordinate + nodeB.xCoordinate) / 2;
                      const midY = (nodeA.yCoordinate + nodeB.yCoordinate) / 2;

                      const scaleFactor = Math.max(0.3, 1 / currentScale);
                      const rectWidth = 32 * scaleFactor;
                      const rectHeight = 20 * scaleFactor;

                      return (
                        <g
                          key={edge.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setEdgeToDeleteId(edge.id);
                          }}
                          className="group cursor-pointer"
                        >
                          {/* HITBOX */}
                          <line
                            x1={nodeA.xCoordinate}
                            y1={nodeA.yCoordinate}
                            x2={nodeB.xCoordinate}
                            y2={nodeB.yCoordinate}
                            stroke="transparent"
                            strokeWidth={16 * scaleFactor}
                          />

                          {/* Visible Line */}
                          <line
                            x1={nodeA.xCoordinate}
                            y1={nodeA.yCoordinate}
                            x2={nodeB.xCoordinate}
                            y2={nodeB.yCoordinate}
                            stroke="#3b82f6"
                            strokeWidth={2 * scaleFactor}
                            className="opacity-70 transition-colors group-hover:stroke-destructive group-hover:opacity-100"
                          />

                          {isWeightVisible && (
                            <>
                              <rect
                                x={midX - rectWidth / 2}
                                y={midY - rectHeight / 2}
                                width={rectWidth}
                                height={rectHeight}
                                rx={4 * scaleFactor}
                                fill="#0a0a0a"
                                stroke="#3b82f6"
                                strokeWidth={1 * scaleFactor}
                                className="opacity-90 group-hover:stroke-destructive"
                              />
                              <text
                                x={midX}
                                y={midY}
                                fill="#94a3b8"
                                fontSize={`${10 * scaleFactor}px`}
                                fontFamily="monospace"
                                textAnchor="middle"
                                dominantBaseline="central"
                              >
                                {edge.weight}
                              </text>
                            </>
                          )}
                        </g>
                      );
                    })}
                  </svg>

                  {/* Nodes */}
                  {floorNodes.map((node) => {
                    const isSelected = selectedNodeId === node.id;
                    const isDrawing = drawingEdgeFromId === node.id;
                    const isActive = isSelected || isDrawing;

                    const baseScale = Math.max(0.3, 1 / currentScale);
                    const finalScale = isActive ? baseScale * 1.25 : baseScale;

                    return (
                      <div
                        key={node.id}
                        onClick={(e) => handleNodeClick(e, node.id)}
                        className={`pointer-events-auto absolute z-20 h-4 w-4 cursor-pointer rounded-full border-2 transition-all ${
                          isSelected
                            ? "z-10 border-white bg-blue-500 shadow-[0_0_0_4px_rgba(59,130,246,0.3)]"
                            : isDrawing
                              ? "z-10 border-white bg-orange-500"
                              : "border-zinc-900 bg-zinc-400 hover:bg-zinc-300"
                        }`}
                        style={{
                          left: `${node.xCoordinate}px`,
                          top: `${node.yCoordinate}px`,
                          transform: `translate(-50%, -50%) scale(${finalScale})`,
                        }}
                      />
                    );
                  })}
                </div>
              </TransformComponent>

              {/* Toolbar (Top) */}
              <div className="absolute top-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-lg border border-border bg-background/95 p-1 px-3 shadow-lg backdrop-blur">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setActiveTool("SELECT")}
                    className={`rounded-md p-2 ${activeTool === "SELECT" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
                    title="Wskaźnik (Przesuwanie)"
                  >
                    <MousePointer2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setActiveTool("ADD_NODE")}
                    className={`rounded-md p-2 ${activeTool === "ADD_NODE" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
                    title="Dodaj węzeł"
                  >
                    <MapPin className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setActiveTool("DRAW_EDGE")}
                    className={`rounded-md p-2 ${activeTool === "DRAW_EDGE" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
                    title="Połącz węzły"
                  >
                    <GitCommit className="h-4 w-4" />
                  </button>
                </div>

                <div className="h-6 w-px bg-border"></div>

                <button
                  onClick={() => setIsWeightVisible(!isWeightVisible)}
                  className={`rounded-md p-2 transition-colors ${
                    isWeightVisible
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                  title={
                    isWeightVisible
                      ? "Ukryj wagi krawędzi"
                      : "Pokaż wagi krawędzi"
                  }
                >
                  <Tag className="h-4 w-4" />
                </button>

                <div className="h-6 w-px bg-border"></div>

                <span className="font-mono text-xs text-muted-foreground">
                  {Math.round(currentScale * 100)}%
                </span>
              </div>

              {/* Zoom Controls */}
              <div className="absolute right-4 bottom-4 z-50 flex flex-col gap-1 rounded-lg border border-border bg-background/95 p-1 shadow-lg backdrop-blur">
                <button
                  onClick={() => zoomIn()}
                  className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <ZoomIn className="h-4 w-4" />
                </button>
                <button
                  onClick={() => zoomOut()}
                  className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <ZoomOut className="h-4 w-4" />
                </button>
                <button
                  onClick={() => resetTransform()}
                  className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <Maximize className="h-4 w-4" />
                </button>
              </div>
            </>
          );
        }}
      </TransformWrapper>
      {errorMessage && (
        <div className="absolute top-20 left-1/2 z-100 flex -translate-x-1/2 items-center gap-3 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive shadow-lg backdrop-blur">
          <span>{errorMessage}</span>
          <button
            onClick={() => setErrorMessage(null)}
            className="font-bold hover:opacity-80"
          >
            ✕
          </button>
        </div>
      )}
      {/* SHADCN ALERT DIALOG: Edge delete */}
      <AlertDialog
        open={!!edgeToDeleteId}
        onOpenChange={() => setEdgeToDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Edge?</AlertDialogTitle>
            <AlertDialogDescription>
              This operation is irreversible. The connection between the
              substances will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (edgeToDeleteId) deleteEdge(edgeToDeleteId);
                setEdgeToDeleteId(null);
              }}
              className="text-destructive-foreground bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
