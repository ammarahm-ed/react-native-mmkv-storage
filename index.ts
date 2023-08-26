import MMKVInstance from './src/mmkvinstance';
import { useIndex } from './src/hooks/useIndex';
import { create, useMMKVStorage } from './src/hooks/useMMKV';
import { createMMKVRefHookForStorage, useMMKVRef } from './src/hooks/useMMKVRef';
import { getCurrentMMKVInstanceIDs } from './src/initializer';
import MMKVLoader from './src/mmkvloader';
import IDStore from './src/mmkv/IDStore';
import { init, isLoaded } from './src/mmkv/init';
import mmkvJsiModule, { mmkvBridgeModule } from './src/module';
import { IOSAccessibleStates, ProcessingModes } from './src/utils';

const MMKVStorage = {
  /**
   * @deprecated Use `import {MMKVLoader} from "react-native-mmkv-storage`"
   */
  Loader: MMKVLoader,
  /**
   * @deprecated Use `import {MMKVInstance} from "react-native-mmkv-storage`"
   */
  API: MMKVInstance,
  /**
   * @deprecated Use `import {ProcessingModes} from "react-native-mmkv-storage`"
   */
  MODES: ProcessingModes,
  /**
   * @deprecated Use `import {IOSAccessibleStates} from "react-native-mmkv-storage`"
   */
  ACCESSIBLE: IOSAccessibleStates,
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

const { getAllMMKVInstanceIDs, STORE_ID: IDSTORE_ID } = IDStore;

export {
  useMMKVStorage,
  create,
  useIndex,
  isLoaded,
  init,
  MMKVInstance,
  MMKVLoader,
  ProcessingModes,
  IOSAccessibleStates,
  getCurrentMMKVInstanceIDs,
  getAllMMKVInstanceIDs,
  IDSTORE_ID,
  createMMKVRefHookForStorage,
  useMMKVRef
};
