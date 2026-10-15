import MainView from "@/components/main-view";
import {
  getBuildings,
  getPoiContext,
  getRouteSegments,
} from "@/services/MapService";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { from, to } = await searchParams;

  const parseParam = (
    param: string | string[] | null | undefined
  ): string | null => {
    if (Array.isArray(param) && typeof param[0] == "string") {
      return param[0];
    } else if (typeof param == "string" && param.length != 0) {
      return param;
    } else {
      return null;
    }
  };

  const getPoiDetails = (poiId: string | null) => {
    if (!poiId) return null;
    const poiContext = getPoiContext(poiId);
    if (!poiContext) return null;
    return poiContext;
  };

  const origin = parseParam(from);
  const destination = parseParam(to);

  function resolveView(origin: string | null, destination: string | null) {
    const poi = getPoiDetails(origin);
    const destinationPoi = getPoiDetails(destination);

    if (origin && destination) {
      const route = getRouteSegments(origin, destination);
      return { poi, route, destinationPoi };
    }

    return { poi, route: null, destinationPoi };
  }

  const { poi, route, destinationPoi } = resolveView(origin, destination);

  const buildings = getBuildings();
  const currentBuilding = (poi || destinationPoi)
    ? buildings.find((b) => b.id === (poi?.buildingId ?? destinationPoi?.buildingId))
    : buildings[0];
  const buildingFloors = currentBuilding?.floors ?? [];

  return (
    <MainView
      floors={buildingFloors}
      initialFloorId={poi?.floorId ?? destinationPoi?.floorId ?? null}
      originPoi={poi ?? null}
      destinationPoi={destinationPoi ?? null}
      routeSegments={route ?? null}
      buildingName={currentBuilding?.name}
    />
  );
}
