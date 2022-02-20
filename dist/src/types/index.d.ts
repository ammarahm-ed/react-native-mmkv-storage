export declare type StorageOptions = {
    /**
     * The id of the instance to be created. Default id is "default".
     */
    instanceID: string;
    /**
     * Specifies if the storage instance should be encrypted
     */
    initWithEncryption: boolean;
    /**
     * Specifies if the password be stored in Keychain
     *
     * Default: true
     */
    secureKeyStorage: boolean;
    /**
     * Set the AccessibleMode for iOS
     * Import ACCESSIBLE from library to use it.
     */
    accessibleMode: string;
    /**
     * Multi Process or Single Process.
     *
     * Use Multi Process if your app needs to share storage between app widgets/extensions etc
     */
    processingMode: number;
    aliasPrefix: string;
    /**
     * The alias which is used to store the password in Keychain
     */
    alias: string | null;
    /**
     * Password for encrypted storage
     */
    key: string | null;
    /**
     * Specify the service name to use if using react-native-keychain library.
     */
    serviceName: string | null;
    /**
     * Is the storage ready?
     */
    initialized: boolean;
    /**
     * Persist default values in hooks
     */
    persistDefaults: boolean;
};
export declare type DataType = 'string' | 'number' | 'object' | 'array' | 'boolean';
export declare type GenericReturnType<T> = [key: string, value: T | null | undefined];
export declare type IndexType = 'stringIndex' | 'boolIndex' | 'numberIndex' | 'mapIndex' | 'arrayIndex';
export declare type MMKVJsiModule = {
    setupMMKVInstance: (id: string, mode?: number, cryptKey?: string, path?: string) => boolean;
    setMMKVServiceName: (alias: string, serviceName: string) => string;
    getSecureKey: (alias: string) => string | null;
    setSecureKey: (alias: string, key: string, accessibleMode: string) => boolean;
    secureKeyExists: (alias: string) => boolean;
    removeSecureKey: (alias: string) => boolean;
    setStringMMKV: (key: string, value: string, id: string) => boolean | undefined;
    getStringMMKV: (key: string, id: string) => string | null | undefined;
    setMapMMKV: (key: string, value: string, id: string) => boolean | undefined;
    getMapMMKV: (key: string, id: string) => string | null | undefined;
    setArrayMMKV: (key: string, value: string, id: string) => boolean | undefined;
    getArrayMMKV: (key: string, id: string) => string | null | undefined;
    setNumberMMKV: (key: string, value: number, id: string) => boolean | undefined;
    getNumberMMKV: (key: string, id: string) => number | null | undefined;
    setBoolMMKV: (key: string, value: boolean, id: string) => boolean | undefined;
    getBoolMMKV: (key: string, id: string) => boolean | null | undefined;
    removeValueMMKV: (key: string, id: string) => boolean | undefined;
    getAllKeysMMKV: (id: string) => string[] | undefined;
    getIndexMMKV: (type: IndexType, id: string) => string[] | undefined;
    containsKeyMMKV: (key: string, id: string) => boolean | undefined;
    clearMMKV: (id: string) => boolean | undefined;
    clearMemoryCache: (id: string) => boolean | undefined;
    encryptMMKV: (cryptKey: string, id: string) => boolean | undefined;
    decryptMMKV: (id: string) => boolean | undefined;
};
//# sourceMappingURL=index.d.ts.map