import { NavigationNode } from '@/types/manifest';
import { NavigationAlgorithm } from '../types';

export class GreedyAlgorithm implements NavigationAlgorithm {
    readonly name = "Greedy (Fastest)";
    readonly identifier = "Greedy";

    private getDistance(a: { x: number, y: number }, b: { x: number, y: number }): number {
        return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
    }

    findPath(nodes: NavigationNode[], startIdRaw: string, endIdRaw: string): string[] {
        const startId = String(startIdRaw || '').trim();
        const endId = String(endIdRaw || '').trim();
        
        const nodeMap = new Map<string, NavigationNode>();
        const adj = new Map<string, Set<string>>();

        nodes.forEach(n => {
            const id = n.qrId.trim();
            nodeMap.set(id, n);
            if (!adj.has(id)) adj.set(id, new Set());
            if (n.connections) {
                n.connections.forEach(c => {
                    const cid = c.trim();
                    adj.get(id)!.add(cid);
                    if (!adj.has(cid)) adj.set(cid, new Set());
                    adj.get(cid)!.add(id);
                });
            }
        });

        const targetNode = nodeMap.get(endId);
        if (!targetNode) return [];

        const openSet: string[] = [startId];
        const cameFrom = new Map<string, string>();
        const visited = new Set<string>([startId]);

        while (openSet.length > 0) {
                        openSet.sort((a, b) => {
                const nodeA = nodeMap.get(a)!;
                const nodeB = nodeMap.get(b)!;
                return this.getDistance(nodeA, targetNode) - this.getDistance(nodeB, targetNode);
            });

            const current = openSet.shift()!;

            if (current === endId) {
                const path = [current];
                let temp = current;
                while (cameFrom.has(temp)) {
                    temp = cameFrom.get(temp)!;
                    path.unshift(temp);
                }
                return path;
            }

            const neighbors = adj.get(current) || new Set();
            for (const neighbor of neighbors) {
                if (!visited.has(neighbor)) {
                    visited.add(neighbor);
                    cameFrom.set(neighbor, current);
                    openSet.push(neighbor);
                }
            }
        }
        return [];
    }
}
