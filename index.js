import { useMMKVStorage, create } from "./src/hooks/useMMKV";
import { ACCESSIBLE, MODES } from "./src/utils";
import { getCurrentMMKVInstanceIDs } from "./src/initializer";
import { default as IDStore } from "./src/mmkv/IDStore";

const Loader = require("./src/loader").default;
const API = require("./src/api").default;

const MMKVStorage = {
  Loader: Loader,
  API: API,
  MODES: MODES,
  ACCESSIBLE: ACCESSIBLE,
  getAllMMKVInstanceIDs: IDStore.getAllMMKVInstanceIDs,
  getCurrentMMKVInstanceIDs: getCurrentMMKVInstanceIDs,
  IDSTORE_ID: IDStore.STORE_ID,
};

export default MMKVStorage;

export {
  useMMKVStorage,
  create
};
