import { useMMKVStorage, create } from './src/hooks/useMMKV';
import { getCurrentMMKVInstanceIDs } from './src/initializer';
import { useIndex } from './src/hooks/useIndex';
import { isLoaded, init } from './src/mmkv/init';
import Loader from './src/loader';
import API from './src/api';
declare const MMKVStorage: {
    Loader: typeof Loader;
    API: typeof API;
    MODES: {
        SINGLE_PROCESS: number;
        MULTI_PROCESS: number;
    };
    ACCESSIBLE: {
        WHEN_UNLOCKED: string;
        AFTER_FIRST_UNLOCK: string;
        ALWAYS: string;
        WHEN_PASSCODE_SET_THIS_DEVICE_ONLY: string;
        WHEN_UNLOCKED_THIS_DEVICE_ONLY: string;
        AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY: string;
        ALWAYS_THIS_DEVICE_ONLY: string;
    };
    getAllMMKVInstanceIDs: () => string[];
    getCurrentMMKVInstanceIDs: typeof getCurrentMMKVInstanceIDs;
    IDSTORE_ID: string;
    _jsiModule: {
        setupMMKVInstance: (id: string, mode?: number | undefined, cryptKey?: string | undefined, path?: string | undefined) => boolean;
        setMMKVServiceName: (alias: string, serviceName: string) => string;
        getSecureKey: (alias: string) => string;
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
        getIndexMMKV: (type: import("./src/types").DataType, id: string) => string[] | undefined;
        containsKeyMMKV: (key: string, id: string) => boolean | undefined;
        clearMMKV: (id: string) => boolean | undefined;
        clearMemoryCache: (id: string) => boolean | undefined;
        encryptMMKV: (cryptKey: string, id: string) => boolean | undefined;
        decryptMMKV: (id: string) => boolean | undefined;
    };
    _bridgeModule: {
        install: () => boolean;
    };
};
export default MMKVStorage;
export { useMMKVStorage, create, useIndex, isLoaded, init };
//# sourceMappingURL=index.d.ts.map