import { NativeModules } from "react-native";
import { useMMKVStorage, create } from "./src/hooks/useMMKV";
import { ACCESSIBLE, MODES } from "./src/utils";
import { getCurrentMMKVInstanceIDs } from "./src/initializer";
import { default as IDStore } from "./src/mmkv/IDStore";
import { useIndex } from "./src/hooks/useIndex";

// Installing JSI Bindings as done by
// https://github.com/mrousavy/react-native-mmkv
export function isLoaded() {
  return typeof global.getStringMMKV === "function";
}

export function init() {
  try {
    if (!isLoaded()) {
      const result = NativeModules.MMKVNative.install();
      if (!result)
        throw new Error("JSI bindings were not installed for: MMKVNative");

      if (!isLoaded()) {
        throw new Error("JSI bindings installation failed for: MMKVNative");
      }
      return true;
    }
    return true;
  } catch (e) {
    console.log("JSI bindings were not installed for: MMKVNative");
    return false;
  }
}
init();

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

export { useMMKVStorage, create, useIndex };
