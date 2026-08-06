import { Edge, Node } from "@/types/map";

function heuristic(nodeA: Node, nodeB: Node): number {
  // Using Euclidean distance as the heuristic
  const dx = nodeA.xCoordinate - nodeB.xCoordinate;
  const dy = nodeA.yCoordinate - nodeB.yCoordinate;
  const distance2D = Math.sqrt(dx * dx + dy * dy);

  const floorPenalty = nodeA.floorId === nodeB.floorId ? 0 : 500;

  return distance2D + floorPenalty;
}

export function findShortestPathAStar(
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

  const endNode = nodes.find((node) => node.id === endNodeId);
  if (!endNode) return null;

  const gScore = new Map<string, number>();
  const fScore = new Map<string, number>();
  const previousNodes = new Map<string, string | null>();
  const unvisited = new Set<string>();

  nodes.forEach((node) => {
    gScore.set(node.id, Infinity);
    fScore.set(node.id, Infinity);
    previousNodes.set(node.id, null);
    unvisited.add(node.id);
  });

  gScore.set(startNodeId, 0);
  fScore.set(
    startNodeId,
    heuristic(
      nodes.find((node) => node.id === startNodeId)!,
      endNode
    )
  );

  // Main loop of the A* algorithm
  while (unvisited.size > 0) {
    let currentNodeId: string | null = null;
    let currentFScore = Infinity;

    // Find the unvisited node with the smallest fScore
    unvisited.forEach((nodeId) => {
      const score = fScore.get(nodeId)!;
      if (score < currentFScore) {
        currentFScore = score;
        currentNodeId = nodeId;
      }
    });

    if (
      currentNodeId === null ||
      currentNodeId === endNodeId ||
      currentFScore === Infinity
    ) {
      break; // All remaining nodes are inaccessible or destination reached
    }

    unvisited.delete(currentNodeId);

    const neighbors = graph.get(currentNodeId) || [];
    for (const neighbor of neighbors) {
      if (!unvisited.has(neighbor.target)) {
        continue; // Skip already visited nodes
      }

      const tentativeGScore = gScore.get(currentNodeId)! + neighbor.weight;

      if (tentativeGScore < gScore.get(neighbor.target)!) {
        previousNodes.set(neighbor.target, currentNodeId);
        gScore.set(neighbor.target, tentativeGScore);

        const neighborNode = nodes.find((node) => node.id === neighbor.target)!;
        fScore.set(
          neighbor.target,
          tentativeGScore + heuristic(neighborNode, endNode)
        );
      }
    }
  }

  const pathIds: string[] = [];
  let current: string | null = endNodeId;

  while (current !== null) {
    pathIds.unshift(current);
    current = previousNodes.get(current) || null;
  }

  if (pathIds.length === 0 || pathIds[0] !== startNodeId) return null; // No path found

  return pathIds.map((id) => nodes.find((node) => node.id === id)!);
}
