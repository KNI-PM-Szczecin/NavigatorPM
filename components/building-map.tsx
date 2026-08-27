"use client";

import Image, { StaticImageData } from "next/image";
import {
  ReactZoomPanPinchContentRef,
  TransformComponent,
  TransformWrapper,
} from "react-zoom-pan-pinch";
import { useEffect, useRef } from "react";
import UseIsLandscape from "@/components/use-is-landscape";
import floor0 from "@/public/maps/floor_0.svg";
import floor1 from "@/public/maps/floor_0.svg"; // Placeholder
import floor2 from "@/public/maps/floor_0.svg"; // Placeholder

const floors: Record<string, StaticImageData> = {
  "/maps/floor_0.svg": floor0,
  "/maps/floor_1.svg": floor1,
  "/maps/floor_2.svg": floor2,
};

// This function unfocues bottombar's input, because it's very annoying
const unfocusInput = () => {
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }
};

const BuildingMap = ({
  initialFloorUrl,
  userX,
  userY,
  route,
}: {
  initialFloorUrl: string | null;
  userX: number | null;
  userY: number | null;
  route: string | null;
}) => {
  const enteredViaQR = initialFloorUrl != null;
  const transformWrapperRef = useRef<ReactZoomPanPinchContentRef | null>(null);
  const markersDiv = useRef<HTMLDivElement | null>(null);
  const orientation = UseIsLandscape();
  const floorUrl =
    (initialFloorUrl ? floors[initialFloorUrl] : undefined) ?? floor0;

  const userMarker = useRef<HTMLDivElement | null>(null);

  const VIEWBOX = { x: 106.7, y: 123.7, w: 654.5, h: 311.5 };

  const FOCUS = 90;
  const focusBox = useRef<HTMLDivElement | null>(null);

  const focusStyle =
    userX != null && userY != null
      ? {
          position: "absolute" as const,
          left: `${((userX - VIEWBOX.x - FOCUS / 2) / VIEWBOX.w) * 100}%`,
          top: `${((userY - VIEWBOX.y - FOCUS / 2) / VIEWBOX.h) * 100}%`,
          width: `${(FOCUS / VIEWBOX.w) * 100}%`,
          height: `${(FOCUS / VIEWBOX.h) * 100}%`,
        }
      : null;

  // This code resets the map view when the screen orientation is changed
  useEffect(() => {
    const api = transformWrapperRef.current;
    if (api == null) return;

    if (focusBox.current != null) {
      api.zoomToElement(focusBox.current, undefined, 600);
    } else {
      api.centerView(1, 0);
    }
  }, [orientation]);

  return (
    <div
      className="fixed inset-0 overflow-hidden bg-white"
      onPointerDown={unfocusInput}
    >
      {/* Zoom engine, holds zoom, x-offset and y-offset */}
      <TransformWrapper
        ref={transformWrapperRef}
        initialScale={1} // start with scale 1
        minScale={1} // you cannot zoom below 1
        maxScale={8} // you can't zoom more than 8
        limitToBounds // forbids you from dragging the image outside the screen
        doubleClick={{
          mode: "toggle",
          step: 2,
        }} // first double tap zooms, the following one unzooms
      >
        {({ centerView, zoomToElement }) => (
          // render prop from transform Wrapper
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
              <Image
                src={floorUrl}
                alt="Map"
                draggable={false}
                onLoad={() => {
                  if (enteredViaQR && focusBox.current != null) {
                    return zoomToElement(focusBox.current, undefined, 600);
                  }
                  return centerView(1, 0);
                }}
                className="block h-full w-auto max-w-none select-none"
              />
              {/* Markers div */}
              <div className="absolute inset-0 z-40" ref={markersDiv}>
                {focusStyle && <div ref={focusBox} style={focusStyle} />}
                {userX != null && userY != null && (
                  <div
                    style={{
                      position: "absolute",
                      left: `${((userX - VIEWBOX.x) / VIEWBOX.w) * 100}%`,
                      top: `${((userY - VIEWBOX.y) / VIEWBOX.h) * 100}%`,
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    <div
                      ref={userMarker}
                      className="h-2 w-2 rounded-full border border-white bg-blue-500 shadow-[0_0_8px_2px_rgb(59_130_246/0.7),0_0_24px_8px_rgb(59_130_246/0.35)]"
                    />
                  </div>
                )}
              </div>
              {route && (
                <svg
                  viewBox={`${VIEWBOX.x} ${VIEWBOX.y} ${VIEWBOX.w} ${VIEWBOX.h}`}
                  className="pointer-events-none absolute inset-0 z-30 h-full w-full"
                >
                  <path
                    d={route}
                    fill="none"
                    stroke="rgb(59 130 246)"
                    strokeWidth={3}
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
    </div>
  );
};

export default BuildingMap;
