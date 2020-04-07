import { DATA_TYPES, promisify } from "../utils";

export default class stringsIndex {
  constructor({ id = "default", mmkv }) {
    this.MMKV = mmkv;
    this.instanceID = id;
  }

  async getKeys() {
    return await this.MMKV.getTypeIndex(this.instanceID, DATA_TYPES.STRING);
  }

  async hasKey(key) {
    return await this.MMKV.typeIndexerHasKey(
      this.instanceID,
      key,
      DATA_TYPES.STRING
    );
  }

  async getAll() {
    return promisify(this.MMKV.getItemsForType)(
      this.instanceID,
      DATA_TYPES.STRING
    );
  }
}
