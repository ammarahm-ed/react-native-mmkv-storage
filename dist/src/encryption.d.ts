export default class encryption {
    instanceID: string;
    alias: string | null;
    aliasPrefix: string;
    key: string | null;
    accessibleMode: string;
    initialized: boolean;
    constructor(id: string);
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
    encrypt(key: string, secureKeyStorage: boolean | undefined, alias: string, accessibleMode: string): boolean;
    /**
     * You can decrypt an encrypted MMKV instance anytime, even after it is created.
     * Decrypting the storage will delete the key you encrypted it with
     *
     */
    decrypt(): boolean;
    /**
     * Change the encryption key incase the old one has been compromised.
     * @param  key; Provide a custom key to encrypt the storage.
     * @param secureKeyStorage Store the key in secure storage.
     * @param alias Provide a custom alias to store the key with in secure storage
     * @param accessibleMode Set accessible mode for secure storage on ios devices
     */
    changeEncryptionKey(key: string, secureKeyStorage: boolean | undefined, alias: string, accessibleMode: string): boolean;
}
//# sourceMappingURL=encryption.d.ts.map