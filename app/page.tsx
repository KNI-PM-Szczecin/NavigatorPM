import SearchMenu from "@/components/search-menu";
import BuildingMap from "@/components/building-map";
import SafeArea from "@/components/safe-area";
import {
  getPoisNameList,
  getPoiContext,
  getSVGRoute,
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

  /**
   * This function exist to ensure that nobody appends multiple arguments to a single search param.
   * @param param searchParam that can be a string, a list or null
   * @returns parameter string or null
   */
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

  // There are 3 posibilities
  // Posibility 1: no props - user entered by url
  // Posibility 2: from prop is present, to prop is missing - user entered by qr code
  // Posibility 3: both from and to props are present - user is displaying route from a to b
  const origin = parseParam(from);
  const destination = parseParam(to);

  function resolveView(origin: string | null, destination: string | null) {
    if (!origin) {
      console.log("No origin");
      return { qr: null, route: null }; // 1
    }
    const poi = getPoiDetails(origin);
    if (!destination) {
      console.log("No destination");
      return { poi, route: null }; // 2
    }
    const route = getSVGRoute(origin, destination);
    return { poi, route: route }; // 3
  }

  const { poi, route } = resolveView(origin, destination);
  const startPosition =
    origin && poi
      ? { id: origin, name: poi.poiName ?? "No translation" }
      : null;

  if (route != null) {
  }
  // This executes regardless of params
  const pois = getPoisNameList();

  return (
    <div className="relative h-dvh w-full overflow-hidden">
      <BuildingMap
        initialFloorUrl={poi?.mapImageUrl ?? null}
        userX={poi?.userX ?? null}
        userY={poi?.userY ?? null}
        route={route ?? null}
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
