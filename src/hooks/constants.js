export const types = ["string", "int", "bool", "map", "array"];

export const methods = {
  string: {
    indexer: "strings",
    get: "getString",
    set: "setString",
  },
  int: {
    indexer: "numbers",
    get: "getInt",
    set: "setInt",
  },
  bool: {
    indexer: "booleans",
    get: "getBool",
    set: "setBool",
  },
  map: {
    indexer: "maps",
    get: "getMap",
    set: "setMap",
  },
  array: {
    indexer: "arrays",
    get: "getArray",
    set: "setArray",
  },
};
