import {
  buildingsById,
  floorsById,
  mapData,
  nodesById,
  poisById,
} from "@/data/mapStore";

export type AppLanguage = "pl" | "en" | "uk";

const SUPPORTED_LANGUAGES: AppLanguage[] = ["pl", "en", "uk"];
const DEFAULT_LANGUAGE: AppLanguage = "pl";

/**
 * Replaces Accept-Language header with AppLanguage object.
 * @param acceptLanguage Raw HTTP header value, can be null
 * @returns AppLanguage object, fallbacks to "pl"
 */
export function parseLanguage(acceptLanguage: string | null): AppLanguage {
  if (!acceptLanguage) return DEFAULT_LANGUAGE;

  const rawLang = acceptLanguage.toLowerCase();
  const matchedLang = SUPPORTED_LANGUAGES.find((lang) =>
    rawLang.includes(lang)
  );

  return matchedLang || DEFAULT_LANGUAGE;
}

export function getBuildings(lang: AppLanguage = DEFAULT_LANGUAGE) {
  const result = mapData.buildings.map((building) => {
    const bTrans =
      building.translations[lang] || building.translations[DEFAULT_LANGUAGE];

    const buildingFloors = mapData.floors.filter(
      (f) => f.buildingId === building.id
    );

    const formattedFloors = buildingFloors.map((floor) => {
      const fTrans =
        floor.translations[lang] || floor.translations[DEFAULT_LANGUAGE];

      return {
        id: floor.id,
        level: floor.level,
        mapImageUrl: floor.mapImageUrl,
        name: fTrans?.name || `Poziom ${floor.level}`,
      };
    });

    formattedFloors.sort((a, b) => a.level - b.level);

    return {
      id: building.id,
      address: building.address,
      name: bTrans?.name || "Brak nazwy",
      floors: formattedFloors,
    };
  });

  return result;
}

export function getNode(id: string) {
  const node = nodesById[id];

  if (!node) {
    console.log(`Node ${id} was not found.`);
    return null;
  }

  return node;
}

export function getPois(lang: AppLanguage = DEFAULT_LANGUAGE) {
  const visiblePois = mapData.pois.filter((p) => p.category !== "QR_CODE");

  const formattedPois = visiblePois.map((poi) => {
    const poiTrans =
      poi.translations[lang] || poi.translations[DEFAULT_LANGUAGE];

    const node = nodesById[poi.nodeId];
    const floorId = node ? node.floorId : null;
    const floor = floorId ? floorsById[floorId] : null;

    return {
      id: poi.id,
      nodeId: poi.nodeId,
      floorId: floorId,
      buildingId: floor?.buildingId,
      category: poi.category,
      subCategory: poi.subCategory,
      name: poiTrans?.name || null,
      description: poiTrans?.description || null,
    };
  });

  return formattedPois;
}

export function getMapData() {
  return {
    nodes: mapData.nodes,
    edges: mapData.edges,
  };
}

export function getQrContext(
  qrId: string,
  lang: AppLanguage = DEFAULT_LANGUAGE
) {
  const qrPoi = poisById[qrId];

  if (!qrPoi || qrPoi.category !== "QR_CODE") {
    return null;
  }

  // If there aren't any nodes or floors, return null. The QR code is invalid
  const node = nodesById[qrPoi.nodeId];
  if (!node) return null;

  const floor = floorsById[node.floorId];
  if (!floor) return null;

  // Building can be null
  const building = buildingsById[floor.buildingId];

  return {
    nodeId: qrPoi.nodeId,
    floorId: node.floorId,
    buildingId: floor?.buildingId,
    mapImageUrl: floor?.mapImageUrl,
    poiName: qrPoi.translations[lang]?.name,
    poiDescription: qrPoi.translations[lang]?.description,
    floorName: floor.translations[lang]?.name,
    floorLevel: floor.level,
    userX: node.xCoordinate,
    userY: node.yCoordinate,
    buildingName: building.translations[lang]?.name,
  };
}
