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

import {options} from 'react-native-mmkv-storage/src/utils';
import {currentInstancesStatus, initialize} from './initializer';

export function handleAction(cb, action, ...args) {
  let id = args[args.length - 1];
  if (currentInstancesStatus[id]) {
    cb && cb(null, action(...args));
    return action(...args);
  } else {
    let opts = options[id];
    initialize(opts, (err) => {
      if (err) {
        currentInstancesStatus[id] = false;
        error = true;
      }
      currentInstancesStatus[id] = true;
      cb && cb(null, action(...args));
    });
    return action(...args);
  }
}

export async function handleActionAsync(action, ...args) {
  let id = args[args.length - 1];
  return new Promise(async (resolve, reject) => {
    if (currentInstancesStatus[id]) {
      try {
        let result = await action(...args);
        resolve(result);
      } catch (e) {
        reject(e);
      }
    } else {
      let opts = options[id];
      initialize(opts, async (err) => {
        if (err) {
          currentInstancesStatus[id] = false;
          return reject(err);
        }

        currentInstancesStatus[id] = true;
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
