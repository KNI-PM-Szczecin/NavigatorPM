"use client";
import { useEffect, useState } from "react";

// This code checks if phone is in landscape or potrait mode. It works dynamically.
const UseIsLandscape = () => {
  const [isLandscape, setIsLandscape] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(orientation: landscape)");

    const updateOrientation = () => {
      setIsLandscape(mediaQuery.matches);
    };

    updateOrientation();

    mediaQuery.addEventListener("change", updateOrientation);

    return () => {
      mediaQuery.removeEventListener("change", updateOrientation);
    };
  }, []);

  return isLandscape;
};

export default UseIsLandscape;
