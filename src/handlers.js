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

import { options } from "./utils";
import { currentInstancesStatus, initialize } from "./initializer";

export function handleAction(action, ...args) {
  let id = args[args.length - 1];
  if (currentInstancesStatus[id]) {
    if (!action) return;
    return action(...args);
  }
  let opts = options[id];
  let ready = initialize(opts);
  if (ready) {
    currentInstancesStatus[id] = true;
  }
  if (!ready) return undefined;
  if (!action) return;
  return action(...args);
}

export async function handleActionAsync(action, ...args) {
  let id = args[args.length - 1];
  return new Promise(async (resolve, reject) => {
    if (currentInstancesStatus[id]) {
      if (!action) {
        resolve(undefined);
        return;
      }
      let result = action(...args);
      resolve(result);
    } else {
      let opts = options[id];
      let ready = initialize(opts);
      if (ready) {
        currentInstancesStatus[id] = true;
      }
      currentInstancesStatus[id] = true;
      if (!action) {
        resolve(undefined);
        return;
      }
      let result = action(...args);
      resolve(result);
    }
  });
}
