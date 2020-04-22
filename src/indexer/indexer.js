import stringsIndex from "./strings";
import numbersIndex from "./numbers";
import boolIndex from "./booleans";
import mapsIndex from "./maps";
import arrayIndex from "./arrays";
import { handleActionAsync } from "../handlers";
export default class indexer {
  constructor(args) {
    this.MMKV = mmkv;
    this.instanceID = id;
    this.options = args;
    this.strings = new stringsIndex({ id: args.id, mmkv: args.mmkv });
    this.numbers = new numbersIndex({ id: args.id, mmkv: args.mmkv });
    this.booleans = new boolIndex({ id: args.id, mmkv: args.mmkv });
    this.maps = new mapsIndex({ id: args.id, mmkv: args.mmkv });
    this.arrays = new arrayIndex({ id: args.id, mmkv: args.mmkv });
  }

  async getKeys() {
    return await handleActionAsync(this.MMKV.getKeys, this.instanceID);
  }

  async hasKey(key) {
    return await handleActionAsync(this.MMKV.hasKey, this.instanceID, key);
  }
}
