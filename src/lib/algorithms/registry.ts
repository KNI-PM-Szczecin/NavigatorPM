import { NavigationAlgorithm } from './types';
import { allAlgorithms } from './index';

class AlgorithmRegistry {
    private algorithms: Map<string, NavigationAlgorithm> = new Map();

    constructor() {
        allAlgorithms.forEach(algo => this.register(algo));
    }

    private register(algo: NavigationAlgorithm) {
        this.algorithms.set(algo.identifier, algo);
    }

    getAlgorithm(identifier: string): NavigationAlgorithm | undefined {
        return this.algorithms.get(identifier);
    }

    getAvailableAlgorithms(): { identifier: string, name: string }[] {
        return Array.from(this.algorithms.values()).map(a => ({
            identifier: a.identifier,
            name: a.name
        }));
    }
}

export const algorithmRegistry = new AlgorithmRegistry();
