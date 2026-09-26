import SearchMenu from "@/components/search-menu";
import BuildingMap from "@/components/building-map";
import SafeArea from "@/components/safe-area";
import {
  getPoisNameList,
  getPoiContext,
  getRouteSegments,
  getBuildings,
} from "@/services/MapService";
import Pill from "@/components/pill";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { from, to } = await searchParams;

  const getPoiDetails = (poiId: string | null) => {
    if (!poiId) return null;
    const poiContext = getPoiContext(poiId);
    if (!poiContext) return null;
    return poiContext;
  };

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

  const origin = parseParam(from);
  const destination = parseParam(to);

  function resolveView(origin: string | null, destination: string | null) {
    if (!origin) {
      return { poi: null, route: null, destinationPoi: null };
    }
    const poi = getPoiDetails(origin);
    if (!destination) {
      return { poi, route: null, destinationPoi: null };
    }
    const route = getRouteSegments(origin, destination);
    const destinationPoi = getPoiDetails(destination);
    return { poi, route: route, destinationPoi };
  }

  const { poi, route, destinationPoi } = resolveView(origin, destination);
  const startPosition =
    origin && poi
      ? { id: origin, name: poi.poiName ?? "No translation" }
      : null;

  const pois = getPoisNameList();
  
  const buildings = getBuildings();
  const currentBuilding = poi ? buildings.find(b => b.id === poi.buildingId) : buildings[0];
  const buildingFloors = currentBuilding?.floors ?? [];

  return (
    <div className="relative h-dvh w-full overflow-hidden">
      <BuildingMap
        floors={buildingFloors}
        initialFloorId={poi?.floorId ?? null}
        originPoi={poi ?? null}
        destinationPoi={destinationPoi ?? null}
        routeSegments={route ?? null}
      />
      <SafeArea className="pointer-events-none relative h-screen w-screen">
        <Pill buildingName={poi?.buildingName ?? null} />
        <SearchMenu
          startPosition={startPosition ?? null}
          poiList={pois ?? null}
        />
      </SafeArea>
    </div>
  );
}
