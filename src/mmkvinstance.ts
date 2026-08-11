import encryption from './encryption';
import EventManager from './eventmanager';
import { handleAction1, handleAction2, handleAction3, handleAction4 } from './handlers';
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
  indexFlushScheduled: boolean = false;
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

  publishWrite(key: string, value: any) {
    if (!this.ev.hasListenersForKey(key)) return;
    this.ev.publishEvent(`${key}:onwrite`, { key, value });
  }

  scheduleIndexFlush() {
    if (this.indexFlushScheduled || !this.options?.enableIndexing) return;
    this.indexFlushScheduled = true;
    queueMicrotask(() => {
      this.indexFlushScheduled = false;
      mmkvJsiModule.flushIndexesMMKV?.(this.instanceID);
    });
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
    const result = this.setString(key, value);
    callback && callback(null);
    return result;
  }
  /**
   * Get the string value for the given key.
   * This method is added for redux-persist/zustand support.
   */
  async getItem(key: string, callback?: (error?: Error | null, result?: string | null) => void) {
    return this.getString(key, callback);
  }

  /**
   * Set a string value to storage for the given key.
   */
  async setStringAsync(key: string, value: string): Promise<boolean | null | undefined> {
    return this.setString(key, value);
  }
  /**
   * Get the string value for the given key.
   */
  async getStringAsync(key: string): Promise<string | null | undefined> {
    return this.getString(key);
  }
  /**
   * Set a number value to storage for the given key.
   */
  async setIntAsync(key: string, value: number): Promise<boolean | null | undefined> {
    return this.setInt(key, value);
  }
  /**
   * Get the number value for the given key.
   */
  async getIntAsync(key: string): Promise<number | null | undefined> {
    return this.getInt(key);
  }
  /**
   * Set a boolean value to storage for the given key.
   *
   */
  async setBoolAsync(key: string, value: boolean): Promise<boolean | null | undefined> {
    return this.setBool(key, value);
  }
  /**
   * Get the boolean value for the given key.
   */
  async getBoolAsync(key: string): Promise<boolean | null | undefined> {
    return this.getBool(key);
  }
  /**
   * Set an Object to storage for the given key.
   *
   * Note that this function does **not** work with the Map data type.
   *
   */
  async setMapAsync(key: string, value: object): Promise<boolean | null | undefined> {
    return this.setMap(key, value);
  }
  /**
   * Get then Object from storage for the given key.
   */
  async getMapAsync<T>(key: string): Promise<T | null | undefined> {
    return this.getMap<T>(key);
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

    if (type === 'string' || type === 'array' || type === 'map') {
      const values = items.map(item => {
        let value = item[1];

        if (this.transactions.beforewrite[type]) {
          value = this.transactions.transact(type as DataType, 'beforewrite', item[0], value);
        }

        if (type === 'string') return value;
        return value ? JSON.stringify(value) : value;
      });

      handleAction4(
        mmkvJsiModule.setMultiMMKV,
        items.map(item => item[0]),
        values,
        `${type}Index`,
        this.instanceID
      );

      this.scheduleIndexFlush();

      queueMicrotask(() => {
        items?.forEach((item, index) => {
          this.publishWrite(item[0], values[index]);

          if (this.transactions.onwrite[type]) {
            this.transactions.transact(type as DataType, 'onwrite', item[0], values[index]);
          }
        });
      });

      return true;
    }

    for (let i = 0; i < items.length; i++) {
      if (type === 'boolean') {
        this.setBool(items[i][0], items[i][1]);
      } else if (type === 'number') {
        this.setInt(items[i][0], items[i][1]);
      }
    }

    this.scheduleIndexFlush();
    return true;
  }

  /**
   * Retrieve multiple items for the given array of keys
   */
  async getMultipleItemsAsync<T>(keys: string[], type: DataType | 'map'): Promise<[string, T][]> {
    let items: [string, T][] = [];

    if (type === 'map') type = 'object';
    if (type === 'array' || type === 'string' || type === 'object') {
      const result = handleAction2(mmkvJsiModule.getMultiMMKV, keys, this.instanceID);
      if (type === 'string') return keys.map((key, index) => [key, result[index] as T]);

      return keys.map((key, index) => {
        let value = result[index] ? JSON.parse(result[index]) : result[index];

        if (this.transactions.onread[type]) {
          value = this.transactions.transact(type as DataType, 'onread', key, value);
        }

        return [key, value];
      });
    }

    for (let i = 0; i < keys.length; i++) {
      const value = type === 'boolean' ? this.getBool(keys[i]) : this.getInt(keys[i]);
      items.push([keys[i], value as T]);
    }
    return items;
  }

  /**
   * Set an array to storage for the given key.
   */
  async setArrayAsync(key: string, value: any[]): Promise<boolean | null | undefined> {
    return this.setArray(key, value);
  }
  /**
   * Get the array from the storage for the given key.
   */
  async getArrayAsync<T>(key: string): Promise<T[] | null | undefined> {
    return this.getArray<T>(key);
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
    let result = handleAction3(mmkvJsiModule.setStringMMKV, key, value, this.instanceID);
    if (result) {
      this.scheduleIndexFlush();
      this.publishWrite(key, value);

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
    let string = handleAction2(mmkvJsiModule.getStringMMKV, key, this.instanceID);

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

    let result = handleAction3(mmkvJsiModule.setNumberMMKV, key, value, this.instanceID);
    if (result) {
      this.scheduleIndexFlush();
      this.publishWrite(key, value);
      if (this.transactions.onwrite['number']) {
        this.transactions.transact('number', 'onwrite', key, value);
      }
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
    let int = handleAction2(mmkvJsiModule.getNumberMMKV, key, this.instanceID);

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

    let result = handleAction3(mmkvJsiModule.setBoolMMKV, key, value, this.instanceID);
    if (result) {
      this.scheduleIndexFlush();
      this.publishWrite(key, value);

      if (this.transactions.onwrite['boolean']) {
        this.transactions.transact('boolean', 'onwrite', key, value);
      }
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
    let bool = handleAction2(mmkvJsiModule.getBoolMMKV, key, this.instanceID);

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

    let result = handleAction3(
      mmkvJsiModule.setMapMMKV,
      key,
      JSON.stringify(value),
      this.instanceID
    );
    if (result) {
      this.scheduleIndexFlush();
      this.publishWrite(key, value);
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
    let json = handleAction2(mmkvJsiModule.getMapMMKV, key, this.instanceID);
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

    if (this.transactions.onread['object']) {
      this.transactions.transact('object', 'onread', key);
    }

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

    let result = handleAction3(
      mmkvJsiModule.setArrayMMKV,
      key,
      JSON.stringify(value),
      this.instanceID
    );
    if (result) {
      this.scheduleIndexFlush();
      this.publishWrite(key, value);
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
    let json = handleAction2(mmkvJsiModule.getMapMMKV, key, this.instanceID);
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
    if (this.transactions.onread['array']) {
      this.transactions.transact('array', 'onread', key);
    }
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

    if (type === 'string' || type === 'array' || type === 'object') {
      const result = handleAction2(mmkvJsiModule.getMultiMMKV, keys, this.instanceID) || [];

      for (let i = 0; i < keys.length; i++) {
        let value: any = result[i] === undefined ? null : result[i];

        if (value !== null && type !== 'string') {
          try {
            value = JSON.parse(value);
          } catch (e) {
            value = null;
          }
        }

        if (this.transactions.onread[type]) {
          value = this.transactions.transact(type as DataType, 'onread', keys[i], value);
        }

        items.push([keys[i], value as T]);
      }
      return items;
    } else if (type === 'boolean' || type === 'number') {
      for (let i = 0; i < keys.length; i++) {
        const value = type === 'boolean' ? this.getBool(keys[i]) : this.getInt(keys[i]);
        items.push([keys[i], value as T]);
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
    let result = handleAction2(mmkvJsiModule.removeValueMMKV, key, this.instanceID);
    if (result) {
      this.scheduleIndexFlush();
      this.publishWrite(key, null);
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
  removeItems(keys: string[]) {
    let result = handleAction2(
      mmkvJsiModule.removeValuesMMKV,
      keys.filter(key => key !== this.instanceID),
      this.instanceID
    );
    if (result) this.scheduleIndexFlush();
    for (const key of keys) {
      if (result) {
        this.publishWrite(key, null);
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
    let keys = handleAction1(mmkvJsiModule.getAllKeysMMKV, this.instanceID);
    let cleared = handleAction1(mmkvJsiModule.clearMMKV, this.instanceID);
    mmkvJsiModule.setBoolMMKV(this.instanceID, true, this.instanceID);

    queueMicrotask(() => {
      keys?.forEach((key: string) => {
        if (this.ev.hasListenersForKey(key)) {
          this.ev.publishEvent(`${key}:onwrite`, { key });
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
    let cleared = handleAction1(mmkvJsiModule.clearMemoryCache, this.instanceID);
    return cleared;
  }
}
