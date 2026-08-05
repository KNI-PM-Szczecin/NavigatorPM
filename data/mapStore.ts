import { MapData } from "@/types/map";
import mapDataRaw from "./map.json";

export const mapData = mapDataRaw as MapData;

export const poisById = mapData.pois.reduce(
  (acc, poi) => {
    acc[poi.id] = poi;
    return acc;
  },
  {} as Record<string, (typeof mapData.pois)[0]>
);

export const nodesById = mapData.nodes.reduce(
  (acc, node) => {
    acc[node.id] = node;
    return acc;
  },
  {} as Record<string, (typeof mapData.nodes)[0]>
);

export const edgesByNodeId = mapData.edges.reduce(
  (acc, edge) => {
    if (!acc[edge.nodeAId]) acc[edge.nodeAId] = [];
    acc[edge.nodeAId].push(edge);

    if (!acc[edge.nodeBId]) acc[edge.nodeBId] = [];
    acc[edge.nodeBId].push(edge);

    return acc;
  },
  {} as Record<string, typeof mapData.edges>
);
