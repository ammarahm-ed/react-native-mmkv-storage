import IDStore from 'react-native-mmkv-storage/src/mmkv/IDStore';
import {NativeModules} from 'react-native';
const MMKV = NativeModules.MMKVStorage;

export const currentInstancesStatus = {};

/**
 *
 * Initialize function is used to create
 * the storage or load the storage if
 * it already exists with the given options.
 *
 * @param {*} options
 * @param {Function} callback
 */

export function initialize(options, callback) {
  if (IDStore.exists(options.instanceID)) {
    if (IDStore.encrypted(options.instanceID)) {
      options.alias = IDStore.getAlias(options.instanceID);
      initWithEncryptionUsingOldKey(options, callback);
    } else {
      initWithoutEncryption(options, callback);
    }
  } else if (options.initWithEncryption) {
    if (options.secureKeyStorage) {
      MMKV.secureKeyExists(options.alias, (error, exists) => {
        if (error) {
          callback(error, null);
        }
        if (exists) {
          initWithEncryptionUsingOldKey(options, callback);
        } else {
          initWithEncryptionUsingNewKey(options, callback);
        }
      });
    } else {
      initWithEncryptionWithoutSecureStorage(options, callback);
    }
  } else {
    initWithoutEncryption(options, callback);
  }
}

/**
 * Usually after first creation of the
 * storage, your database will be
 * initialized with its old key stored
 * in the secure storage.
 *
 * @param {*} options The options you have set for storage in loader class
 * @param {Function} callback A function called with two params, error & result
 */

function initWithEncryptionUsingOldKey(options, callback) {
  MMKV.getSecureKey(options.alias, (error, key) => {
    if (error) {
      callback(error, null);
      return;
    }
    if (key) {
      setupWithEncryption(
        options.instanceID,
        options.processingMode,
        key,
        options.alias,
        callback,
      );
    }
  });
}

/**
 * For first creation of storage
 * this function is called when
 * you are encrypting it on initialzation
 *
 * @param {*} options The options you have set for storage in loader class
 * @param {Function} callback A function called with two params, error & result
 */

function initWithEncryptionUsingNewKey(options, callback) {
  if (options.key == null || options.key.length < 3)
    throw new Error('Key is null or too short');

  MMKV.setSecureKey(
    options.alias,
    options.key,
    {accessible: options.accessibleMode},
    (error) => {
      if (error) {
        callback(error, null);
      }

      setupWithEncryption(
        options.instanceID,
        options.processingMode,
        options.key,
        options.alias,
        callback,
      );
    },
  );
}

/**
 * It is possible that the user does not
 * want to store the key in secure storage.
 * In such a case, this function will
 * be called to encrypt the storage.
 *
 * @param {*} options The options you have set for storage in loader class
 * @param {Function} callback A function called with two params, error & result
 */

function initWithEncryptionWithoutSecureStorage(options, callback) {
  if (options.key == null || options.key.length < 3)
    throw new Error('Key is null or too short');

  setupWithEncryption(
    options.instanceID,
    options.processingMode,
    options.key,
    options.alias,
    callback,
  );
}

/**
 *
 * When you want to initializ the storage
 * without encryption this function is called.
 *
 * @param {*} options The options you have set for storage in loader class
 * @param {Function} callback A function called with two params, error & result
 */

function initWithoutEncryption(options, callback) {
  setup(options.instanceID, options.processingMode, callback);
}

function setup(id, mode, callback) {
  global.setupMMKVInstance(id, mode, '', '');
  if (!IDStore.exists(id)) {
    global.setBoolMMKV(id, true, id);
    IDStore.add(id, false, null);
    callback(null, true);
  } else {
    if (global.containsKeyMMKV(id, id)) {
      callback(null, true);
    } else {
      encryptionHandler(id, mode, callback);
    }
  }
}

function setupWithEncryption(id, mode, key, alias, callback) {
  global.setupMMKVInstance(id, mode, key, '');

  if (!IDStore.exists(id)) {
    global.setBoolMMKV(id, true, id);
    IDStore.add(id, true, alias);
    callback(null, true);
  } else {
    if (global.containsKeyMMKV(id, id)) {
      callback(null, true);
    } else {
      encryptionHandler(id, mode, callback);
    }
  }
}

function encryptionHandler(id, mode, callback) {
  alias = IDStore.getAlias(id);
  if (IDStore.encrypted(id)) {
    MMKV.secureKeyExists(alias, (error, exists) => {
      if (error) {
        callback(error, null);
      }
      if (exists) {
        MMKV.getSecureKey(alias, (error, key) => {
          if (error) {
            callback(error, null);
            return;
          }
          if (key) {
            global.setupMMKVInstance(id, mode, key, '');
            callback(null, true);
          }
        });
      }
    });
  } else {
    global.setupMMKVInstance(id, mode, '', '');
    callback(null, true);
  }
}
