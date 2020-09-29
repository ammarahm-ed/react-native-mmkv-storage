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
  if (options.initWithEncryption) {
    if (options.secureKeyStorage) {
      options.mmkv.secureKeyExists(options.alias, (error, exists) => {
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
  options.mmkv.getSecureKey(options.alias, (error, value) => {
    if (error) {
      callback(error, null);
      return;
    }
    if (value) {
      options.mmkv.setupWithEncryption(
        options.instanceID,
        options.processingMode,
        value,
        options.alias,
        (error) => {
          if (error) {
            callback(error, null);
            return;
          }
          callback(null, true);
        }
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
    throw new Error("Key is null or too short");

  options.mmkv.setSecureKey(
    options.alias,
    options.key,
    { accessible: options.accessibleMode },
    (error) => {
      if (error) {
        callback(error, null);
      }
      options.mmkv.setupWithEncryption(
        options.instanceID,
        options.processingMode,
        options.key,
        options.alias,
        (error) => {
          if (error) {
            callback(error, null);
            return;
          }
          callback(null, true);
        }
      );
    }
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
    throw new Error("Key is null or too short");

  options.mmkv.setupWithEncryption(
    options.instanceID,
    options.processingMode,
    options.key,
    options.alias,
    (error) => {
      if (error) {
        callback(error, null);
        return;
      }
      callback(null, true);
    }
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
  options.mmkv.setup(
    options.instanceID,
    options.processingMode,
    (error) => {
      if (error) {
        callback(error, null);
      }

      callback(null, true);
    }
  );
}
