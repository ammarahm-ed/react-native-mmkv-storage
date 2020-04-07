declare function MMKVStorage(): any;

export default MMKVStorage;

declare module MMKVStorage {
  export const MODES = {
    SINGLE_PROCESS: 1,
    MULTI_PROCESS: 2,
  };
  export const ACCESSIBLE = {
    WHEN_UNLOCKED: "AccessibleWhenUnlocked",
    AFTER_FIRST_UNLOCK: "AccessibleAfterFirstUnlock",
    ALWAYS: "AccessibleAlways",
    WHEN_PASSCODE_SET_THIS_DEVICE_ONLY:
      "AccessibleWhenPasscodeSetThisDeviceOnly",
    WHEN_UNLOCKED_THIS_DEVICE_ONLY: "AccessibleWhenUnlockedThisDeviceOnly",
    AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY:
      "AccessibleAfterFirstUnlockThisDeviceOnly",
    ALWAYS_THIS_DEVICE_ONLY: "AccessibleAlwaysThisDeviceOnly",
  };

  class API {
    /**
     * Set a string value to storag for a given key.
     *
     * @param {String} key
     * @param {String} value
     *
     */
    async setStringAsync(key: string, value: string): Promise<boolean>;
    /**
     * Get a string value for a given key.
     * @param {String} key
     */
    async getStringAsync(key: string): Promise<string>;

    /**
     * Set a number value to storage for a given key.
     *
     * @param {String} key
     * @param {number} value
     *
     */
    async setIntAsync(key: string, value: number): Promise<boolean>;

    /**
     * Get a number value for a given key
     * @param {String} key
     */
    async getIntAsync(key: string): Promise<number>;

    /**
     * Set a boolean value to storag for a given key.
     *
     * @param {String} key
     * @param {boolean} value
     *
     */
    async setBoolAsync(key: string, value: boolean): Promise<boolean>;

    /**
     * Get a boolean value for a given key.
     * @param {String} key
     */
    async getBoolAsync(key: string): Promise<boolean>;

    /**
     * Set an Object to storage for a given key.
     *
     * @param {String} key
     * @param {Object} value
     *
     */

    async setMapAsync(key: string, value: object): Promise<boolean>;
    /**
     * Get an Object from storage for a given key.
     * @param {String} key
     */
    async getMapAsync(key: string): Promise<object>;
    /**
     * Set an array to the db.
     * @param {String} key
     * @param {Array} array
     */
    async setArrayAsync(key: string, value: Array<*>): Promise<boolean>;
    /**
     * get an array from the storage for give key.
     * @param {String} key
     */

    async getArrayAsync(key: string): Promise<Array<*>>;
    /**
     * Retrieve multiple Objects for a given array of keys. Currently will work only if data for all keys is an Object.
     * Arrays will also be returned but wrappen in a object.
     *
     * **Will not work if a key as a String value.**
     *
     * @param {Array} keys
     */
    async getMultipleItemsAsync(keys: Array<string>): Promise<Array<object>>;

    async clearStore(): Promise;
    /**
     * Remove an item from storage for a given key.
     *
     * @param {String} key
     */
    async removeItem(key: string): Promise;

    // NON ASYNC CALLS

    /**
     * Set a string value to storag for a given key.
     *
     * @param {String} key
     * @param {String} value
     * @param {Function} callback
     */
    setString(key: string, value: string, callback: Function): boolean;
    /**
     * Get a string value for a given key.
     * @param {String} key
     * @param {Function} callback
     */
    getString(key: string, callback: Function): string;

    /**
     * Set a number value to storage for a given key.
     *
     * @param {String} key
     * @param {number} value
     * @param {Function} callback
     */
    setInt(key: string, value: number, callback: Function): boolean;

    /**
     * Get a number value for a given key
     * @param {String} key
     * @param {Function} callback
     */
    getInt(key: string, callback: Function): number;

    /**
     * Set a boolean value to storag for a given key.
     *
     * @param {String} key
     * @param {boolean} value
     * @param {Function} callback
     */
    setBool(key: string, value: boolean, callback: Function): boolean;

    /**
     * Get a boolean value for a given key.
     * @param {String} key
     * @param {Function} callback
     */
    getBool(key: string, callback: Function): boolean;

    /**
     * Set an Object to storage for a given key.
     *
     * @param {String} key
     * @param {Object} value
     * @param {Function} callback
     */

    setMap(key: string, value: object, callback: Function): boolean;
    /**
     * Get an Object from storage for a given key.
     * @param {String} key
     * @param {Function} callback
     */
    getMap(key: string, callback: Function): object;
    /**
     * Set an array to the db.
     * @param {String} key
     * @param {Array} array
     * @param {Function} callback
     */
    setArray(key: string, value: Array<*>, callback: Function): boolean;
    /**
     * get an array from the storage for give key.
     * @param {String} key
     * @param {Function} callback
     */

    getArray(key: string, callback: Function): Array<*>;
    /**
     * Retrieve multiple Objects for a given array of keys. Currently will work only if data for all keys is an Object.
     * Arrays will also be returned but wrappen in a object.
     *
     * **Will not work if a key as a String value.**
     *
     * @param {Array} keys
     * @param {Function} callback
     */
    getMultipleItems(keys: Array<string>, callback: Function): Array<object>;

