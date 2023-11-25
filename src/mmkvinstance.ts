import encryption from './encryption';
import EventManager from './eventmanager';
import { handleAction } from './handlers';
import indexer from './indexer/indexer';
import { getCurrentMMKVInstanceIDs } from './initializer';
import { default as IDStore } from './mmkv/IDStore';
import mmkvJsiModule from './module';
import transactions from './transactions';
import { DataType, StorageOptions } from './types';
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

  isRegisterd(key: string) {
    return this.ev._registry[`${key}:onwrite`];
  }

  handleNullOrUndefined(key: string, value: any) {
    if (value === null || value === undefined) {
      this.removeItem(key);
      return true;
    }
    return false;
  }

  /**
   * Set a string value to storage for the given key.
   * This method is added for redux-persist/zustand support.
   *
   */
  async setItem(key: string, value: string, callback?: (err?: Error | null) => void) {
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
  async getItem(key: string, callback?: (error?: Error | null, result?: string | null) => void) {
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
   * Set items in bulk of same type at once
   *
   * If a value against a key is null/undefined, it will be
   * set as null.
   *
   * @param keys Array of keys
   * @param values Array of values
   * @param type
   */
  async setMultipleItemsAsync(items: [string, any][], type: DataType | 'map') {
    if (type === 'object') type = 'map';

    let values = [];

    if (type === 'string' || type === 'array' || type === 'map') {
      values = items.map(item => {
        let value = item[1];

        if (this.transactions.beforewrite[type]) {
          value = this.transactions.transact(type as DataType, 'beforewrite', item[0], value);
        }

        if (type === 'string') return value;
        return value ? JSON.stringify(value) : value;
      });
      handleAction(
        mmkvJsiModule.setMultiMMKV,
        items.map(item => item[0]),
        values,
        `${type}Index`,
        this.instanceID
      );
    } else {
      if (type === 'boolean') {
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          let value = item[1];

          if (this.transactions.beforewrite[type]) {
            value = this.transactions.transact(type as DataType, 'beforewrite', item[0], value);
          }
          values[i] = value;
          this.setBool(item[0], value);
        }
      } else if (type === 'number') {
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          let value = item[1];

          if (this.transactions.beforewrite[type]) {
            value = this.transactions.transact(type as DataType, 'beforewrite', item[0], value);
          }
          values[i] = value;
          this.setInt(item[0], value);
        }
      }
    }
    queueMicrotask(() => {
      items?.forEach((item, index) => {
        if (this.isRegisterd(item[0])) {
          this.ev.publish(`${item[0]}:onwrite`, { key: item[0], value: values[index] });
        }

        if (this.transactions.onwrite[type]) {
          this.transactions.transact(type as DataType, 'onwrite', item[0], values[index]);
        }
      });
    });
    return true;
  }

  /**
   * Retrieve multiple items for the given array of keys
   */
  async getMultipleItemsAsync<T>(keys: string[], type: DataType | 'map'): Promise<[string, T][]> {
    let items: [string, T][] = [];

    if (type === 'map') type = 'object';
    if (type === 'array' || type === 'string' || type === 'object') {
      const result = handleAction(mmkvJsiModule.getMultiMMKV, keys, this.instanceID);
      if (type === 'string') return keys.map((key, index) => [key, result[index] as T]);

      return keys.map((key, index) => {
        let value = result[index] ? JSON.parse(result[index]) : result[index];

        if (this.transactions.onread[type]) {
          value = this.transactions.transact(type as DataType, 'onread', key, value);
        }

        return [key, value];
      });
    }

    if (type === 'boolean') {
      for (let i = 0; i < keys.length; i++) {
        let value = this.getBool(keys[i]);

        if (this.transactions.onread[type]) {
          value = this.transactions.transact(type as DataType, 'onread', keys[i], value);
        }

        const item: [string, T] = [keys[i], value as T];
        items.push(item);
      }
      return items;
    } else if (type === 'number') {
      for (let i = 0; i < keys.length; i++) {
        let value = this.getInt(keys[i]);

        if (this.transactions.onread[type]) {
          value = this.transactions.transact(type as DataType, 'onread', keys[i], value);
        }

        const item: [string, T] = [keys[i], value as T];
        items.push(item);
      }
      return items;
    }
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
  setString = (key: string, value: string): boolean | undefined => {
    if (this.transactions.beforewrite['string']) {
      value = this.transactions.transact('string', 'beforewrite', key, value);
    }
    if (this.handleNullOrUndefined(key, value)) return true;

    assert('string', value);
    let result = handleAction(mmkvJsiModule.setStringMMKV, key, value, this.instanceID);
    if (result) {
      if (this.isRegisterd(key)) {
        this.ev.publish(`${key}:onwrite`, { key, value: value });
      }

      if (this.transactions.onwrite['string']) {
        this.transactions.transact('string', 'onwrite', key, value);
      }
    }

    return result;
  };

  /**
   * Get the string value for the given key.
   */
  getString = (
    key: string,
    callback?: (error: any, value: string | undefined | null) => void
  ): string | null | undefined => {
    let string = handleAction(mmkvJsiModule.getStringMMKV, key, this.instanceID);

    if (this.transactions.onread['string']) {
      string = this.transactions.transact('string', 'onread', key, string);
    }

    callback && callback(null, string);
    return string;
  };
  /**
   * Set a number value to storage for the given key.
   */
  setInt = (key: string, value: number): boolean | undefined => {
    if (this.transactions.beforewrite['number']) {
      value = this.transactions.transact('number', 'beforewrite', key, value);
    }

    if (this.handleNullOrUndefined(key, value)) return true;
    assert('number', value);

    let result = handleAction(mmkvJsiModule.setNumberMMKV, key, value, this.instanceID);
    if (result) {
      if (this.isRegisterd(key)) {
        this.ev.publish(`${key}:onwrite`, { key, value: value });
      }
      this.transactions.transact('number', 'onwrite', key, value);
    }

    return result;
  };
  /**
   * Get the number value for the given key
   */
  getInt = (
    key: string,
    callback?: (error: any, value: number | undefined | null) => void
  ): number | null | undefined => {
    let int = handleAction(mmkvJsiModule.getNumberMMKV, key, this.instanceID);

    if (this.transactions.onread['number']) {
      int = this.transactions.transact('number', 'onread', key, int);
    }

    callback && callback(null, int);

    return int;
  };
  /**
   * Set a boolean value to storage for the given key
   */
  setBool = (key: string, value: boolean): boolean | undefined => {
    if (this.transactions.beforewrite['boolean']) {
      value = this.transactions.transact('boolean', 'beforewrite', key, value);
    }

    if (this.handleNullOrUndefined(key, value)) return true;
    assert('boolean', value);

    let result = handleAction(mmkvJsiModule.setBoolMMKV, key, value, this.instanceID);
    if (result) {
      if (this.isRegisterd(key)) {
        this.ev.publish(`${key}:onwrite`, { key, value: value });
      }

      this.transactions.transact('boolean', 'onwrite', key, value);
    }

    return result;
  };
  /**
   * Get the boolean value for the given key.
   */
  getBool = (
    key: string,
    callback?: (error: any, value: boolean | undefined | null) => void
  ): boolean | null | undefined => {
    let bool = handleAction(mmkvJsiModule.getBoolMMKV, key, this.instanceID);

    if (this.transactions.onread['boolean']) {
      bool = this.transactions.transact('boolean', 'onread', key, bool);
    }

    callback && callback(null, bool);
    return bool;
  };
  /**
   * Set an Object to storage for a given key.
   *
   * Note that this function does **not** work with the Map data type
   */
  setMap = (key: string, value: object): boolean | undefined => {
    if (this.transactions.beforewrite['object']) {
      value = this.transactions.transact('object', 'beforewrite', key, value);
    }

    if (this.handleNullOrUndefined(key, value)) return true;
    assert('object', value);

    let result = handleAction(
      mmkvJsiModule.setMapMMKV,
      key,
      JSON.stringify(value),
      this.instanceID
    );
    if (result) {
      if (this.isRegisterd(key)) {
        this.ev.publish(`${key}:onwrite`, { key, value: value });
      }
      if (this.transactions.onwrite['object']) {
        this.transactions.transact('object', 'onwrite', key, value);
      }
    }

    return result;
  };
  /**
   * Get an Object from storage for a given key.
   */
  getMap = <T>(
    key: string,
    callback?: (error: any, value: T | undefined | null) => void
  ): T | null | undefined => {
    let json = handleAction(mmkvJsiModule.getMapMMKV, key, this.instanceID);
    try {
      if (json) {
        let map: T = JSON.parse(json);

        if (this.transactions.onread['object']) {
          map = this.transactions.transact('object', 'onread', key, map) as T;
        }

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
  setArray = (key: string, value: any[]): boolean | undefined => {
    if (this.transactions.beforewrite['array']) {
      value = this.transactions.transact('array', 'beforewrite', key, value);
    }

    if (this.handleNullOrUndefined(key, value)) return true;
    assert('array', value);

    let result = handleAction(
      mmkvJsiModule.setArrayMMKV,
      key,
      JSON.stringify(value),
      this.instanceID
    );
    if (result) {
      if (this.isRegisterd(key)) {
        this.ev.publish(`${key}:onwrite`, { key, value: value });
      }
      if (this.transactions.onwrite['array']) {
        this.transactions.transact('array', 'onwrite', key, value);
      }
    }

    return result;
  };

  /**
   * get an array from the storage for give key.
   */
  getArray = <T>(
    key: string,
    callback?: (error: any, value: T[] | undefined | null) => void
  ): T[] | null | undefined => {
    let json = handleAction(mmkvJsiModule.getMapMMKV, key, this.instanceID);
    try {
      if (json) {
        let array: T[] = JSON.parse(json);

        if (this.transactions.onread['array']) {
          array = this.transactions.transact('array', 'onread', key, array) as T[];
        }

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
    let items: [string, T][] = [];
    if (type === 'map') type = 'object';

    if (type === 'string') {
      for (let i = 0; i < keys.length; i++) {
        const item: [string, T] = [keys[i], this.getString(keys[i]) as T];

        if (this.transactions.onread[type]) {
          item[1] = this.transactions.transact(type as DataType, 'onread', item[0], item[1]) as T;
        }

        items.push(item);
      }
      return items;
    } else if (type === 'array') {
      for (let i = 0; i < keys.length; i++) {
        const item: [string, T] = [keys[i], this.getArray(keys[i]) as T];

        if (this.transactions.onread[type]) {
          item[1] = this.transactions.transact(type as DataType, 'onread', item[0], item[1]) as T;
        }

        items.push(item);
      }
      return items;
    } else if (type === 'object') {
      for (let i = 0; i < keys.length; i++) {
        const item: [string, T] = [keys[i], this.getMap(keys[i]) as T];

        if (this.transactions.onread[type]) {
          item[1] = this.transactions.transact(type as DataType, 'onread', item[0], item[1]) as T;
        }

        items.push(item);
      }
      return items;
    } else if (type === 'boolean') {
      for (let i = 0; i < keys.length; i++) {
        const item: [string, T] = [keys[i], this.getBool(keys[i]) as T];

        if (this.transactions.onread[type]) {
          item[1] = this.transactions.transact(type as DataType, 'onread', item[0], item[1]) as T;
        }

        items.push(item);
      }
      return items;
    } else if (type === 'number') {
      for (let i = 0; i < keys.length; i++) {
        const item: [string, T] = [keys[i], this.getInt(keys[i]) as T];

        if (this.transactions.onread[type]) {
          item[1] = this.transactions.transact(type as DataType, 'onread', item[0], item[1]) as T;
        }

        items.push(item);
      }
      return items;
    }
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
   * If you are removing large number of keys, use `removeItems` instead.
   */
  removeItem(key: string) {
    let result = handleAction(mmkvJsiModule.removeValueMMKV, key, this.instanceID);
    if (result) {
      if (this.isRegisterd(key)) {
        this.ev.publish(`${key}:onwrite`, { key, value: null });
      }
    }

    if (this.transactions.ondelete) {
      this.transactions.transact('string', 'ondelete', key);
    }

    return result;
  }

  /**
   * Remove multiple items from storage for given keys
   *
   */
  removeItems(...keys: string[]) {
    let result = handleAction(mmkvJsiModule.removeValuesMMKV, keys, this.instanceID);
    for (const key of keys) {
      if (result) {
        if (this.isRegisterd(key)) {
          this.ev.publish(`${key}:onwrite`, { key, value: null });
        }
      }
      if (this.transactions.ondelete) {
        this.transactions.transact('string', 'ondelete', key);
      }
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

    queueMicrotask(() => {
      keys?.forEach((key: string) => {
        if (this.isRegisterd(key)) {
          this.ev.publish(`${key}:onwrite`, { key });
        }

        if (this.transactions.ondelete) {
          this.transactions.transact('string', 'ondelete', key);
        }
      });
    });

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
