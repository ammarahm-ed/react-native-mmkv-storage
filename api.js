import { NativeModules } from "react-native";

const RNFastStorage = NativeModules.RNFastStorage;

if (RNFastStorage.setupLibrary) RNFastStorage.setupLibrary();

/**
 * Set a string value to storage for a given key.
 *
 * @param {String} key
 * @param {String} value
 *Async
 */
export async function setStringAsync(key, value) {
  if (typeof value !== "string")
    throw new Error("The provided value is not a string");

  return await RNFastStorage.setStringAsync(key, value);
}

/**
 * Get a string value for a given key.
 * @param {String} key
 */
export async function getStringAsync(key) {
  return await RNFastStorage.getStringAsync(key);
}

/**
 * Set a number value to storage for a given key.
 *
 * @param {String} key
 * @param {number} value
 *
 */
export async function setIntAsync(key, value) {
  if (isNaN(value)) throw new Error("The provided value is not a number");
  return await RNFastStorage.setIntAsync(key, value);
}

/**
 * Get a number value for a given key
 * @param {String} key
 */
export async function getIntAsync(key) {
  return await RNFastStorage.getIntAsync(key);
}

/**
 * Set a boolean value to storag for a given key.
 *
 * @param {String} key
 * @param {boolean} value
 *
 */
export async function setBoolAsync(key, value) {
  if (typeof value !== "boolean")
    throw new Error("The provided value is not a boolean");
  return await RNFastStorage.setBoolAsync(key, value);
}

/**
 * Get a boolean value for a given key.
 * @param {String} key
 */
export async function getBoolAsync(key) {
  return await RNFastStorage.getBoolAsync(key);
}

/**
 * Set an Object to storage for a given key.
 *
 * @param {String} key
 * @param {Object} value
 *
 */
export async function setMapAsync(key, value) {
  if (typeof value !== "object")
    throw new Error("The provided value is not a object");
  return await RNFastStorage.setMapAsync(key, value);
}

/**
 * Get an Object from storage for a given key.
 * @param {String} key
 */
export async function getMapAsync(key) {
  return await RNFastStorage.getMapAsync(key);
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

export async function getKeysAsync() {
  return await RNFastStorage.getKeysAsync();
}

/**
 * Check if a key exists in storage.
 *
 * @param {String} key
 */

export async function hasKeyAsync(key) {
  return await RNFastStorage.hasKeyAsync(key);
}

/**
 * Retrieve multiple Objects for a given array of keys. Currently will work only if data for all keys is an Object.
 * Arrays will also be returned but wrappen in a object.
 *
 * @param {Array} keys
 */
export async function getMultipleItemsAsync(keys) {
  return await RNFastStorage.getMultipleItemsAsync(keys);
}

/**
 * Set an array to the db.
 * @param {String} key
 * @param {Array} array
 */
export async function setArrayAsync(key, array) {
  if (!Array.isArray(array)) throw new Error("Provided value is not an array");
  let data = {};
  data[key] = array.slice();

  return await RNFastStorage.setMapAsync(key, data);
}

/**
 * get an array from the storage for give key.
 * @param {String} key
 */

export async function getArrayAsync(key) {
  let data;
  try {
    data = await RNFastStorage.getMapAsync(key);
    if (data) {
      return data[key].slice();
    } else {
      return [];
    }
  } catch (e) {
    return [];
  }
}

// NO ASYNC CALLS

/**
 * Set a string value to storage for a given key.
 *
 * @param {String} key
 * @param {String} value
 * @param {Function} callback
 *
 */
export function setString(key, value, callback) {
  if (typeof value !== "string")
    throw new Error("The provided value is not a string");

  return RNFastStorage.setString(key, value, callback);
}

/**
 * Get a string value for a given key.
 * @param {String} key
 * @param {Function} callback
 */
export function getString(key, callback) {
  return RNFastStorage.getString(key, callback);
}

/**
 * Set a number value to storage for a given key.
 *
 * @param {String} key
 * @param {number} value
 * @param {Function} callback
 */
export function setInt(key, value, callback) {
  if (isNaN(value)) throw new Error("The provided value is not a number");
  return RNFastStorage.setInt(key, value, callback);
}

/**
 * Get a number value for a given key
 * @param {String} key
 * @param {Function} callback
 */
export function getInt(key, callback) {
  return RNFastStorage.getInt(key, callback);
}

/**
 * Set a boolean value to storag for a given key.
 *
 * @param {String} key
 * @param {boolean} value
 * @param {Function} callback
 *
 */
export function setBool(key, value, callback) {
  if (typeof value !== "boolean")
    throw new Error("The provided value is not a boolean");
  return RNFastStorage.setBool(key, value, callback);
}

/**
 * Get a boolean value for a given key.
 * @param {String} key
 * @param {Function} callback
 */
export function getBool(key, callback) {
  return RNFastStorage.getBool(key, callback);
}

/**
 * Set an Object to storage for a given key.
 *
 * @param {String} key
 * @param {Object} value
 * @param {Function} callback
 *
 */
export function setMap(key, value, callback) {
  if (typeof value !== "object")
    throw new Error("The provided value is not a object");
  return RNFastStorage.setMap(key, value, callback);
}

/**
 * Get an Object from storage for a given key.
 * @param {String} key
 * @param {Function} callback
 */
export function getMap(key, callback) {
  return RNFastStorage.getMap(key, callback);
}

/**
 * get all keys in storage.
 * @param {Function} callback
 */

export function getKeys(callback) {
  return RNFastStorage.getKeys(callback);
}

/**
 * Check if a key exists in storage.
 *
 * @param {String} key
 * @param {Function} callback
 */

export function hasKey(key, callback) {
  return RNFastStorage.hasKey(key, callback);
}

/**
 * Retrieve multiple Objects for a given array of keys. Currently will work only if data for all keys is an Object.
 * Arrays will also be returned but wrappen in a object.
 *
 * @param {Array} keys
 * @param {Function} callback
 */
export function getMultipleItems(keys, callback) {
  return RNFastStorage.getMultipleItems(keys, callback);
}

/**
 * Set an array to the db.
 * @param {String} key
 * @param {Array} array
 * @param {Function} callback
 */
export function setArray(key, array, callback) {
  if (!Array.isArray(array)) throw new Error("Provided value is not an array");
  let data = {};
  data[key] = array.slice();

  return RNFastStorage.setMap(key, data, callback);
}

/**
 * get an array from the storage for give key.
 * @param {String} key
 * @param {Function} callback
 */

export function getArray(key, callback) {
  RNFastStorage.getMap(key, data => {
    if (data.Error) return callback(data);
    if (data && data[key]) {
      return callback(data[key].slice());
    } else {
      return callback([]);
    }
  });
}
