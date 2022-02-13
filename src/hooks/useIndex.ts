import { useCallback, useEffect, useState } from 'react';
import API from '../api';
import { DataType } from '../types';
import { methods } from './constants';

type GenericValueType<T> = [key: string, value: T | null | undefined];

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
export const useIndex = <T>(keys: string[], type: DataType, storage: API) => {
  const [values, setValues] = useState<GenericValueType<T>[]>(
    storage.getMultipleItems(keys || [], type)
  );

  const onChange = useCallback(({ key }) => {
    setValues(values => {
      let index = values.findIndex(v => v[0] === key);
      //@ts-ignore
      let value = storage[methods[type]['get']](key);
      if (value) {
        if (index !== -1) {
          values[index][1] = value;
        } else {
          setValues(storage.getMultipleItems(keys || [], type));
        }
      } else {
        values.splice(index);
      }
      return [...values];
    });
  }, []);

  useEffect(() => {
    let names = keys.map(v => `${v}:onwrite`);
    storage.ev.subscribeMulti(names, onChange);

    return () => {
      names.forEach(name => {
        storage.ev.unsubscribe(name, onChange);
      });
    };
  }, [keys, type]);

  const update = useCallback((key, value) => {
    if (!value) return remove(key);
    //@ts-ignore
    storage[methods[type]['set']](key, value);
  }, []);

  const remove = useCallback(key => {
    storage.removeItem(key);
  }, []);

  return [values.map(v => v[1]).filter(v => v !== null), update, remove];
};
