import encryption from './encryption';
import EventManager from './eventmanager';
import { handleAction } from './handlers';
import indexer from './indexer/indexer';
import { getCurrentMMKVInstanceIDs } from './initializer';
import { default as IDStore } from './mmkv/IDStore';
import mmkvJsiModule from './module';
import transactions from './transactions';
import { DataType, GenericReturnType, StorageOptions } from './types';
import { options } from './utils';

export default class MMKVInstance {
  transactions: transactions;
  instanceID: string;
  encryption: encryption;
  indexer: indexer;
  ev: EventManager;
  options: StorageOptions;
  constructor(id: string) {
    this.instanceID = id;
    this.encryption = new encryption(id);
    this.indexer = new indexer(id);
    this.ev = new EventManager();
    this.transactions = new transactions();
    this.options = options[id];
  }

  /**
   * Set a string value to storage for the given key.
   * This method is added for redux-persist/zustand support.
   *
   */
  setItem(key: string, value: string) {
    return this.setStringAsync(key, value);
  }
  /**
   * Get the string value for the given key.
   * This method is added for redux-persist/zustand support.
   */
  getItem(key: string) {
    return this.getStringAsync(key);
  }

  /**
   * Set a string value to storage for the given key.
   */
  setStringAsync(key: string, value: string): Promise<boolean | null | undefined> {
    return new Promise(resolve => {
      resolve(this.setString(key, value));
    });
  }
  /**
   * Get the string value for the given key.
   */
  getStringAsync(key: string): Promise<string | null | undefined> {
    return new Promise(resolve => {
      resolve(this.getString(key));
    });
  }
  /**
   * Set a number value to storage for the given key.
   */
  setIntAsync(key: string, value: number): Promise<boolean | null | undefined> {
    return new Promise(resolve => {
      resolve(this.setInt(key, value));
    });
  }
  /**
   * Get the number value for the given key.
   */
  getIntAsync(key: string): Promise<number | null | undefined> {
    return new Promise(resolve => {
      resolve(this.getInt(key));
    });
  }
  /**
   * Set a boolean value to storage for the given key.
   *
   */
  setBoolAsync(key: string, value: boolean): Promise<boolean | null | undefined> {
    return new Promise(resolve => {
      resolve(this.setBool(key, value));
    });
  }
  /**
   * Get the boolean value for the given key.
   */
  getBoolAsync(key: string): Promise<boolean | null | undefined> {
    return new Promise(resolve => {
      resolve(this.getBool(key));
    });
  }
  /**
   * Set an Object to storage for the given key.
   *
   * Note that this function does **not** work with the Map data type.
   *
   */
  setMapAsync(key: string, value: object): Promise<boolean | null | undefined> {
    return new Promise(resolve => {
      resolve(this.setMap(key, value));
    });
  }
  /**
   * Get then Object from storage for the given key.
   */
  getMapAsync<T>(key: string): Promise<T | null | undefined> {
    return new Promise(resolve => {
      resolve(this.getMap<T>(key));
    });
  }

  /**
   * Retrieve multiple items for the given array of keys.
   */
  async getMultipleItemsAsync<T>(
    keys: string[],
    type: DataType | 'map'
  ): Promise<GenericReturnType<T>[]> {
    return new Promise(resolve => {
      resolve(this.getMultipleItems<T>(keys, type));
    });
  }
  /**
   * Set an array to storage for the given key.
   */
  async setArrayAsync(key: string, value: any[]): Promise<boolean | null | undefined> {
    return new Promise(resolve => {
      resolve(this.setArray(key, value));
    });
  }
  /**
   * Get the array from the storage for the given key.
   */
  async getArrayAsync<T>(key: string): Promise<T[] | null | undefined> {
    return new Promise(resolve => {
      resolve(this.getArray<T>(key));
    });
  }
  /**
   * Set a string value to storage for the given key.
   */
  setString = (key: string, value: string) => {
    if (typeof value !== 'string') throw new Error(`Trying to set ${typeof value} as a string`);

    let _value = value;
    let before = this.transactions.beforewrite['string'];
    if (before) {
      _value = before(key, value);
    }

    let result = handleAction(mmkvJsiModule.setStringMMKV, key, _value, this.instanceID);
    if (result) {
      this.ev.publish(`${key}:onwrite`, { key, value: _value });
      let onwrite = this.transactions.onwrite['string'];
      if (onwrite) {
        onwrite(key, _value);
      }
    }

    return result;
  };

