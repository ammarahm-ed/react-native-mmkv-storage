import { initialize, currentInstancesStatus } from "./initializer";
import generatePassword from "./keygen";
import { stringToHex } from "./utils";
import { handleActionAsync } from "./handlers";
import IDStore from "./mmkv/IDStore";

function encryptStorage(
  options,
  key,
  secureKeyStorage = true,
  alias,
  accessibleMode,
  callback
) {
  if (secureKeyStorage) {
    global.setSecureKey(alias, key, accessibleMode);
    global.encryptMMKV(key, options.instanceID);
    global.setBoolMMKV(options.instanceID, true, options.instanceID);
    IDStore.add(options.instanceID, true, alias);
    callback(null, true);
  } else {
    global.encryptMMKV(key, options.instanceID);
    global.setBoolMMKV(options.instanceID, true, options.instanceID);
    IDStore.add(options.instanceID, true, null);
    callback(null, true);
  }
}

export default class encryption {
  constructor(args) {
    this.instanceID = args.instanceID;
    this.alias = args.alias;
    this.aliasPrefix = args.aliasPrefix;
    this.key = args.key;
    this.accessibleMode = args.accessibleMode;
    this.initialized = args.initialized;
    this.options = args;
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
    }

    return new Promise((resolve, reject) => {
      if (currentInstancesStatus[this.instanceID]) {
        encryptStorage(
          this.options,
          this.key,
          secureKeyStorage,
          this.alias,
          this.accessibleMode,
          (e, r) => {
            if (e) {
              reject(e);
            }
            resolve(r);
          }
        );
      } else {
        initialize(this.options, (e) => {
          if (e) {
            return;
          }
          currentInstancesStatus[this.instanceID] = true;
          encryptStorage(
            this.options,
            this.key,
            secureKeyStorage,
            this.alias,
            this.accessibleMode,
            (e, r) => {
              if (e) {
                reject(e);
              }
              resolve(r);
            }
          );
        });
      }
    });
  }

  async decrypt() {
    await handleActionAsync(global.decryptMMKV, this.instanceID);
    global.setBoolMMKV(options.instanceID, false, options.instanceID);
    IDStore.add(options.instanceID, true, null);
    return true;
  }

  async changeEncryptionKey(
    key,
    secureKeyStorage = true,
    alias,
    accessibleMode
  ) {
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
    }

    return new Promise(async (resolve, reject) => {
      if (currentInstancesStatus[this.instanceID]) {
        encryptStorage(
          this.options,
          this.key,
          secureKeyStorage,
          this.alias,
          this.accessibleMode,
          (e, r) => {
            if (e) {
              reject(e);
            }
            resolve(r);
          }
        );
      } else {
        initialize(this.options, (e) => {
          if (e) {
            return;
          }
          currentInstancesStatus[this.instanceID] = true;
          encryptStorage(
            this.options,
            this.key,
            secureKeyStorage,
            this.alias,
            this.accessibleMode,
            (e, r) => {
              if (e) {
                reject(e);
              }
              resolve(r);
            }
          );
        });
      }
    });
  }
}
