"use client";

import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils";
import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

function useIsMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    getClientSnapshot,
    getServerSnapshot
  );
}

export interface ResponsivePanelProps {
  children: React.ReactNode;
  /**
   * Whether the panel is open.
   * On desktop, controls visibility of the floating window.
   * On mobile, controls open state of the drawer.
   * @default true
   */
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;

  /**
   * Mobile snap points: numbers between 0-1 represent viewport fractions,
   * numbers > 1 represent pixels (e.g. 112 for collapsed peek bar).
   * @default [112, 0.5, 0.88]
   */
  snapPoints?: (number | string)[];

  /** Controlled active snap point */
  snapPoint?: number | string | null;

  /** Initial snap point when uncontrolled @default 112 */
  defaultSnapPoint?: number | string;

  /** Callback fired when user swipes between snap points */
  onSnapPointChange?: (snapPoint: number | string | null) => void;

  /**
   * Whether the drawer acts as a modal (blocks background interactions).
   * For map apps, this should usually be false so users can interact with the map.
   * Set to true for full-screen modals like Settings.
   * @default false
   */
  modal?: boolean;

  /** Custom class for the desktop floating panel */
  desktopClassName?: string;

  /** Custom class for the mobile drawer popup */
  mobileClassName?: string;

  /** Custom class for the scrollable content area */
  contentClassName?: string;
}

const DEFAULT_SNAP_POINTS = [148, 0.5, 0.88];

export default function ResponsivePanel({
  children,
  isOpen = true,
  onOpenChange,
  snapPoints = DEFAULT_SNAP_POINTS,
  snapPoint,
  defaultSnapPoint = 148,
  onSnapPointChange,
  modal = false,
  desktopClassName,
  mobileClassName,
  contentClassName,
}: ResponsivePanelProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const mounted = useIsMounted();

  // SSR / Pre-mount placeholder: render desktop skeleton to avoid hydration mismatches
  if (!mounted) {
    if (!isOpen) return null;
    return (
      <aside
        aria-label="Panel boczny"
        className={cn(
          "pointer-events-auto fixed top-20 left-6 z-30 hidden max-h-[calc(100dvh-6.5rem)] w-80 flex-col overflow-hidden rounded-3xl border border-black/10 bg-white/80 shadow-[0_16px_40px_rgba(0,0,0,0.12)] backdrop-blur-2xl md:flex md:w-84 lg:w-96 xl:w-105 dark:border-white/10 dark:bg-zinc-950/80 dark:shadow-[0_16px_40px_rgba(0,0,0,0.45)]",
          desktopClassName
        )}
      >
        <div
          className={cn(
            "flex-1 overflow-y-auto overscroll-contain p-4 select-text",
            contentClassName
          )}
        >
          {children}
        </div>
      </aside>
    );
  }

  // Desktop Floating Window (Liquid Glass)
  if (isDesktop) {
    if (!isOpen) return null;

    return (
      <aside
        aria-label="Panel boczny"
        className={cn(
          "pointer-events-auto fixed top-20 left-6 z-30 flex max-h-[calc(100dvh-6.5rem)] w-80 flex-col overflow-hidden rounded-3xl border border-black/10 bg-white/80 shadow-[0_16px_40px_rgba(0,0,0,0.12)] backdrop-blur-2xl md:w-84 lg:w-96 xl:w-105 dark:border-white/10 dark:bg-zinc-950/80 dark:shadow-[0_16px_40px_rgba(0,0,0,0.45)]",
          desktopClassName
        )}
      >
        <div
          className={cn(
            "flex-1 overflow-y-auto overscroll-contain p-4 select-text",
            contentClassName
          )}
        >
          {children}
        </div>
      </aside>
    );
  }

  // Mobile Bottom Sheet (Non-modal Drawer with snap points)
  return (
    <Drawer
      open={isOpen}
      onOpenChange={onOpenChange}
      modal={modal}
      disablePointerDismissal={!modal}
      snapPoints={snapPoints}
      snapPoint={snapPoint}
      defaultSnapPoint={defaultSnapPoint}
      onSnapPointChange={onSnapPointChange}
      showSwipeHandle={true}
    >
      <DrawerContent
        className={cn(
          "pointer-events-auto rounded-t-3xl border-t border-black/10 bg-white/95 text-zinc-900 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-zinc-950/85 dark:text-slate-50",
          mobileClassName
        )}
      >
        <div
          className={cn(
            "flex h-full min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-4 pt-2 pb-[max(1rem,env(safe-area-inset-bottom))] select-text",
            contentClassName
          )}
        >
          {children}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
