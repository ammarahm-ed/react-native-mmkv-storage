import { useRozeniteDevToolsClient } from '@rozenite/plugin-bridge';
import { useEffect, useMemo } from 'react';
import type { MMKVInstance } from 'react-native-mmkv-storage';
import { MMKVEventMap, PLUGIN_ID } from '../shared/messaging';
import { MMKVEntry } from '../shared/types';
import { createStorageView, StorageView } from './storage-view';

export type MMKVDevToolsOptions = {
  storages: MMKVInstance[] | Record<string, MMKVInstance>;
  blacklist?: RegExp;
  rescanIntervalMs?: number;
};

const DEFAULT_RESCAN_INTERVAL_MS = 1000;

const normalizeStorages = (
  storages: MMKVInstance[] | Record<string, MMKVInstance>
): Record<string, MMKVInstance> => {
  if (!Array.isArray(storages)) return storages;

  const result: Record<string, MMKVInstance> = {};
  for (const storage of storages) {
    result[storage.instanceID] = storage;
  }
  return result;
};

const keysOf = (entries: MMKVEntry[]) => entries.map(entry => entry.key);

const sameKeys = (a: string[], b: string[]) =>
  a.length === b.length && a.every((key, index) => key === b[index]);

export const useMMKVDevTools = ({
  storages,
  blacklist,
  rescanIntervalMs = DEFAULT_RESCAN_INTERVAL_MS
}: MMKVDevToolsOptions) => {
  const normalized = useMemo(() => normalizeStorages(storages), [storages]);

  const views = useMemo(
    () =>
      Object.entries(normalized).map(([id, storage]) =>
        createStorageView(id, storage, blacklist)
      ),
    [normalized, blacklist]
  );

  const client = useRozeniteDevToolsClient<MMKVEventMap>({ pluginId: PLUGIN_ID });

  useEffect(() => {
    if (!client) return;

    let disposed = false;
    const watchedKeys = new Map<StorageView, string[]>();
    const unwatch = new Map<StorageView, () => void>();

    const sendEntry = (view: StorageView, key: string) => {
      const entry = view.get(key);

      if (!entry) {
        client.send('delete-entry', { type: 'delete-entry', id: view.getId(), key });
        return;
      }

      client.send('set-entry', { type: 'set-entry', id: view.getId(), entry });
    };

    const watchKeys = (view: StorageView, keys: string[]) => {
      const previous = watchedKeys.get(view);
      if (previous && sameKeys(previous, keys)) return false;

      unwatch.get(view)?.();
      unwatch.set(
        view,
        view.subscribe(keys, key => sendEntry(view, key))
      );
      watchedKeys.set(view, keys);

      return true;
    };

    const publishSnapshot = async (view: StorageView) => {
      const entries = await view.getAllEntries();
      if (disposed) return;

      watchKeys(view, keysOf(entries));
      client.send('snapshot', { type: 'snapshot', id: view.getId(), entries });
    };

    const rescan = async (view: StorageView) => {
      const entries = await view.getAllEntries();
      if (disposed) return;

      if (!watchKeys(view, keysOf(entries))) return;
      client.send('snapshot', { type: 'snapshot', id: view.getId(), entries });
    };

    views.forEach(view => {
      void publishSnapshot(view);
    });

    const findView = (id: string) => views.find(view => view.getId() === id);

    const subscriptions = [
      client.onMessage('get-snapshot', ({ id }) => {
        if (id === 'all') {
          views.forEach(view => void publishSnapshot(view));
          return;
        }

        const view = findView(id);
        if (view) void publishSnapshot(view);
      }),
      client.onMessage('set-entry', ({ id, entry }) => {
        const view = findView(id);
        if (!view) return;
        view.set(entry.key, entry.type, entry.value);
        void publishSnapshot(view);
      }),
      client.onMessage('delete-entry', ({ id, key }) => {
        const view = findView(id);
        if (!view) return;
        view.remove(key);
        void publishSnapshot(view);
      })
    ];

    const interval =
      rescanIntervalMs > 0
        ? setInterval(() => views.forEach(view => void rescan(view)), rescanIntervalMs)
        : null;

    return () => {
      disposed = true;
      if (interval) clearInterval(interval);
      subscriptions.forEach(subscription => subscription.remove());
      unwatch.forEach(unsubscribe => unsubscribe());
    };
  }, [client, views, rescanIntervalMs]);

  return client;
};
