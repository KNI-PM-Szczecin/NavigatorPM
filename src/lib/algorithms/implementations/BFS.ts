import { NavigationNode } from '@/types/manifest';
import { NavigationAlgorithm } from '../types';

export class BFSAlgorithm implements NavigationAlgorithm {
    readonly name = "BFS (Shortest steps)";
    readonly identifier = "BFS";

    findPath(nodes: NavigationNode[], startIdRaw: string, endIdRaw: string): string[] {
        const startId = String(startIdRaw || '').trim();
        const endId = String(endIdRaw || '').trim();
        
        const adj = new Map<string, Set<string>>();
        nodes.forEach(n => {
            const id = n.qrId.trim();
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

        const queue: string[] = [startId];
        const visited = new Set<string>([startId]);
        const cameFrom = new Map<string, string>();

        while (queue.length > 0) {
            const current = queue.shift()!;

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
                    queue.push(neighbor);
                }
            }
        }
        return [];
    }
}
