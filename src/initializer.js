import { options } from "./utils";
import IDStore from "./mmkv/IDStore";

export const currentInstancesStatus = {};

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
 * @param {string} id
 */

export function initialize(id) {
  let opts = options[id];

  if (!global.setupMMKVInstance) return false;
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
  if (!global.secureKeyExists(opts.alias)) {
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
 * @param {*} options The options you have set for storage in loader class
 */

function initWithEncryptionUsingOldKey(options) {
  let key = global.getSecureKey(options.alias);
  if (key) {
    return setupWithEncryption(
      options.instanceID,
      options.processingMode,
      key,
      options.alias
    );
  }
}

/**
 * For first creation of storage
 * this function is called when
 * you are encrypting it on initialzation
 *
 * @param {*} options The options you have set for storage in loader class
 */

function initWithEncryptionUsingNewKey(options) {
  if (!options.key || options.key.length < 3)
    throw new Error("Key is null or too short");

  global.setSecureKey(options.alias, options.key, options.accessibleMode);
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
 * @param {*} options The options you have set for storage in loader class
 */

function initWithEncryptionWithoutSecureStorage(options) {
  if (!options.key || options.key.length < 3)
    throw new Error("Key is null or too short");

  return setupWithEncryption(
    options.instanceID,
    options.processingMode,
    options.key,
    options.alias
  );
}

/**
 *
 * When you want to initializ the storage
 * without encryption this function is called.
 *
 * @param {*} options The options you have set for storage in loader class
 */

function initWithoutEncryption(options) {
  return setup(options.instanceID, options.processingMode);
}

function setup(id, mode) {
  global.setupMMKVInstance(id, mode, "", "");
  if (!IDStore.exists(id)) {
    global.setBoolMMKV(id, true, id);
    IDStore.add(id, false, null);
    return true;
  } else {
    if (global.containsKeyMMKV(id, id)) {
      return true;
    } else {
      return encryptionHandler(id, mode);
    }
  }
}

function setupWithEncryption(id, mode, key, alias) {
  global.setupMMKVInstance(id, mode, key, "");
  if (!IDStore.exists(id)) {
    global.setBoolMMKV(id, true, id);
    IDStore.add(id, true, alias);
    return true;
  } else {
    if (global.containsKeyMMKV(id, id)) {
      options[id].key = key;
      return true;
    } else {
      return encryptionHandler(id, mode);
    }
  }
}

function encryptionHandler(id, mode) {
  alias = IDStore.getAlias(id);
  if (IDStore.encrypted(id)) {
    let exists = global.secureKeyExists(alias);
    if (exists) {
      let key = global.getSecureKey(alias);
      if (key) {
        global.setupMMKVInstance(id, mode, key, "");
        options[id].key = key;
        return true;
      }
    }
  } else {
    global.setupMMKVInstance(id, mode, "", "");
    return true;
  }
}
