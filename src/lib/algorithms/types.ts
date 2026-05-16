import { NavigationNode } from '@/types/manifest';

export interface NavigationAlgorithm {
    readonly name: string;
    readonly identifier: string;
    findPath(nodes: NavigationNode[], startId: string, endId: string): string[];
}
