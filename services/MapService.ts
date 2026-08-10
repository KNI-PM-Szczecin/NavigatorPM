import { mapData, nodesById, poisById } from "@/data/mapStore";

export type AppLanguage = "pl" | "en" | "uk";

const SUPPORTED_LANGUAGES: AppLanguage[] = ["pl", "en", "uk"];
const DEFAULT_LANGUAGE: AppLanguage = "pl";

export function parseLanguage(acceptLanguage: string | null): AppLanguage {
  if (!acceptLanguage) return DEFAULT_LANGUAGE;

  const rawLang = acceptLanguage.toLowerCase();
  const matchedLang = SUPPORTED_LANGUAGES.find((lang) =>
    rawLang.includes(lang)
  );

  return matchedLang || DEFAULT_LANGUAGE;
}

export function getBuildings(lang: AppLanguage = DEFAULT_LANGUAGE) {
  try {
    const result = mapData.buildings.map((building) => {
      const bTransList = mapData.buildingTranslations.filter(
        (t) => t.buildingId === building.id
      );

      const bTrans =
        bTransList.find((t) => t.language === lang) ||
        bTransList.find((t) => t.language === DEFAULT_LANGUAGE);

      const buildingFloors = mapData.floors.filter(
        (f) => f.buildingId === building.id
      );

      const formattedFloors = buildingFloors.map((floor) => {
        const fTransList = mapData.floorTranslations.filter(
          (t) => t.floorId === floor.id
        );

        const fTrans =
          fTransList.find((t) => t.language === lang) ||
          fTransList.find((t) => t.language === DEFAULT_LANGUAGE);

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
        description: bTrans?.description || null,
        floors: formattedFloors,
      };
    });

    return result;
  } catch (error) {
    console.error("Error fetching buildings:", error);
    return [];
  }
}

export function getPois(lang: AppLanguage = DEFAULT_LANGUAGE) {
  try {
    const visiblePois = mapData.pois.filter((p) => p.category !== "QR_CODE");

    const formattedPois = visiblePois.map((poi) => {
      let poiTranslation = mapData.poiTranslations.find(
        (t) => t.poiId === poi.id && t.language === lang
      );

      if (!poiTranslation) {
        poiTranslation = mapData.poiTranslations.find(
          (t) => t.poiId === poi.id && t.language === DEFAULT_LANGUAGE
        );
      }

      return {
        id: poi.id,
        nodeId: poi.nodeId,
        category: poi.category,
        subCategory: poi.subCategory,
        name: poiTranslation?.name || null,
        description: poiTranslation?.description || null,
      };
    });

    return formattedPois;
  } catch (error) {
    console.error("Error fetching POIs:", error);
    return [];
  }
}

export function getMapData() {
  try {
    return {
      nodes: mapData.nodes,
      edges: mapData.edges,
    };
  } catch (error) {
    console.error("Error fetching map data:", error);
    return {
      nodes: [],
      edges: [],
    };
  }
}

export function getQrContext(qrId: string) {
  try {
    const qrPoi = poisById[qrId];

    if (!qrPoi || qrPoi.category !== "QR_CODE") {
      return null;
    }

    const node = nodesById[qrPoi.nodeId];
    if (!node) {
      return null;
    }

    const floor = mapData.floors.find((f) => f.id === node.floorId);

    return {
      nodeId: qrPoi.nodeId,
      floorId: node.floorId,
      buildingId: floor?.buildingId,
      mapImageUrl: floor?.mapImageUrl,
    };
  } catch (error) {
    console.error("Error fetching QR context:", error);
    return null;
  }
}
