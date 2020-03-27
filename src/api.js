

export const modes = {
  MULTI_PROCESS_MODE: 2,
  SINGLE_PROCESS_MODE: 1
};

export default class API {
  constructor({id = "default", mmkv }) {
    this.MMKV = mmkv;
    this.instanceID = id;
  }
  /**
   * Set a string value to storage for a given key.
   *
   * @param {String} key
   * @param {String} value
   *
   */

  async setStringAsync(key, value) {
    if (typeof value !== "string")
      throw new Error("The provided value is not a string");

    return await this.MMKV.setStringAsync(this.instanceID, key, value);
  }

  /**
   * Get a string value for a given key.
   * @param {String} key
   */
  async getStringAsync(key) {
    return await this.MMKV.getStringAsync(this.instanceID, key);
  }

  /**
   * Set a number value to storage for a given key.
   *
   * @param {String} key
   * @param {number} value
   *
   */
  async setIntAsync(key, value) {
    if (isNaN(value)) throw new Error("The provided value is not a number");
    return await this.MMKV.setIntAsync(this.instanceID, key, value);
  }

  /**
   * Get a number value for a given key
   * @param {String} key
   */
  async getIntAsync(key) {
    return await this.MMKV.getIntAsync(this.instanceID, key);
  }

  /**
   * Set a boolean value to storag for a given key.
   *
   * @param {String} key
   * @param {boolean} value
   *
   */
  async setBoolAsync(key, value) {
    if (typeof value !== "boolean")
      throw new Error("The provided value is not a boolean");
    return await this.MMKV.setBoolAsync(this.instanceID, key, value);
  }

  /**
   * Get a boolean value for a given key.
   * @param {String} key
   */
  async getBoolAsync(key) {
    return await this.MMKV.getBoolAsync(this.instanceID, key);
  }

  /**
   * Set an Object to storage for a given key.
   *
   * @param {String} key
   * @param {Object} value
   *
   */
  async setMapAsync(key, value) {
    if (typeof value !== "object")
      throw new Error("The provided value is not a object");
    return await this.MMKV.setMapAsync(this.instanceID, key, value);
  }

  /**
   * Get an Object from storage for a given key.
   * @param {String} key
   */
  async getMapAsync(key) {
    return await this.MMKV.getMapAsync(this.instanceID, key);
  }

  /**
   * Remove an item from storage for a given key.
   *
   * @param {String} key
   */
  async removeItem(key) {
    return await this.MMKV.removeItem(this.instanceID, key);
  }

  /**
   * Clear the storage.
   *
   */

  async clearStore() {
    return await this.MMKV.clearStore(this.instanceID);
  }

  /**
   * get all keys in storage.
   *
   */

  async getKeysAsync() {
    return await this.MMKV.getKeysAsync(this.instanceID);
  }

  /**
   * Check if a key exists in storage.
   *
   * @param {String} key
   */

  async hasKeyAsync(key) {
    return await this.MMKV.hasKeyAsync(this.instanceID, key);
  }

  /**
   * Retrieve multiple Objects for a given array of keys. Currently will work only if data for all keys is an Object.
   * Arrays will also be returned but wrappen in a object.
   *
   * @param {Array} keys
   */
  async getMultipleItemsAsync(keys) {
    return await this.MMKV.getMultipleItemsAsync(this.instanceID, keys);
  }

  /**
   * Set an array to the db.
   * @param {String} key
   * @param {Array} array
   */
  async setArrayAsync(key, array) {
    if (!Array.isArray(array))
      throw new Error("Provided value is not an array");
    let data = {};
    data[key] = array.slice();

    return await this.MMKV.setMapAsync(this.instanceID, key, data);
  }

  /**
   * get an array from the storage for give key.
   * @param {String} key
   */

  async getArrayAsync(key) {
    let data = await this.MMKV.getMapAsync(this.instanceID, key);
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
  setString(key, value, callback) {
    if (typeof value !== "string")
      throw new Error("The provided value is not a string");

    return this.MMKV.setString(this.instanceID, key, value, callback);
  }

  /**
   * Get a string value for a given key.
   * @param {String} key
   * @param {Function} callback
   */
  getString(key, callback) {
    return this.MMKV.getString(this.instanceID, key, callback);
  }

  /**
   * Set a number value to storage for a given key.
   *
   * @param {String} key
   * @param {number} value
   * @param {Function} callback
   */
  setInt(key, value, callback) {
    if (isNaN(value)) throw new Error("The provided value is not a number");
    return this.MMKV.setInt(this.instanceID, key, value, callback);
  }

  /**
   * Get a number value for a given key
   * @param {String} key
   * @param {Function} callback
   */
  getInt(key, callback) {
    return this.MMKV.getInt(this.instanceID, key, callback);
  }

  /**
   * Set a boolean value to storag for a given key.
   *
   * @param {String} key
   * @param {boolean} value
   * @param {Function} callback
   *
   */
  setBool(key, value, callback) {
    if (typeof value !== "boolean")
      throw new Error("The provided value is not a boolean");
    return this.MMKV.setBool(this.instanceID, key, value, callback);
  }

  /**
   * Get a boolean value for a given key.
   * @param {String} key
   * @param {Function} callback
   */
  getBool(key, callback) {
    return this.MMKV.getBool(this.instanceID, key, callback);
  }

  /**
   * Set an Object to storage for a given key.
   *
   * @param {String} key
   * @param {Object} value
   * @param {Function} callback
   *
   */
  setMap(key, value, callback) {
    if (typeof value !== "object")
      throw new Error("The provided value is not a object");
    return this.MMKV.setMap(this.instanceID, key, value, callback);
  }

  /**
   * Get an Object from storage for a given key.
   * @param {String} key
   * @param {Function} callback
   */
  getMap(key, callback) {
    return this.MMKV.getMap(this.instanceID, key, callback);
  }

  /**
   * get all keys in storage.
   * @param {Function} callback
   */

  getKeys(callback) {
    return this.MMKV.getKeys(this.instanceID, callback);
  }

  /**
   * Check if a key exists in storage.
   *
   * @param {String} key
   * @param {Function} callback
   */

  hasKey(key, callback) {
    return this.MMKV.hasKey(this.instanceID, key, callback);
  }

  /**
   * Retrieve multiple Objects for a given array of keys. Currently will work only if data for all keys is an Object.
   * Arrays will also be returned but wrappen in a object.
   *
   * @param {Array} keys
   * @param {Function} callback
   */
  getMultipleItems(keys, callback) {
    return this.MMKV.getMultipleItems(this.instanceID, keys, callback);
  }

  /**
   * Set an array to the db.
   * @param {String} key
   * @param {Array} array
   * @param {Function} callback
   */
  setArray(key, array, callback) {
    if (!Array.isArray(array))
      throw new Error("Provided value is not an array");
    let data = {};
    data[key] = array.slice();

    return this.MMKV.setMap(this.instanceID, key, data, callback);
  }

  /**
   * get an array from the storage for give key.
   * @param {String} key
   * @param {Function} callback
   */

  getArray(key, callback) {
    this.MMKV.getMap(this.instanceID, key, data => {
      if (data) {
        return callback(data[key].slice());
      } else {
        return callback([]);
      }
    });
  }


  




}
