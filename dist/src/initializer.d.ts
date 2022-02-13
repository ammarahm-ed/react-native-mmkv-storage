export declare const currentInstancesStatus: {
    [name: string]: boolean;
};
/**
 * Get current instance ID status for instances
 * loaded since application started
 */
export declare function getCurrentMMKVInstanceIDs(): {
    [x: string]: boolean;
};
/**
 *
 * Initialize function is used to create
 * the storage or load the storage if
 * it already exists with the given options.
 *
 */
export declare function initialize(id: string): boolean;
//# sourceMappingURL=initializer.d.ts.map