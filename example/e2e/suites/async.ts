import { suite, test, expect, expectRejects } from '../../testing/framework';
import { uniqueKey } from '../../testing/async';
import { plain } from '../storages';

suite('Async API', () => {
  test('setStringAsync and getStringAsync round-trip', async () => {
    const key = uniqueKey('async_string');
    await plain.setStringAsync(key, 'async hello');
    expect(await plain.getStringAsync(key)).toBe('async hello');
  });

  test('setIntAsync and getIntAsync round-trip', async () => {
    const key = uniqueKey('async_int');
    await plain.setIntAsync(key, 99);
    expect(await plain.getIntAsync(key)).toBe(99);
  });

  test('setBoolAsync and getBoolAsync round-trip', async () => {
    const key = uniqueKey('async_bool');
    await plain.setBoolAsync(key, true);
    expect(await plain.getBoolAsync(key)).toBe(true);
  });

  test('setMapAsync and getMapAsync round-trip', async () => {
    const key = uniqueKey('async_map');
    const value = { async: true, items: [1, 2, 3] };
    await plain.setMapAsync(key, value);
    expect(await plain.getMapAsync(key)).toEqual(value);
  });

  test('setArrayAsync and getArrayAsync round-trip', async () => {
    const key = uniqueKey('async_array');
    const value = ['a', 'b', 'c'];
    await plain.setArrayAsync(key, value);
    expect(await plain.getArrayAsync(key)).toEqual(value);
  });

  test('async getters resolve null for a missing key', async () => {
    expect(await plain.getStringAsync(uniqueKey('async_missing'))).toBeNull();
    expect(await plain.getMapAsync(uniqueKey('async_missing_map'))).toBeNull();
    expect(await plain.getArrayAsync(uniqueKey('async_missing_array'))).toBeNull();
  });

  test('async setters reject on a type mismatch', async () => {
    const key = uniqueKey('async_type');
    await expectRejects(plain.setStringAsync(key, 12 as any), 'as a string');
    await expectRejects(plain.setIntAsync(key, 'nope' as any), 'as a number');
    await expectRejects(plain.setBoolAsync(key, 'nope' as any), 'as a boolean');
    await expectRejects(plain.setArrayAsync(key, 'nope' as any), 'as a array');
  });

  test('async writes are visible to the sync getters', async () => {
    const key = uniqueKey('async_visible');
    await plain.setStringAsync(key, 'written async');
    expect(plain.getString(key)).toBe('written async');
  });

  test('sync writes are visible to the async getters', async () => {
    const key = uniqueKey('sync_visible');
    plain.setString(key, 'written sync');
    expect(await plain.getStringAsync(key)).toBe('written sync');
  });

  test('concurrent async writes all land', async () => {
    const keys = Array.from({ length: 25 }, (_, index) => `${uniqueKey('concurrent')}_${index}`);
    await Promise.all(keys.map((key, index) => plain.setIntAsync(key, index)));
    const values = await Promise.all(keys.map(key => plain.getIntAsync(key)));
    expect(values).toEqual(keys.map((_key, index) => index));
  });
});
