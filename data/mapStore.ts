import { MapData } from "@/types/map";
import mapDataRaw from "./map.json";

/**
 * This file maps every type from map.ts to it's own dictionaries so you don't have
 * to traverse the whole list to get one node.
 */

export const mapData: MapData = mapDataRaw;

function indexById<T extends { id: string }>(items: T[]): Record<string, T> {
  return Object.fromEntries(items.map((item) => [item.id, item]));
}

export const buildingsById = indexById(mapData.buildings);
export const floorsById = indexById(mapData.floors);
export const nodesById = indexById(mapData.nodes);
export const poisById = indexById(mapData.pois);
