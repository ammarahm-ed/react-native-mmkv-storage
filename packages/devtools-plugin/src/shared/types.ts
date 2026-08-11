export type MMKVEntryType = 'string' | 'number' | 'boolean' | 'object' | 'array';

export type MMKVEntry =
  | { key: string; type: 'string'; value: string }
  | { key: string; type: 'number'; value: number }
  | { key: string; type: 'boolean'; value: boolean }
  | { key: string; type: 'object'; value: Record<string, unknown> }
  | { key: string; type: 'array'; value: unknown[] };

export type MMKVEntryValue = MMKVEntry['value'];
