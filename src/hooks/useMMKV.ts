import { useCallback, useEffect, useRef, useState } from 'react';
import API from '../api';
import { methods } from './constants';
import { getDataType, getInitialValue } from './functions';

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
export const create =
  <T>(storage: API) =>
  (key: string, defaultValue: any) => {
    if (!key || typeof key !== 'string' || !storage)
      throw new Error('Key and Storage are required parameters.');
    return useMMKVStorage<T>(key, storage, defaultValue);
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
export const useMMKVStorage = <T>(
  key: string,
  storage: API,
  defaultValue: any
): [value: T | null | undefined, setValue: (value: T) => void] => {
  const getValue = useCallback(getInitialValue(key, storage, 'value'), [key, storage]);
  const getValueType = useCallback(getInitialValue(key, storage, 'type'), [key, storage]);

  const [value, setValue] = useState<T | null | undefined>(getValue);
  const [valueType, setValueType] = useState(getValueType);

  const prevKey = usePrevious(key);
  const prevStorage = usePrevious(storage);

  const prevValue = useRef(value);

  useEffect(() => {
    prevValue.current = value;
    if (!value && storage.options.persistDefaults) {
      setNewValue(defaultValue);
    }
  }, [value]);

  useEffect(() => {
    if (storage !== null) {
      // This check prevents getInitialValue from being called twice when this hook intially loads
      if (prevKey !== key || prevStorage !== storage) {
        setValue(getValue);
        setValueType(getValueType);
      }

      storage.ev.subscribe(`${key}:onwrite`, updateValue);
    }
    return () => {
      if (storage != null) {
        storage.ev.unsubscribe(`${key}:onwrite`, updateValue);
      }
    };
  }, [prevKey, key, prevStorage, storage, getValue, getValueType]);

  const updateValue = useCallback(event => {
    let type = getDataType(event.value);
    //@ts-ignore
    let _value = event.value ? methods[type]['copy'](event.value) : null;
    setValue(_value);
    setValueType(type);
  }, []);

  const setNewValue = useCallback(
    async nextValue => {
      let updatedValue = nextValue;
      if (typeof nextValue === 'function') {
        if (nextValue.constructor.name === 'AsyncFunction') {
          __DEV__ &&
            console.warn(`Attempting to use an async function as state setter is not allowed.`);
          return;
        }
        updatedValue = nextValue(prevValue.current || defaultValue);
      }

      let _value: T;
      let _valueType: string | null = valueType;
      if (updatedValue === null || updatedValue === undefined) {
        storage.removeItem(key);
        _valueType = null;
      } else {
        let _dataType = getDataType(updatedValue);

        if (_valueType && _dataType !== valueType) {
          __DEV__ &&
            console.warn(
              `Trying to set a ${_dataType} value to hook for type ${_valueType} is not allowed.`
            );
          return;
        }
        if (!valueType) {
          _valueType = _dataType;
        }
        _value = updatedValue;
        //@ts-ignore
        storage[methods[_valueType]['set']](key, _value);
      }
      //@ts-ignore
      setValue(_value);
      setValueType(_valueType);
      return;
    },
    [key, storage, valueType]
  );

  return [valueType === 'boolean' ? value : value || defaultValue, setNewValue];
};

function usePrevious(value: any) {
  const ref = useRef(value);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}
