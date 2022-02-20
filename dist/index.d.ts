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
    _jsiModule: import("./src/types").MMKVJsiModule;
    _bridgeModule: {
        install: () => boolean;
    };
};
export default MMKVStorage;
export { useMMKVStorage, create, useIndex, isLoaded, init };
//# sourceMappingURL=index.d.ts.map