import { MMKVEntry } from './types';

export type MMKVSnapshotEvent = {
  type: 'snapshot';
  id: string;
  entries: MMKVEntry[];
};

export type MMKVSetEntryEvent = {
  type: 'set-entry';
  id: string;
  entry: MMKVEntry;
};

export type MMKVDeleteEntryEvent = {
  type: 'delete-entry';
  id: string;
  key: string;
};

export type MMKVGetSnapshotEvent = {
  type: 'get-snapshot';
  id: string | 'all';
};

export type MMKVEvent =
  | MMKVSnapshotEvent
  | MMKVSetEntryEvent
  | MMKVDeleteEntryEvent
  | MMKVGetSnapshotEvent;

export type MMKVEventMap = {
  [K in MMKVEvent['type']]: Extract<MMKVEvent, { type: K }>;
};

export const PLUGIN_ID = 'react-native-mmkv-storage-devtools';
