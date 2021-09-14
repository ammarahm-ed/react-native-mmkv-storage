import encryption from "./encryption";
import EventManager from "./eventmanager";
import { handleAction } from "./handlers";
import indexer from "./indexer/indexer";
import { getCurrentMMKVInstanceIDs } from "./initializer";
import { default as IDStore } from "./mmkv/IDStore";
import transactions from "./transactions";
import { options, promisify } from "./utils";

export default class API {
  constructor(id) {
    this.instanceID = id;
    this.encryption = new encryption(id);
    this.indexer = new indexer(id);
    this.ev = new EventManager();
    this.transactions = new transactions();
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

    let _value = value;
    let before = this.transactions.beforewrite["string"];
    if (before) {
      _value = before(key, value);
    }

    let result = handleAction(
      global.setStringMMKV,
      key,
      _value,
      this.instanceID
    );
    if (result) {
      this.ev.publish(`${key}:onwrite`, {key,value:_value});
      let onwrite = this.transactions.onwrite["string"];
      if (onwrite) {
        onwrite(key, _value);
      }
    }

    return result;
  };

  getString = (key, callback) => {
    let string = handleAction(global.getStringMMKV, key, this.instanceID);

    let onread = this.transactions.onread["string"];
    if (onread) {
      string = onread(key, string);
    }

    callback && callback(null, string);
    return string;
  };

  setInt = (key, value) => {

    let _value = value;
    let before = this.transactions.beforewrite["number"];
    if (before) {
      _value = before(key, value);
    }

    let result = handleAction(
      global.setNumberMMKV,
      key,
      _value,
      this.instanceID
    );
    if (result) {
      this.ev.publish(`${key}:onwrite`, {key,value:_value});
      let onwrite = this.transactions.onwrite["number"];
      if (onwrite) {
        onwrite(key, _value);
      }
    }

    return result;
  };

  getInt = (key, callback) => {
    let int = handleAction(global.getNumberMMKV, key, this.instanceID);
    callback && callback(null, int);
    return int;
  };

  setBool = (key, value) => {

    let _value = value;
    let before = this.transactions.beforewrite["boolean"];
    if (before) {
      _value = before(key, value);
    }

    let result = handleAction(global.setBoolMMKV, key, _value, this.instanceID);

    if (result) {
      this.ev.publish(`${key}:onwrite`, {key,value:_value});
      let onwrite = this.transactions.onwrite["boolean"];
      if (onwrite) {
        onwrite(key, _value);
      }
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

    let _value = value;
    let before = this.transactions.beforewrite["map"];
    if (before) {
      _value = before(key, value);
    }

    let result = handleAction(
      global.setMapMMKV,
      key,
      JSON.stringify(_value),
      this.instanceID
    );
    if (result) {
      this.ev.publish(`${key}:onwrite`, {key,value:_value});
      let onwrite = this.transactions.onwrite["map"];
      if (onwrite) {
        onwrite(key, _value);
      }
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

    let _value = value;
    let before = this.transactions.beforewrite["array"];
    if (before) {
      _value = before(key, value);
    }

    let result = handleAction(
      global.setArrayMMKV,
      key,
      JSON.stringify(value),
      this.instanceID
    );
    if (result) {
      this.ev.publish(`${key}:onwrite`, {key,value:_value});
      
      let onwrite = this.transactions.onwrite["array"];
      if (onwrite) {
        onwrite(key, _value);
      }
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
          case "boolean":
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
    return getCurrentMMKVInstanceIDs();
  }

  getAllMMKVInstanceIDs() {
    return IDStore.getAllMMKVInstanceIDs();
  }

  removeItem(key) {
    let result = handleAction(global.removeValueMMKV, key, this.instanceID);
    if (result) {
      this.ev.publish(`${key}:onwrite`, {key,value:null});
      if (this.transactions.ondelete) {
        this.transactions.ondelete(key);
      }
    }

    
    return result;
  }

  clearStore() {
    let cleared = handleAction(global.clearMMKV, this.instanceID);
    global.setBoolMMKV(this.instanceID, true, this.instanceID);
    return cleared;
  }

  getKey() {
    let { alias, key } = options[this.instanceID];
    return { alias, key };
  }

  clearMemoryCache() {
    let cleared = handleAction(global.clearMemoryCache, this.instanceID);
    return cleared;
  }
}