    /**
     *
     * Get all MMKV Instance IDs.
     *
     */
    async getAllMMKVInstanceIDs(): Promise<object>;

    /**
     *
     * Get all MMKV Instance IDs that are currently loaded
     *
     */

    async getCurrentMMKVInstanceIDs(): Promise<Array<string>>;

    encryption: encryption;

    indexer: indexer;
  }

  class indexer {
    /**
     * Get all keys from storage.
     *
     */
    async getKeys(): Promise<Array<string>>;

    /**
     * Check if a key exists in storage.
     *
     * @param {String} key
     */
    async hasKey(key: string): Promise<boolean>;

    strings: {
      /**
       * Get all keys from strings index;
       *
       */
      getKeys(): Promise<Array<string>>;

      /**
       * Check if a key exists in strings index;
       *
       * @param {String} key
       */
      hasKey(key: string): Promise<boolean>;

      /**
       * Get all strings in the strings index
       *
       */
      getAll(): Promise<Array<>>;
    };

    numbers: {
      /**
       * Get all keys from numbers index;
       *
       */
      getKeys(): Promise<Array<string>>;

      /**
       * Check if a key exists in numbers index;
       *
       * @param {String} key
       */
      hasKey(key: string): Promise<boolean>;

      /**
       * Get all numbers in the numbers index;
       *
       */
      getAll(): Promise<Array<>>;
    };

    booleans: {
      /**
       * Get all keys from booleans index
       *
       */
      getKeys(): Promise<Array<string>>;

      /**
       * Check if a key exists in booleans index
       *
       * @param {String} key
       */
      hasKey(key: string): Promise<boolean>;

      /**
       * Get all booleans in the booleans index
       *
       */
      getAll(): Promise<Array<>>;
    };

      maps: {
        /**
         * Get all keys from maps index
         *
         */
        getKeys(): Promise<Array<string>>;

        /**
         * Check if a key exists in maps index
         *
         * @param {String} key
         */
        hasKey(key: string): Promise<boolean>;

        /**
         * Get all items in the maps index
         *
         */
        getAll(): Promise<Array<>>;
      };

      arrays: {
        /**
         * Get all keys from array index
         *
         */
        getKeys(): Promise<Array<string>>;

        /**
         * Check if a key exists in array index
         *
         * @param {String} key
         */
        hasKey(key: string): Promise<boolean>;

        /**
         * Get all arrays in the array index
         *
         */
        getAll(): Promise<Array<>>;
      };
    
  }

  class encryption {
    /**
     * You can encrypt an MMKV instance anytime, even after it is created.
     *
     * Calling this without a key will generate a key itself & store it in secure storage.
     * If no parameters are provided, a key is generated and securely stored in the storage with the default alias for later use.
     *
     * @param {string} key; Provide a custom key to encrypt the storage.
     * @param {boolean} secureKeyStorage Store the key in secure storage.
     * @param {string}  alias Provide a custom alias to store the key with in secure storage
     * @returns An object with alias and key
     */
    async encrypt(
      key: string,
      secureKeyStorage: boolean,
      alias: string
    ): Promise<>;

    /**
     * You can decrypt an encrypted MMKV instance anytime, even after it is created.
     * Decrypting the storage will delete the key you encrypted it with
     *
     */
    async decrypt(): Promise<>;

    /**
     * Change the encryption key incase the old one has been compromised.
     * @param {string} key; Provide a custom key to encrypt the storage.
     * @param {boolean} secureKeyStorage Store the key in secure storage.
     * @param {string}  alias Provide a custom alias to store the key with in secure storage
     */

    async changeEncryptionKey(
      key: string,
      secureKeyStorage: boolean,
      alias: string
    ): Promise<>;
  }

  export class Loader {
    /**
     * Load MMKV with the specified ID. If instance does not exist, a new instance will be created.
     * @param {String} id
     */
    withInstanceID(id: string): this;

    /**
     * Encrypt MMKV Instance and store the creditials in secured storage for later use.
     * The key for encryption is automatically generated and the default alias for key storage is 'com.MMKV.ammarahmed' which is converted to HEX for usage.
     *
     * Requires an ID to be specified.
     *
     */
    withEncryption(): this;

    /**
     * Provide a custom key to encrypt the storage. Use this if you dont want to generate the key automatically.
     * You must call withEncryption() to use this.
     * To store your key for later use call withSecureKeyStorage() too.
     *
     * @param {string} key the key to encrypt the storage with
     * @param {boolean} secureKeyStorage Should the key be stored securely.
     * @param {string} alias Provide an alias for key storage. Default alias is aliasPrefix + instanceID
     */

    encryptWithCustomKey(
      key: string,
      secureKeyStorage: boolean,
      alias: string
    ): this;

    /**
     * Set the processing mode for storage.
     *
     * Will recieve the following values.
     * MMKV.MULTI_PROCESS
     * MMKV.SINGLE_PROCESS
     *
     * @param {number} mode Set processing mode for storage
     */

    setProcessingMode(mode: number): this;

    /**
     * Finally after setting all the options, call this to create the instance.
     *
     */

    async initialize(): Promise<API>;
  }
}
