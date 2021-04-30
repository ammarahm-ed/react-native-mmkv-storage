import { handleActionAsync, handleAction } from "../handlers";
const INDEX_TYPE = "numberIndex"
export default class numbersIndex {
  constructor(args) {
    this.MMKV = args.mmkv;
    this.instanceID = args.instanceID;
    this.options = args;
  }
  async getKeys() {
    return await handleActionAsync(
      global.getIndexMMKV,
      INDEX_TYPE,
      this.instanceID,
    );
  }

hasKey(key) {
    let keys = handleAction(
      global.getIndexMMKV,
      INDEX_TYPE,
      this.instanceID,
    );
    return keys.indexOf(key) > -1;
  }

  async getAll() {
    return new Promise((resolve) => {
      let keys = handleAction(
        global.getIndexMMKV,
        INDEX_TYPE,
        this.instanceID,
      );
      let items = [];
      for (let i = 0; i < keys.length; i++) {
        let item = [];
        item[0] = keys[i];
        item[1] = global.getNumberMMKV(keys[i], this.instanceID);
        items.push(item);
      }
      resolve(items);
    });
  }
}
