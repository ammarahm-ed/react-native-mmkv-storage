import API from './src/api';
import { useIndex } from './src/hooks/useIndex';
import { create, useMMKVStorage } from './src/hooks/useMMKV';
import { getCurrentMMKVInstanceIDs } from './src/initializer';
import MMKVLoader from './src/loader';
import IDStore from './src/mmkv/IDStore';
import { init, isLoaded } from './src/mmkv/init';
import mmkvJsiModule, { mmkvBridgeModule } from './src/module';
import { ACCESSIBLE, MODES } from './src/utils';
var MMKVStorage = {
    /**
     * @deprecated Use `import {MMKVLoader} from "react-native-mmkv-storage`"
     */
    Loader: MMKVLoader,
    /**
     * @deprecated Use `import {API} from "react-native-mmkv-storage`"
     */
    API: API,
    /**
     * @deprecated Use `import {MODES} from "react-native-mmkv-storage`"
     */
    MODES: MODES,
    /**
     * @deprecated Use `import {ACCESSIBLE} from "react-native-mmkv-storage`"
     */
    ACCESSIBLE: ACCESSIBLE,
    /**
     * @deprecated Use `import {getAllMMKVInstanceIDs} from "react-native-mmkv-storage`"
     */
    getAllMMKVInstanceIDs: IDStore.getAllMMKVInstanceIDs,
    /**
     * @deprecated Use `import {getCurrentMMKVInstanceIDs} from "react-native-mmkv-storage`"
     */
    getCurrentMMKVInstanceIDs: getCurrentMMKVInstanceIDs,
    /**
     * @deprecated Use `import {IDSTORE_ID} from "react-native-mmkv-storage`"
     */
    IDSTORE_ID: IDStore.STORE_ID,
    _jsiModule: mmkvJsiModule,
    _bridgeModule: mmkvBridgeModule
};
export default MMKVStorage;
var getAllMMKVInstanceIDs = IDStore.getAllMMKVInstanceIDs, IDSTORE_ID = IDStore.STORE_ID;
export { useMMKVStorage, create, useIndex, isLoaded, init, API, MMKVLoader, MODES, ACCESSIBLE, getCurrentMMKVInstanceIDs, getAllMMKVInstanceIDs, IDSTORE_ID };
