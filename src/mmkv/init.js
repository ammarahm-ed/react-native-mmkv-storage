import { NativeModules } from "react-native";

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
