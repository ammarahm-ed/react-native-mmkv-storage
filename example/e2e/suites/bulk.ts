import { suite, test, expect } from '../../testing/framework';
import { uniqueKey } from '../../testing/async';
import { plain } from '../storages';

const pairs = <T>(keys: string[], make: (index: number) => T): [string, T][] =>
  keys.map((key, index) => [key, make(index)] as [string, T]);

suite('Bulk API', () => {
  test('getMultipleItems returns key value tuples for strings', () => {
    const keys = [uniqueKey('bulk_s'), uniqueKey('bulk_s'), uniqueKey('bulk_s')];
    keys.forEach((key, index) => plain.setString(key, `value_${index}`));

    const result = plain.getMultipleItems<string>(keys, 'string');
    expect(result).toHaveLength(3);
    expect(result![0][0]).toBe(keys[0]);
    expect(result!.map((entry: [string, any]) => entry[1])).toEqual(['value_0', 'value_1', 'value_2']);
  });

  test('getMultipleItems reads numbers', () => {
    const keys = [uniqueKey('bulk_n'), uniqueKey('bulk_n')];
    keys.forEach((key, index) => plain.setInt(key, index * 10));
    const result = plain.getMultipleItems<number>(keys, 'number');
    expect(result!.map((entry: [string, any]) => entry[1])).toEqual([0, 10]);
  });

  test('getMultipleItems reads booleans', () => {
    const keys = [uniqueKey('bulk_b'), uniqueKey('bulk_b')];
    plain.setBool(keys[0], true);
    plain.setBool(keys[1], false);
    const result = plain.getMultipleItems<boolean>(keys, 'boolean');
    expect(result!.map((entry: [string, any]) => entry[1])).toEqual([true, false]);
  });

  test('getMultipleItems reads objects', () => {
    const keys = [uniqueKey('bulk_o'), uniqueKey('bulk_o')];
    keys.forEach((key, index) => plain.setMap(key, { index }));
    const result = plain.getMultipleItems<{ index: number }>(keys, 'object');
    expect(result!.map((entry: [string, any]) => entry[1])).toEqual([{ index: 0 }, { index: 1 }]);
  });

  test('getMultipleItems accepts "map" as an alias for "object"', () => {
    const key = uniqueKey('bulk_alias');
    plain.setMap(key, { aliased: true });
    const result = plain.getMultipleItems<{ aliased: boolean }>([key], 'map');
    expect(result![0][1]).toEqual({ aliased: true });
  });

  test('getMultipleItems reads arrays', () => {
    const keys = [uniqueKey('bulk_a'), uniqueKey('bulk_a')];
    keys.forEach((key, index) => plain.setArray(key, [index, index + 1]));
    const result = plain.getMultipleItems<number[]>(keys, 'array');
    expect(result!.map((entry: [string, any]) => entry[1])).toEqual([
      [0, 1],
      [1, 2]
    ]);
  });

  test('getMultipleItems returns undefined for an unsupported type', () => {
    const key = uniqueKey('bulk_bad');
    plain.setString(key, 'value');
    expect(plain.getMultipleItems([key], 'bool' as any)).toBeUndefined();
  });

  test('setMultipleItemsAsync writes strings in bulk', async () => {
    const keys = [uniqueKey('multi_s'), uniqueKey('multi_s'), uniqueKey('multi_s')];
    await plain.setMultipleItemsAsync(
      pairs(keys, index => `bulk_${index}`),
      'string'
    );
    expect(keys.map(key => plain.getString(key))).toEqual(['bulk_0', 'bulk_1', 'bulk_2']);
  });

  test('setMultipleItemsAsync writes maps in bulk', async () => {
    const keys = [uniqueKey('multi_m'), uniqueKey('multi_m')];
    await plain.setMultipleItemsAsync(
      pairs(keys, index => ({ index, nested: { ok: true } })),
      'map'
    );
    expect(keys.map(key => plain.getMap(key))).toEqual([
      { index: 0, nested: { ok: true } },
      { index: 1, nested: { ok: true } }
    ]);
  });

  test('setMultipleItemsAsync writes arrays in bulk', async () => {
    const keys = [uniqueKey('multi_a'), uniqueKey('multi_a')];
    await plain.setMultipleItemsAsync(
      pairs(keys, index => [index, index * 2]),
      'array'
    );
    expect(keys.map(key => plain.getArray(key))).toEqual([
      [0, 0],
      [1, 2]
    ]);
  });

  test('setMultipleItemsAsync writes numbers and booleans', async () => {
    const numberKeys = [uniqueKey('multi_n'), uniqueKey('multi_n')];
    const boolKeys = [uniqueKey('multi_b'), uniqueKey('multi_b')];
    await plain.setMultipleItemsAsync(
      pairs(numberKeys, index => index + 100),
      'number'
    );
    await plain.setMultipleItemsAsync(
      pairs(boolKeys, index => index === 0),
      'boolean'
    );
    expect(numberKeys.map(key => plain.getInt(key))).toEqual([100, 101]);
    expect(boolKeys.map(key => plain.getBool(key))).toEqual([true, false]);
  });

  test('setMultipleItemsAsync resolves true', async () => {
    const key = uniqueKey('multi_result');
    const result = await plain.setMultipleItemsAsync([[key, 'value']], 'string');
    expect(result).toBe(true);
  });

  test('getMultipleItemsAsync reads strings written in bulk', async () => {
    const keys = [uniqueKey('async_multi'), uniqueKey('async_multi')];
    await plain.setMultipleItemsAsync(
      pairs(keys, index => `async_${index}`),
      'string'
    );
    const result = await plain.getMultipleItemsAsync<string>(keys, 'string');
    expect(result.map((entry: [string, any]) => entry[1])).toEqual(['async_0', 'async_1']);
  });

  test('getMultipleItemsAsync reads numbers and booleans', async () => {
    const numberKeys = [uniqueKey('async_multi_n'), uniqueKey('async_multi_n')];
    numberKeys.forEach((key, index) => plain.setInt(key, index * 5));
    const numbers = await plain.getMultipleItemsAsync<number>(numberKeys, 'number');
    expect(numbers.map((entry: [string, any]) => entry[1])).toEqual([0, 5]);

    const boolKeys = [uniqueKey('async_multi_b')];
    plain.setBool(boolKeys[0], true);
    const booleans = await plain.getMultipleItemsAsync<boolean>(boolKeys, 'boolean');
    expect(booleans[0][1]).toBe(true);
  });

  test('bulk writes are visible through the indexer', async () => {
    const keys = [uniqueKey('multi_indexed'), uniqueKey('multi_indexed')];
    await plain.setMultipleItemsAsync(
      pairs(keys, index => `indexed_${index}`),
      'string'
    );
    const indexed = await plain.indexer.strings.getKeys();
    expect(indexed).toContain(keys[0]);
    expect(indexed).toContain(keys[1]);
  });

  test('a large bulk write round-trips', async () => {
    const prefix = uniqueKey('large');
    const keys = Array.from({ length: 200 }, (_, index) => `${prefix}_${index}`);
    await plain.setMultipleItemsAsync(
      pairs(keys, index => `value_${index}`),
      'string'
    );
    const result = await plain.getMultipleItemsAsync<string>(keys, 'string');
    expect(result).toHaveLength(200);
    expect(result[199][1]).toBe('value_199');
  });
});
