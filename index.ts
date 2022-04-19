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
  Loader: Loader,
  /**
   * Deprecated: Use `import {API} from "react-native-mmkv-storage`"
   */
  API: API,
  MODES: MODES,
  ACCESSIBLE: ACCESSIBLE,
  getAllMMKVInstanceIDs: IDStore.getAllMMKVInstanceIDs,
  getCurrentMMKVInstanceIDs: getCurrentMMKVInstanceIDs,
  IDSTORE_ID: IDStore.STORE_ID,
  _jsiModule: mmkvJsiModule,
  _bridgeModule: mmkvBridgeModule
};

export default MMKVStorage;

export { useMMKVStorage, create, useIndex, isLoaded, init, API };
