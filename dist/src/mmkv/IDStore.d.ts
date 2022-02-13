export declare type StorageInstanceInfo = {
    encrypted: boolean;
    id: string;
    alias: string;
};
/**
 *	Store instance properties that we will use later to
 *  load the storage again.
 */
declare function add(id: string, encrypted?: boolean, alias?: string | null): void;
/**
 * Check if the storage instance with the given ID is encrypted or not.
 */
declare function encrypted(id: string): boolean;
/**
 * Get the alias for the storage which we used
 * to store the crypt key in secure storage.
 * @param {string} id instance id
 */
declare function getAlias(id: string): string | null;
/**
 * Check if an instance is already present in the store.
 * @param {string} id instance id
 */
declare function exists(id: string): boolean;
/**
 * Get all the available instances that
 * were loaded since the app was installed.
 */
declare function getAll(): never[] | {
    [name: string]: StorageInstanceInfo;
};
/**
 * Get all the instance ids for instances
 * that were loaded since the app was installed
 */
declare function getAllMMKVInstanceIDs(): string[];
declare const _default: {
    getAll: typeof getAll;
    getAlias: typeof getAlias;
    getAllMMKVInstanceIDs: typeof getAllMMKVInstanceIDs;
    add: typeof add;
    exists: typeof exists;
    encrypted: typeof encrypted;
    STORE_ID: string;
};
export default _default;
//# sourceMappingURL=IDStore.d.ts.map