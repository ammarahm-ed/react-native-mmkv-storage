import encryption from "./encryption";
import EventManager from "./eventmanager";
import { handleAction } from "./handlers";
import indexer from "./indexer/indexer";
import { currentInstancesStatus } from "./initializer";
import IDStore from "./mmkv/IDStore";
import { promisify } from "./utils";

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
    this.ev = new EventManager();
  }

  setItem(key, value) {
    return this.setStringAsync(key, value);
  }

  getItem(key) {
    return this.getStringAsync(key);
  }

  setStringAsync(key, value) {
    return new Promise((resolve) => {
      resolve(this.setString(key, value));
    });
  }

  getStringAsync(key) {
    return new Promise((resolve) => {
      resolve(this.getString(key));
    });
  }

  setIntAsync(key, value) {
    return new Promise((resolve) => {
      resolve(this.setInt(key, value));
    });
  }

  getIntAsync(key) {
    return new Promise((resolve) => {
      resolve(this.getInt(key));
    });
  }

  setBoolAsync(key, value) {
    return new Promise((resolve) => {
      resolve(this.setBool(key, value));
    });
  }

  getBoolAsync(key) {
    return new Promise((resolve) => {
      resolve(this.getBool(key));
    });
  }

  setMapAsync(key, value) {
    return new Promise((resolve) => {
      resolve(this.setMap(key, value));
    });
  }

  getMapAsync(key) {
    return new Promise((resolve) => {
      resolve(this.getMap(key));
    });
  }

  async getMultipleItemsAsync(keys, type = "map") {
    return promisify(this.getMultipleItems)(keys, type);
  }

  async setArrayAsync(key, value) {
    return new Promise((resolve) => {
      resolve(this.setArray(key, value));
    });
  }

  async getArrayAsync(key) {
    return new Promise((resolve) => {
      resolve(this.getArray(key));
    });
  }

  setString = (key, value) => {
    let result = handleAction(
      global.setStringMMKV,
      key,
      value,
      this.instanceID
    );
    if (result) {
      this.ev.publish(`${key}:onwrite`);
    }

    return result;
  };

  getString = (key, callback) => {
    let string = handleAction(global.getStringMMKV, key, this.instanceID);
    callback && callback(null, string);
    return string;
  };

  setInt = (key, value) => {
    let result = handleAction(
      global.setNumberMMKV,
      key,
      value,
      this.instanceID
    );
    if (result) {
      this.ev.publish(`${key}:onwrite`);
    }

    return result;
  };

  getInt = (key, callback) => {
    let int = handleAction(global.getNumberMMKV, key, this.instanceID);
    callback && callback(null, int);
    return int;
  };

  setBool = (key, value) => {
    let result = handleAction(global.setBoolMMKV, key, value, this.instanceID);

    if (result) {
      this.ev.publish(`${key}:onwrite`);
    }

    return result;
  };

  getBool = (key, callback) => {
    let bool = handleAction(global.getBoolMMKV, key, this.instanceID);
    callback && callback(null, bool);
    return bool;
  };

  setMap = (key, value) => {
    if (typeof value !== "object") throw new Error("value must be an object");
    let result = handleAction(
      global.setMapMMKV,
      key,
      JSON.stringify(value),
      this.instanceID
    );
    if (result) {
      this.ev.publish(`${key}:onwrite`);
    }

    return result;
  };

  getMap = (key, callback) => {
    let map = handleAction(global.getMapMMKV, key, this.instanceID);
    try {
      map = JSON.parse(map);
      callback && callback(null, map);
      return map;
    } catch (e) {
      callback && callback(null, null);
      return null;
    }
  };

  setArray = (key, value) => {
    if (!Array.isArray(value)) throw new Error("value must be an Array");

    let result = handleAction(
      global.setArrayMMKV,
      key,
      JSON.stringify(value),
      this.instanceID
    );
    if (result) {
      this.ev.publish(`${key}:onwrite`);
    }

    return result;
  };

  getArray = (key, callback) => {
    let array = handleAction(global.getMapMMKV, key, this.instanceID);
    try {
      array = JSON.parse(array);
      callback && callback(null, array);
      return array;
    } catch (e) {
      callback && callback(null, null);
      return null;
    }
  };

  getMultipleItems = (keys, type = "map") => {
    const func = () => {
      let items = [];
      for (let i = 0; i < keys.length; i++) {
        let item = [];
        item[0] = keys[i];
        switch (type) {
          case "string":
            item[1] = global.getStringMMKV(keys[i], this.instanceID);
            break;
          case "bool":
            item[1] = global.getBoolMMKV(keys[i], this.instanceID);
            break;
          case "number":
            item[1] = global.getNumberMMKV(keys[i], this.instanceID);
            break;
          case "map":
            let map = global.getMapMMKV(keys[i], this.instanceID);
            if (map) {
              try {
                item[1] = JSON.parse(map);
              } catch (e) {
                if (__DEV__) {
                  console.warn(
                    keys[i] +
                      "has a value that is not an object, returning null"
                  );
                }
                item[1] = null;
              }
            } else {
              item[1] = null;
            }
            break;
          case "array":
            let array = global.getArrayMMKV(keys[i], this.instanceID);
            if (array) {
              try {
                item[1] = JSON.parse(array);
              } catch (e) {
                if (__DEV__) {
                  console.warn(
                    keys[i] + "has a value that is not an array, returning null"
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
    handleAction(() => null, keys, this.instanceID);
    return func();
  };

getCurrentMMKVInstanceIDs() {
    return currentInstancesStatus;
  }

 getAllMMKVInstanceIDs() {
    let instances = IDStore.getAll();
    return Object.keys(instances);
  }

  removeItem(key) {
    let result = handleAction(global.removeValueMMKV, key, this.instanceID);
    if (result) {
      this.ev.publish(`${key}:onwrite`);
    }

    return result;
  }

  clearStore() {
    let cleared = handleAction(global.clearMMKV, this.instanceID);
    global.setBoolMMKV(this.instanceID,true,this.instanceID)
    return cleared;
  }
}
