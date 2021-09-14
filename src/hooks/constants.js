export const types = ["string", "number", "boolean", "object", "array"];

export const methods = {
  string: {
    indexer: "strings",
    get: "getString",
    set: "setString",
    copy:value => value
  },
  number: {
    indexer: "numbers",
    get: "getInt",
    set: "setInt",
    copy:value => value
  },
  boolean: {
    indexer: "booleans",
    get: "getBool",
    set: "setBool",
    copy:value => value
  },
  object: {
    indexer: "maps",
    get: "getMap",
    set: "setMap",
    copy:(value) => {
      return {...value}
    }
  },
  array: {
    indexer: "arrays",
    get: "getArray",
    set: "setArray",
    copy:(value) => {
      return [...value]
    }
  },
};
