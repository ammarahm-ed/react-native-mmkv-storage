import { handleActionAsync, handleAction } from '../handlers';
import mmkvJsiModule from '../module';
import type { GenericReturnType, JsonReviver } from '../types';
const INDEX_TYPE = 'mapIndex';

/**
 * Index of all objects stored in storage.
 */
export default class mapsIndex {
  instanceID: string;
  constructor(id: string) {
    this.instanceID = id;
  }

  /**
   *
   * Get all keys
   */
  async getKeys() {
    return await handleActionAsync(mmkvJsiModule.getIndexMMKV, INDEX_TYPE, this.instanceID);
  }

  /**
   * Check if a key exists.
   */
  hasKey(key: string) {
    let keys = handleAction(mmkvJsiModule.getIndexMMKV, INDEX_TYPE, this.instanceID);
    return keys && keys.indexOf(key) > -1;
  }

  /**
   * Get all objects stored in storage.
   */
  async getAll<T>(reviver?: JsonReviver) {
    return new Promise(resolve => {
      let keys = handleAction(mmkvJsiModule.getIndexMMKV, INDEX_TYPE, this.instanceID);
      if (!keys) keys = [];
      let items: GenericReturnType<T>[] = [];
      for (let i = 0; i < keys.length; i++) {
        //@ts-ignore
        let item: GenericReturnType<T> = [];
        item[0] = keys[i];
        let map = mmkvJsiModule.getMapMMKV(keys[i], this.instanceID);
        item[1] = map ? JSON.parse(map, reviver) : null;
        items.push(item);
      }
      resolve(items);
    });
  }
}
