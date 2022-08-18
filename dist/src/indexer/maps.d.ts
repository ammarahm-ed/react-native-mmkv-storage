import type { JsonReviver } from '../types';
/**
 * Index of all objects stored in storage.
 */
export default class mapsIndex {
    instanceID: string;
    constructor(id: string);
    /**
     *
     * Get all keys
     */
    getKeys(): Promise<string[] | null | undefined>;
    /**
     * Check if a key exists.
     */
    hasKey(key: string): boolean | null | undefined;
    /**
     * Get all objects stored in storage.
     */
    getAll<T>(reviver?: JsonReviver): Promise<unknown>;
}
//# sourceMappingURL=maps.d.ts.map