import type { MMKVInstance } from 'react-native-mmkv-storage';
import { MMKVEntry, MMKVEntryType, MMKVEntryValue } from '../shared/types';

type TypeBinding = {
  type: MMKVEntryType;
  index: (storage: MMKVInstance) => { getAll: () => Promise<unknown>; hasKey: (key: string) => boolean | undefined };
  read: (storage: MMKVInstance, key: string) => unknown;
  write: (storage: MMKVInstance, key: string, value: unknown) => void;
};

const BINDINGS: TypeBinding[] = [
  {
    type: 'string',
    index: storage => storage.indexer.strings,
    read: (storage, key) => storage.getString(key),
    write: (storage, key, value) => storage.setString(key, String(value))
  },
  {
    type: 'number',
    index: storage => storage.indexer.numbers,
    read: (storage, key) => storage.getInt(key),
    write: (storage, key, value) => storage.setInt(key, Number(value))
  },
  {
    type: 'boolean',
    index: storage => storage.indexer.booleans,
    read: (storage, key) => storage.getBool(key),
    write: (storage, key, value) => storage.setBool(key, Boolean(value))
  },
  {
    type: 'object',
    index: storage => storage.indexer.maps,
    read: (storage, key) => storage.getMap(key),
    write: (storage, key, value) => storage.setMap(key, value as object)
  },
  {
    type: 'array',
    index: storage => storage.indexer.arrays,
    read: (storage, key) => storage.getArray(key),
    write: (storage, key, value) => storage.setArray(key, value as unknown[])
  }
];

export type StorageView = {
  getId: () => string;
  getAllEntries: () => Promise<MMKVEntry[]>;
  get: (key: string) => MMKVEntry | null;
  set: (key: string, type: MMKVEntryType, value: MMKVEntryValue) => void;
  remove: (key: string) => void;
  observe: (handlers: {
    onWrite: (entry: MMKVEntry) => void;
    onDelete: (key: string) => void;
  }) => () => void;
};

export const createStorageView = (
  id: string,
  storage: MMKVInstance,
  blacklist?: RegExp
): StorageView => {
  const isHidden = (key: string) => (blacklist ? blacklist.test(`${id}:${key}`) : false);

  const get = (key: string): MMKVEntry | null => {
    if (isHidden(key)) return null;

    for (const binding of BINDINGS) {
      if (!binding.index(storage).hasKey(key)) continue;

      const value = binding.read(storage, key);
      if (value === null || value === undefined) return null;

      return { key, type: binding.type, value } as MMKVEntry;
    }

    return null;
  };

  const getAllEntries = async (): Promise<MMKVEntry[]> => {
    const entries: MMKVEntry[] = [];

    for (const binding of BINDINGS) {
      const pairs = (await binding.index(storage).getAll()) as [string, unknown][] | null;
      if (!pairs) continue;

      for (const [key, value] of pairs) {
        if (isHidden(key)) continue;
        if (value === null || value === undefined) continue;
        entries.push({ key, type: binding.type, value } as MMKVEntry);
      }
    }

    return entries.sort((a, b) => a.key.localeCompare(b.key));
  };

  const set = (key: string, type: MMKVEntryType, value: MMKVEntryValue) => {
    const binding = BINDINGS.find(item => item.type === type);
    if (!binding) return;
    binding.write(storage, key, value);
  };

  const observe = (handlers: {
    onWrite: (entry: MMKVEntry) => void;
    onDelete: (key: string) => void;
  }) => {
    const unsubscribers = BINDINGS.map(binding =>
      storage.transactions.subscribe(binding.type, 'onwrite', (key, value) => {
        if (isHidden(key)) return;
        if (value === null || value === undefined) return;
        handlers.onWrite({ key, type: binding.type, value } as MMKVEntry);
      })
    );

    unsubscribers.push(
      storage.transactions.subscribe('string', 'ondelete', key => {
        if (isHidden(key)) return;
        handlers.onDelete(key);
      })
    );

    return () => unsubscribers.forEach(unsubscribe => unsubscribe());
  };

  return {
    getId: () => id,
    getAllEntries,
    get,
    set,
    remove: (key: string) => storage.removeItem(key),
    observe
  };
};
