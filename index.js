import { useMMKVStorage as useMMKV } from "./src/hooks/useMMKV";
import { ACCESSIBLE, MODES } from "./src/utils";
export const useMMKVStorage = useMMKV;
export const create = require("./src/hooks/useMMKV").create;

const Loader = require("./src/loader").default;
const API = require("./src/api").default;

const MMKVStorage = {
  Loader: Loader,
  API: API,
  MODES: MODES,
  ACCESSIBLE: ACCESSIBLE,
};

export default MMKVStorage;
