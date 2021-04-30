import {
  handleActionAsync,
  handleAction,
} from '../handlers';

const INDEX_TYPE = 'arrayIndex';
export default class arrayIndex {
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

  async hasKey(key) {
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
        let array = global.getArrayMMKV(keys[i], this.instanceID);
        item[1] = JSON.parse(array);
        items.push(item);
      }
      resolve(items);

    });
  }
}
