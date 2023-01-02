import encryption from './encryption';
import EventManager from './eventmanager';
import indexer from './indexer/indexer';
import transactions from './transactions';
import { DataType, GenericReturnType, StorageOptions } from './types';
export default class MMKVInstance {
    transactions: transactions;
    instanceID: string;
    encryption: encryption;
    indexer: indexer;
    ev: EventManager;
    options: StorageOptions;
    constructor(id: string);
    /**
     * Set a string value to storage for the given key.
     * This method is added for redux-persist/zustand support.
     *
     */
    setItem(key: string, value: string, callback?: (err?: Error | null) => void): Promise<unknown>;
    /**
     * Get the string value for the given key.
     * This method is added for redux-persist/zustand support.
     */
    getItem(key: string, callback?: (error?: Error | null, result?: string | null) => void): Promise<unknown>;
    /**
     * Set a string value to storage for the given key.
     */
    setStringAsync(key: string, value: string): Promise<boolean | null | undefined>;
    /**
     * Get the string value for the given key.
     */
    getStringAsync(key: string): Promise<string | null | undefined>;
    /**
     * Set a number value to storage for the given key.
     */
    setIntAsync(key: string, value: number): Promise<boolean | null | undefined>;
    /**
     * Get the number value for the given key.
     */
    getIntAsync(key: string): Promise<number | null | undefined>;
    /**
     * Set a boolean value to storage for the given key.
     *
     */
    setBoolAsync(key: string, value: boolean): Promise<boolean | null | undefined>;
    /**
     * Get the boolean value for the given key.
     */
    getBoolAsync(key: string): Promise<boolean | null | undefined>;
    /**
     * Set an Object to storage for the given key.
     *
     * Note that this function does **not** work with the Map data type.
     *
     */
    setMapAsync(key: string, value: object): Promise<boolean | null | undefined>;
    /**
     * Get then Object from storage for the given key.
     */
    getMapAsync<T>(key: string): Promise<T | null | undefined>;
    /**
     * Retrieve multiple items for the given array of keys.
     */
    getMultipleItemsAsync<T>(keys: string[], type: DataType | 'map'): Promise<GenericReturnType<T>[]>;
    /**
     * Set an array to storage for the given key.
     */
    setArrayAsync(key: string, value: any[]): Promise<boolean | null | undefined>;
    /**
     * Get the array from the storage for the given key.
     */
    getArrayAsync<T>(key: string): Promise<T[] | null | undefined>;
    /**
     * Set a string value to storage for the given key.
     */
    setString: (key: string, value: string) => boolean | null | undefined;
    /**
     * Get the string value for the given key.
     */
    getString: (key: string, callback?: ((error: any, value: string | undefined | null) => void) | undefined) => string | null | undefined;
    /**
     * Set a number value to storage for the given key.
     */
    setInt: (key: string, value: number) => boolean | null | undefined;
    /**
     * Get the number value for the given key
     */
    getInt: (key: string, callback?: ((error: any, value: number | undefined | null) => void) | undefined) => number | null | undefined;
    /**
     * Set a boolean value to storage for the given key
     */
    setBool: (key: string, value: boolean) => boolean | null | undefined;
    /**
     * Get the boolean value for the given key.
     */
    getBool: (key: string, callback?: ((error: any, value: boolean | undefined | null) => void) | undefined) => boolean | null | undefined;
    /**
     * Set an Object to storage for a given key.
     *
     * Note that this function does **not** work with the Map data type
     */
    setMap: (key: string, value: object) => boolean | null | undefined;
    /**
     * Get an Object from storage for a given key.
     */
    getMap: <T>(key: string, callback?: ((error: any, value: T | null | undefined) => void) | undefined) => T | null;
    /**
     * Set an array to storage for the given key.
     */
    setArray: (key: string, value: any[]) => boolean | null | undefined;
    /**
     * get an array from the storage for give key.
     */
    getArray: <T>(key: string, callback?: ((error: any, value: T[] | null | undefined) => void) | undefined) => T[] | null;
    /**
     * Retrieve multiple items for the given array of keys.
     *
     */
    getMultipleItems: <T>(keys: string[], type: DataType | 'map') => GenericReturnType<T>[];
    /**
     *
     * Get all Storage Instance IDs that are currently loaded.
     *
     */
    getCurrentMMKVInstanceIDs(): {
        [x: string]: boolean;
    };
    /**
     *
     * Get all Storage Instance IDs.
     *
     */
    getAllMMKVInstanceIDs(): string[];
    /**
     * Remove an item from storage for a given key.
     *
     */
    removeItem(key: string): boolean | undefined;
    /**
     * Remove all keys and values from storage.
     */
    clearStore(): boolean | null | undefined;
    /**
     * Get the key and alias for the encrypted storage
     */
    getKey(): {
        alias: string | null;
        key: string | null;
    };
    /**
     * Clear memory cache of the current MMKV instance
     */
    clearMemoryCache(): boolean | null | undefined;
}
//# sourceMappingURL=mmkvinstance.d.ts.map