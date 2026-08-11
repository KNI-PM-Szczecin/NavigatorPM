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
}: {
  initialFloorUrl: string | null;
}) => {
  const transformWrapperRef = useRef<ReactZoomPanPinchContentRef | null>(null);
  const orientation = UseIsLandscape();
  const floor_url = initialFloorUrl
    ? floors[initialFloorUrl]
    : "/maps/floor_0.svg";

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
            <div className="relative h-dvh bg-white">
              <Image
                src={floor_url}
                alt="Map"
                draggable={false}
                onLoad={() => centerView(1, 0)}
                className="block h-full w-auto max-w-none select-none"
              />
              {/* <Image
                src={initialFloorUrl}
                alt="Map"
                draggable={false}
                onLoad={() => centerView(1, 0)}
                className="absolute top-0 left-0 z-10 h-dvh w-auto max-w-none select-none"
              /> */}
            </div>
          </TransformComponent>
        )}
      </TransformWrapper>
    </div>
  );
};

export default BuildingMap;
