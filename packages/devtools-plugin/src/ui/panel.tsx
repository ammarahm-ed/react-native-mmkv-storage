import { useRozeniteDevToolsClient } from '@rozenite/plugin-bridge';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { MMKVEventMap, PLUGIN_ID } from '../shared/messaging';
import { MMKVEntry, MMKVEntryType } from '../shared/types';

type Snapshots = Record<string, MMKVEntry[]>;

const formatValue = (entry: MMKVEntry) => {
  if (entry.type === 'object' || entry.type === 'array') {
    return JSON.stringify(entry.value);
  }
  return String(entry.value);
};

const parseValue = (type: MMKVEntryType, draft: string) => {
  if (type === 'number') {
    const parsed = Number(draft);
    return Number.isNaN(parsed) ? null : parsed;
  }
  if (type === 'boolean') {
    if (draft === 'true') return true;
    if (draft === 'false') return false;
    return null;
  }
  if (type === 'object' || type === 'array') {
    try {
      return JSON.parse(draft);
    } catch {
      return null;
    }
  }
  return draft;
};

const TYPE_COLORS: Record<MMKVEntryType, string> = {
  string: '#2f855a',
  number: '#2b6cb0',
  boolean: '#805ad5',
  object: '#b7791f',
  array: '#c05621'
};

