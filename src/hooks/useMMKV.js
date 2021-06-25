import { useCallback, useEffect, useRef, useState } from "react";
import { methods, types } from "./constants";
import { getDataType, getInitialValue } from "./functions";

export const create = (storage) => (key) => useMMKVStorage(key,storage);

export const useMMKVStorage = (key, storage) => {
  
  const getValue = useCallback(getInitialValue({ key, storage, kindValue: "value" }), [key, storage]);
  const getValueType = useCallback(getInitialValue({ key, storage,  kindValue: "valueType" }), [key, storage]);
  
  const [value, setValue] = useState(getValue);
  const [valueType, setValueType] = useState(getValueType);

  const prevKey = usePrevious(key);
  const prevStorage = usePrevious(storage);
  
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

  const updateValue = useCallback(async (updatedValue) => {
    let indexer = storage.indexer;
    let _value;
    let _valueType;
    if (indexer.hasKey(key)) {
      for (var i = 0; i < types.length; i++) {
        let type = types[i];
        if (valueType === type || indexer[methods[type].indexer].hasKey(key)) {
          _valueType = type;
          _value = updatedValue || storage[methods[type]["get"]](key);
          setValue(_value);
          setValueType(_valueType);
          return;
        }
      }
    } else {
      setValue(null);
      setValueType(null);
    }
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

        updatedValue = nextValue(value);
      }

      let _value;
      let _valueType = valueType;
      if (updatedValue === null || updatedValue === undefined) {
        storage.removeItem(key);
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
    [valueType, value]
  );

  return [value, setNewValue];
};

function usePrevious(value) {
  const ref = useRef(value);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
};
