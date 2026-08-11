import { useRozeniteDevToolsClient } from '@rozenite/plugin-bridge';
import { useEffect, useMemo } from 'react';
import type { MMKVInstance } from 'react-native-mmkv-storage';
import { MMKVEventMap, PLUGIN_ID } from '../shared/messaging';
import { createStorageView, StorageView } from './storage-view';

export type MMKVDevToolsOptions = {
  storages: MMKVInstance[] | Record<string, MMKVInstance>;
  blacklist?: RegExp;
};

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

export const useMMKVDevTools = ({ storages, blacklist }: MMKVDevToolsOptions) => {
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

    const publishSnapshot = async (view: StorageView) => {
      const entries = await view.getAllEntries();
      if (disposed) return;
      client.send('snapshot', { type: 'snapshot', id: view.getId(), entries });
    };

    const unobservers = views.map(view =>
      view.observe({
        onWrite: entry => {
          client.send('set-entry', { type: 'set-entry', id: view.getId(), entry });
        },
        onDelete: key => {
          client.send('delete-entry', { type: 'delete-entry', id: view.getId(), key });
        }
      })
    );

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
        findView(id)?.set(entry.key, entry.type, entry.value);
      }),
      client.onMessage('delete-entry', ({ id, key }) => {
        findView(id)?.remove(key);
      })
    ];

    return () => {
      disposed = true;
      subscriptions.forEach(subscription => subscription.remove());
      unobservers.forEach(unobserve => unobserve());
    };
  }, [client, views]);

  return client;
};
