import { AStarAlgorithm } from './implementations/AStar';
import { BFSAlgorithm } from './implementations/BFS';
import { DijkstraAlgorithm } from './implementations/Dijkstra';
import { GreedyAlgorithm } from './implementations/Greedy';

export const allAlgorithms = [
    new AStarAlgorithm(),
    new BFSAlgorithm(),
    new DijkstraAlgorithm(),
    new GreedyAlgorithm(),
];
