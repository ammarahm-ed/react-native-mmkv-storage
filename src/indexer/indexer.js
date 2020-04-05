import stringsIndex from "./strings";
import numbersIndex from "./numbers";
import boolIndex from "./booleans";
import mapsIndex from "./maps";
import arrayIndex from "./arrays";

export default class indexer {

  constructor({ id = "default", mmkv }) {
    this.MMKV = mmkv;
    this.instanceID = id;
    this.strings = new stringsIndex({ id: id, mmkv: mmkv });
    this.numbers = new numbersIndex({ id: id, mmkv: mmkv });
    this.booleans = new boolIndex({ id: id, mmkv: mmkv });
    this.maps = new mapsIndex({ id: id, mmkv: mmkv });
    this.arrays = new arrayIndex({ id: id, mmkv: mmkv });
  }
  async getKeys() {
    return await this.MMKV.getKeysAsync(this.instanceID);
  }
  async hasKey(key) {
    return await this.MMKV.hasKeyAsync(this.instanceID, key);
  }
}
