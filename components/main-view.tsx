"use client";

import BuildingMap from "@/components/building-map";
import FloatingHeader from "@/components/floating-header";
import ResponsivePanel from "@/components/overlays/responsive-panel";
import MockPanelContent from "@/components/panel-content";
import { FloorInfo, PoiDetails, RouteSegment } from "@/types/map";

interface MainViewProps {
  floors: FloorInfo[];
  initialFloorId: string | null;
  originPoi: PoiDetails | null;
  destinationPoi: PoiDetails | null;
  routeSegments: RouteSegment[] | null;
  buildingName?: string;
}

export default function MainView({
  floors,
  initialFloorId,
  originPoi,
  destinationPoi,
  routeSegments,
  buildingName,
}: MainViewProps) {
  return (
    <div className="relative h-dvh w-full overflow-hidden bg-zinc-950">
      {/* Layer 0: Fullscreen Map Canvas */}
      <BuildingMap
        floors={floors}
        initialFloorId={initialFloorId}
        originPoi={originPoi}
        destinationPoi={destinationPoi}
        routeSegments={routeSegments}
      />

      {/* Layer 1: Floating Header / Top Bar */}
      <FloatingHeader buildingName={buildingName} />

      {/* Layer 3: Responsive Panel (Desktop Floating Window / Mobile Bottom Sheet) */}
      <ResponsivePanel>
        <MockPanelContent />
      </ResponsivePanel>
    </div>
  );
}
