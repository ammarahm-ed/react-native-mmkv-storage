import { initialize, currentInstancesStatus } from "./initializer";
import generatePassword from "./keygen";
import { options, stringToHex } from "./utils";
import { handleAction } from "./handlers";
import IDStore from "./mmkv/IDStore";

function encryptStorage(
  id,
  key,
  secureKeyStorage = true,
  alias,
  accessibleMode
) {
  if (secureKeyStorage) {
    global.setSecureKey(alias, key, accessibleMode);
    global.encryptMMKV(key, id);
    global.setBoolMMKV(id, true, id);
    IDStore.add(id, true, alias);
  } else {
    global.encryptMMKV(key, id);
    global.setBoolMMKV(id, true, id);
    IDStore.add(id, true, null);
  }
  return true;
}

export default class encryption {
  constructor(id) {
    let opts = options[id];

    this.instanceID = opts.instanceID;
    this.alias = opts.alias;
    this.aliasPrefix = opts.aliasPrefix;
    this.key = opts.key;
    this.accessibleMode = opts.accessibleMode;
    this.initialized = opts.initialized;
  }

  encrypt(key, secureKeyStorage = true, alias, accessibleMode) {
    if (accessibleMode) {
      this.accessibleMode = accessibleMode;
    }

    this.alias = stringToHex(this.aliasPrefix + this.instanceID);
    this.key = key || generatePassword();
    options[this.instanceID].key = this.key;

    if (secureKeyStorage) {
      this.alias = stringToHex(
        alias ? this.aliasPrefix + alias : this.aliasPrefix + this.instanceID
      );
    }
    options[this.instanceID].alias = this.alias;

    if (!currentInstancesStatus[this.instanceID]) {
      initialize(this.instanceID);
      currentInstancesStatus[this.instanceID] = true;
    }
    return encryptStorage(
      this.instanceID,
      this.key,
      secureKeyStorage,
      this.alias,
      this.accessibleMode
    );
  }

  decrypt() {
    handleAction(global.decryptMMKV, this.instanceID);
    global.setBoolMMKV(this.instanceID, false, this.instanceID);
    IDStore.add(this.instanceID, true, null);
    return true;
  }

  changeEncryptionKey(key, secureKeyStorage = true, alias, accessibleMode) {
    return this.encrypt(key, secureKeyStorage, alias, accessibleMode);
  }
}
