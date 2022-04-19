import { useMMKVStorage, create } from './src/hooks/useMMKV';
import { ACCESSIBLE, MODES } from './src/utils';
import { getCurrentMMKVInstanceIDs } from './src/initializer';
import { useIndex } from './src/hooks/useIndex';
import { isLoaded, init } from './src/mmkv/init';
import Loader from './src/loader';
import API from './src/api';
declare const MMKVStorage: {
    /**
     * Deprecated: Use `import {Loader} from "react-native-mmkv-storage`"
     */
    Loader: typeof Loader;
    /**
     * Deprecated: Use `import {API} from "react-native-mmkv-storage`"
     */
    API: typeof API;
    /**
     * Deprecated: Use `import {MODES} from "react-native-mmkv-storage`"
     */
    MODES: {
        SINGLE_PROCESS: number;
        MULTI_PROCESS: number;
    };
    /**
     * Deprecated: Use `import {ACCESSIBLE} from "react-native-mmkv-storage`"
     */
    ACCESSIBLE: {
        WHEN_UNLOCKED: string;
        AFTER_FIRST_UNLOCK: string;
        ALWAYS: string;
        WHEN_PASSCODE_SET_THIS_DEVICE_ONLY: string;
        WHEN_UNLOCKED_THIS_DEVICE_ONLY: string;
        AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY: string;
        ALWAYS_THIS_DEVICE_ONLY: string;
    };
    /**
     * Deprecated: Use `import {getAllMMKVInstanceIDs} from "react-native-mmkv-storage`"
     */
    getAllMMKVInstanceIDs: () => string[];
    /**
     * Deprecated: Use `import {getCurrentMMKVInstanceIDs} from "react-native-mmkv-storage`"
     */
    getCurrentMMKVInstanceIDs: typeof getCurrentMMKVInstanceIDs;
    /**
     * Deprecated: Use `import {IDSTORE_ID} from "react-native-mmkv-storage`"
     */
    IDSTORE_ID: string;
    _jsiModule: import("./src/types").MMKVJsiModule;
    _bridgeModule: {
        install: () => boolean;
    };
};
export default MMKVStorage;
declare const getAllMMKVInstanceIDs: () => string[], IDSTORE_ID: string;
export { useMMKVStorage, create, useIndex, isLoaded, init, API, Loader, MODES, ACCESSIBLE, getCurrentMMKVInstanceIDs, getAllMMKVInstanceIDs, IDSTORE_ID };
//# sourceMappingURL=index.d.ts.map