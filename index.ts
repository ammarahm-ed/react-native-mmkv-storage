import { useMMKVStorage, create } from './src/hooks/useMMKV';
import { ACCESSIBLE, MODES } from './src/utils';
import { getCurrentMMKVInstanceIDs } from './src/initializer';
import IDStore from './src/mmkv/IDStore';
import { useIndex } from './src/hooks/useIndex';
import { isLoaded, init } from './src/mmkv/init';
import Loader from './src/loader';
import API from './src/api';
import mmkvJsiModule, { mmkvBridgeModule } from './src/module';
import { MMKVJsiModule } from './src/types';

interface MMKVStorageInterface {
  Loader: typeof Loader;
  API?: API;
  MODES: typeof MODES;
  ACCESSIBLE: typeof ACCESSIBLE;
  getAllMMKVInstanceIDs: typeof IDStore.getAllMMKVInstanceIDs;
  getCurrentMMKVInstanceIDs: typeof getCurrentMMKVInstanceIDs;
  IDSTORE_ID: string;
  _jsiModule: MMKVJsiModule;
  _bridgeModule: typeof mmkvBridgeModule;
}

const MMKVStorage: MMKVStorageInterface = {
  Loader: Loader,
  MODES: MODES,
  ACCESSIBLE: ACCESSIBLE,
  getAllMMKVInstanceIDs: IDStore.getAllMMKVInstanceIDs,
  getCurrentMMKVInstanceIDs: getCurrentMMKVInstanceIDs,
  IDSTORE_ID: IDStore.STORE_ID,
  _jsiModule: mmkvJsiModule,
  _bridgeModule: mmkvBridgeModule
};

export default MMKVStorage;

export { useMMKVStorage, create, useIndex, isLoaded, init, API, MMKVStorageInterface };
