import { DATA_TYPES, promisify } from "../utils";

export default class numbersIndex {
  constructor({ id = "default", mmkv, alias, aliasPrefix, key }) {
    this.MMKV = mmkv;
    this.instanceID = id;
  }
  async getKeys() {
    return await this.MMKV.getTypeIndex(this.instanceID, DATA_TYPES.NUMBER);
  }
  async hasKey(key) {
    return await this.MMKV.typeIndexerHasKey(
      this.instanceID,
      key,
      DATA_TYPES.NUMBER
    );
  }

  async getAll() {
    return promisify(this.MMKV.getItemsForType)(
      this.instanceID,
      DATA_TYPES.NUMBER
    );
  }
}