  /**
   * Get the string value for the given key.
   */
  getString = (key: string, callback?: (error: any, value: string | undefined | null) => void) => {
    let string = handleAction(mmkvJsiModule.getStringMMKV, key, this.instanceID);

    let onread = this.transactions.onread['string'];
    if (onread) {
      string = onread(key, string);
    }

    callback && callback(null, string);
    return string;
  };
  /**
   * Set a number value to storage for the given key.
   */
  setInt = (key: string, value: number) => {
    if (typeof value !== 'number') throw new Error(`Trying to set ${typeof value} as a number`);

    let _value = value;
    let before = this.transactions.beforewrite['number'];
    if (before) {
      _value = before(key, value);
    }

    let result = handleAction(mmkvJsiModule.setNumberMMKV, key, _value, this.instanceID);
    if (result) {
      this.ev.publish(`${key}:onwrite`, { key, value: _value });
      let onwrite = this.transactions.onwrite['number'];
      if (onwrite) {
        onwrite(key, _value);
      }
    }

    return result;
  };
  /**
   * Get the number value for the given key
   */
  getInt = (key: string, callback?: (error: any, value: number | undefined | null) => void) => {
    let int = handleAction(mmkvJsiModule.getNumberMMKV, key, this.instanceID);
    callback && callback(null, int);
    return int;
  };
  /**
   * Set a boolean value to storage for the given key
   */
  setBool = (key: string, value: boolean) => {
    if (typeof value !== 'boolean') throw new Error(`Trying to set ${typeof value} as a boolean`);

    let _value = value;
    let before = this.transactions.beforewrite['boolean'];
    if (before) {
      _value = before(key, value);
    }

    let result = handleAction(mmkvJsiModule.setBoolMMKV, key, _value, this.instanceID);

    if (result) {
      this.ev.publish(`${key}:onwrite`, { key, value: _value });
      let onwrite = this.transactions.onwrite['boolean'];
      if (onwrite) {
        onwrite(key, _value);
      }
    }

    return result;
  };
  /**
   * Get the boolean value for the given key.
   */
  getBool = (key: string, callback?: (error: any, value: boolean | undefined | null) => void) => {
    let bool = handleAction(mmkvJsiModule.getBoolMMKV, key, this.instanceID);
    callback && callback(null, bool);
    return bool;
  };
  /**
   * Set an Object to storage for a given key.
   *
   * Note that this function does **not** work with the Map data type
   */
  setMap = (key: string, value: object) => {
    if (typeof value !== 'object') throw new Error(`Trying to set ${typeof value} as a object`);

    let _value = value;
    let before = this.transactions.beforewrite['map'];
    if (before) {
      _value = before(key, value);
    }

    let result = handleAction(
      mmkvJsiModule.setMapMMKV,
      key,
      JSON.stringify(_value),
      this.instanceID
    );
    if (result) {
      this.ev.publish(`${key}:onwrite`, { key, value: _value });
      let onwrite = this.transactions.onwrite['map'];
      if (onwrite) {
        onwrite(key, _value);
      }
    }

    return result;
  };
  /**
   * Get an Object from storage for a given key.
   */
  getMap = <T>(key: string, callback?: (error: any, value: T | undefined | null) => void) => {
    let json = handleAction(mmkvJsiModule.getMapMMKV, key, this.instanceID);
    try {
      if (json) {
        let map: T = JSON.parse(json);
        callback && callback(null, map);
        return map;
      }
    } catch (e) {}
    callback && callback(null, null);
    return null;
  };

