"use client";
import React, { useCallback, useRef } from "react";
import QuickPinchZoom, { make3dTransformValue } from "react-quick-pinch-zoom";

const BuildingMap = () => {
  const imgRef = useRef<HTMLImageElement>(null);

  const onUpdate = useCallback(
    ({ x, y, scale }: { x: number; y: number; scale: number }) => {
      const { current: img } = imgRef;
      if (img) {
        const value = make3dTransformValue({ x, y, scale });
        img.style.setProperty("transform", value);
      }
    },
    []
  );

  return (
    <div className="absolute inset-0 overflow-hidden bg-black">
      <QuickPinchZoom
        onUpdate={onUpdate}
        containerProps={{ className: "h-full w-full" }}
        maxZoom={8}
        minZoom={0.5}
        tapZoomFactor={2}
        doubleTapToggleZoom
        inertia
        centerContained
        verticalPadding={128}
      >
        <img
          ref={imgRef}
          alt="Map"
          src="/image.png"
          draggable={false}
          className="h-auto max-w-none origin-top-left will-change-transform select-none"
        />
      </QuickPinchZoom>
    </div>
  );
};

export default BuildingMap;
