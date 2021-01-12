import { initialize, currentInstancesStatus } from "./initializer";
import generatePassword from "./keygen";
import { stringToHex } from "./utils";
import { handleActionAsync } from "react-native-mmkv-storage/src/handlers";

function encryptStorage(
  options,
  key,
  secureKeyStorage = true,
  alias,
  accessibleMode,
  callback
) {
  if (secureKeyStorage) {
    options.mmkv.setSecureKey(
      alias,
      key,
      { accessible: accessibleMode },
      (error) => {
        if (error) {
          return;
        } else {
          options.mmkv
            .encrypt(options.instanceID, key, alias)
            .then((r) => {
              callback(null, r);
            })
            .catch((e) => {
              callback(e, null);
            });
        }
      }
    );
  } else {
    options.mmkv
      .encrypt(options.instanceID, key, null)
      .then((r) => {
        callback(null, r);
      })
      .catch((e) => {
        callback(e, null);
      });
  }
}

export default class encryption {
  constructor(args) {
    this.MMKV = args.mmkv;
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
    return await handleActionAsync(
      this.options,
      this.MMKV.decrypt,
      this.instanceID
    );
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
