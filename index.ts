import { useMMKVStorage, create } from './src/hooks/useMMKV';
import { ACCESSIBLE, MODES } from './src/utils';
import { getCurrentMMKVInstanceIDs } from './src/initializer';
import { default as IDStore } from './src/mmkv/IDStore';
import { useIndex } from './src/hooks/useIndex';
import { isLoaded, init } from './src/mmkv/init';
import Loader from './src/loader';
import API from './src/api';
import mmkvJsiModule, { mmkvBridgeModule } from './src/module';

const MMKVStorage = {
  /**
   * Deprecated: Use `import {Loader} from "react-native-mmkv-storage`"
   */
  Loader: Loader,
  /**
   * Deprecated: Use `import {API} from "react-native-mmkv-storage`"
   */
  API: API,
  /**
   * Deprecated: Use `import {MODES} from "react-native-mmkv-storage`"
   */
  MODES: MODES,
  /**
   * Deprecated: Use `import {ACCESSIBLE} from "react-native-mmkv-storage`"
   */
  ACCESSIBLE: ACCESSIBLE,
  /**
   * Deprecated: Use `import {getAllMMKVInstanceIDs} from "react-native-mmkv-storage`"
   */
  getAllMMKVInstanceIDs: IDStore.getAllMMKVInstanceIDs,
  /**
   * Deprecated: Use `import {getCurrentMMKVInstanceIDs} from "react-native-mmkv-storage`"
   */
  getCurrentMMKVInstanceIDs: getCurrentMMKVInstanceIDs,
  /**
   * Deprecated: Use `import {IDSTORE_ID} from "react-native-mmkv-storage`"
   */
  IDSTORE_ID: IDStore.STORE_ID,
  _jsiModule: mmkvJsiModule,
  _bridgeModule: mmkvBridgeModule
};

export default MMKVStorage;

const { getAllMMKVInstanceIDs, STORE_ID: IDSTORE_ID } = IDStore;

export { useMMKVStorage, create, useIndex, isLoaded, init, API, Loader, MODES, ACCESSIBLE, getCurrentMMKVInstanceIDs, getAllMMKVInstanceIDs, IDSTORE_ID };
