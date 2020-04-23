/**
 *
 * A handler function used to handle all the
 * calls made to native code. The purpose is
 * to make sure that the storage is initialized
 * before any storage requests are sent to the
 * MMKV instance.
 *
 *
 * @param {boolean} initialized Tells the function if the storage has been loaded
 * @param {*} options The options you used to initialize the loader class
 * @param {*} action The native function that will be called
 * @param {*} callback The callback function for the native function
 * @param  {...any} args Arguments for the native function
 */

import { currentInstancesStatus, initialize } from "./initializer";

export function handleAction(options, action, callback, ...args) {
  if (currentInstancesStatus[options.instanceID]) {
    return action(...args, callback);
  } else {
    initialize(options, (err, result) => {
      if (err) {
        currentInstancesStatus[options.instanceID] = false;
        return callback(err, null);
      }
      currentInstancesStatus[options.instanceID] = true;

      return action(...args, callback);
    });
  }
}

export async function handleActionAsync(options, action, ...args) {
  return new Promise(async (resolve, reject) => {
    if (currentInstancesStatus[options.instanceID]) {
      try {
        let result = await action(...args);
        resolve(result);
      } catch (e) {
        reject(e);
      }
    } else {
      initialize(options, async (err, result) => {
        if (err) {
          currentInstancesStatus[options.instanceID] = false;
          return reject(err);
        }

        currentInstancesStatus[options.instanceID] = true;
        try {
          let result = await action(...args);
          resolve(result);
        } catch (e) {
          reject(e);
        }
      });
    }
  });
}
