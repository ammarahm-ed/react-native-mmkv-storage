import { MMKVJsiModule } from '../types';

//@ts-ignore
const isDebugMode =
  global.location && global.location.pathname && global.location.pathname.includes('/debugger-ui');

const isTurboModuleEnabled = global.__turboModuleProxy != null;

export const mmkvBridgeModule: {
  /*
   * Install JSI bindings
   */
  install: () => boolean;
} = !isDebugMode
  ? isTurboModuleEnabled
    ? require('./NativeMMKVStorage').default
    : require('react-native').NativeModules.MMKVStorage
  : {
      install: () => {
        console.warn(
          `Remote debugging is not supported by JSI modules. MMKV is running with a memory adapter currently and is fully functional for testing only. Hence any values will not persist on App refresh/reload. `
        );
        require('../../../jest/dist/jest/memoryStore.js').mock();
        return true;
      }
    };

/**
 * All jsi functions bound to global object.
 *
 * The last param `id` is the instance id of the storage instance we want to get/set the value.
 *
 * `undefined`: It means that instance is not loaded
 *
 * `null`: Value does not exist or some error occured while getting the value
 *
 */

//@ts-ignore
const mmkvJsiModule: MMKVJsiModule = global;

export default mmkvJsiModule;
