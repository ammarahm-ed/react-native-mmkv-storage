import { useIndex } from './src/hooks/useIndex';
import { create, useMMKVStorage } from './src/hooks/useMMKV';
import { getCurrentMMKVInstanceIDs } from './src/initializer';
import Loader from './src/loader';
import IDStore from './src/mmkv/IDStore';
import { init, isLoaded } from './src/mmkv/init';
import mmkvJsiModule, { mmkvBridgeModule } from './src/module';
import { ACCESSIBLE, MODES } from './src/utils';
var MMKVStorage = {
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
export { useMMKVStorage, create, useIndex, isLoaded, init };
