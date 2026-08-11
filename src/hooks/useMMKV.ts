import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import MMKVInstance from '../mmkvinstance';
import { methods } from './constants';
import { getDataType, getInitialState, InitialState } from './functions';

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
export const create: CreateType =
  (storage: MMKVInstance) =>
  <T = undefined>(
    key: string,
    defaultValue?: T,
    equalityFn?: (prev: T | undefined, next: T | undefined) => boolean
  ) => {
    if (!key || typeof key !== 'string' || !storage)
      throw new Error('Key and Storage are required parameters.');

    return useMMKVStorage<T>(key, storage, defaultValue, equalityFn);
  };

/**
 * Types curried function to return differently based on the
 * absence of the `defaultValue` parameter.
 * @see {@link UseMMKVStorageType}
 */
type CreateType = (storage: MMKVInstance) => {
  <T = undefined>(key: string): [
    value: T | undefined,
    setValue: (value: (T | undefined) | ((prevValue: T | undefined) => T | undefined)) => void
  ];
  <T>(key: string, defaultValue: T): [
    value: T,
    setValue: (value: T | ((prevValue: T) => T)) => void
  ];
  <T>(
    key: string,
    defaultValue: T,
    equalityFn?: (prev: T | undefined, next: T | undefined) => boolean
  ): [value: T, setValue: (value: T | ((prevValue: T) => T)) => void];
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
 * @param equalityFn Provide a custom function to handle state update if value has changed.
 *
 * @returns `[value,setValue]`
 */
export const useMMKVStorage: UseMMKVStorageType = <T = undefined>(
  key: string,
  storage: MMKVInstance,
  defaultValue?: T,
  equalityFn?: (prev: T | undefined, next: T | undefined) => boolean
): [value: T, setValue: (value: T | ((prevValue: T) => T)) => void] => {
  const [state, setState] = useState<InitialState>(() => getInitialState(key, storage));

  const stateRef = useRef(state);
  stateRef.current = state;

  const equalityFnRef = useRef(equalityFn);
  equalityFnRef.current = equalityFn;

  const defaultValueRef = useRef(defaultValue);
  defaultValueRef.current = defaultValue;

  const sourceRef = useRef({ key, storage });
  if (sourceRef.current.key !== key || sourceRef.current.storage !== storage) {
    sourceRef.current = { key, storage };
    const next = getInitialState(key, storage);
    stateRef.current = next;
    setState(next);
  }

  const updateValue = useCallback((event: any) => {
    const next = event.value;
    const type = getDataType(next);
    const current = stateRef.current;

    if (equalityFnRef.current?.(current.value, next)) return;
    if (next === current.value && type !== 'object' && type !== 'array') return;

    let value = next;
    if (next !== null && next !== undefined && (type === 'object' || type === 'array')) {
      const cached = clonedValues.get(event);
      if (cached !== undefined) {
        value = cached;
      } else {
        //@ts-ignore
        value = methods[type]['copy'](next);
        clonedValues.set(event, value);
      }
    }

    setState({ value, type });
  }, []);

  const setNewValue = useCallback(
    (nextValue: any) => {
      const current = stateRef.current;
      let updatedValue = nextValue;

      if (typeof nextValue === 'function') {
        if (isAsyncFunction(nextValue)) {
          __DEV__ &&
            console.warn(`Attempting to use an async function as state setter is not allowed.`);
          return;
        }
        updatedValue = nextValue(
          current.value === null || current.value === undefined
            ? defaultValueRef.current
            : current.value
        );

        if (isThenable(updatedValue)) {
          __DEV__ &&
            console.warn(`Attempting to use an async function as state setter is not allowed.`);
          return;
        }
      }

      if (updatedValue === null || updatedValue === undefined) {
        storage.removeItem(key);
        return;
      }

      const dataType = getDataType(updatedValue);

      if (current.type && dataType !== current.type) {
        __DEV__ &&
          console.warn(
            `Trying to set a ${dataType} value to hook for type ${current.type} is not allowed.`
          );
        return;
      }

      //@ts-ignore
      storage[methods[dataType]['set']](key, updatedValue);
    },
    [key, storage]
  );

  useEffect(() => {
    if (!storage) return;

    const name = `${key}:onwrite`;
    storage.ev.subscribe(name, updateValue);

    return () => {
      storage.ev.unsubscribe(name, updateValue);
    };
  }, [key, storage, updateValue]);

  useEffect(() => {
    if (state.value !== null && state.value !== undefined) return;
    if (!storage?.options?.persistDefaults) return;
    if (defaultValue === null || defaultValue === undefined) return;

    setNewValue(defaultValue);
  }, [state.value, storage, defaultValue, setNewValue]);

  const value = state.value === null || state.value === undefined ? defaultValue : state.value;

  return useMemo(() => [value as T, setNewValue], [value, setNewValue]);
};

const clonedValues = new WeakMap<object, any>();

function isAsyncFunction(value: any) {
  return (
    Object.prototype.toString.call(value) === '[object AsyncFunction]' ||
    value?.constructor?.name === 'AsyncFunction'
  );
}

function isThenable(value: any) {
  return value !== null && typeof value === 'object' && typeof value.then === 'function';
}

/**
 * Uses typescript's {@link https://www.typescriptlang.org/docs/handbook/interfaces.html#function-types anonymous function overloading}
 * to mimic React's `useState` typing.
 */
type UseMMKVStorageType = {
  <T = undefined>(key: string, storage: MMKVInstance): [
    value: T | undefined,
    setValue: (value: (T | undefined) | ((prevValue: T | undefined) => T | undefined)) => void
  ];
  <T>(key: string, storage: MMKVInstance, defaultValue: T | undefined): [
    value: T,
    setValue: (value: T | ((prevValue: T) => T)) => void
  ];
  <T>(
    key: string,
    storage: MMKVInstance,
    defaultValue: T | undefined,
    equalityFn?: (prev: T | undefined, next: T | undefined) => boolean
  ): [value: T, setValue: (value: T | ((prevValue: T) => T)) => void];
};
