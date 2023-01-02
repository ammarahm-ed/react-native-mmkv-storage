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

function assert(type: DataType, value: any) {
  if (type === 'array') {
    if (!Array.isArray(value)) throw new Error(`Trying to set ${typeof value} as a ${type}.`);
  } else {
    if (typeof value !== type) throw new Error(`Trying to set ${typeof value} as a ${type}.`);
  }
}

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
  setItem(key: string, value: string, callback?: (err?: Error | null) => void): Promise<boolean | undefined> {
    return new Promise(resolve => {
      const result = this.setString(key, value);
      callback && callback(null);
      resolve(result);
    });
  }
  /**
   * Get the string value for the given key.
   * This method is added for redux-persist/zustand support.
   */
  getItem(key: string, callback?: (error?: Error | null, result?: string | null) => void) {
    return new Promise(resolve => {
      resolve(this.getString(key, callback));
    });
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
    assert('string', value);
    let _value = this.transactions.transact('string', 'beforewrite', key, value);
    assert('string', _value);

    let result = handleAction(mmkvJsiModule.setStringMMKV, key, _value, this.instanceID);
    if (result) {
      this.ev.publish(`${key}:onwrite`, { key, value: _value });
      this.transactions.transact('string', 'onwrite', key, _value);
    }

    return result;
  };

  /**
   * Get the string value for the given key.
   */
  getString = (key: string, callback?: (error: any, value: string | undefined | null) => void) => {
    let string = handleAction(mmkvJsiModule.getStringMMKV, key, this.instanceID);
    string = this.transactions.transact('string', 'onread', key, string);
    callback && callback(null, string);
    return string;
  };
  /**
   * Set a number value to storage for the given key.
   */
  setInt = (key: string, value: number) => {
    assert('number', value);
    let _value = this.transactions.transact('number', 'beforewrite', key, value);
    assert('number', _value);
    let result = handleAction(mmkvJsiModule.setNumberMMKV, key, _value, this.instanceID);
    if (result) {
      this.ev.publish(`${key}:onwrite`, { key, value: _value });
      this.transactions.transact('number', 'onwrite', key, _value);
    }

    return result;
  };
  /**
   * Get the number value for the given key
   */
  getInt = (key: string, callback?: (error: any, value: number | undefined | null) => void) => {
    let int = handleAction(mmkvJsiModule.getNumberMMKV, key, this.instanceID);
    int = this.transactions.transact('number', 'onread', key, int);
    callback && callback(null, int);

    return int;
  };
  /**
   * Set a boolean value to storage for the given key
   */
  setBool = (key: string, value: boolean) => {
    assert('boolean', value);
    let _value = this.transactions.transact('boolean', 'beforewrite', key, value);
    assert('boolean', _value);
    let result = handleAction(mmkvJsiModule.setBoolMMKV, key, _value, this.instanceID);
    if (result) {
      this.ev.publish(`${key}:onwrite`, { key, value: value });
      this.transactions.transact('boolean', 'onwrite', key, _value);
    }

    return result;
  };
  /**
   * Get the boolean value for the given key.
   */
  getBool = (key: string, callback?: (error: any, value: boolean | undefined | null) => void) => {
    let bool = handleAction(mmkvJsiModule.getBoolMMKV, key, this.instanceID);
    bool = this.transactions.transact('boolean', 'onread', key, bool);
    callback && callback(null, bool);
    return bool;
  };
  /**
   * Set an Object to storage for a given key.
   *
   * Note that this function does **not** work with the Map data type
   */
  setMap = (key: string, value: object) => {
    assert('object', value);
    let _value = this.transactions.transact('object', 'beforewrite', key, value);
    assert('object', _value);
    let result = handleAction(
      mmkvJsiModule.setMapMMKV,
      key,
      JSON.stringify(_value),
      this.instanceID
    );
    if (result) {
      this.ev.publish(`${key}:onwrite`, { key, value: _value });
      this.transactions.transact('object', 'onwrite', key, _value);
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
        map = this.transactions.transact('object', 'onread', key, map) as T;
        callback && callback(null, map);
        return map;
      }
    } catch (e) {}
    this.transactions.transact('object', 'onread', key);
    callback && callback(null, null);
    return null;
  };

  /**
   * Set an array to storage for the given key.
   */
  setArray = (key: string, value: any[]) => {
    assert('array', value);
    let _value = this.transactions.transact('array', 'beforewrite', key, value);
    assert('array', _value);

    let result = handleAction(
      mmkvJsiModule.setArrayMMKV,
      key,
      JSON.stringify(value),
      this.instanceID
    );
    if (result) {
      this.ev.publish(`${key}:onwrite`, { key, value: _value });
      this.transactions.transact('array', 'onwrite', key, _value);
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
        array = this.transactions.transact('array', 'onread', key, array) as T[];
        callback && callback(null, array);
        return array;
      }
    } catch (e) {}
    this.transactions.transact('array', 'onread', key);
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
  removeItem(key: string): boolean | undefined {
    let result = handleAction(mmkvJsiModule.removeValueMMKV, key, this.instanceID);
    if (result) {
      this.ev.publish(`${key}:onwrite`, { key, value: null });
    }
    this.transactions.transact('string', 'ondelete', key);

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
