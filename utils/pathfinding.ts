import { findShortestPathAStar } from "@/utils/aStar";
import { findShortestPathDijkstra } from "@/utils/djikstra";

const algorithms = {
  dijkstra: findShortestPathDijkstra,
  astar: findShortestPathAStar,
};

// change it to change the algorithm (why? for fun.)
export const pathfindingAlgorithm = algorithms.dijkstra;
