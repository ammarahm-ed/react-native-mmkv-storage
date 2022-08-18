import { StorageOptions } from './types';
export declare function promisify(fn: Function): (...args: any) => Promise<unknown>;
/**
 * Accessible modes for iOS Keychain
 */
export declare const IOSAccessibleStates: {
    WHEN_UNLOCKED: string;
    AFTER_FIRST_UNLOCK: string;
    /** @deprected in iOS 16+ */
    ALWAYS: string;
    WHEN_PASSCODE_SET_THIS_DEVICE_ONLY: string;
    WHEN_UNLOCKED_THIS_DEVICE_ONLY: string;
    AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY: string;
    /** @deprected in iOS 16+ */
    ALWAYS_THIS_DEVICE_ONLY: string;
};
/**
 * Processing modes for storage.
 */
export declare const ProcessingModes: {
    SINGLE_PROCESS: number;
    MULTI_PROCESS: number;
};
export declare const DATA_TYPES: Readonly<{
    STRING: 1;
    NUMBER: 2;
    BOOL: 3;
    MAP: 4;
    ARRAY: 5;
}>;
/**
 * Information about all storage instances
 */
export declare const options: {
    [name: string]: StorageOptions;
};
export declare const stringToHex: (input: string) => string;
//# sourceMappingURL=utils.d.ts.map