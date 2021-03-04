import encryption from 'react-native-mmkv-storage/src/encryption';
import indexer from 'react-native-mmkv-storage/src/indexer/indexer';
import {promisify} from 'react-native-mmkv-storage/src/utils';
import {handleAction, handleActionAsync} from './handlers';
import {currentInstancesStatus} from 'react-native-mmkv-storage/src/initializer';
import IDStore from 'react-native-mmkv-storage/src/mmkv/IDStore';

export default class API {
  constructor(args) {
    this.instanceID = args.instanceID;
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

  setItem(key, value) {
    return setStringAsync(key, value);
  }

  getItem(key) {
    return getStringAsync(key);
  }

  setStringAsync(key, value) {
    return new Promise((resolve) => {
      this.setString(key, value, (e, v) => resolve(v));
    });
  }

  getStringAsync(key) {
    return new Promise((resolve) => {
      this.getString(key, (e, v) => resolve(v));
    });
  }

  setIntAsync(key, value) {
    return new Promise((resolve) => {
      this.setInt(key, value, (e, v) => resolve(v));
    });
  }

  getIntAsync(key) {
    return new Promise((resolve) => {
      this.getInt(key, (e, v) => resolve(v));
    });
  }

  setBoolAsync(key, value) {
    return new Promise((resolve) => {
      this.setBool(key, value, (e, v) => resolve(v));
    });
  }

  getBoolAsync(key) {
    return new Promise((resolve) => {
      this.getBool(key, (e, v) => resolve(v));
    });
  }

  setMapAsync(key, value) {
    return new Promise((resolve) => {
      this.setMap(key, value, (e, v) => resolve(v));
    });
  }

  getMapAsync(key) {
    return new Promise((resolve) => {
      this.getMap(key, (e, v) => resolve(v));
    });
  }

  async getMultipleItemsAsync(keys, type = 'map') {
    return promisify(this.getMultipleItems)(keys, type);
  }

  async setArrayAsync(key, value) {
    return new Promise((resolve) => {
      this.setArray(key, value, (e, v) => resolve(v));
    });
  }

  async getArrayAsync(key) {
    return new Promise((resolve) => {
      this.getArray(key, (e, v) => resolve(v));
    });
  }

  setString = (key, value, cb) => {
    return handleAction(cb, global.setStringMMKV, key, value, this.instanceID);
  };

  getString = (key, cb) => {
    return handleAction(cb, global.getStringMMKV, key, this.instanceID);
  };

  setInt = (key, value, cb) => {
    return handleAction(cb, global.setNumberMMKV, key, value, this.instanceID);
  };

  getInt = (key, cb) => {
    return handleAction(cb, global.getNumberMMKV, key, this.instanceID);
  };

  setBool = (key, value, cb) => {
    return handleAction(cb, global.setBoolMMKV, key, value, this.instanceID);
  };

  getBool = (key, cb) => {
    return handleAction(cb, global.getBoolMMKV, key, this.instanceID);
  };

  setMap = (key, value, cb) => {
    if (typeof value !== 'object') throw new Error('value must be an object');
    return handleAction(
      cb,
      global.setMapMMKV,
      key,
      JSON.stringify(value),
      this.instanceID,
    );
  };

  getMap = (key, cb) => {
    const func = (v) => {
      try {
        return JSON.parse(v);
      } catch (e) {
        return null;
      }
    };
    let map = handleAction(
      (e, v) => {
        if (!cb) return;
        let map = func(v);
        cb(e, map);
      },
      global.getMapMMKV,
      key,
      this.instanceID,
    );
    return func(map);
  };

  setArray = (key, value, cb) => {
    if (!Array.isArray(value)) throw new Error('value must be an Array');
    handleAction(
      cb,
      global.setArrayMMKV,
      key,
      JSON.stringify(value),
      this.instanceID,
    );
  };

  getArray = (key, cb) => {
    const func = (v) => {
      try {
        return JSON.parse(v);
      } catch (e) {
        return null;
      }
    };
    let array = handleAction(
      (e, v) => {
        if (!cb) return;
        let array = func(v);
        cb(e, array);
      },
      global.getMapMMKV,
      key,
      this.instanceID,
    );
    return func(array);
  };

  getMultipleItems = (keys, type = 'map', cb) => {
    const func = () => {
      let items = [];
      for (let i = 0; i < keys.length; i++) {
        let item = [];
        item[0] = keys[i];
        switch (type) {
          case 'string':
            item[1] = global.getStringMMKV(keys[i], this.instanceID);
            break;
          case 'bool':
            item[1] = global.getBoolMMKV(keys[i], this.instanceID);
            break;
          case 'number':
            item[1] = global.getNumberMMKV(keys[i], this.instanceID);
            break;
          case 'map':
            let map = global.getMapMMKV(keys[i], this.instanceID);
            if (map) {
              try {
                item[1] = JSON.parse(map);
              } catch (e) {
                if (__DEV__) {
                  console.warn(
                    keys[i] +
                      'has a value that is not an object, returning null',
                  );
                }
                item[1] = null;
              }
            } else {
              item[1] = null;
            }
            break;
          case 'array':
            let array = global.getArrayMMKV(keys[i], this.instanceID);
            if (array) {
              try {
                item[1] = JSON.parse(array);
              } catch (e) {
                if (__DEV__) {
                  console.warn(
                    keys[i] +
                      'has a value that is not an array, returning null',
                  );
                }
                item[1] = null;
              }
            } else {
              item[1] = null;
            }
            break;
          default:
            item[1] = null;
            break;
        }
        items.push(item);
      }
      return items;
    };
    handleAction(
      () => {
        cb(e, func());
      },
      () => null,
      keys,
      this.instanceID,
    );
    return func();
  };

  async getCurrentMMKVInstanceIDs() {
    return currentInstancesStatus;
  }

  async getAllMMKVInstanceIDs() {
    let instances = IDStore.getAll();
    return Object.keys(instances);
  }

  async removeItem(key) {
    return await handleActionAsync(
      global.removeValueMMKV,
      key,
      this.instanceID,
    );
  }

  async clearStore() {
    return await handleActionAsync(global.clearMMKV, this.instanceID);
  }
}
