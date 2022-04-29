import MMKVInstance from './mmkvinstance';
import { StorageOptions } from './types';
export default class MMKVLoader {
    options: StorageOptions;
    constructor();
    /**
     * Load MMKV with the specified ID. If instance does not exist, a new instance will be created.
     */
    withInstanceID(id: string): this;
    /**
     * Persist default values in hooks.
     * Normally hooks do not persist default values in storage,
     * so for example calling `getItem` will return `null`.
     * Setting this to true, the defaultValue will be returned instead.
     *
     */
    withPersistedDefaultValues(): this;
    /**
     * Encrypt MMKV Instance and store the creditials in secured storage for later use.
     * The key for encryption is automatically generated and the default alias for key storage is 'com.MMKV.ammarahmed' which is converted to HEX for usage.
     *
     * Requires an ID to be specified.
     *
     */
    withEncryption(): this;
    /**
     * (iOS only) Sets the kSecAttrService attribute in the key chain (https://developer.apple.com/documentation/security/ksecattrservice).
     * Addresses https://github.com/ammarahm-ed/react-native-mmkv-storage/issues/156#issuecomment-934046177 issue.
     */
    withServiceName(serviceName: string): this;
    /**
     * Set accessible mode for secure storage on ios devices
     *
     * @param accessible `MMKVStorage.ACCESSIBLE`
     */
    setAccessibleIOS(accessible: string): this;
    /**
     * Provide a custom key to encrypt the storage. Use this if you dont want to generate the key automatically.
     * You must call withEncryption() to use this.
     * To store your key for later use call withSecureKeyStorage() too.
     *
     * @param key the key to encrypt the storage with
     * @param secureKeyStorage Should the key be stored securely.
     * @param alias Provide an alias for key storage. Default alias is aliasPrefix + instanceID
     */
    encryptWithCustomKey(key: string, secureKeyStorage?: boolean, alias?: string): this;
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
     * Create the instance with the given options.
     */
    initialize(): MMKVInstance;
    generateKey(): this;
}
//# sourceMappingURL=mmkvloader.d.ts.map