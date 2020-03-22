import { NativeModules } from "react-native";

const RNFastStorage = NativeModules.RNFastStorage;

if (RNFastStorage.setupLibrary) RNFastStorage.setupLibrary();

/**
 * Set a string value to storage for a given key.
 *
 * @param {String} key
 * @param {String} value
 *
 */
export async function setString(key, value) {
  if (typeof(value) !== "string") throw new Error("The provided value is not a string");

  return await RNFastStorage.setString(key, value);
}

/**
 * Get a string value for a given key.
 * @param {String} key
 */
export async function getString(key) {
  return await RNFastStorage.getString(key);
}

/**
 * Set a number value to storage for a given key.
 *
 * @param {String} key
 * @param {number} value
 *
 */
export async function setInt(key, value) {
  if (isNaN(value)) throw new Error("The provided value is not a number");
  return await RNFastStorage.setInt(key, value);
}

/**
 * Get a number value for a given key
 * @param {String} key
 */
export async function getInt(key) {
  return await RNFastStorage.getInt(key);
}

/**
 * Set a boolean value to storag for a given key.
 *
 * @param {String} key
 * @param {boolean} value
 *
 */
export async function setBool(key, value) {
  if (typeof value !== "boolean") throw new Error('The provided value is not a boolean');
  return await RNFastStorage.setBool(key, value);
}

/**
 * Get a boolean value for a given key.
 * @param {String} key
 */
export async function getBool(key) {
  return await RNFastStorage.getBool(key);
}

/**
 * Set an Object to storage for a given key.
 *
 * @param {String} key
 * @param {Object} value
 *
 */
export async function setMap(key, value) {
  if (typeof value !== "object") throw new Error('The provided value is not a object');
  return await RNFastStorage.setMap(key, value);
}

/**
 * Get an Object from storage for a given key.
 * @param {String} key
 */
export async function getMap(key) {
  return await RNFastStorage.getMap(key);
}

/**
 * Remove an item from storage for a given key.
 *
 * @param {String} key
 */
export async function removeItem(key) {
  return await RNFastStorage.removeItem(key);
}

/**
 * Clear the storage.
 *
 */

export async function clearStore() {
  return await RNFastStorage.clearStore();
}

/**
 * get all keys in storage.
 *
 */

export async function getKeys() {

  return await RNFastStorage.getKeys();
}



/**
 * Check if a key exists in storage.
 *
 * @param {String} key
 */

export async function hasKey(key) {
  return await RNFastStorage.hasKey(key);
}

/**
 * Retrieve multiple Objects for a given array of keys. Currently will work only if data for all keys is an Object.
 * Arrays will also be returned but wrappen in a object.
 *
 * @param {Array} keys
 */
export async function getMultipleItems(keys) {
  return await RNFastStorage.getMultipleItems(keys);
}

/**
 * Set an array to the db.
 * @param {String} key
 * @param {Array} array
 */
export async function setArray(key, array) {
  if (!Array.isArray(array)) throw new Error("Provided value is not an array");
  let data = {};
  data[key] = array.slice();

  return await RNFastStorage.setMap(key, data);
}

/**
 * get an array from the storage for give key.
 * @param {String} key
 */

export async function getArray(key) {
  try {
    let data = await RNFastStorage.getMap(key);
    if (data) {
      return data[key].slice();
    } else {
      return [];
    }
  } catch (e) {
    return e;
  }
}
