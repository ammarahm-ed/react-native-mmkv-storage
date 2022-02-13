import { handleActionAsync, handleAction } from '../handlers';
import mmkvJsiModule from '../module';
import { GenericReturnType } from '../types';
const INDEX_TYPE = 'arrayIndex';

/**
 * Index of all array values stored in storage
 */
export default class arrayIndex {
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
   * Get all arrays from storage.
   */
  async getAll<T>() {
    return new Promise(resolve => {
      let keys = handleAction(mmkvJsiModule.getIndexMMKV, INDEX_TYPE, this.instanceID);
      if (!keys) keys = [];
      let items: GenericReturnType<T>[] = [];
      for (let i = 0; i < keys.length; i++) {
        //@ts-ignore
        let item: GenericReturnType = [];
        item[0] = keys[i];
        let array = mmkvJsiModule.getArrayMMKV(keys[i], this.instanceID);

        item[1] = array ? JSON.parse(array) : null;
        items.push(item);
      }
      resolve(items);
    });
  }
}
