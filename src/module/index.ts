import { NativeModules } from 'react-native';
import { DataType } from '../types/index';

export const mmkvBridgeModule: {
  /**
   * Install JSI bindings
   */
  install: () => boolean;
} = NativeModules.MMKVNative;

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
const mmkvJsiModule: {
  setupMMKVInstance: (id: string, mode?: number, cryptKey?: string, path?: string) => boolean;

  setMMKVServiceName: (alias: string, serviceName: string) => string;
  getSecureKey: (alias: string) => string;
  setSecureKey: (alias: string, key: string, accessibleMode: string) => boolean;
  secureKeyExists: (alias: string) => boolean;
  removeSecureKey: (alias: string) => boolean;

  setStringMMKV: (key: string, value: string, id: string) => boolean | undefined;
  getStringMMKV: (key: string, id: string) => string | null | undefined;

  setMapMMKV: (key: string, value: string, id: string) => boolean | undefined;
  getMapMMKV: (key: string, id: string) => string | null | undefined;

  setArrayMMKV: (key: string, value: string, id: string) => boolean | undefined;
  getArrayMMKV: (key: string, id: string) => string | null | undefined;

  setNumberMMKV: (key: string, value: number, id: string) => boolean | undefined;
  getNumberMMKV: (key: string, id: string) => number | null | undefined;

  setBoolMMKV: (key: string, value: boolean, id: string) => boolean | undefined;
  getBoolMMKV: (key: string, id: string) => boolean | null | undefined;

  removeValueMMKV: (key: string, id: string) => boolean | undefined;

  getAllKeysMMKV: (id: string) => string[] | undefined;
  getIndexMMKV: (type: DataType, id: string) => string[] | undefined;
  containsKeyMMKV: (key: string, id: string) => boolean | undefined;

  clearMMKV: (id: string) => boolean | undefined;
  clearMemoryCache: (id: string) => boolean | undefined;

  encryptMMKV: (cryptKey: string, id: string) => boolean | undefined;
  decryptMMKV: (id: string) => boolean | undefined;
} = global;

export default mmkvJsiModule;
