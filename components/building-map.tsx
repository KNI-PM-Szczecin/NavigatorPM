"use client";

import UseIsLandscape from "@/components/use-is-landscape";
import { useEffect, useRef, useState } from "react";
import {
  ReactZoomPanPinchContentRef,
  TransformComponent,
  TransformWrapper,
} from "react-zoom-pan-pinch";

type FloorInfo = {
  id: string;
  level: number;
  mapImageUrl: string | null;
  viewBox: number[] | null;
  name: string;
};

type PoiDetails = {
  nodeId: string;
  floorId: string;
  userX: number;
  userY: number;
  poiName?: string;
};

type RouteSegment = {
  floorId: string;
  path: string;
};

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
  const [mapSize, setMapSize] = useState({ w: 0, h: 0 });

  const activeFloor = floors.find((f) => f.id === activeFloorId);
  const floorUrl = activeFloor?.mapImageUrl || "";

  // Node coordinates are in the floor SVG's viewBox space, which may not start at 0,0
  // and is not the same unit as the image's natural pixel size (pt vs px).
  // Floors without a stored viewBox fall back to the natural image size.
  const [vbX = 0, vbY = 0, vbW = mapSize.w, vbH = mapSize.h] =
    activeFloor?.viewBox ?? [];
  const hasViewBox = vbW > 0 && vbH > 0;
  const toPct = (x: number, y: number) => ({
    left: `${((x - vbX) / vbW) * 100}%`,
    top: `${((y - vbY) / vbH) * 100}%`,
  });

  const focusBox = useRef<HTMLDivElement | null>(null);

  const FOCUS = 90;
  let focusStyle = null;

  if (originPoi && originPoi.floorId === activeFloorId && hasViewBox) {
    focusStyle = {
      position: "absolute" as const,
      ...toPct(originPoi.userX - FOCUS / 2, originPoi.userY - FOCUS / 2),
      width: `${(FOCUS / vbW) * 100}%`,
      height: `${(FOCUS / vbH) * 100}%`,
    };
  }

  // Reset the map view when the screen orientation is changed
  useEffect(() => {
    const api = transformWrapperRef.current;
    if (api == null) return;

    if (focusBox.current != null) {
      api.zoomToElement(focusBox.current, undefined, 600);
    } else {
      api.centerView(1, 0);
    }
  }, [orientation]);

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
      className="fixed inset-0 overflow-hidden bg-white"
      onPointerDown={unfocusInput}
    >
      <TransformWrapper
        ref={transformWrapperRef}
        initialScale={1}
        minScale={1}
        maxScale={8}
        limitToBounds
        doubleClick={{
          mode: "toggle",
          step: 2,
        }}
      >
        {({ centerView, zoomToElement }) => (
          <TransformComponent
            wrapperStyle={{
              width: "100vw",
              height: "100dvh",
              overflow: "hidden",
              touchAction: "none",
            }}
            contentStyle={{
              width: "max-content",
              height: "100dvh",
            }}
          >
            <div className="relative h-[67dvh] bg-white">
              {floorUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={floorUrl}
                  alt="Map"
                  draggable={false}
                  onLoad={(e) => {
                    const img = e.currentTarget;
                    if (img.naturalWidth && img.naturalHeight) {
                      setMapSize({ w: img.naturalWidth, h: img.naturalHeight });
                    }
                    if (enteredViaQR && focusBox.current != null) {
                      return zoomToElement(focusBox.current, undefined, 600);
                    }
                    return centerView(1, 0);
                  }}
                  onError={(e) => {
                    console.error("Failed to load map image");
                    e.currentTarget.style.display = "none";
                  }}
                  className="block h-full w-auto max-w-none select-none"
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
                    className="drop-shadow-sm"
                  />
                </svg>
              )}
            </div>
          </TransformComponent>
        )}
      </TransformWrapper>

      {/* Floor Switcher */}
      {floors.length > 1 && (
        <div className="absolute top-1/2 left-4 z-50 flex -translate-y-1/2 flex-col gap-2 rounded-full bg-white/80 p-2 shadow-lg backdrop-blur-md">
          {floors.map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFloorId(f.id)}
              className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                f.id === activeFloorId
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-transparent text-slate-700 hover:bg-slate-200"
              }`}
            >
              {f.level}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default BuildingMap;
