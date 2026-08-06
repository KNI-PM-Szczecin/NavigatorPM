import { Edge, Node } from "@/types/map";

export function findShortestPathDijkstra(
  startNodeId: string,
  endNodeId: string,
  nodes: Node[],
  edges: Edge[],
  isWheelchairAccessible: boolean
): Node[] | null {
  // Filter edges based on accessibility if required
  const validEdges = isWheelchairAccessible
    ? edges.filter((edge) => edge.isAccessible)
    : edges;

  // Set up the graph as an adjacency list
  const graph = new Map<string, { target: string; weight: number }[]>();
  nodes.forEach((node) => graph.set(node.id, []));

  validEdges.forEach((edge) => {
    if (graph.has(edge.nodeAId) && graph.has(edge.nodeBId)) {
      graph
        .get(edge.nodeAId)!
        .push({ target: edge.nodeBId, weight: edge.weight });
      graph
        .get(edge.nodeBId)!
        .push({ target: edge.nodeAId, weight: edge.weight });
    }
  });

  //   Set up the distances and previous nodes maps
  const distances = new Map<string, number>();
  const previousNodes = new Map<string, string | null>();
  const unvisitedNodes = new Set<string>();

  nodes.forEach((node) => {
    distances.set(node.id, Infinity);
    previousNodes.set(node.id, null);
    unvisitedNodes.add(node.id);
  });

  distances.set(startNodeId, 0);

  // Main loop of Dijkstra's algorithm
  while (unvisitedNodes.size > 0) {
    let currentNodeId: string | null = null;
    let currentDistance = Infinity;

    // Find the unvisited node with the smallest distance
    unvisitedNodes.forEach((nodeId) => {
      const distance = distances.get(nodeId)!;
      if (distance < currentDistance) {
        currentDistance = distance;
        currentNodeId = nodeId;
      }
    });

    if (currentNodeId === null || currentDistance === Infinity) {
      break; // All remaining nodes are inaccessible
    }

    if (currentNodeId === endNodeId) {
      break; // Reached the destination node
    }

    unvisitedNodes.delete(currentNodeId);

    const neighbors = graph.get(currentNodeId) || [];
    for (const neighbor of neighbors) {
      if (!unvisitedNodes.has(neighbor.target)) {
        continue; // Skip already visited nodes
      }

      const newDistance = currentDistance + neighbor.weight;
      if (newDistance < distances.get(neighbor.target)!) {
        distances.set(neighbor.target, newDistance);
        previousNodes.set(neighbor.target, currentNodeId);
      }
    }
  }

  const pathIds: string[] = [];
  let currentNodeId: string | null = endNodeId;

  while (currentNodeId !== null) {
    pathIds.unshift(currentNodeId);
    currentNodeId = previousNodes.get(currentNodeId) || null;
  }

  if (pathIds.length === 0 || pathIds[0] !== startNodeId) return null; // No path found

  return pathIds.map((id) => nodes.find((node) => node.id === id)!);
}
