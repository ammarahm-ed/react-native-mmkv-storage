import { initialize } from "./initializer";
import generatePassword from "./keygen";
import { stringToHex } from "./utils";

function encryptStorage(key, secureKeyStorage = true, alias, accessibleMode, resolve,reject) {
 
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
            reject(error);
            return;
          } else {
            await this.MMKV.encrypt(this.instanceID, key, this.alias);
            resolve(true);
          }
        }
      );
    } else {
      await this.MMKV.encrypt(this.instanceID, key, null);
      resolve(true);
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
    return new Promise(async (resolve, reject) => {
      
        if (!currentInstancesStatus[this.instanceID]) {
          encryptStorage(key,secureKeyStorage,alias,accessibleMode,resolve,reject).call(this);
         
        } else {
          initialize(this.options,(e,r) => {
            if (e) {
              return;
            }
            currentInstancesStatus[this.instanceID] = true;
            encryptStorage(key,secureKeyStorage,alias,accessibleMode,resolve,reject).call(this);
           });
        }
      })
  }

  async decrypt() {
    if (!currentInstancesStatus[this.instanceID]) { 
      currentInstancesStatus[this.instanceID] = true;
      initialize(this.options,(e,r) => {
        if (e) {
          return;
        }

        await this.MMKV.decrypt(this.instanceID);

      })

    } else {
      await this.MMKV.decrypt(this.instanceID);
      }
   
  }

  async changeEncryptionKey(key, secureKeyStorage = true, alias,accessibleMode) {
    return new Promise(async (resolve, reject) => {
    
        if (!currentInstancesStatus[this.instanceID]) {
          encryptStorage(key,secureKeyStorage,alias,accessibleMode,resolve,reject).call(this);
         
        } else {
          initialize(this.options,(e,r) => {
            if (e) {
              return;
            }
            currentInstancesStatus[this.instanceID] = true;
            encryptStorage(key,secureKeyStorage,alias,accessibleMode,resolve,reject).call(this);
           });
        }
      })
   

  }
}
