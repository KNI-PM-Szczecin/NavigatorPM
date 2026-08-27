import {
  buildingsById,
  floorsById,
  mapData,
  nodesById,
  poisById,
} from "@/data/mapStore";
import { generateSvgPath } from "@/utils/generateSvgPath";
import { pathfindingAlgorithm } from "@/utils/pathfinding";

import { AppLanguage } from "@/types/map";

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

/**
 *
 * @param lang AppLanguage optional parameter, fallbacks to "pl"
 * @returns poi list of a json object with id and name
 */
export function getPoisNameList(lang: AppLanguage = DEFAULT_LANGUAGE) {
  const visiblePois = mapData.pois.filter((p) => p.category !== "QR_CODE");
  const formattedPois = visiblePois.map((poi) => ({
    id: poi.id,
    name: poi.translations[lang]?.name ?? "No translation",
  }));

  return formattedPois;
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

export function getSVGRoute(originId: string, destinationId: string) {
  const originNodeId = poisById[originId] ? poisById[originId].nodeId : null;
  const destinationNodeId = poisById[destinationId]
    ? poisById[destinationId].nodeId
    : null;

  if (!originNodeId) {
    console.error(`Origin ID: ${originId} doesn't exist.`);
    return;
  }

  if (!destinationNodeId) {
    console.error(`Destination ID: ${destinationId} doesn't exist.`);
    return;
  }

  const nodes = pathfindingAlgorithm(
    originNodeId,
    destinationNodeId,
    mapData.nodes,
    mapData.edges,
    false
  );

  if (!nodes || nodes.length < 2) {
    console.error(`Path from ${originId} to ${destinationId} has no nodes`);
    return;
  }

  return generateSvgPath(nodes);
}

export function getPoiContext(
  qrId: string,
  lang: AppLanguage = DEFAULT_LANGUAGE
) {
  const poi = poisById[qrId];

  if (!poi) {
    console.error(`Poi with id ${qrId} was not found.`);
    return null;
  }

  // If there aren't any nodes or floors, return null. The Poi is invalid
  const node = nodesById[poi.nodeId];
  if (!node) {
    console.error(`Poi ${poi.nodeId} has no nodes`);
    return null;
  }

  const floor = floorsById[node.floorId];
  if (!floor) {
    console.error(`Node ${node.id} has no floors`);
    return null;
  }

  const building = buildingsById[floor.buildingId];
  if (!building) {
    console.error(
      `Floor ${floor.id} points at a missing building ${floor.buildingId}`
    );
    return null;
  }

  return {
    nodeId: poi.nodeId,
    floorId: node.floorId,
    buildingId: floor?.buildingId,
    mapImageUrl: floor?.mapImageUrl,
    poiName: poi.translations[lang]?.name,
    poiDescription: poi.translations[lang]?.description,
    floorName: floor.translations[lang]?.name,
    floorLevel: floor.level,
    userX: node.xCoordinate,
    userY: node.yCoordinate,
    buildingName: building.translations[lang]?.name,
  };
}
