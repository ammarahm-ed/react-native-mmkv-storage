import { stringToHex, ACCESSIBLE } from "./utils";
import generatePassword from "./keygen";

export default class encryption {
  constructor({
    id = "default",
    mmkv,
    alias,
    aliasPrefix,
    key,
    accessibleMode = ACCESSIBLE.WHEN_UNLOCKED,
  }) {
    this.MMKV = mmkv;
    this.instanceID = id;
    this.alias = alias;
    this.aliasPrefix = aliasPrefix;
    this.key = key;
    this.accessibleMode = accessibleMode;
  }

  async encrypt(key, secureKeyStorage = true, alias, accessibleMode) {
    if (accessibleMode) {
      this.accessibleMode = accessibleMode;
    }

    this.alias = stringToHex(this.aliasPrefix + this.instanceID);
    if (key) {
      this.key = key;
    } else {
      this.key = generatePassword();
    }

    if (secureKeyStorage) {
      if (alias) {
        if (alias) {
          this.alias = stringToHex(this.aliasPrefix + alias);
        } else {
          this.alias = stringToHex(this.aliasPrefix + this.instanceID);
        }
      }
      this.MMKV.setSecureKey(
        this.alias,
        this.key,
        { accessible: this.accessibleMode },
        async (error, result) => {
          if (error) {
            return;
          } else {
            await this.MMKV.encrypt(this.instanceID, key, this.alias);
          }
        }
      );
    } else {
      await this.MMKV.encrypt(this.instanceID, key, null);
    }
  }

  async decrypt() {
    await this.MMKV.decrypt(this.instanceID);
  }

  async changeEncryptionKey(key, secureKeyStorage, alias) {
    if (key) {
      this.key = key;
    } else {
      this.key = generatePassword();
    }

    if (secureKeyStorage) {
      if (alias) {
        this.alias = stringToHex(this.aliasPrefix + alias);
      }
      this.MMKV.setSecureKey(
        this.alias,
        this.key,
        { accessible: this.accessibleMode },
        async (error, result) => {
          if (error) {
            return;
          } else {
            await this.MMKV.encrypt(key, this.alias);
          }
        }
      );
    } else {
      await this.MMKV.encrypt(key, null);
    }
  }
}
