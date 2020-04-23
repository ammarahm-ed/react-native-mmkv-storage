import stringsIndex from "./strings";
import numbersIndex from "./numbers";
import boolIndex from "./booleans";
import mapsIndex from "./maps";
import arrayIndex from "./arrays";
import { handleActionAsync } from "../handlers";
export default class indexer {
  constructor(args) {
    this.MMKV = args.mmkv;
    this.instanceID = args.instanceID;
    this.options = args;
    this.strings = new stringsIndex(args);
    this.numbers = new numbersIndex(args);
    this.booleans = new boolIndex(args);
    this.maps = new mapsIndex(args);
    this.arrays = new arrayIndex(args);
  
  }

  async getKeys() {
    return await handleActionAsync(this.options,this.MMKV.getKeys, this.instanceID);
  }

  async hasKey(key) {
    return await handleActionAsync(this.options,this.MMKV.hasKey, this.instanceID, key);
  }
}
