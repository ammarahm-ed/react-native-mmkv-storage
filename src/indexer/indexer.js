import stringsIndex from "./strings";
import numbersIndex from "./numbers";
import boolIndex from "./booleans";
import mapsIndex from "./maps";
import arrayIndex from "./arrays";
import { handleAction, handleActionAsync } from "../handlers";
export default class indexer {
  constructor(id) {
    this.instanceID = id;
    this.strings = new stringsIndex(id);
    this.numbers = new numbersIndex(id);
    this.booleans = new boolIndex(id);
    this.maps = new mapsIndex(id);
    this.arrays = new arrayIndex(id);
  }

  async getKeys() {
    return await handleActionAsync(global.getAllKeysMMKV, this.instanceID);
  }

  hasKey(key) {
    return handleAction(global.containsKeyMMKV, key, this.instanceID);
  }
}
