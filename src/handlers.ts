import { currentInstancesStatus, initialize } from './initializer';

/**
 *
 * A handler function used to handle all the
 * calls made to native code. The purpose is
 * to make sure that the storage is initialized
 * before any read/write requests are sent to the
 * MMKV instance.
 *
 *
 * @param action The native function that will be called
 * @param args Arguments for the native function
 */
export function handleAction<T extends (...args: any[]) => any | undefined | null>(
  action: T,
  ...args: any[]
): ReturnType<T> | undefined | null {
  let id = args[args.length - 1];
  if (currentInstancesStatus[id]) {
    if (!action) return;
    return action(...args);
  }
  let ready = initialize(id);
  if (ready) {
    currentInstancesStatus[id] = true;
  }
  if (!ready || !action) return undefined;

  return action(...args);
}

/**
 *
 * A handler function used to handle all the
 * calls made to native code. The purpose is
 * to make sure that the storage is initialized
 * before any read/write requests are sent to the
 * MMKV instance.
 *
 *
 * @param action The native function that will be called
 * @param args Arguments for the native function
 */
export async function handleActionAsync<T extends (...args: any[]) => any | undefined | null>(
  action: T,
  ...args: any[]
): Promise<ReturnType<T> | undefined | null> {
  let id = args[args.length - 1];
  return new Promise(async resolve => {
    if (currentInstancesStatus[id]) {
      if (!action) {
        resolve(undefined);
        return;
      }
      let result = action(...args);
      resolve(result);
    } else {
      let ready = initialize(id);
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
