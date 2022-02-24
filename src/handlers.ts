import { currentInstancesStatus, initialize } from './initializer';
import { options } from './utils';

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
  // The last argument is always the instance id.
  let id: string = args[args.length - 1];
  if (!currentInstancesStatus[id]) {
    currentInstancesStatus[id] = initialize(id);
  }
  const opts = options[id];
  opts.logs = [`status: fetch value for ${args[0]}`];
  if (!action) return undefined;
  let result = action(...args);

  if (result === undefined) currentInstancesStatus[id] = initialize(id);
  result = action(...args);
  opts.logs.push(
    `result for ${args[0]} is: undefined?${result === undefined} null?${
      result === null
    }: current instance status: ${currentInstancesStatus[id]}`
  );
  opts.callback && opts.callback(opts.logs.join('\n'));
  return result;
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
  return new Promise(resolve => {
    if (!currentInstancesStatus[id]) {
      currentInstancesStatus[id] = initialize(id);
    }
    if (!action) return resolve(undefined);
    let result = action(...args);
    if (result === undefined) currentInstancesStatus[id] = initialize(id);
    result = action(...args);
    resolve(result);
  });
}
