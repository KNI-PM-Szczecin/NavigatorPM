"use client";
import { cn } from "@/lib/utils";
import React from "react";
export function GlowGlassCard({
  children,
  className,
  contentClassName,
  ...rest
}: React.ComponentProps<"div"> & { contentClassName?: string }) {
  return (
    <div
      {...rest}
      className={cn(
        "group/card relative cursor-default overflow-hidden rounded-[36px] shadow-[0_-8px_30px_rgba(0,0,0,0.08)]",
        className
      )}
      onPointerMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty("--x", `${e.clientX - rect.left}px`);
        e.currentTarget.style.setProperty("--y", `${e.clientY - rect.top}px`);
      }}
    >
      {/* Spotlight Glow Layer */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/card:opacity-100"
        style={{
          background: `radial-gradient(300px circle at var(--x, 50%) var(--y, 0px), rgba(255, 255, 255, 0.50), transparent 70%)`,
          zIndex: 1,
        }}
      />

      {/* Frosted Glass Backdrop Layer */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: "rgba(255, 255, 255, 0.15)",
          backdropFilter: "blur(12px) saturate(100%)",
          WebkitBackdropFilter: "blur(12px) saturate(100%)",
          border: "1px solid rgba(255, 255, 255, 0.27)",
        }}
      />

      {/* Content Layer */}
      <div className={cn("relative z-10", contentClassName)}>{children}</div>
    </div>
  );
}
