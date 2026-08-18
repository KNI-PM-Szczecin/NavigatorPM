import SearchMenu from "@/components/search-menu";
import BuildingMap from "@/components/building-map";
import SafeArea from "@/components/safe-area";
import { getPoisNameList, getQrContext } from "@/services/MapService";
import Pill from "@/components/pill";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { from } = await searchParams;
  let initialLocation: string | null = "";

  const getQRCodeDetails = (poiId: string | null) => {
    if (!poiId) return null;
    const qrContext = getQrContext(poiId);
    if (!qrContext) return null;
    return qrContext;
  };

  if (Array.isArray(from)) {
    initialLocation = from[0];
  } else if (typeof from == "string") {
    initialLocation = from;
  } else {
    initialLocation = null;
  }

  const qr = getQRCodeDetails(initialLocation);
  const startPosition =
    initialLocation && qr
      ? { id: initialLocation, name: qr.poiName ?? "No translation" }
      : null;

  const pois = getPoisNameList();

  return (
    <div className="relative h-dvh w-full overflow-hidden">
      <BuildingMap
        initialFloorUrl={qr?.mapImageUrl ?? null}
        userX={qr?.userX ?? null}
        userY={qr?.userY ?? null}
      />
      <SafeArea className="pointer-events-none relative h-screen w-screen">
        <Pill buildingName={qr?.buildingName ?? null} />
        <SearchMenu
          startPosition={startPosition ?? null}
          poiList={pois ?? null}
        />
      </SafeArea>
    </div>
  );
}
