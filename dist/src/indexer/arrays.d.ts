/**
 * Index of all array values stored in storage
 */
export default class arrayIndex {
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
     * Get all arrays from storage.
     */
    getAll<T>(): Promise<unknown>;
}
//# sourceMappingURL=arrays.d.ts.map