import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import MMKVInstance from '../mmkvinstance';
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
export const useIndex = <T>(
  keys: string[],
  type: DataType,
  storage: MMKVInstance
): [
  values: (T | null | undefined)[],
  update: (key: string, value: T) => void,
  remove: (key: string) => void
] => {
  const positions = useRef<Map<string, number>>(new Map());

  const [values, setValues] = useState<GenericValueType<T>[]>(() => {
    const rows = storage.getMultipleItems<T>(keys || [], type) || [];
    positions.current = buildPositions(rows);
    return rows;
  });

  const keysRef = useRef(keys);
  keysRef.current = keys;

  const typeRef = useRef(type);
  typeRef.current = type;

  const keysKey = keys ? keys.join('\u0000') : '';

  const onChange = useCallback(
    ({ key }: { key: string }) => {
      //@ts-ignore
      const value = storage[methods[typeRef.current]['get']](key);

      setValues(current => {
        const index = positions.current.get(key);

        if (value === null || value === undefined) {
          if (index === undefined) return current;

          const next = current.slice();
          next.splice(index, 1);
          positions.current = buildPositions(next);
          return next;
        }

        if (index === undefined) {
          const next = current.slice();
          next.splice(insertionPoint(next, key, keysRef.current), 0, [key, value]);
          positions.current = buildPositions(next);
          return next;
        }

        const next = current.slice();
        next[index] = [key, value];
        return next;
      });
    },
    [storage]
  );

  useEffect(() => {
    const names = (keysRef.current || []).map(value => `${value}:onwrite`);
    storage.ev.subscribeMulti(names, onChange);

    return () => {
      storage.ev.unsubscribeMulti(names, onChange);
    };
  }, [keysKey, storage, onChange]);

  const remove = useCallback(
    (key: string) => {
      storage.removeItem(key);
    },
    [storage]
  );

  const update = useCallback(
    (key: string, value: T) => {
      if (!value) return remove(key);
      //@ts-ignore
      storage[methods[typeRef.current]['set']](key, value);
    },
    [storage, remove]
  );

  const result = useMemo(
    () => values.map(value => value[1]).filter(value => value !== null),
    [values]
  );

  return [result, update, remove];
};

function buildPositions<T>(rows: GenericValueType<T>[]) {
  const positions = new Map<string, number>();
  for (let i = 0; i < rows.length; i++) {
    positions.set(rows[i][0], i);
  }
  return positions;
}

function insertionPoint<T>(rows: GenericValueType<T>[], key: string, keys: string[]) {
  if (!keys) return rows.length;

  const order = new Map<string, number>();
  for (let i = 0; i < keys.length; i++) {
    if (!order.has(keys[i])) order.set(keys[i], i);
  }

  const target = order.get(key);
  if (target === undefined) return rows.length;

  for (let i = 0; i < rows.length; i++) {
    const position = order.get(rows[i][0]);
    if (position !== undefined && position > target) return i;
  }

  return rows.length;
}
