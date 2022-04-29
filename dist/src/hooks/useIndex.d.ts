import MMKVInstance from '../mmkvinstance';
import { DataType } from '../types';
/**
 * A hook that will take an array of keys and returns an array of values for those keys.
 * This is supposed to work in combination with `Transactions`s. When you have build your custom index,
 * you will need an easy and quick way to load values for your index. useIndex hook actively listens
 * to all read/write changes and updates the values accordingly.
 *
 * ```tsx
 * import MMKVStorage from "react-native-mmkv-storage"
 *
 * const storage = new MMKVStorage.Loader().initialize();
 *
 * const App = () => {
    const postsIndex = useMMKVStorage("postsIndex",MMKV,[]);
    const [posts] = useIndex(postsIndex,"object" MMKV);

    return <View>
    <FlatList
    data={posts}
    renderItem={...}
    >
</View>

}
 * ```
 *
 * Documentation: https://rnmmkv.vercel.app/#/useindex
 *
 * @param keys Array of keys against which the hook should load values
 * @param type Type of values
 * @param storage The storage instance
 *
 * @returns `[values, update, remove]`
 */
export declare const useIndex: <T>(keys: string[], type: DataType, storage: MMKVInstance) => [values: (T | null | undefined)[], update: (key: string, value: T) => void, remove: (key: string) => void];
//# sourceMappingURL=useIndex.d.ts.map