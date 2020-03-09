import { NativeModules } from "react-native";

const RNFastStorage = NativeModules.RNFastStorage;

if (RNFastStorage.setupLibrary) RNFastStorage.setupLibrary();
/**
 * Set an array to the db.
 * @param {String} key
 * @param {Array} array
 */
export async function setArray(key, array) {
  let data = {};
  data[key] = array;
  await RNFastStorage.setMap(key, data);
  return true;
}

/**
 * get an array from the db.
 * @param {String} key
 */

export async function getArray(key) {
  let data = await RNFastStorage.getMap(key);
  if (data) {
    return data[key];
  } else {
    return undefined;
  }
}

export default RNFastStorage;
