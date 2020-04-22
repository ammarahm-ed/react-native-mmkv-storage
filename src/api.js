import encryption from "react-native-mmkv-storage/src/encryption";
import indexer from "react-native-mmkv-storage/src/indexer/indexer";
import { promisify } from "react-native-mmkv-storage/src/utils";
import { DATA_TYPES } from "./utils";
import { handleAction, handleActionAsync } from "./handlers";

export default class API {
  constructor(args) {
    this.MMKV = args.mmkv;
    this.instanceID = args.id;
    this.initWithEncryption = args.initWithEncryption;
    this.accessibleMode = args.accessibleMode;
    this.processingMode = args.processingMode;
    this.secureKeyStorage = args.secureKeyStorage;
    this.alias = args.alias;
    this.aliasPrefix = args.aliasPrefix;
    this.key = args.key;
    this.initialized = false;
    this.options = args;
    this.encryption = new encryption(this.options);
    this.indexer = new indexer(this.options);
  }

  setStringAsync(key, value) {
    return promisify(this.setString)(key, value);
  }

  async getStringAsync(key) {
    return promisify(this.getString)(key);
  }

  setIntAsync(key, value) {
    return promisify(this.setInt)(key, value);
  }

  getIntAsync(key) {
    return promisify(this.getInt)(key);
  }

  setBoolAsync(key, value) {
    return promisify(this.setBool)(key, value);
  }

  getBoolAsync(key) {
    return promisify(this.getBool)(key);
  }

  setMapAsync(key, value) {
    return promisify(this.setMap)(key, value);
  }

  getMapAsync(key) {
    return promisify(this.getMap)(key);
  }

  async getMultipleItemsAsync(keys) {
    return promisify(this.getMultipleItems)(keys, value);
  }

  async setArrayAsync(key, array) {
    return promisify(this.setArray)(key, array);
  }

  async getArrayAsync(key) {
    return promisify(this.getArray)(key);
  }

  setString = (key, value, callback) => {
    handleAction(
      this.MMKV.setString,
      callback,
      this.instanceID,
      key,
      value
    ).call(this);
  };

  getString = (key, callback) => {
    handleAction(
      this.MMKV.getItem,
      callback,
      this.instanceID,
      key,
      DATA_TYPES.STRING
    ).call(this);
  };

  setInt = (key, value, callback) => {
    handleAction(this.MMKV.setInt, callback, this.instanceID, key, value).call(
      this
    );
  };

  getInt = (key, callback) => {
    handleAction(
      this.MMKV.getItem,
      callback,
      this.instanceID,
      key,
      DATA_TYPES.NUMBER
    ).call(this);
  };

  setBool = (key, value, callback) => {
    handleAction(this.MMKV.setBool, callback, this.instanceID, key, value).call(
      this
    );
  };

  getBool = (key, callback) => {
    handleAction(
      this.MMKV.getItem,
      callback,
      this.instanceID,
      key,
      DATA_TYPES.BOOL
    ).call(this);
  };

  setMap = (key, value, callback) => {
    handleAction(
      this.MMKV.setMap,
      callback,
      this.instanceID,
      key,
      data,
      false
    ).call(this);
  };

  getMap = (key, callback) => {
    handleAction(
      this.MMKV.getItem,
      callback,
      this.instanceID,
      key,
      DATA_TYPES.MAP
    ).call(this);
  };

  getMultipleItems = (keys, callback) => {
    handleAction(
      this.MMKV.getMultipleItems,
      callback,
      this.instanceID,
      keys
    ).call(this);
  };

  setArray = (key, array, callback) => {
    if (!Array.isArray(array))
      throw new Error("Provided value is not an array");
    let data = {};
    data[key] = array.slice();

    handleAction(
      this.MMKV.setMap,
      callback,
      this.instanceID,
      key,
      data,
      true
    ).call(this);
  };

  getArray = (key, callback) => {
    handleAction(
      this.MMKV.getItem,
      (error, data) => {
        if (error) {
          callback(error, null);
          return;
        }

        if (data) {
          callback(null, data[key].slice());
        } else {
          callback(null, []);
        }
      },
      this.instanceID,
      key,
      DATA_TYPES.ARRAY
    ).call(this);
  };

  async getCurrentMMKVInstanceIDs() {
    return await this.MMKV.getCurrentMMKVInstanceIDs();
  }

  async getAllMMKVInstanceIDs() {
    return await this.MMKV.getAllMMKVInstanceIDs();
  }

  async removeItem(key) {
    return await handleActionAsync(
      this.MMKV.removeItem,
      this.instanceID,
      key
    ).call(this);
  }

  async clearStore() {
    return await handleActionAsync(
      this.MMKV.clearStore,
      this.instanceID,
      key
    ).call(this);
  }
}
