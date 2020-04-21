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

export function handleAction(initialized, options, action, callback, ...args) {
  if (initialized) {
    return action(...args, callback);
  } else {
    initialize(options, (err, result) => {
      if (err) {
        return callback(err, null);
      }
      return action(...args, callback);
    });
  }
}
