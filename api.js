import { NativeModules, TouchableWithoutFeedbackBase } from "react-native";

const RNFastStorage = NativeModules.RNFastStorage;


const specials = '_.][?)(&$/{}';
const lowercase = 'abcdefghijklmnopqrstuvwxyz';
const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const numbers = '0123456789';

const all = specials + lowercase + uppercase + numbers;

export default function generatePassword() {
  let password = '';

  password += pick(password, specials, 1, 3);
  password += pick(password, lowercase, 1, 3);
  password += pick(password, uppercase, 1, 3);
  password += pick(password, all, 10);

  return shuffle(password);
}

function pick(exclusions, string, min, max) {
  var n, chars = '';

  if (max === undefined) {
    n = min;
  } else {
    n = min + Math.floor(Math.random() * (max - min + 1));
  }

  var i = 0;
  while (i < n) {
    const character = string.charAt(Math.floor(Math.random() * string.length));
    if (exclusions.indexOf(character) < 0 && chars.indexOf(character) < 0) {
      chars += character;
      i++;
    }
  }

  return chars;
}

const stringToHex = (input) => {
  let str = ""
  for (const char of input) {
    str += char.charCodeAt(0).toString(16)
  }
  return str
}

function shuffle(string) {
  var array = string.split('');
  var tmp, current, top = array.length;

  if (top) while (--top) {
    current = Math.floor(Math.random() * (top + 1));
    tmp = array[current];
    array[current] = array[top];
    array[top] = tmp;
  }

  return array.join('');
}



export class loader {
  constructor() {
      this.instanceID = null;
      this.initWithEncryption = false;
      this.secureKeyStorage = false;
      this.accessibleModeForSecureKey = null;
      this.mmkvDirPath = '';
      this.initWithCustomDirPath = false;
      this.processingMode = '';
      this.defaultAlias = 'com.ammarahmed.MMKV';
      this.alias = null;
      this.key = null;
  }

default() {
  RNFastStorage.setupLibrary();
}

withInstanceID(id) {
  this.instanceID = id;

  return this;
}

withEncryption() {
  this.initWithEncryption = true;
  this.key = this.generateKey();
  this.alias = this.defaultAlias;
  this.secureKeyStorage = true;
  return this;
}

withCustomKey(key) {
  this.key = key;
  this.secureKeyStorage = false;
  return this;
}


withSecureKeyStorage(alias = this.defaultAlias) {
  this.secureKeyStorage = true;
  this.alias = stringToHex(alias);

  return this;
}

withCustomDirPath(path) {
  this.initWithCustomDirPath = true;
  this.mmkvDirPath = path;

  return this;
}

setProcessingMode(mode) {
  this.processingMode = mode;

  return this;
}

initialize() {
 console.log(this);
}

generateKey() {
  this.key = generatePassword();

  return this;
}

encrypt(key) {
 RNFastStorage.encrypt(key);
}

decrypt() {
  RNFastStorage.decrypt();
}

changeEncryptionKey(key) {
  RNFastStorage.encrypt(key);
}

}






if (RNFastStorage.setupLibrary) RNFastStorage.setupLibrary();

/**
 * Set a string value to storage for a given key.
 *
 * @param {String} key
 * @param {String} value
 *Async
 */
export async function setStringAsync(key, value) {
  if (typeof(value) !== "string") throw new Error("The provided value is not a string");

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
  if (typeof value !== "boolean") throw new Error('The provided value is not a boolean');
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
  if (typeof value !== "object") throw new Error('The provided value is not a object');
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

    let data = await RNFastStorage.getMapAsync(key);
    if (data) {
      return data[key].slice();
    } else {
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
  if (typeof(value) !== "string") throw new Error("The provided value is not a string");

  return RNFastStorage.setString(key, value, callback);
}

/**
 * Get a string value for a given key.
 * @param {String} key
 * @param {Function} callback
 */
export function getString(key,callback) {
  return RNFastStorage.getString(key, callback);
}

/**
 * Set a number value to storage for a given key.
 *
 * @param {String} key
 * @param {number} value
 * @param {Function} callback
 */
export function setInt(key, value,callback) {
  if (isNaN(value)) throw new Error("The provided value is not a number");
  return RNFastStorage.setInt(key, value,callback);
}

/**
 * Get a number value for a given key
 * @param {String} key
 * @param {Function} callback
 */
export function getInt(key,callback) {
  return RNFastStorage.getInt(key,callback);
}

/**
 * Set a boolean value to storag for a given key.
 *
 * @param {String} key
 * @param {boolean} value
 * @param {Function} callback
 *
 */
export function setBool(key, value,callback) {
  if (typeof value !== "boolean") throw new Error('The provided value is not a boolean');
  return RNFastStorage.setBool(key, value,callback);
}

/**
 * Get a boolean value for a given key.
 * @param {String} key
  * @param {Function} callback
 */
export function getBool(key,callback) {
  return RNFastStorage.getBool(key,callback);
}

/**
 * Set an Object to storage for a given key.
 *
 * @param {String} key
 * @param {Object} value
 * @param {Function} callback
 *
 */
export function setMap(key, value,callback) {
  if (typeof value !== "object") throw new Error('The provided value is not a object');
  return RNFastStorage.setMap(key, value,callback);
}

/**
 * Get an Object from storage for a given key.
 * @param {String} key
 * @param {Function} callback
 */
export function getMap(key,callback) {
  return RNFastStorage.getMap(key,callback);
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

export function hasKey(key,callback) {
  return RNFastStorage.hasKey(key,callback);
}

/**
 * Retrieve multiple Objects for a given array of keys. Currently will work only if data for all keys is an Object.
 * Arrays will also be returned but wrappen in a object.
 *
 * @param {Array} keys
 * @param {Function} callback
 */
export function getMultipleItems(keys,callback) {
  return RNFastStorage.getMultipleItems(keys,callback);
}

/**
 * Set an array to the db.
 * @param {String} key
 * @param {Array} array
 * @param {Function} callback
 */
export function setArray(key, array,callback) {
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

export function getArray(key,callback) {
  RNFastStorage.getMap(key,(data) => {
    if (data) {
      return callback(data[key].slice())
    } else {
      return callback([]);
    }
  });
}
