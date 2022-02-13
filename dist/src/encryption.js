import { initialize, currentInstancesStatus } from './initializer';
import generatePassword from './keygen';
import { options, stringToHex } from './utils';
import { handleAction } from './handlers';
import IDStore from './mmkv/IDStore';
import mmkvJsiModule from './module';
function encryptStorage(id, key, secureKeyStorage, alias, accessibleMode) {
    if (secureKeyStorage === void 0) { secureKeyStorage = true; }
    if (secureKeyStorage) {
        mmkvJsiModule.setSecureKey(alias, key, accessibleMode);
        mmkvJsiModule.encryptMMKV(key, id);
        mmkvJsiModule.setBoolMMKV(id, true, id);
        IDStore.add(id, true, alias);
    }
    else {
        mmkvJsiModule.encryptMMKV(key, id);
        mmkvJsiModule.setBoolMMKV(id, true, id);
        IDStore.add(id, true, null);
    }
    return true;
}
var encryption = /** @class */ (function () {
    function encryption(id) {
        var opts = options[id];
        this.instanceID = opts.instanceID;
        this.alias = opts.alias;
        this.aliasPrefix = opts.aliasPrefix;
        this.key = opts.key;
        this.accessibleMode = opts.accessibleMode;
        this.initialized = opts.initialized;
    }
    /**
     * You can encrypt an MMKV instance anytime, even after it is created.
     *
     * Calling this without a key will generate a key itself & store it in secure storage.
     * If no parameters are provided, a key is generated and securely stored in the storage with the default alias for later use.
     *
     * Note that you don't need to use this method if you use `withEncryption()` at initialization.
     * This is only used for encrypting an unencrypted instance at runtime.
     *
     * @param key; Provide a custom key to encrypt the storage.
     * @param secureKeyStorage Store the key in secure storage.
     * @param alias Provide a custom alias to store the key with in secure storage
     * @param accessibleMode Set accessible mode for secure storage on ios devices
     * @returns An object with alias and key
     */
    encryption.prototype.encrypt = function (key, secureKeyStorage, alias, accessibleMode) {
        if (secureKeyStorage === void 0) { secureKeyStorage = true; }
        if (accessibleMode) {
            this.accessibleMode = accessibleMode;
        }
        this.alias = stringToHex(this.aliasPrefix + this.instanceID);
        this.key = key || generatePassword();
        options[this.instanceID].key = this.key;
        if (secureKeyStorage) {
            this.alias = stringToHex(alias ? this.aliasPrefix + alias : this.aliasPrefix + this.instanceID);
        }
        options[this.instanceID].alias = this.alias;
        if (!currentInstancesStatus[this.instanceID]) {
            initialize(this.instanceID);
            currentInstancesStatus[this.instanceID] = true;
        }
        return encryptStorage(this.instanceID, this.key, secureKeyStorage, this.alias, this.accessibleMode);
    };
    /**
     * You can decrypt an encrypted MMKV instance anytime, even after it is created.
     * Decrypting the storage will delete the key you encrypted it with
     *
     */
    encryption.prototype.decrypt = function () {
        handleAction(mmkvJsiModule.decryptMMKV, this.instanceID);
        mmkvJsiModule.setBoolMMKV(this.instanceID, true, this.instanceID);
        IDStore.add(this.instanceID, false, null);
        return true;
    };
    /**
     * Change the encryption key incase the old one has been compromised.
     * @param  key; Provide a custom key to encrypt the storage.
     * @param secureKeyStorage Store the key in secure storage.
     * @param alias Provide a custom alias to store the key with in secure storage
     * @param accessibleMode Set accessible mode for secure storage on ios devices
     */
    encryption.prototype.changeEncryptionKey = function (key, secureKeyStorage, alias, accessibleMode) {
        if (secureKeyStorage === void 0) { secureKeyStorage = true; }
        return this.encrypt(key, secureKeyStorage, alias, accessibleMode);
    };
    return encryption;
}());
export default encryption;
