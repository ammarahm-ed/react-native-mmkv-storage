import { initialize } from "./initializer";
import generatePassword from "./keygen";
import { stringToHex } from "./utils";
import { handleActionAsync } from "react-native-mmkv-storage/src/handlers";

function encryptStorage(key, secureKeyStorage = true, alias, accessibleMode, callback) {

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
      (error, result) => {
        if (error) {
          return;
        } else {
          await this.MMKV.encrypt(this.instanceID, key, this.alias).then(r => {
            callback(null, r);
          }).catch(e => {
            callback(e, null);
          })
        }
      }
    );
  } else {
    this.MMKV.encrypt(this.instanceID, key, null).then(r => {
      callback(null, r);
    }).catch(e => {
      callback(e, null)
    })
  }
}


export default class encryption {
  constructor(args) {
    this.MMKV = args.mmkv;
    this.instanceID = args.id;
    this.alias = args.alias;
    this.aliasPrefix = args.aliasPrefix;
    this.key = args.key;
    this.accessibleMode = args.accessibleMode;
    this.initialized = args.initialized;
    this.options = args;
  }

  async encrypt(key, secureKeyStorage = true, alias, accessibleMode) {
    return new Promise((resolve, reject) => {

      if (!currentInstancesStatus[this.instanceID]) {
        encryptStorage(key, secureKeyStorage, alias, accessibleMode, (e, r) => {
          if (e) {
            reject(e);
          }
          resolve(r);
        }).call(this);

      } else {
        initialize(this.options, (e, r) => {
          if (e) {
            return;
          }
          currentInstancesStatus[this.instanceID] = true;
          encryptStorage(key, secureKeyStorage, alias, accessibleMode, (e, r) => {
            if (e) {
              reject(e);
            }
            resolve(r);
          }).call(this);
        });
      }
    })
  }

  async decrypt() {
    return await handleActionAsync(this.MMKV.decrypt, this.instanceID);
  }

  async changeEncryptionKey(key, secureKeyStorage = true, alias, accessibleMode) {
    return new Promise(async (resolve, reject) => {

      if (!currentInstancesStatus[this.instanceID]) {
        encryptStorage(key, secureKeyStorage, alias, accessibleMode, (e, r) => {
          if (e) {
            reject(e);
          }
          resolve(r);
        }).call(this);

      } else {
        initialize(this.options, (e, r) => {
          if (e) {
            return;
          }
          currentInstancesStatus[this.instanceID] = true;
          encryptStorage(key, secureKeyStorage, alias, accessibleMode, (e, r) => {
            if (e) {
              reject(e);
            }
            resolve(r);
          }).call(this);
        });
      }
    })


  }
}
