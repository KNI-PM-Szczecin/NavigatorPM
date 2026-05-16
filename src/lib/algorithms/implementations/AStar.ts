import { NavigationNode } from '@/types/manifest';
import { NavigationAlgorithm } from '../types';

export class AStarAlgorithm implements NavigationAlgorithm {
    readonly name = "A* (A-Star)";
    readonly identifier = "A-star";

    private getDistance(a: { x: number, y: number }, b: { x: number, y: number }): number {
        return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
    }

    findPath(nodes: NavigationNode[], startIdRaw: string, endIdRaw: string): string[] {
        const startId = String(startIdRaw || '').trim();
        const endId = String(endIdRaw || '').trim();
        
        console.log(`[A*] Starting search: ${startId} -> ${endId}`);
        
        const nodeMap = new Map<string, any>();
        const adj = new Map<string, Set<string>>();

                nodes.forEach((n: any) => {
            const id = (n.qrId || n.qr_id || "").trim();
            if (!id) return;
            nodeMap.set(id, n);
            if (!adj.has(id)) adj.set(id, new Set());
            
            const connections = n.connections || [];
            connections.forEach((c: string) => {
                const cid = c.trim();
                if (!cid || cid === id) return;
                adj.get(id)!.add(cid);
                                if (!adj.has(cid)) adj.set(cid, new Set());
                adj.get(cid)!.add(id);
            });
        });

        if (!nodeMap.has(startId) || !nodeMap.has(endId)) return [];

                const openSet: string[] = [startId];
        const closedSet = new Set<string>();
        const cameFrom = new Map<string, string>();
        
        const gScore = new Map<string, number>();
        const fScore = new Map<string, number>();

        nodeMap.forEach((_, id) => {
            gScore.set(id, Infinity);
            fScore.set(id, Infinity);
        });

        gScore.set(startId, 0);
        fScore.set(startId, this.getDistance(nodeMap.get(startId), nodeMap.get(endId)));

        let iterations = 0;
        while (openSet.length > 0) {
            iterations++;
            if (iterations > 3000) break; 
                        openSet.sort((a, b) => (fScore.get(a) || Infinity) - (fScore.get(b) || Infinity));
            const currentId = openSet.shift()!;

            if (currentId === endId) {
                const path = [currentId];
                let curr = currentId;
                while (cameFrom.has(curr)) {
                    curr = cameFrom.get(curr)!;
                    path.unshift(curr);
                }
                return path;
            }

            closedSet.add(currentId);

            const neighbors = adj.get(currentId) || new Set();
            for (const neighborId of neighbors) {
                if (closedSet.has(neighborId)) continue;

                const neighborNode = nodeMap.get(neighborId);
                if (!neighborNode) continue;

                const tentativeGScore = (gScore.get(currentId) ?? Infinity) + this.getDistance(nodeMap.get(currentId), neighborNode);

                if (tentativeGScore < (gScore.get(neighborId) ?? Infinity)) {
                    cameFrom.set(neighborId, currentId);
                    gScore.set(neighborId, tentativeGScore);
                    fScore.set(neighborId, tentativeGScore + this.getDistance(neighborNode, nodeMap.get(endId)));

                    if (!openSet.includes(neighborId)) {
                        openSet.push(neighborId);
                    }
                }
            }
        }

        return [];
    }
}
