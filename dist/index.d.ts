import MMKVInstance from './src/mmkvinstance';
import { useIndex } from './src/hooks/useIndex';
import { create, useMMKVStorage } from './src/hooks/useMMKV';
import { getCurrentMMKVInstanceIDs } from './src/initializer';
import MMKVLoader from './src/mmkvloader';
import { init, isLoaded } from './src/mmkv/init';
import { IOSAccessibleStates, ProcessingModes } from './src/utils';
declare const MMKVStorage: {
    /**
     * @deprecated Use `import {MMKVLoader} from "react-native-mmkv-storage`"
     */
    Loader: typeof MMKVLoader;
    /**
     * @deprecated Use `import {MMKVInstance} from "react-native-mmkv-storage`"
     */
    API: typeof MMKVInstance;
    /**
     * @deprecated Use `import {ProcessingModes} from "react-native-mmkv-storage`"
     */
    MODES: {
        SINGLE_PROCESS: number;
        MULTI_PROCESS: number;
    };
    /**
     * @deprecated Use `import {IOSAccessibleStates} from "react-native-mmkv-storage`"
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
     * @deprecated Use `import {getAllMMKVInstanceIDs} from "react-native-mmkv-storage`"
     */
    getAllMMKVInstanceIDs: () => string[];
    /**
     * @deprecated Use `import {getCurrentMMKVInstanceIDs} from "react-native-mmkv-storage`"
     */
    getCurrentMMKVInstanceIDs: typeof getCurrentMMKVInstanceIDs;
    /**
     * @deprecated Use `import {IDSTORE_ID} from "react-native-mmkv-storage`"
     */
    IDSTORE_ID: string;
    _jsiModule: import("./src/types").MMKVJsiModule;
    _bridgeModule: {
        install: () => boolean;
    };
};
export default MMKVStorage;
declare const getAllMMKVInstanceIDs: () => string[], IDSTORE_ID: string;
export { useMMKVStorage, create, useIndex, isLoaded, init, MMKVInstance, MMKVLoader, ProcessingModes, IOSAccessibleStates, getCurrentMMKVInstanceIDs, getAllMMKVInstanceIDs, IDSTORE_ID };
//# sourceMappingURL=index.d.ts.map