export default function MMKVStoragePanel() {
  const client = useRozeniteDevToolsClient<MMKVEventMap>({ pluginId: PLUGIN_ID });

  const [snapshots, setSnapshots] = useState<Snapshots>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [filter, setFilter] = useState('');
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState('');

  useEffect(() => {
    if (!client) return;

    client.send('get-snapshot', { type: 'get-snapshot', id: 'all' });

    const subscriptions = [
      client.onMessage('snapshot', ({ id, entries }) => {
        setSnapshots(current => ({ ...current, [id]: entries }));
      }),
      client.onMessage('set-entry', ({ id, entry }) => {
        setSnapshots(current => {
          const entries = current[id] ?? [];
          const index = entries.findIndex(item => item.key === entry.key);
          const next = index === -1 ? [...entries, entry] : entries.slice();
          if (index !== -1) next[index] = entry;
          next.sort((a, b) => a.key.localeCompare(b.key));
          return { ...current, [id]: next };
        });
      }),
      client.onMessage('delete-entry', ({ id, key }) => {
        setSnapshots(current => ({
          ...current,
          [id]: (current[id] ?? []).filter(entry => entry.key !== key)
        }));
      })
    ];

    return () => subscriptions.forEach(subscription => subscription.remove());
  }, [client]);

  const instanceIds = useMemo(() => Object.keys(snapshots).sort(), [snapshots]);
  const activeId = selected && snapshots[selected] ? selected : (instanceIds[0] ?? null);
  const entries = activeId ? (snapshots[activeId] ?? []) : [];

  const visible = useMemo(() => {
    if (!filter) return entries;
    const needle = filter.toLowerCase();
    return entries.filter(
      entry =>
        entry.key.toLowerCase().includes(needle) ||
        formatValue(entry).toLowerCase().includes(needle)
    );
  }, [entries, filter]);

  const commit = (entry: MMKVEntry) => {
    if (!client || !activeId) return;

    const value = parseValue(entry.type, draft);
    if (value === null && entry.type !== 'string') {
      return;
    }

    client.send('set-entry', {
      type: 'set-entry',
      id: activeId,
      entry: { key: entry.key, type: entry.type, value } as MMKVEntry
    });
    setEditing(null);
  };

  const remove = (key: string) => {
    if (!client || !activeId) return;
    client.send('delete-entry', { type: 'delete-entry', id: activeId, key });
  };

  if (!client) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Connecting to the app…</Text>
      </View>
    );
  }

  if (instanceIds.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>No MMKV instances registered</Text>
        <Text style={styles.emptyText}>
          Call useMMKVDevTools({'{'} storages: [storage] {'}'}) in your app to inspect it here.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {instanceIds.map(id => (
            <Pressable
              key={id}
              onPress={() => setSelected(id)}
              style={[styles.tab, id === activeId && styles.tabActive]}
            >
              <Text style={[styles.tabText, id === activeId && styles.tabTextActive]}>
                {id}
              </Text>
              <Text style={styles.tabCount}>{(snapshots[id] ?? []).length}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <View style={styles.filterRow}>
        <TextInput
          value={filter}
          onChangeText={setFilter}
          placeholder="Filter keys and values"
          placeholderTextColor="#9aa5b1"
          style={styles.filterInput}
        />
        <Pressable
          onPress={() =>
            client.send('get-snapshot', { type: 'get-snapshot', id: activeId ?? 'all' })
          }
          style={styles.refresh}
        >
          <Text style={styles.refreshText}>Refresh</Text>
        </Pressable>
      </View>

      <View style={styles.headerRow}>
        <Text style={[styles.headerCell, styles.keyCell]}>Key</Text>
        <Text style={[styles.headerCell, styles.typeCell]}>Type</Text>
        <Text style={[styles.headerCell, styles.valueCell]}>Value</Text>
        <Text style={[styles.headerCell, styles.actionCell]} />
      </View>

      <ScrollView style={styles.rows}>
        {visible.length === 0 ? (
          <Text style={styles.noRows}>
            {entries.length === 0 ? 'This instance is empty.' : 'No keys match the filter.'}
          </Text>
        ) : (
          visible.map(entry => {
            const isEditing = editing === entry.key;

            return (
              <View key={entry.key} style={styles.row}>
                <Text style={[styles.cell, styles.keyCell]} numberOfLines={1}>
                  {entry.key}
                </Text>
                <Text style={[styles.cell, styles.typeCell, { color: TYPE_COLORS[entry.type] }]}>
                  {entry.type}
                </Text>
                {isEditing ? (
                  <TextInput
                    value={draft}
                    onChangeText={setDraft}
                    onSubmitEditing={() => commit(entry)}
                    autoFocus
                    style={[styles.cell, styles.valueCell, styles.valueInput]}
                  />
                ) : (
                  <Pressable
                    style={styles.valueCell}
                    onPress={() => {
                      setEditing(entry.key);
                      setDraft(formatValue(entry));
                    }}
                  >
                    <Text style={styles.cell} numberOfLines={1}>
                      {formatValue(entry)}
                    </Text>
                  </Pressable>
                )}
                <View style={[styles.actionCell, styles.actions]}>
                  {isEditing ? (
                    <>
                      <Pressable onPress={() => commit(entry)}>
                        <Text style={styles.save}>Save</Text>
                      </Pressable>
                      <Pressable onPress={() => setEditing(null)}>
                        <Text style={styles.cancel}>Cancel</Text>
                      </Pressable>
                    </>
                  ) : (
                    <Pressable onPress={() => remove(entry.key)}>
                      <Text style={styles.delete}>Delete</Text>
                    </Pressable>
                  )}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  emptyTitle: { fontSize: 15, fontWeight: '600', color: '#1a1a1a', marginBottom: 6 },
  emptyText: { fontSize: 13, color: '#666', textAlign: 'center' },
  toolbar: { borderBottomWidth: 1, borderBottomColor: '#e9ecef' },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent'
  },
  tabActive: { borderBottomColor: '#8232ff' },
  tabText: { fontSize: 13, color: '#666' },
  tabTextActive: { color: '#1a1a1a', fontWeight: '600' },
  tabCount: {
    marginLeft: 6,
    fontSize: 11,
    color: '#8a94a0',
    backgroundColor: '#f1f3f5',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8
  },
  filterInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 13
  },
  refresh: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 6,
    backgroundColor: '#f1f3f5'
  },
  refreshText: { fontSize: 12, color: '#495057', fontWeight: '600' },
  headerRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f8f9fa',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e9ecef'
  },
  headerCell: { fontSize: 11, fontWeight: '700', color: '#868e96', textTransform: 'uppercase' },
  rows: { flex: 1 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f5'
  },
  cell: { fontSize: 12, color: '#212529' },
  keyCell: { flex: 3, paddingRight: 8 },
  typeCell: { flex: 1, paddingRight: 8, fontWeight: '600' },
  valueCell: { flex: 5, paddingRight: 8 },
  actionCell: { flex: 2 },
  actions: { flexDirection: 'row', gap: 10, justifyContent: 'flex-end' },
  valueInput: {
    borderWidth: 1,
    borderColor: '#8232ff',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 3
  },
  noRows: { padding: 20, fontSize: 13, color: '#868e96', textAlign: 'center' },
  save: { fontSize: 12, color: '#2f855a', fontWeight: '600' },
  cancel: { fontSize: 12, color: '#868e96' },
  delete: { fontSize: 12, color: '#c92a2a' }
});
