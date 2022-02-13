import { handleAction, handleActionAsync } from '../handlers';
import mmkvJsiModule from '../module';
const INDEX_TYPE = 'stringIndex';
/**
 * Index of all string values in storage
 */
export default class stringsIndex {
  instanceID: string;
  constructor(id: string) {
    this.instanceID = id;
  }

  /**
   * Get all keys
   */
  async getKeys() {
    return await handleActionAsync(mmkvJsiModule.getIndexMMKV, INDEX_TYPE, this.instanceID);
  }

  /**
   * Checck if a key exists
   */
  hasKey(key: string) {
    let keys = handleAction(mmkvJsiModule.getIndexMMKV, INDEX_TYPE, this.instanceID);
    return keys && keys.indexOf(key) > -1;
  }

  /**
   * Get all string values from storage
   */
  async getAll() {
    return new Promise(resolve => {
      let keys = handleAction(mmkvJsiModule.getIndexMMKV, INDEX_TYPE, this.instanceID);
      if (!keys) keys = [];
      let items = [];
      for (let i = 0; i < keys.length; i++) {
        let item = [];
        item[0] = keys[i];
        item[1] = mmkvJsiModule.getStringMMKV(keys[i], this.instanceID);
        items.push(item);
      }
      resolve(items);
    });
  }
}
