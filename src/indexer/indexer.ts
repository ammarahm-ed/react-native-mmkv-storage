import stringsIndex from './strings';
import numbersIndex from './numbers';
import boolIndex from './booleans';
import mapsIndex from './maps';
import arrayIndex from './arrays';
import { handleAction, handleActionAsync } from '../handlers';
import mmkvJsiModule from '../module';

export default class indexer {
  instanceID: string;
  strings: stringsIndex;
  numbers: numbersIndex;
  booleans: boolIndex;
  maps: mapsIndex;
  arrays: arrayIndex;

  constructor(id: string) {
    this.instanceID = id;
    this.strings = new stringsIndex(id);
    this.numbers = new numbersIndex(id);
    this.booleans = new boolIndex(id);
    this.maps = new mapsIndex(id);
    this.arrays = new arrayIndex(id);
  }

  /**
   * Get all keys from storage.
   *
   */
  async getKeys() {
    return await handleActionAsync(mmkvJsiModule.getAllKeysMMKV, this.instanceID);
  }

  /**
   * Check if a key exists in storage.
   */
  hasKey(key: string) {
    return handleAction(mmkvJsiModule.containsKeyMMKV, key, this.instanceID);
  }
}
