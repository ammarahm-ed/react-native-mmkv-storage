export const flush = () => new Promise<void>(resolve => setTimeout(resolve, 0));

export const delay = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

export const nextFrame = () =>
  new Promise<void>(resolve => {
    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(() => resolve());
    } else {
      setTimeout(resolve, 16);
    }
  });

export async function waitFor<T>(
  predicate: () => T | false | null | undefined,
  options: { timeout?: number; interval?: number; message?: string } = {}
): Promise<T> {
  const timeout = options.timeout ?? 2000;
  const interval = options.interval ?? 10;
  const deadline = Date.now() + timeout;

  for (;;) {
    let value: T | false | null | undefined;
    let error: any = null;
    try {
      value = predicate();
    } catch (e) {
      error = e;
    }
    if (!error && value !== false && value !== null && value !== undefined) {
      return value as T;
    }
    if (Date.now() > deadline) {
      throw new Error(
        options.message
          ? `waitFor timed out after ${timeout}ms: ${options.message}`
          : `waitFor timed out after ${timeout}ms${error ? `: ${error.message ?? error}` : ''}`
      );
    }
    await delay(interval);
  }
}

export function waitForValue<T>(
  read: () => T,
  expected: T,
  options: { timeout?: number; interval?: number } = {}
): Promise<T> {
  return waitFor(() => (Object.is(read(), expected) ? { value: read() } : false), {
    ...options,
    message: `expected value to become ${JSON.stringify(expected)}`
  }).then(result => (result as { value: T }).value);
}

export const uniqueKey = (() => {
  let counter = 0;
  return (prefix = 'k') => `${prefix}_${Date.now().toString(36)}_${counter++}`;
})();