  /**
   * Set an array to storage for the given key.
   */
  setArray = (key: string, value: any[]) => {
    if (!Array.isArray(value)) throw new Error(`Trying to set ${typeof value} as a Array`);

    let _value = value;
    let before = this.transactions.beforewrite['array'];
    if (before) {
      _value = before(key, value);
    }

    let result = handleAction(
      mmkvJsiModule.setArrayMMKV,
      key,
      JSON.stringify(value),
      this.instanceID
    );
    if (result) {
      this.ev.publish(`${key}:onwrite`, { key, value: _value });

      let onwrite = this.transactions.onwrite['array'];
      if (onwrite) {
        onwrite(key, _value);
      }
    }

    return result;
  };

  /**
   * get an array from the storage for give key.
   */
  getArray = <T>(key: string, callback?: (error: any, value: T[] | undefined | null) => void) => {
    let json = handleAction(mmkvJsiModule.getMapMMKV, key, this.instanceID);
    try {
      if (json) {
        let array: T[] = JSON.parse(json);
        callback && callback(null, array);
        return array;
      }
    } catch (e) {}
    callback && callback(null, null);

    return null;
  };

  /**
   * Retrieve multiple items for the given array of keys.
   *
   */
  getMultipleItems = <T>(keys: string[], type: DataType | 'map') => {
    if (!type) type = 'object';
    const func = (): GenericReturnType<T>[] => {
      //@ts-ignore
      let items: GenericReturnType<T>[] = [];
      for (let i = 0; i < keys.length; i++) {
        let item = [];
        item[0] = keys[i];
        switch (type) {
          case 'string':
            item[1] = mmkvJsiModule.getStringMMKV(keys[i], this.instanceID);
            break;
          case 'boolean':
            item[1] = mmkvJsiModule.getBoolMMKV(keys[i], this.instanceID);
            break;
          case 'number':
            item[1] = mmkvJsiModule.getNumberMMKV(keys[i], this.instanceID);
            break;
          case 'object':
          case 'map':
            let map = mmkvJsiModule.getMapMMKV(keys[i], this.instanceID);
            if (map) {
              try {
                item[1] = JSON.parse(map);
              } catch (e) {
                if (__DEV__) {
                  console.warn(keys[i] + 'has a value that is not an object, returning null');
                }
                item[1] = null;
              }
            } else {
              item[1] = null;
            }
            break;
          case 'array':
            let array = mmkvJsiModule.getArrayMMKV(keys[i], this.instanceID);
            if (array) {
              try {
                item[1] = JSON.parse(array);
              } catch (e) {
                if (__DEV__) {
                  console.warn(keys[i] + 'has a value that is not an array, returning null');
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
        //@ts-ignore
        items.push(item);
      }
      return items;
    };

    handleAction(() => null, keys, this.instanceID);
    return func();
  };

  /**
   *
   * Get all Storage Instance IDs that are currently loaded.
   *
   */
  getCurrentMMKVInstanceIDs() {
    return getCurrentMMKVInstanceIDs();
  }

  /**
   *
   * Get all Storage Instance IDs.
   *
   */
  getAllMMKVInstanceIDs() {
    return IDStore.getAllMMKVInstanceIDs();
  }

  /**
   * Remove an item from storage for a given key.
   *
   */
  removeItem(key: string) {
    let result = handleAction(mmkvJsiModule.removeValueMMKV, key, this.instanceID);
    if (result) {
      this.ev.publish(`${key}:onwrite`, { key, value: null });
    }

    if (this.transactions.ondelete) {
      this.transactions.ondelete(key);
    }

    return result;
  }

  /**
   * Remove all keys and values from storage.
   */
  clearStore() {
    let keys = handleAction(mmkvJsiModule.getAllKeysMMKV, this.instanceID);
    let cleared = handleAction(mmkvJsiModule.clearMMKV, this.instanceID);
    mmkvJsiModule.setBoolMMKV(this.instanceID, true, this.instanceID);
    keys?.forEach((key: string) => this.ev.publish(`${key}:onwrite`, { key }));

    return cleared;
  }

  /**
   * Get the key and alias for the encrypted storage
   */
  getKey() {
    let { alias, key } = options[this.instanceID];
    return { alias, key };
  }

  /**
   * Clear memory cache of the current MMKV instance
   */
  clearMemoryCache() {
    let cleared = handleAction(mmkvJsiModule.clearMemoryCache, this.instanceID);
    return cleared;
  }
}
