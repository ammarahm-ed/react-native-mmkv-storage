import generatePassword from "./keygen";
import API from "./api";
import { stringToHex, ACCESSIBLE, MODES, options } from "./utils";
import { currentInstancesStatus } from "./initializer";
import { handleAction } from "./handlers";

export default class Loader {
  constructor() {
    this.options = {
      instanceID: "default",
      initWithEncryption: false,
      secureKeyStorage: false,
      accessibleMode: ACCESSIBLE.WHEN_UNLOCKED,
      processingMode: MODES.SINGLE_PROCESS,
      aliasPrefix: "com.MMKV.",
      alias: null,
      key: null,
      initialized: false,
    };
  }

  withInstanceID(id) {
    this.options.instanceID = id;

    return this;
  }

  withEncryption() {
    this.options.initWithEncryption = true;
    this.options.key = generatePassword();
    this.options.alias = stringToHex(
      this.options.aliasPrefix + this.options.instanceID
    );
    this.options.secureKeyStorage = true;
    return this;
  }

  setAccessibleIOS(accessible) {
    this.options.accessibleMode = accessible;
    return this;
  }

  encryptWithCustomKey(key, secureKeyStorage, alias) {
    this.options.key = key;
    this.options.secureKeyStorage = false;
    if (secureKeyStorage) {
      this.options.secureKeyStorage = true;
      if (alias) {
        this.options.alias = stringToHex(this.options.aliasPrefix + alias);
      } else {
        this.options.alias = stringToHex(
          this.options.aliasPrefix + this.options.instanceID
        );
      }
    }

    return this;
  }

  setProcessingMode(mode) {
    this.options.processingMode = mode;

    return this;
  }

  initialize() {
    currentInstancesStatus[this.options.instanceID] = false;
    let instance = new API(this.options);
    options[this.options.instanceID] = this.options;
    handleAction(null, this.options.instanceID);
    return instance;
  }

  generateKey() {
    this.options.key = generatePassword();
    return this;
  }
}
