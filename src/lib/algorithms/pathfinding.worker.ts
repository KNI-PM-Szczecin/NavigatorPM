import { findPath } from '../navigation';

self.onmessage = (e: MessageEvent) => {
    const { nodes, startId, endId, algorithmIdentifier } = e.data;
    try {
        const path = findPath(nodes, startId, endId, algorithmIdentifier);
        self.postMessage({ success: true, path });
    } catch (error: any) {
        self.postMessage({ success: false, error: error?.message || String(error) });
    }
};

export {};
