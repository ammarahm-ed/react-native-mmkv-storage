import { currentInstancesStatus, initialize } from './initializer';

function ensureInitialized(id: string) {
  if (!currentInstancesStatus[id]) {
    currentInstancesStatus[id] = initialize(id);
  }
}

/**
 * Fixed arity variants of `handleAction`. They avoid the rest/spread pair that
 * the variadic version allocates on every single storage operation.
 */
export function handleAction1<R>(action: (id: string) => R, id: string): R | undefined {
  if (!action) return undefined;
  ensureInitialized(id);
  let result = action(id);
  if (result === undefined) {
    currentInstancesStatus[id] = initialize(id);
    result = action(id);
  }
  return result;
}

export function handleAction2<A, R>(action: (a: A, id: string) => R, a: A, id: string): R | undefined {
  if (!action) return undefined;
  ensureInitialized(id);
  let result = action(a, id);
  if (result === undefined) {
    currentInstancesStatus[id] = initialize(id);
    result = action(a, id);
  }
  return result;
}

export function handleAction3<A, B, R>(
  action: (a: A, b: B, id: string) => R,
  a: A,
  b: B,
  id: string
): R | undefined {
  if (!action) return undefined;
  ensureInitialized(id);
  let result = action(a, b, id);
  if (result === undefined) {
    currentInstancesStatus[id] = initialize(id);
    result = action(a, b, id);
  }
  return result;
}

export function handleAction4<A, B, C, R>(
  action: (a: A, b: B, c: C, id: string) => R,
  a: A,
  b: B,
  c: C,
  id: string
): R | undefined {
  if (!action) return undefined;
  ensureInitialized(id);
  let result = action(a, b, c, id);
  if (result === undefined) {
    currentInstancesStatus[id] = initialize(id);
    result = action(a, b, c, id);
  }
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
export function handleAction<T extends (...args: any[]) => any | undefined | null>(
  action: T,
  ...args: any[]
): ReturnType<T> | undefined {
  // The last argument is always the instance id.
  let id: string = args[args.length - 1];
  if (!currentInstancesStatus[id]) {
    currentInstancesStatus[id] = initialize(id);
  }
  if (!action) return undefined;
  let result = action(...args);
  if (result === undefined) {
    currentInstancesStatus[id] = initialize(id);
    result = action(...args);
  }
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
    if (result === undefined) {
      currentInstancesStatus[id] = initialize(id);
      result = action(...args);
    }
    resolve(result);
  });
}

export async function handlePromise<T extends (...args: any[]) => any | undefined | null>(
  action: T,
  ...args: any[]
): Promise<ReturnType<T> | undefined> {
  // The last argument is always the instance id.
  let id: string = args[args.length - 1];
  if (!currentInstancesStatus[id]) {
    currentInstancesStatus[id] = initialize(id);
  }
  if (!action) return undefined;
  let result = await action(...args);
  if (result === undefined) {
    currentInstancesStatus[id] = initialize(id);
    result = await action(...args);
  }
  return result;
}
