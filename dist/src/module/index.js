import { NativeModules } from 'react-native';
export var mmkvBridgeModule = NativeModules.MMKVNative;
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
var mmkvJsiModule = global;
export default mmkvJsiModule;
