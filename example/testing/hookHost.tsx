import React, { useEffect, useReducer } from 'react';
import { flush, waitFor } from './async';

type HookEntry<T = any> = {
  id: number;
  render: () => T;
  result: { current: T | undefined; error: Error | undefined };
  renderCount: number;
  committed: number;
};

let entries: HookEntry[] = [];
let nextId = 1;
const listeners = new Set<() => void>();

const notify = () => {
  listeners.forEach(listener => listener());
};

function HookRunner({ entry }: { entry: HookEntry }) {
  try {
    entry.result.current = entry.render();
    entry.result.error = undefined;
  } catch (e: any) {
    entry.result.error = e;
  }
  entry.renderCount++;

  useEffect(() => {
    entry.committed++;
  });

  return null;
}

export function HookHost() {
  const [, forceRender] = useReducer((count: number) => count + 1, 0);

  useEffect(() => {
    const listener = () => forceRender();
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return (
    <>
      {entries.map(entry => (
        <HookRunner key={entry.id} entry={entry} />
      ))}
    </>
  );
}

export type RenderHookHandle<T> = {
  result: { current: T | undefined; error: Error | undefined };
  renderCount: () => number;
  waitForNextRender: (timeout?: number) => Promise<void>;
  waitForValue: (predicate: (value: T | undefined) => boolean, timeout?: number) => Promise<T | undefined>;
  act: (fn: () => void | Promise<void>) => Promise<void>;
  unmount: () => Promise<void>;
};

export async function renderHook<T>(render: () => T): Promise<RenderHookHandle<T>> {
  if (listeners.size === 0) {
    throw new Error('HookHost is not mounted. Render <HookHost /> before calling renderHook.');
  }

  const entry: HookEntry<T> = {
    id: nextId++,
    render,
    result: { current: undefined, error: undefined },
    renderCount: 0,
    committed: 0
  };

  entries = entries.concat(entry);
  notify();

  await waitFor(() => entry.committed > 0, { message: 'hook did not mount' });

  if (entry.result.error) throw entry.result.error;

  return {
    result: entry.result,
    renderCount: () => entry.renderCount,
    async waitForNextRender(timeout = 2000) {
      const before = entry.committed;
      await waitFor(() => entry.committed > before, { timeout, message: 'hook did not re-render' });
    },
    async waitForValue(predicate, timeout = 2000) {
      await waitFor(() => predicate(entry.result.current), {
        timeout,
        message: 'hook value did not satisfy predicate'
      });
      return entry.result.current;
    },
    async act(fn) {
      await fn();
      await flush();
      await flush();
    },
    async unmount() {
      entries = entries.filter(item => item !== entry);
      notify();
      await flush();
    }
  };
}

export async function unmountAllHooks() {
  entries = [];
  notify();
  await flush();
}
