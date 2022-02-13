var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { useCallback, useEffect, useState } from 'react';
import { methods } from './constants';
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
export var useIndex = function (keys, type, storage) {
    var _a = useState(storage.getMultipleItems(keys || [], type)), values = _a[0], setValues = _a[1];
    var onChange = useCallback(function (_a) {
        var key = _a.key;
        setValues(function (values) {
            var index = values.findIndex(function (v) { return v[0] === key; });
            //@ts-ignore
            var value = storage[methods[type]['get']](key);
            if (value) {
                if (index !== -1) {
                    values[index][1] = value;
                }
                else {
                    setValues(storage.getMultipleItems(keys || [], type));
                }
            }
            else {
                values.splice(index);
            }
            return __spreadArray([], values, true);
        });
    }, []);
    useEffect(function () {
        var names = keys.map(function (v) { return "".concat(v, ":onwrite"); });
        storage.ev.subscribeMulti(names, onChange);
        return function () {
            names.forEach(function (name) {
                storage.ev.unsubscribe(name, onChange);
            });
        };
    }, [keys, type]);
    var update = useCallback(function (key, value) {
        if (!value)
            return remove(key);
        //@ts-ignore
        storage[methods[type]['set']](key, value);
    }, []);
    var remove = useCallback(function (key) {
        storage.removeItem(key);
    }, []);
    return [values.map(function (v) { return v[1]; }).filter(function (v) { return v !== null; }), update, remove];
};
