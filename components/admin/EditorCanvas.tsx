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
import { useHotkeys } from "@/hooks/useHotkeys";
import { Edge, Node } from "@/types/map";
import {
  GitCommit,
  Grid3x3,
  MapPin,
  Maximize,
  MousePointer2,
  Route,
  Tag,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { MouseEvent, useRef, useState } from "react";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
import { useShallow } from "zustand/shallow";

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
    isGridSnapEnabled,
    toggleGridSnap,
  } = useEditorStore(
    useShallow((state) => ({
      nodes: state.nodes,
      edges: state.edges,
      floors: state.floors,
      activeFloorId: state.activeFloorId,
      selectedNodeId: state.selectedNodeId,
      activeTool: state.activeTool,
      drawingEdgeFromId: state.drawingEdgeFromId,
      addNode: state.addNode,
      deleteEdge: state.deleteEdge,
      setSelectedNode: state.setSelectedNode,
      setActiveTool: state.setActiveTool,
      handleNodeClickForEdge: state.handleNodeClickForEdge,
      isGridSnapEnabled: state.isGridSnapEnabled,
      toggleGridSnap: state.toggleGridSnap,
    }))
  );

  useHotkeys();

  const dynamicLineRef = useRef<SVGLineElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isWeightVisible, setIsWeightVisible] = useState(true);
  const [currentScale, setCurrentScale] = useState(1);
  const [svgDimensions, setSvgDimensions] = useState({
    width: 2000,
    height: 1500,
  });

  const [edgeToDeleteId, setEdgeToDeleteId] = useState<string | null>(null);

  const [prevFloorId, setPrevFloorId] = useState<string | null>(activeFloorId);

  if (activeFloorId !== prevFloorId) {
    setPrevFloorId(activeFloorId);
    if (
      !activeFloorId ||
      !floors.find((f) => f.id === activeFloorId)?.mapImageUrl
    ) {
      setSvgDimensions({ width: 2000, height: 1500 });
    }
  }
  const activeFloor = floors.find((f) => f.id === activeFloorId);
  const floorNodes = nodes.filter((n) => n.floorId === activeFloorId);
  const floorEdges = edges.filter(
    (e) =>
      floorNodes.some((n) => n.id === e.nodeAId) &&
      floorNodes.some((n) => n.id === e.nodeBId)
  );

  const ghostFloor = activeFloor
    ? floors.find(
        (f) =>
          f.buildingId === activeFloor.buildingId &&
          f.level === activeFloor.level - 1
      )
    : undefined;

  const ghostNodes = ghostFloor
    ? nodes.filter((n) => n.floorId === ghostFloor.id)
    : [];

  const handleNodeClick = (e: MouseEvent, nodeId: string) => {
    e.stopPropagation();

    if (activeTool === "DRAW_EDGE") {
      handleNodeClickForEdge(nodeId);
    } else if (activeTool === "DRAW_PATH") {
      useEditorStore.getState().connectNodesInPath(nodeId);
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
        {({ zoomIn, zoomOut, resetTransform, state: transformState }) => {
          const actualScale = transformState.scale;

          const vbX = activeFloor?.viewBox?.[0] ?? 0;
          const vbY = activeFloor?.viewBox?.[1] ?? 0;
          const vbW = activeFloor?.viewBox?.[2] ?? svgDimensions.width;
          const vbH = activeFloor?.viewBox?.[3] ?? svgDimensions.height;

          const handleCanvasClick = (e: MouseEvent<SVGSVGElement>) => {
            if (!activeFloorId) {
              setErrorMessage(
                "Wybierz lub stwórz piętro przed dodaniem węzłów!"
              );
              return;
            }

            if (
              (activeTool !== "ADD_NODE" && activeTool !== "DRAW_PATH") ||
              !canvasRef.current
            ) {
              return;
            }

            const svg = svgRef.current;
            if (!svg) return;

            const ctm = svg.getScreenCTM();
            if (!ctm) return;

            const pt = svg.createSVGPoint();
            pt.x = e.clientX;
            pt.y = e.clientY;

            const svgPos = pt.matrixTransform(ctm.inverse());
            let calcX = svgPos.x;
            let calcY = svgPos.y;

            // Obliczanie promienia przyciągania
            // ctm.a to obecna skala ekranu względem SVG.
            const snapRadius = 15 / ctm.a;
            let isGhostSnapped = false;

            // GHOST SNAPPING (Przyciąganie do duchów z niższego piętra)
            for (const ghost of ghostNodes) {
              const dx = calcX - ghost.xCoordinate;
              const dy = calcY - ghost.yCoordinate;
              if (Math.sqrt(dx * dx + dy * dy) < snapRadius) {
                calcX = ghost.xCoordinate;
                calcY = ghost.yCoordinate;
                isGhostSnapped = true;
                break;
              }
            }

            if (!isGhostSnapped) {
              if (isGridSnapEnabled) {
                calcX = Math.round(calcX / 24) * 24;
                calcY = Math.round(calcY / 24) * 24;
              } else {
                calcX = Math.round(calcX);
                calcY = Math.round(calcY);
              }

              if (e.shiftKey) {
                const referenceNodeId =
                  activeTool === "DRAW_PATH" || activeTool === "ADD_NODE"
                    ? selectedNodeId
                    : drawingEdgeFromId;
                const refNode = floorNodes.find(
                  (n) => n.id === referenceNodeId
                );
                if (refNode) {
                  if (
                    Math.abs(calcX - refNode.xCoordinate) >
                    Math.abs(calcY - refNode.yCoordinate)
                  ) {
                    calcY = refNode.yCoordinate;
                  } else {
                    calcX = refNode.xCoordinate;
                  }
                }
              }
            }

            const newNode: Node = {
              id: `n_${Date.now()}`,
              floorId: activeFloorId,
              xCoordinate: calcX,
              yCoordinate: calcY,
              type: "CORRIDOR",
            };

            if (activeTool === "DRAW_PATH" && selectedNodeId) {
              const prevNode = floorNodes.find((n) => n.id === selectedNodeId);

              if (prevNode) {
                const dx = newNode.xCoordinate - prevNode.xCoordinate;
                const dy = newNode.yCoordinate - prevNode.yCoordinate;
                const calculatedWeight = Math.round(
                  Math.sqrt(dx * dx + dy * dy)
                );

                const newEdge: Edge = {
                  id: `e_${Date.now()}`,
                  nodeAId: selectedNodeId,
                  nodeBId: newNode.id,
                  weight: calculatedWeight,
                  isAccessible: true,
                };
                useEditorStore.getState().addNodeAndEdge(newNode, newEdge);
              }
            } else {
              addNode(newNode);
              setSelectedNode(newNode.id);
            }
          };

          const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
            const isDrawingEdge =
              activeTool === "DRAW_EDGE" && drawingEdgeFromId;
            const isDrawingPath = activeTool === "DRAW_PATH" && selectedNodeId;

            if (!isDrawingEdge && !isDrawingPath) {
              return;
            }

            if (!canvasRef.current) return;

            const rect = canvasRef.current.getBoundingClientRect();
            const pixelX = (e.clientX - rect.left) / actualScale;
            const pixelY = (e.clientY - rect.top) / actualScale;
            let currentX = vbX + (pixelX / svgDimensions.width) * vbW;
            let currentY = vbY + (pixelY / svgDimensions.height) * vbH;

            const activeNodeId = isDrawingEdge
              ? drawingEdgeFromId
              : selectedNodeId;
            const startNode = floorNodes.find((n) => n.id === activeNodeId);

            if (startNode && e.shiftKey) {
              const deltaX = Math.abs(currentX - startNode.xCoordinate);
              const deltaY = Math.abs(currentY - startNode.yCoordinate);
              if (deltaX > deltaY) currentY = startNode.yCoordinate;
              else currentX = startNode.xCoordinate;
            }

            if (dynamicLineRef.current) {
              dynamicLineRef.current.setAttribute("x2", currentX.toString());
              dynamicLineRef.current.setAttribute("y2", currentY.toString());
            }
          };

          return (
            <>
              <TransformComponent
                wrapperStyle={{ width: "100%", height: "100%" }}
              >
                <div
                  ref={canvasRef}
                  onMouseMove={handleMouseMove}
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
                  <svg
                    ref={svgRef}
                    onClick={handleCanvasClick}
                    className="absolute inset-0 z-10 h-full w-full"
                    viewBox={`${vbX} ${vbY} ${vbW} ${vbH}`}
                  >
                    {/* WIZUALIZACJA: Duchy z poprzedniego piętra */}
                    {ghostNodes.map((ghost) => {
                      const scaleFactor = Math.max(0.3, 1 / currentScale);
                      return (
                        <circle
                          key={`ghost_${ghost.id}`}
                          cx={ghost.xCoordinate}
                          cy={ghost.yCoordinate}
                          r={6 * scaleFactor} // Nieco mniejsze niż normalne węzły
                          fill="transparent"
                          stroke="#9ca3af" // Szary kolor (Tailwind: text-gray-400)
                          strokeWidth={2 * scaleFactor}
                          strokeDasharray={`${3 * scaleFactor} ${3 * scaleFactor}`}
                          className="opacity-40"
                        />
                      );
                    })}

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

                    {/* WIZUALIZACJA: Rysowana krawędź w locie */}
                    {(() => {
                      const isDrawingEdge =
                        activeTool === "DRAW_EDGE" && drawingEdgeFromId;
                      const isDrawingPath =
                        activeTool === "DRAW_PATH" && selectedNodeId;

                      if (!isDrawingEdge && !isDrawingPath) return null;

                      const activeStartId =
                        activeTool === "DRAW_EDGE"
                          ? drawingEdgeFromId
                          : selectedNodeId;
                      if (!activeStartId) return null;

                      const startNode = floorNodes.find(
                        (n) => n.id === activeStartId
                      );
                      if (!startNode) return null;

                      const scaleFactor = Math.max(0.3, 1 / currentScale);

                      return (
                        <line
                          ref={dynamicLineRef}
                          x1={startNode.xCoordinate}
                          y1={startNode.yCoordinate}
                          x2={startNode.xCoordinate}
                          y2={startNode.yCoordinate}
                          stroke={
                            activeTool === "DRAW_PATH" ? "#10b981" : "#f97316"
                          } /* Ścieżka: zielona, Zwykła linia: pomarańczowa */
                          strokeWidth={2 * scaleFactor}
                          strokeDasharray={`${4 * scaleFactor} ${4 * scaleFactor}`}
                          className="pointer-events-none opacity-70"
                        />
                      );
                    })()}

                    {/* Nodes */}
                    {floorNodes.map((node) => {
                      const isSelected = selectedNodeId === node.id;
                      const isDrawing = drawingEdgeFromId === node.id;
                      const isActive = isSelected || isDrawing;

                      const baseScale = Math.max(0.3, 1 / currentScale);
                      const finalScale = isActive
                        ? baseScale * 1.25
                        : baseScale;

                      return (
                        <circle
                          key={node.id}
                          cx={node.xCoordinate}
                          cy={node.yCoordinate}
                          r={6 * finalScale}
                          onClick={(e) => handleNodeClick(e, node.id)}
                          strokeWidth={2 * finalScale}
                          className={`pointer-events-auto cursor-pointer transition-all ${
                            isSelected
                              ? "fill-blue-500 stroke-white"
                              : isDrawing
                                ? "fill-orange-500 stroke-white"
                                : "fill-zinc-400 stroke-zinc-900 hover:fill-zinc-300"
                          }`}
                        />
                      );
                    })}
                  </svg>
                </div>
              </TransformComponent>

              {/* Toolbar (Top) */}
              <div className="absolute top-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-lg border border-border bg-background/95 p-1 px-3 shadow-lg backdrop-blur">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setActiveTool("SELECT")}
                    className={`rounded-md p-2 ${activeTool === "SELECT" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
                    title="Selector [V]"
                  >
                    <MousePointer2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setActiveTool("DRAW_PATH")}
                    className={`rounded-md p-2 transition-colors ${activeTool === "DRAW_PATH" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
                    title="Rysuj ścieżkę ciągłą [P]"
                  >
                    <Route className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setActiveTool("ADD_NODE")}
                    className={`rounded-md p-2 ${activeTool === "ADD_NODE" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
                    title="Add Node [N]"
                  >
                    <MapPin className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setActiveTool("DRAW_EDGE")}
                    className={`rounded-md p-2 ${activeTool === "DRAW_EDGE" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
                    title="Draw Edges [E]"
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
                    isWeightVisible ? "Hide edge weight" : "Show edge weight"
                  }
                >
                  <Tag className="h-4 w-4" />
                </button>

                <button
                  onClick={toggleGridSnap}
                  className={`rounded-md p-2 transition-colors ${
                    isGridSnapEnabled
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                  title="Snap to Grid [G]"
                >
                  <Grid3x3 className="h-4 w-4" />
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
