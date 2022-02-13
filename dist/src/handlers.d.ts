/**
 *
 * A handler function used to handle all the
 * calls made to native code. The purpose is
 * to make sure that the storage is initialized
 * before any read/write requests are sent to the
 * MMKV instance.
 *
 *
 * @param action The native function that will be called
 * @param args Arguments for the native function
 */
export declare function handleAction<T extends (...args: any[]) => any | undefined | null>(action: T, ...args: any[]): ReturnType<T> | undefined | null;
/**
 *
 * A handler function used to handle all the
 * calls made to native code. The purpose is
 * to make sure that the storage is initialized
 * before any read/write requests are sent to the
 * MMKV instance.
 *
 *
 * @param action The native function that will be called
 * @param args Arguments for the native function
 */
export declare function handleActionAsync<T extends (...args: any[]) => any | undefined | null>(action: T, ...args: any[]): Promise<ReturnType<T> | undefined | null>;
//# sourceMappingURL=handlers.d.ts.map