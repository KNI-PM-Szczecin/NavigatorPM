"use client";

import Image from "next/image";
import {
  ReactZoomPanPinchContentRef,
  TransformComponent,
  TransformWrapper,
  useControls,
} from "react-zoom-pan-pinch";
import mapImage from "@/public/image.png";
import { useEffect, useRef } from "react";
import UseIsLandscape from "@/components/use-is-landscape";

// This function unfocues bottombar's input, because it's very annoying
const unfocusInput = () => {
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }
};

const BuildingMap = () => {
  const transformWrapperRef = useRef<ReactZoomPanPinchContentRef | null>(null);
  const orientation = UseIsLandscape();

  // This code resets the map view when the screen orientation is changed
  useEffect(() => {
    if (transformWrapperRef.current !== null) {
      transformWrapperRef.current.setTransform(0, 0, 2);
      transformWrapperRef.current.centerView();
    }
  }, [orientation]);

  return (
    <div
      className="fixed inset-0 overflow-hidden bg-black"
      onPointerDown={unfocusInput}
    >
      {/* Zoom engine, holds zoom, x-offset and y-offset */}
      <TransformWrapper
        ref={transformWrapperRef}
        initialScale={1} // start with scale 1
        minScale={1} // you cannot zoom below 1
        maxScale={8} // you can't zoom more than 8
        centerOnInit // center the image after launch
        limitToBounds // forbids you from dragging the image outside the screen
        doubleClick={{
          mode: "toggle",
          step: 2,
        }} // first double tap zooms, the following one unzooms
      >
        {({ centerView }) => (
          // render prop from transform Wrapper
          <TransformComponent
            wrapperStyle={{
              width: "100vw", // whole screen width
              height: "100dvh", // whole screen height of mobile
              overflow: "hidden", // nothing sticks out outside the screen
              touchAction: "none", // doesn't allow your to scroll with gestures
            }}
            contentStyle={{
              width: "max-content",
              height: "100dvh",
            }} // container that allows you to drag left and right
          >
            <Image
              src={mapImage}
              alt="Map"
              draggable={false}
              onLoad={() => centerView(1, 0)}
              className="block h-dvh w-auto max-w-none select-none"
            />
          </TransformComponent>
        )}
      </TransformWrapper>
    </div>
  );
};

export default BuildingMap;
