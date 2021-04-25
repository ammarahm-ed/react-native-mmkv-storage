/**
 *
 * A handler function used to handle all the
 * calls made to native code. The purpose is
 * to make sure that the storage is initialized
 * before any storage requests are sent to the
 * MMKV instance.
 *
 *
 * @param {*} action The native function that will be called
 * @param  {...any} args Arguments for the native function
 */

import {options} from 'react-native-mmkv-storage/src/utils';
import {currentInstancesStatus, initialize} from './initializer';

export function handleAction(action, ...args) {
  let id = args[args.length - 1];
  if (currentInstancesStatus[id]) {
    if (!action) return;
    return action(...args);
  } else {
    let opts = options[id];
    initialize(opts);
    currentInstancesStatus[id] = true;
    if (!action) return;
    return action(...args);}
}

export async function handleActionAsync(action, ...args) {
  let id = args[args.length - 1];
  return new Promise(async (resolve) => {
    if (currentInstancesStatus[id]) {
      let result = action(...args);
        resolve(result);
    } else {
      let opts = options[id];
      initialize(opts);
      currentInstancesStatus[id] = true;
      let result = action(...args);
      resolve(result);
    }
  });
}
