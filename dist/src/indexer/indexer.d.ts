import stringsIndex from './strings';
import numbersIndex from './numbers';
import boolIndex from './booleans';
import mapsIndex from './maps';
import arrayIndex from './arrays';
export default class indexer {
    instanceID: string;
    strings: stringsIndex;
    numbers: numbersIndex;
    booleans: boolIndex;
    maps: mapsIndex;
    arrays: arrayIndex;
    constructor(id: string);
    /**
     * Get all keys from storage.
     *
     */
    getKeys(): Promise<string[] | null | undefined>;
    /**
     * Check if a key exists in storage.
     */
    hasKey(key: string): boolean | null | undefined;
}
//# sourceMappingURL=indexer.d.ts.map