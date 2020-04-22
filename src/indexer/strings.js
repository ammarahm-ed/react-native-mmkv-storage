import { handleAction, handleActionAsync } from "../handlers";
import { DATA_TYPES } from "../utils";
export default class stringsIndex {
  constructor({ id = "default", mmkv }) {
    this.MMKV = mmkv;
    this.instanceID = id;
  }

  async getKeys() {
    return await handleActionAsync(
      this.MMKV.getTypeIndex,
      this.instanceID,
      DATA_TYPES.STRING
    );
  }

  async hasKey(key) {
    return await handleActionAsync(
      this.MMKV.typeIndexerHasKey,
      this.instanceID,
      key,
      DATA_TYPES.STRING
    );
  }

  async getAll() {
    return new Promise((resolve, reject) => {
      handleAction(
        this.MMKV.getItemsForType,
        (error, result) => {
          if (error) {
            reject(error);
            return;
          }
          resolve(result);
        },
        this.instanceID,
        DATA_TYPES.STRING
      );
    });
  }
}
