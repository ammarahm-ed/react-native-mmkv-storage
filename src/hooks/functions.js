import {types,methods} from "./constants";

export const getDataType = (value) => {
  if (typeof value === "string") {
    return "string";
  } else if (typeof value === "boolean") {
    return "bool";
  } else if (typeof value === "object") {
    return "map";
  } else if (Array.isArray(value)) {
    return "array";
  } else if (typeof value === "number") {
    return "int";
  } else {
    return "unknown";
  }
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
