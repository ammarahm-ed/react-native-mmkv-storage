import { Platform } from "react-native";
const STORE_ID = Platform.OS === "ios" ? "mmkvIdStore" : "mmkvIDStore";

/**
 *	Store instance properties that we will use later to
 *  load the storage again.
 * @param {string} id instance id
 * @param {boolean} encrypted is current instance encrypted
 * @param {string} alias alias of key in keychain
 */

function add(id, encrypted, alias) {
  let storeUnit = {
    id,
    encrypted,
    alias,
  };
  global.setStringMMKV(id, JSON.stringify(storeUnit), STORE_ID);
}

/**
 * Check if the storage instance with the given ID is encrypted or not.
 * @param {string} id instance id
 */
function encrypted(id) {
  let storeUnit = global.getStringMMKV(id, STORE_ID);
  if (!storeUnit) {
    return false;
  }
  storeUnit = JSON.parse(storeUnit);
  return storeUnit.encrypted;
}

/**
 * Get the alias for the storage which we used
 * to store the crypt key in secure storage.
 * @param {string} id instance id
 */
function getAlias(id) {
  let storeUnit = global.getStringMMKV(id, STORE_ID);
  if (!storeUnit) {
    return null;
  }
  storeUnit = JSON.parse(storeUnit);
  return storeUnit.alias;
}

/**
 * Check if an instance is already present in the store.
 * @param {string} id instance id
 */
function exists(id) {
  let storeUnit = global.getStringMMKV(id, STORE_ID);
  if (!storeUnit) {
    return null;
  }
  return true;
}

let blacklist = ["stringIndex"];
/**
 * Get all the available instances that
 * were loaded since the app was installed.
 */
function getAll() {
  let keys = global.getAllKeysMMKV(STORE_ID);
  let storeUnits = {};
  keys.forEach((key) => {
    if (!blacklist.includes(key)) {
      let storeUnit = global.getStringMMKV(key, STORE_ID);
      storeUnit = JSON.parse(storeUnit);
      storeUnits[key] = storeUnit;
    }
  });
  return storeUnits;
}

export default {
  getAll,
  getAlias,
  add,
  exists,
  encrypted,
};
