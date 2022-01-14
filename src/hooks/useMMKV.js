import { useCallback, useEffect, useRef, useState } from "react";
import { methods } from "./constants";
import { getDataType, getInitialValue } from "./functions";

export const create = (storage) => (key, defaultValue) => {
  if (!key || typeof key !== "string" || !storage)
    throw new Error("Key and Storage are required parameters.");
  return useMMKVStorage(key, storage, defaultValue);
};

export const useMMKVStorage = (key, storage, defaultValue) => {
  const getValue = useCallback(
    getInitialValue({ key, storage, kindValue: "value" }),
    [key, storage]
  );
  const getValueType = useCallback(
    getInitialValue({ key, storage, kindValue: "valueType" }),
    [key, storage]
  );

  const [value, setValue] = useState(getValue);
  const [valueType, setValueType] = useState(getValueType);

  const prevKey = usePrevious(key);
  const prevStorage = usePrevious(storage);

  const prevValue = useRef(value);

  useEffect(() => {
    prevValue.current = value;
  },[value])

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

  const updateValue = useCallback((event) => {
    let type = getDataType(event.value);
    let _value = event.value ? methods[type]["copy"](event.value) : null;
    setValue(_value);
    setValueType(type);
  }, []);

  const setNewValue = useCallback(
    async (nextValue) => {
      let updatedValue = nextValue;
      if (typeof nextValue === "function") {
        if (nextValue.constructor.name === "AsyncFunction") {
          __DEV__ &&
            console.warn(
              `Attempting to use an async function as state setter is not allowed.`
            );
          return;
        }
        updatedValue = nextValue(prevValue.current || defaultValue);
      }

      let _value;
      let _valueType = valueType;
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
        storage[methods[_valueType]["set"]](key, _value);
      }
      setValue(_value);
      setValueType(_valueType);
      return;
    },
    [key, storage, valueType]
  );

  return [valueType === "boolean" ? value : value || defaultValue, setNewValue];
};

function usePrevious(value) {
  const ref = useRef(value);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current
}
