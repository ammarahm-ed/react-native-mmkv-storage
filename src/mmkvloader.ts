import MMKVInstance from './mmkvinstance';
import { handleAction } from './handlers';
import { currentInstancesStatus } from './initializer';
import generatePassword from './keygen';
import { init } from './mmkv/init';
import { IOSAccessibleStates, ProcessingModes, options, stringToHex } from './utils';
import type { JsonReviver, StorageOptions } from './types';

export default class MMKVLoader {
  options: StorageOptions;
  constructor() {
    this.options = {
      instanceID: 'default',
      initWithEncryption: false,
      secureKeyStorage: false,
      accessibleMode: IOSAccessibleStates.AFTER_FIRST_UNLOCK,
      processingMode: ProcessingModes.SINGLE_PROCESS,
      aliasPrefix: 'com.MMKV.',
      alias: null,
      key: null,
      serviceName: null,
      initialized: false,
      persistDefaults: false,
      defaultReviver: undefined
    };
  }

  /**
   * Load MMKV with the specified ID. If instance does not exist, a new instance will be created.
   */
  withInstanceID(id: string) {
    this.options.instanceID = id;
    return this;
  }

  /**
   * Persist default values in hooks.
   * Normally hooks do not persist default values in storage,
   * so for example calling `getItem` will return `null`.
   * Setting this to true, the defaultValue will be returned instead.
   *
   */
  withPersistedDefaultValues() {
    this.options.persistDefaults = true;
    return this;
  }
  /**
   * Encrypt MMKV Instance and store the creditials in secured storage for later use.
   * The key for encryption is automatically generated and the default alias for key storage is 'com.MMKV.ammarahmed' which is converted to HEX for usage.
   *
   * Requires an ID to be specified.
   *
   */
  withEncryption() {
    this.options.initWithEncryption = true;
    this.options.key = generatePassword();
    this.options.alias = stringToHex(this.options.aliasPrefix + this.options.instanceID);
    this.options.secureKeyStorage = true;
    return this;
  }

  /**
   * (iOS only) Sets the kSecAttrService attribute in the key chain (https://developer.apple.com/documentation/security/ksecattrservice).
   * Addresses https://github.com/ammarahm-ed/react-native-mmkv-storage/issues/156#issuecomment-934046177 issue.
   */
  withServiceName(serviceName: string) {
    this.options.serviceName = serviceName;
    return this;
  }

  /**
   * Sets default reviver function when retrieving objects or arrays from storage.
   * Even if not set, each function that calls `JSON.parse` can still receive a reviver parameter.
   * Addresses https://github.com/ammarahm-ed/react-native-mmkv-storage/issues/277 issue.
   *
   * @param reviver Same reviver parameter from `JSON.parse`
   */
  withDefaultReviver(reviver: JsonReviver) {
    this.options.defaultReviver = reviver;
    return this;
  }

  /**
   * Set accessible mode for secure storage on ios devices
   *
   * @param accessible `MMKVStorage.ACCESSIBLE`
   */
  setAccessibleIOS(accessible: string) {
    this.options.accessibleMode = accessible;
    return this;
  }
  /**
   * Provide a custom key to encrypt the storage. Use this if you dont want to generate the key automatically.
   * You must call withEncryption() to use this.
   * To store your key for later use call withSecureKeyStorage() too.
   *
   * @param key the key to encrypt the storage with
   * @param secureKeyStorage Should the key be stored securely.
   * @param alias Provide an alias for key storage. Default alias is aliasPrefix + instanceID
   */
  encryptWithCustomKey(key: string, secureKeyStorage?: boolean, alias?: string) {
    this.options.key = key;
    this.options.secureKeyStorage = false;
    if (secureKeyStorage) {
      this.options.secureKeyStorage = true;
      if (alias) {
        this.options.alias = stringToHex(this.options.aliasPrefix + alias);
      } else {
        this.options.alias = stringToHex(this.options.aliasPrefix + this.options.instanceID);
      }
    }

    return this;
  }

  /**
   * Set the processing mode for storage.
   *
   * Will recieve the following values.
   * MMKV.MULTI_PROCESS
   * MMKV.SINGLE_PROCESS
   *
   * @param {number} mode Set processing mode for storage
   */
  setProcessingMode(mode: number) {
    this.options.processingMode = mode;
    return this;
  }

  /**
   * Create the instance with the given options.
   */
  initialize() {
    if (!init()) throw new Error('MMKVNative bindings not installed');
    currentInstancesStatus[this.options.instanceID] = false;
    options[this.options.instanceID] = this.options;
    let instance = new MMKVInstance(this.options.instanceID);
    instance.reviver = this.options.defaultReviver;
    //@ts-ignore
    handleAction(null, this.options.instanceID);
    return instance;
  }

  generateKey() {
    this.options.key = generatePassword();
    return this;
  }
}
