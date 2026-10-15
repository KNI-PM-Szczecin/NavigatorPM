"use client";

import FloorControls from "@/components/floor-controls";
import UseIsLandscape from "@/components/use-is-landscape";
import { FloorInfo, PoiDetails, RouteSegment } from "@/types/map";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ReactZoomPanPinchContentRef,
  TransformComponent,
  TransformWrapper,
} from "react-zoom-pan-pinch";

const unfocusInput = () => {
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }
};

const BuildingMap = ({
  floors,
  initialFloorId,
  originPoi,
  destinationPoi,
  routeSegments,
}: {
  floors: FloorInfo[];
  initialFloorId: string | null;
  originPoi: PoiDetails | null;
  destinationPoi: PoiDetails | null;
  routeSegments: RouteSegment[] | null;
}) => {
  const enteredViaQR = originPoi != null;
  const transformWrapperRef = useRef<ReactZoomPanPinchContentRef | null>(null);
  const orientation = UseIsLandscape();

  const defaultFloor =
    initialFloorId || (floors.length > 0 ? (floors[0]?.id ?? null) : null);
  const [activeFloorId, setActiveFloorId] = useState<string | null>(
    defaultFloor
  );

  const activeFloor = floors.find((f) => f.id === activeFloorId);
  const floorUrl = activeFloor?.mapImageUrl || "";

  const [vbX = 0, vbY = 0, vbW = 841.7, vbH = 595.2] = activeFloor?.viewBox ?? [
    0, 0, 841.7, 595.2,
  ];
  const hasViewBox = vbW > 0 && vbH > 0;

  const [svgDimensions, setSvgDimensions] = useState({
    width: vbW || 1122,
    height: vbH || 793,
  });

  const [prevFloorId, setPrevFloorId] = useState<string | null>(activeFloorId);
  if (activeFloorId !== prevFloorId) {
    setPrevFloorId(activeFloorId);
    const newFloor = floors.find((f) => f.id === activeFloorId);
    const nw = newFloor?.viewBox?.[2] || 1122;
    const nh = newFloor?.viewBox?.[3] || 793;
    setSvgDimensions({ width: nw, height: nh });
  }

  const toPct = (x: number, y: number) => ({
    left: `${((x - vbX) / vbW) * 100}%`,
    top: `${((y - vbY) / vbH) * 100}%`,
  });

  const focusBox = useRef<HTMLDivElement | null>(null);

  const FOCUS_W = 90;
  const FOCUS_H = 150; // Rozszerzenie w dół przesuwa optyczny środek ponad dolny drawer
  let focusStyle = null;

  // Cel powiększenia: punkt początkowy (z QR) lub punkt docelowy (jeśli nie ma QR)
  const focusTarget =
    originPoi && originPoi.floorId === activeFloorId
      ? originPoi
      : destinationPoi && destinationPoi.floorId === activeFloorId && !originPoi
        ? destinationPoi
        : null;
  const hasFocusTarget = focusTarget != null;

  if (focusTarget && hasViewBox) {
    focusStyle = {
      position: "absolute" as const,
      ...toPct(focusTarget.userX - FOCUS_W / 2, focusTarget.userY - FOCUS_W / 2),
      width: `${(FOCUS_W / vbW) * 100}%`,
      height: `${(FOCUS_H / vbH) * 100}%`,
    };
  }

  // Centrowanie / zoom widoku przy załadowaniu rzutu, zmianie orientacji lub piętra
  const handleMapReady = useCallback(() => {
    const api = transformWrapperRef.current;
    if (api == null) return;

    if (hasFocusTarget && focusBox.current != null) {
      api.zoomToElement(focusBox.current, undefined, 600);
    } else {
      // Oblicz optymalną skalę, aby cały rzut piętra idealnie mieścił się na ekranie z marginesem
      const wrapperW = window.innerWidth;
      const wrapperH = window.innerHeight;
      const padX = wrapperW < 768 ? 32 : 96;
      const padY = wrapperW < 768 ? 160 : 96; // Większy margines od dołu na telefonie przez drawer
      const fitScale = Math.min(
        Math.max(0.15, (wrapperW - padX) / svgDimensions.width),
        Math.max(0.15, (wrapperH - padY) / svgDimensions.height),
        1.5
      );
      api.centerView(fitScale, 200);
    }
  }, [hasFocusTarget, svgDimensions]);

  useEffect(() => {
    handleMapReady();
  }, [activeFloorId, orientation, svgDimensions, handleMapReady]);

  const [prevInitialFloorId, setPrevInitialFloorId] = useState(initialFloorId);
  if (initialFloorId !== prevInitialFloorId) {
    setPrevInitialFloorId(initialFloorId);
    if (initialFloorId) {
      setActiveFloorId(initialFloorId);
    }
  }

  const activeRouteSegment = routeSegments?.find(
    (s) => s.floorId === activeFloorId
  );

  return (
    <div
      className="fixed inset-0 overflow-hidden bg-zinc-100 transition-colors duration-300 dark:bg-zinc-950"
      onPointerDown={unfocusInput}
    >
      <TransformWrapper
        ref={transformWrapperRef}
        initialScale={1}
        minScale={0.15}
        maxScale={15}
        centerOnInit={true}
        centerZoomedOut={true}
        wheel={{
          step: 0.01,
        }}
      >
        {() => (
          <TransformComponent
            wrapperStyle={{
              width: "100%",
              height: "100%",
              touchAction: "none",
            }}
          >
            <div
              className="relative origin-top-left"
              style={{
                width: `${svgDimensions.width}px`,
                height: `${svgDimensions.height}px`,
              }}
            >
              {floorUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={floorUrl}
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
                  className="pointer-events-none absolute top-0 left-0 h-full w-full opacity-85 dark:invert dark:hue-rotate-180"
                  draggable={false}
                />
              )}

              <div className="absolute inset-0 z-40">
                {focusStyle && <div ref={focusBox} style={focusStyle} />}

                {/* Origin Marker */}
                {originPoi &&
                  originPoi.floorId === activeFloorId &&
                  hasViewBox && (
                    <div
                      style={{
                        position: "absolute",
                        ...toPct(originPoi.userX, originPoi.userY),
                        transform: "translate(-50%, -50%)",
                      }}
                    >
                      <div className="h-2 w-2 rounded-full border border-white bg-blue-500 shadow-[0_0_8px_2px_rgb(59_130_246/0.7),0_0_24px_8px_rgb(59_130_246/0.35)]" />
                    </div>
                  )}

                {/* Destination Marker */}
                {destinationPoi &&
                  destinationPoi.floorId === activeFloorId &&
                  hasViewBox && (
                    <div
                      style={{
                        position: "absolute",
                        ...toPct(destinationPoi.userX, destinationPoi.userY),
                        transform: "translate(-50%, -50%)",
                      }}
                    >
                      <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-red-500 shadow-md">
                        <div className="h-1.5 w-1.5 rounded-full bg-white" />
                      </div>
                    </div>
                  )}
              </div>

              {/* Route SVG */}
              {activeRouteSegment && hasViewBox && (
                <svg
                  viewBox={`${vbX} ${vbY} ${vbW} ${vbH}`}
                  className="pointer-events-none absolute inset-0 z-30 h-full w-full"
                >
                  <path
                    d={activeRouteSegment.path}
                    fill="none"
                    stroke="rgb(59 130 246)"
                    strokeWidth={4}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>
              )}
            </div>
          </TransformComponent>
        )}
      </TransformWrapper>

      <FloorControls
        floors={floors}
        activeFloorId={activeFloorId}
        onFloorChange={setActiveFloorId}
        destinationFloorId={destinationPoi?.floorId ?? null}
      />
    </div>
  );
};

export default BuildingMap;
