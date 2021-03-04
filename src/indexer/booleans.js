import { handleActionAsync, handleAction } from "react-native-mmkv-storage/src/handlers";
const INDEX_TYPE = "boolIndex"
export default class boolIndex {
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
    let keys = await handleActionAsync(
      global.getIndexMMKV,
      INDEX_TYPE,
      this.instanceID,
    );
    return keys.indexOf(key) > -1;
  }

  async getAll() {
    return new Promise((resolve) => {
      handleAction(
        (error, result) => {
          if (!result) {
            resolve([]);
            return;
          }
          let items = [];
          for (let i = 0; i < result.length; i++) {
            let item = [];
            item[0] = result[i];
            item[1] = global.getBoolMMKV(result[i], this.instanceID);
            items.push(item);
          }
          resolve(items);
        },
        global.getIndexMMKV,
        INDEX_TYPE,
        this.instanceID,
      );
    });
  }
}
