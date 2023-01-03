import { options } from './utils';
import IDStore from './mmkv/IDStore';
import mmkvJsiModule from './module';
import { StorageOptions } from './types';

export const currentInstancesStatus: { [name: string]: boolean } = {};

/**
 * Get current instance ID status for instances
 * loaded since application started
 */
export function getCurrentMMKVInstanceIDs() {
  return { ...currentInstancesStatus };
}

/**
 *
 * Initialize function is used to create
 * the storage or load the storage if
 * it already exists with the given options.
 *
 */
export function initialize(id: string) {
  let opts = options[id];

  if (!mmkvJsiModule.setupMMKVInstance) return false;

  if (opts.serviceName && opts.alias && mmkvJsiModule.setMMKVServiceName) {
    mmkvJsiModule.setMMKVServiceName(opts.alias, opts.serviceName);
  }

  if (opts.initWithEncryption && !opts.secureKeyStorage) {
    return initWithEncryptionWithoutSecureStorage(opts);
  }

  if (opts.alias && !mmkvJsiModule.secureKeyExists(opts.alias)) {
    return initWithEncryptionUsingNewKey(opts);
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
  return initWithEncryptionUsingOldKey(opts);
}

/**
 * Usually after first creation of the
 * storage, your database will be
 * initialized with its old key stored
 * in the secure storage.
 *
 */

function initWithEncryptionUsingOldKey(options: StorageOptions) {
  if (!options.alias) return false;
  let key = mmkvJsiModule.getSecureKey(options.alias);
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

function initWithEncryptionUsingNewKey(options: StorageOptions) {
  if (!options.key || options.key.length < 3) throw new Error('Key is null or too short');
  if (!options.alias) return false;
  mmkvJsiModule.setSecureKey(options.alias, options.key, options.accessibleMode);
  return setupWithEncryption(
    options.instanceID,
    options.processingMode,
    options.key,
    options.alias
  );
}

/**
 * It is possible that the user does not
 * want to store the key in secure storage.
 * In such a case, this function will
 * be called to encrypt the storage.
 *
 */

function initWithEncryptionWithoutSecureStorage(options: StorageOptions) {
  if (!options.key || options.key.length < 3) throw new Error('Key is null or too short');
  if (!options.alias) return false;
  return setupWithEncryption(
    options.instanceID,
    options.processingMode,
    options.key,
    options.alias
  );
}

/**
 *
 * When you want to initialize the storage
 * without encryption this function is called.
 *
 */

function initWithoutEncryption(options: StorageOptions) {
  return setup(options.instanceID, options.processingMode);
}

function setup(id: string, mode: number) {
  mmkvJsiModule.setupMMKVInstance(id, mode, '', '');
  if (!IDStore.exists(id)) {
    mmkvJsiModule.setBoolMMKV(id, true, id);
    IDStore.add(id, false, null);
    return true;
  } else {
    if (mmkvJsiModule.containsKeyMMKV(id, id)) {
      return true;
    } else {
      return encryptionHandler(id, mode);
    }
  }
}

function setupWithEncryption(id: string, mode: number, key: string, alias: string) {
  mmkvJsiModule.setupMMKVInstance(id, mode, key, '');
  if (!IDStore.exists(id)) {
    mmkvJsiModule.setBoolMMKV(id, true, id);
    IDStore.add(id, true, alias);
    return true;
  } else {
    if (mmkvJsiModule.containsKeyMMKV(id, id)) {
      options[id].key = key;
      return true;
    } else {
      return encryptionHandler(id, mode);
    }
  }
}

/**
 * When a storage instance is encrypted at runtime, this functions
 * helps in detecting and loading the instance properly.
 */
function encryptionHandler(id: string, mode: number) {
  let alias = IDStore.getAlias(id);
  if (!alias) return mmkvJsiModule.setupMMKVInstance(id, mode, '', '');
  let exists = mmkvJsiModule.secureKeyExists(alias);
  let key = exists && mmkvJsiModule.getSecureKey(alias);

  if (IDStore.encrypted(id) && key) {
    options[id].key = key;
    return mmkvJsiModule.setupMMKVInstance(id, mode, key, '');
  } else {
    return mmkvJsiModule.setupMMKVInstance(id, mode, '', '');
  }
}
