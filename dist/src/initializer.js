var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import { options } from './utils';
import IDStore from './mmkv/IDStore';
import mmkvJsiModule from './module';
export var currentInstancesStatus = {};
/**
 * Get current instance ID status for instances
 * loaded since application started
 */
export function getCurrentMMKVInstanceIDs() {
    return __assign({}, currentInstancesStatus);
}
/**
 *
 * Initialize function is used to create
 * the storage or load the storage if
 * it already exists with the given options.
 *
 */
export function initialize(id) {
    var opts = options[id];
    if (!mmkvJsiModule.setupMMKVInstance)
        return false;
    if (opts.serviceName && opts.alias && mmkvJsiModule.setMMKVServiceName) {
        mmkvJsiModule.setMMKVServiceName(opts.alias, opts.serviceName);
    }
    if (IDStore.exists(id)) {
        if (!IDStore.encrypted(id)) {
            return initWithoutEncryption(opts);
        }
        opts.alias = IDStore.getAlias(id);
        return initWithEncryptionUsingOldKey(opts);
    }
    if (!opts.initWithEncryption) {
        return initWithoutEncryption(opts);
    }
    if (!opts.secureKeyStorage) {
        return initWithEncryptionWithoutSecureStorage(opts);
    }
    if (opts.alias && !mmkvJsiModule.secureKeyExists(opts.alias)) {
        return initWithEncryptionUsingNewKey(opts);
    }
    return initWithEncryptionUsingOldKey(opts);
}
/**
 * Usually after first creation of the
 * storage, your database will be
 * initialized with its old key stored
 * in the secure storage.
 *
 */
function initWithEncryptionUsingOldKey(options) {
    if (!options.alias)
        return false;
    var key = mmkvJsiModule.getSecureKey(options.alias);
    if (key) {
        return setupWithEncryption(options.instanceID, options.processingMode, key, options.alias);
    }
    return false;
}
/**
 * For first creation of storage
 * this function is called when
 * you are encrypting it on initialzation
 *
 */
function initWithEncryptionUsingNewKey(options) {
    if (!options.key || options.key.length < 3)
        throw new Error('Key is null or too short');
    if (!options.alias)
        return false;
    mmkvJsiModule.setSecureKey(options.alias, options.key, options.accessibleMode);
    return setupWithEncryption(options.instanceID, options.processingMode, options.key, options.alias);
}
/**
 * It is possible that the user does not
 * want to store the key in secure storage.
 * In such a case, this function will
 * be called to encrypt the storage.
 *
 */
function initWithEncryptionWithoutSecureStorage(options) {
    if (!options.key || options.key.length < 3)
        throw new Error('Key is null or too short');
    if (!options.alias)
        return false;
    return setupWithEncryption(options.instanceID, options.processingMode, options.key, options.alias);
}
/**
 *
 * When you want to initialize the storage
 * without encryption this function is called.
 *
 */
function initWithoutEncryption(options) {
    return setup(options.instanceID, options.processingMode);
}
function setup(id, mode) {
    mmkvJsiModule.setupMMKVInstance(id, mode, '', '');
    if (!IDStore.exists(id)) {
        mmkvJsiModule.setBoolMMKV(id, true, id);
        IDStore.add(id, false, null);
        return true;
    }
    else {
        if (mmkvJsiModule.containsKeyMMKV(id, id)) {
            return true;
        }
        else {
            return encryptionHandler(id, mode);
        }
    }
}
function setupWithEncryption(id, mode, key, alias) {
    mmkvJsiModule.setupMMKVInstance(id, mode, key, '');
    if (!IDStore.exists(id)) {
        mmkvJsiModule.setBoolMMKV(id, true, id);
        IDStore.add(id, true, alias);
        return true;
    }
    else {
        if (mmkvJsiModule.containsKeyMMKV(id, id)) {
            options[id].key = key;
            return true;
        }
        else {
            return encryptionHandler(id, mode);
        }
    }
}
/**
 * When a storage instance is encrypted at runtime, this functions
 * helps in detecting and loading the instance properly.
 */
function encryptionHandler(id, mode) {
    var alias = IDStore.getAlias(id);
    if (!alias)
        return mmkvJsiModule.setupMMKVInstance(id, mode, '', '');
    var exists = mmkvJsiModule.secureKeyExists(alias);
    var key = exists && mmkvJsiModule.getSecureKey(alias);
    if (IDStore.encrypted(id) && key) {
        options[id].key = key;
        return mmkvJsiModule.setupMMKVInstance(id, mode, key, '');
    }
    else {
        return mmkvJsiModule.setupMMKVInstance(id, mode, '', '');
    }
}
