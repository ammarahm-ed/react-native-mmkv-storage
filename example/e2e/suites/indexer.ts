import { suite, test, expect } from '../../testing/framework';
import { uniqueKey } from '../../testing/async';
import { plain, unindexed } from '../storages';

suite('Indexer', () => {
  test('indexer.getKeys returns every key in the instance', async () => {
    const key = uniqueKey('index_all');
    plain.setString(key, 'value');
    const keys = await plain.indexer.getKeys();
    expect(keys).toContain(key);
  });

  test('indexer.hasKey is synchronous and returns a boolean', () => {
    const key = uniqueKey('index_has');
    plain.setString(key, 'value');
    const result = plain.indexer.hasKey(key);
    expect(result).toBe(true);
    expect((result as any)?.then).toBeUndefined();
  });

  test('indexer.hasKey returns false for a missing key', () => {
    expect(plain.indexer.hasKey(uniqueKey('index_missing'))).toBe(false);
  });

  test('strings index tracks only string keys', async () => {
    const stringKey = uniqueKey('idx_string');
    const numberKey = uniqueKey('idx_number');
    plain.setString(stringKey, 'value');
    plain.setInt(numberKey, 1);

    const keys = await plain.indexer.strings.getKeys();
    expect(keys).toContain(stringKey);
    expect(keys).not.toContain(numberKey);
  });

  test('numbers index tracks number keys', async () => {
    const key = uniqueKey('idx_num');
    plain.setInt(key, 5);
    expect(await plain.indexer.numbers.getKeys()).toContain(key);
    expect(plain.indexer.numbers.hasKey(key)).toBe(true);
  });

  test('booleans index tracks boolean keys', async () => {
    const key = uniqueKey('idx_bool');
    plain.setBool(key, true);
    expect(await plain.indexer.booleans.getKeys()).toContain(key);
    expect(plain.indexer.booleans.hasKey(key)).toBe(true);
  });

  test('maps index tracks object keys', async () => {
    const key = uniqueKey('idx_map');
    plain.setMap(key, { indexed: true });
    expect(await plain.indexer.maps.getKeys()).toContain(key);
    expect(plain.indexer.maps.hasKey(key)).toBe(true);
  });

  test('arrays index tracks array keys', async () => {
    const key = uniqueKey('idx_array');
    plain.setArray(key, [1, 2, 3]);
    expect(await plain.indexer.arrays.getKeys()).toContain(key);
    expect(plain.indexer.arrays.hasKey(key)).toBe(true);
  });

  test('strings getAll returns key value pairs', async () => {
    const key = uniqueKey('getall_string');
    plain.setString(key, 'get all value');
    const all = (await plain.indexer.strings.getAll()) as [string, string][];
    const entry = all.find(item => item[0] === key);
    expect(entry).toBeDefined();
    expect(entry![1]).toBe('get all value');
  });

  test('numbers getAll returns parsed numbers', async () => {
    const key = uniqueKey('getall_number');
    plain.setInt(key, 77);
    const all = (await plain.indexer.numbers.getAll()) as [string, number][];
    const entry = all.find(item => item[0] === key);
    expect(entry![1]).toBe(77);
  });

  test('booleans getAll returns parsed booleans', async () => {
    const key = uniqueKey('getall_bool');
    plain.setBool(key, false);
    const all = (await plain.indexer.booleans.getAll()) as [string, boolean][];
    const entry = all.find(item => item[0] === key);
    expect(entry![1]).toBe(false);
  });

  test('maps getAll parses stored objects', async () => {
    const key = uniqueKey('getall_map');
    plain.setMap(key, { parsed: true });
    const all = (await plain.indexer.maps.getAll()) as [string, any][];
    const entry = all.find(item => item[0] === key);
    expect(entry![1]).toEqual({ parsed: true });
  });

  test('arrays getAll parses stored arrays', async () => {
    const key = uniqueKey('getall_array');
    plain.setArray(key, ['a', 'b']);
    const all = (await plain.indexer.arrays.getAll()) as [string, any][];
    const entry = all.find(item => item[0] === key);
    expect(entry![1]).toEqual(['a', 'b']);
  });

  test('removing a key removes it from its index', async () => {
    const key = uniqueKey('idx_removed');
    plain.setString(key, 'value');
    expect(await plain.indexer.strings.getKeys()).toContain(key);
    plain.removeItem(key);
    expect(await plain.indexer.strings.getKeys()).not.toContain(key);
  });

  test('removeItems clears keys from the index', async () => {
    const keys = [uniqueKey('idx_bulk_rm'), uniqueKey('idx_bulk_rm')];
    keys.forEach(key => plain.setString(key, 'value'));
    plain.removeItems(keys);
    const indexed = await plain.indexer.strings.getKeys();
    keys.forEach(key => expect(indexed).not.toContain(key));
  });

  test('disableIndexing leaves the type indexes empty', async () => {
    const key = uniqueKey('unindexed');
    unindexed.setString(key, 'value');
    expect(unindexed.getString(key)).toBe('value');
    const keys = await unindexed.indexer.strings.getKeys();
    expect(keys ?? []).not.toContain(key);
  });

  test('an unindexed instance still lists raw keys', async () => {
    const key = uniqueKey('unindexed_raw');
    unindexed.setString(key, 'value');
    expect(await unindexed.indexer.getKeys()).toContain(key);
  });
});
