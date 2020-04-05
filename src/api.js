import encryption from "react-native-mmkv-storage/src/encryption";
import { promisify } from "react-native-mmkv-storage/src/utils";
import indexer from "react-native-mmkv-storage/src/indexer";
import { DATA_TYPES, ACCESSIBLE } from "./utils";

export default class API {
  constructor({ id = "default", mmkv, alias, aliasPrefix, key, accessibleMode = ACCESSIBLE.WHEN_UNLOCKED }) {
    this.MMKV = mmkv;
    this.instanceID = id;
    this.alias = alias;
    this.aliasPrefix = aliasPrefix;
    this.key = key;
    let options = {
      id: this.instanceID,
      mmkv: this.MMKV,
      alias: this.alias,
      aliasPrefix: this.aliasPrefix,
      key: this.key,
      accessibleMode:accessibleMode
    };
    this.encryption = new encryption(options);
    this.indexer = new indexer(options);
  }

  setStringAsync(key, value) {
    return promisify(this.setString)(this.instanceID, key, value);
  }

  async getStringAsync(key) {
    return promisify(this.setString)(this.instanceID, key, DATA_TYPES.STRING);
  }

  setIntAsync(key, value) {
    return promisify(this.setInt)(this.instanceID, key, value);
  }

  getIntAsync(key) {
    return promisify(this.setString)(this.instanceID, key, DATA_TYPES.NUMBER);
  }

  setBoolAsync(key, value) {
    return promisify(this.setBool)(this.instanceID, key, value);
  }

  setMapAsync(key, value) {
    return promisify(this.setMap)(this.instanceID, key, value);
  }

  getMapAsync(key) {
    return promisify(this.setString)(this.instanceID, key, DATA_TYPES.MAP);
  }

  async removeItem(key) {
    return await this.MMKV.removeItem(this.instanceID, key);
  }

  async clearStore() {
    return await this.MMKV.clearStore(this.instanceID);
  }

  async getMultipleItemsAsync(keys) {
    return promisify(this.getMultipleItems)(this.instanceID, keys, value);
  }

  async setArrayAsync(key, array) {
    if (!Array.isArray(array))
      throw new Error("Provided value is not an array");
    let data = {};
    data[key] = array.slice();

    return await this.MMKV.setMapAsync(this.instanceID, key, data, true);
  }

  async getArrayAsync(key) {
    let data = await this.MMKV.getItemAsync(
      this.instanceID,
      key,
      DATA_TYPES.ARRAY
    );
    if (data) {
      return data[key].slice();
    } else {
      return [];
    }
  }

  setString(key, value, callback) {
    return this.MMKV.setString(this.instanceID, key, value, callback);
  }

  getString(key, callback) {
    return this.MMKV.getItem(this.instanceID, key, DATA_TYPES.STRING, callback);
  }

  setInt(key, value, callback) {
    return this.MMKV.setInt(this.instanceID, key, value, callback);
  }

  getInt(key, callback) {
    return this.MMKV.getItem(this.instanceID, key, DATA_TYPES.NUMBER, callback);
  }

  setBool(key, value, callback) {

    return this.MMKV.setBool(this.instanceID, key, value, callback);
  }

  getBool(key, callback) {
    return this.MMKV.getItem(this.instanceID, key, DATA_TYPES.BOOL, callback);
  }

  setMap(key, value, callback) {
  
    return this.MMKV.setMap(this.instanceID, key, value, false, callback);
  }

  getMap(key, callback) {
    return this.MMKV.getItem(this.instanceID, key, DATA_TYPES.MAP, callback);
  }

  getMultipleItems(keys, callback) {
    return this.MMKV.getMultipleItems(this.instanceID, keys, callback);
  }

  setArray(key, array, callback) {
    if (!Array.isArray(array))
      throw new Error("Provided value is not an array");
    let data = {};
    data[key] = array.slice();

    return this.MMKV.setMap(this.instanceID, key, data, true, callback);
  }

  getArray(key, callback) {
    this.MMKV.getItem(this.instanceID, key, DATA_TYPES.ARRAY, (data) => {
      if (data) {
        return callback(data[key].slice());
      } else {
        return callback([]);
      }
    });
  }

  async getCurrentMMKVInstanceIDs() {
    return await this.MMKV.getCurrentMMKVInstanceIDs();
  }

  async getAllMMKVInstanceIDs() {
    return await this.MMKV.getAllMMKVInstanceIDs();
  }
}
