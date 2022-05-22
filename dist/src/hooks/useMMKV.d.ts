import MMKVInstance from '../mmkvinstance';
/**
 * A helper function which returns `useMMKVStorage` hook with a storage instance set.
 *
 * ```tsx
 * import MMKVStorage, {create} from "react-native-mmkv-storage"
 *
 * const storage = new MMKVStorage.Loader().initialize();
 * const useStorage = create(storage);
 *
 * // Then later in your component
 * const App = () => {
 *  const [value, setValue] = useStorage("key");
 *
 * ...
 * }
 * ```
 * Documentation: https://rnmmkv.vercel.app/#/usemmkvstorage
 *
 * @param storage The storage instance
 * @returns `useMMKVStorage` hook
 */
export declare const create: CreateType;
/**
 * Types curried function to return differently based on the
 * absence of the `defaultValue` parameter.
 * @see {@link UseMMKVStorageType}
 */
declare type CreateType = (storage: MMKVInstance) => {
    <T = undefined>(key: string): [
        value: T | undefined,
        setValue: (value: (T | undefined) | ((prevValue: T | undefined) => T | undefined)) => void
    ];
    <T>(key: string, defaultValue: T): [
        value: T,
        setValue: (value: T | ((prevValue: T) => T)) => void
    ];
};
/**
 *
 * useMMKVStorage Hook is like a persisted state that will always write every change in storage and update your app UI instantly.
 * It doesn’t matter if you reload the app or restart it. Everything will be in place on app load.
 *
 * ```tsx
 * import MMKVStorage from "react-native-mmkv-storage"
 *
 * const MMKV = new MMKVStorage.Loader().initialize();
 *
 * // Then later in your component
 * const App = () => {
 * const [user, setUser] = useMMKVStorage("user", MMKV, "robert");
 *
 * ...
 * };
 * ```
 * Documentation: https://rnmmkv.vercel.app/#/usemmkvstorage
 *
 * @param key The key against which the hook should update
 * @param storage The storage instance
 * @param defaultValue Default value if any
 *
 * @returns `[value,setValue]`
 */
export declare const useMMKVStorage: UseMMKVStorageType;
/**
 * Uses typescript's {@link https://www.typescriptlang.org/docs/handbook/interfaces.html#function-types anonymous function overloading}
 * to mimic React's `useState` typing.
 */
declare type UseMMKVStorageType = {
    <T = undefined>(key: string, storage: MMKVInstance): [
        value: T | undefined,
        setValue: (value: (T | undefined) | ((prevValue: T | undefined) => T | undefined)) => void
    ];
    <T>(key: string, storage: MMKVInstance, defaultValue: T | undefined): [
        value: T,
        setValue: (value: T | ((prevValue: T) => T)) => void
    ];
};
export {};
//# sourceMappingURL=useMMKV.d.ts.map