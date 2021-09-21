import {types,methods} from "./constants";

export const getDataType = (value) => {
  if (value === null || value === undefined) return null;
  let type = Array.isArray(value) ? "array" : typeof value;
  return type;
};

export const getInitialValue =
  ({ key,storage,kindValue }) =>
  () => {
    if (!storage?.indexer) {
      return null;
    }
    let indexer = storage.indexer;
    if (indexer.hasKey(key)) {
      for (let i = 0; i < types.length; i++) {
        let type = types[i];
        if (indexer[methods[type].indexer].hasKey(key)) {
          if (kindValue === "value") {
            return storage[methods[type]["get"]](key);
          }
          if (kindValue === "valueType") {
            return type;
          }
        }
      }
    }
    return null;
  };
