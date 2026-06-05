import { NavigationNode } from '@/types/manifest';
import { algorithmRegistry } from './algorithms/registry';

export type Algorithm = 'A-star' | 'Dijkstra' | 'BFS' | 'Greedy';

export function findPath(
    nodes: NavigationNode[],
    startId: string,
    endId: string,
    algorithmIdentifier: Algorithm = 'A-star'
): string[] {
    const algorithm = algorithmRegistry.getAlgorithm(algorithmIdentifier);
    
        const activeAlgo = algorithm || algorithmRegistry.getAlgorithm('A-star');
    
    if (!activeAlgo) {
        console.error("No pathfinding algorithms registered.");
        return [];
    }

    console.log(`Using algorithm: ${activeAlgo.name} to find path from ${startId} to ${endId}`);
    
    const path = activeAlgo.findPath(nodes, startId, endId);
    console.log("Algorithm result:", path);
    
    return path;
}
