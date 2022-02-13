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
//# sourceMappingURL=index.d.ts.map