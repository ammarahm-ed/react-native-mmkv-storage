import { NativeModules } from "react-native";

const RNFastStorage = NativeModules.RNFastStorage;

if (RNFastStorage.setupLibrary) RNFastStorage.setupLibrary();

/**
 * Set a string value to storag for a given key.
 *
 * @param {String} key
 * @param {String} value
 *
 */
async function setString(key, value) {
  return await RNFastStorage.setString(key, value);
}

/**
 * Get a string value for a given key.
 * @param {String} key
 */
async function getString(key) {
  return await RNFastStorage.getString(key);
}

/**
 * Set an Object to storage for a given key.
 *
 * @param {String} key
 * @param {Object} value
 *
 */
async function setMap(key, value) {
  return await RNFastStorage.setMap(key, value);
}

/**
 * Get an Object from storage for a given key.
 * @param {String} key
 */
async function getMap(key) {
  return await RNFastStorage.getMap(key);
}

/**
 * Remove an item from storage for a given key.
 *
 * @param {String} key
 */
async function removeItem(key) {
  return await RNFastStorage.removeItem(key);
}

/**
 * Clear the storage.
 *
 */

async function clearStore() {
  return await RNFastStorage.clearStore();
}

async function hasKey(key) {
  return await RNFastStorage.hasKey(key);
}

/**
 * Retrieve multiple Objects for a given array of keys. Currently will work only if data for all keys is an Object.
 * Arrays will also be returned but wrappen in a object.
 *
 * @param {Array} keys
 */
async function getMultipleItems(keys) {
  return await RNFastStorage.getMultipleItems(keys);
}
/**
 * Retrieve multiple Objects for a given array of keys. Currently will work only if data for all keys is an Object.
 * Arrays will also be returned but wrappen in a object.
 *
 * @param {Array} keys
 */
async function getMultipleItems(keys) {
  return await RNFastStorage.getMultipleItems(keys);
}

/**
 * Set an array to the db.
 * @param {String} key
 * @param {Array} array
 */
async function setArray(key, array) {
  let data = {};
  data[key] = array;

  return await RNFastStorage.setMap(key, data);
}

/**
 * get an array from the storage for give key.
 * @param {String} key
 */

async function getArray(key) {
  try {
    let data = await RNFastStorage.getMap(key);
    if (data) {
      return data[key];
    } else {
      return [];
    }
  } catch (e) {
    return e;
  }
}

/**
 * Retrieve multiple Objects for a given array of keys. Currently will work only if data for all keys is an Object.
 * Arrays will also be returned but wrappen in a object.
 *
 * **Will not work if a key as a String value.**
 *
 * @param {Array} keys
 */
async function getMultipleItems(keys) {
  return await RNFastStorage.getMultipleItems(keys);
}
