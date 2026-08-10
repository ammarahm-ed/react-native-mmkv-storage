import { MMKVLoader, getAllMMKVInstanceIDs, getCurrentMMKVInstanceIDs, IDSTORE_ID } from 'react-native-mmkv-storage';
import { Platform } from 'react-native';
import { suite, test, expect } from '../../testing/framework';
import { uniqueKey, flush } from '../../testing/async';
import { plain, E2E_INSTANCE_IDS } from '../storages';

suite('General methods', () => {
  test('removeItem deletes a single key', () => {
    const key = uniqueKey('remove');
    plain.setString(key, 'value');
    expect(plain.removeItem(key)).toBe(true);
    expect(plain.getString(key)).toBeNull();
  });

  test('removeItems deletes many keys', () => {
    const keys = [uniqueKey('remove_many'), uniqueKey('remove_many'), uniqueKey('remove_many')];
    keys.forEach(key => plain.setString(key, 'value'));
    plain.removeItems(keys);
    keys.forEach(key => expect(plain.getString(key)).toBeNull());
  });

  test('removeItems leaves other keys untouched', () => {
    const removed = uniqueKey('remove_target');
    const kept = uniqueKey('remove_kept');
    plain.setString(removed, 'gone');
    plain.setString(kept, 'kept');
    plain.removeItems([removed]);
    expect(plain.getString(removed)).toBeNull();
    expect(plain.getString(kept)).toBe('kept');
  });

  test('setItem and getItem provide the AsyncStorage shape', async () => {
    const key = uniqueKey('async_storage');
    await plain.setItem(key, 'async storage value');
    expect(await plain.getItem(key)).toBe('async storage value');
  });

  test('setItem invokes its callback', async () => {
    const key = uniqueKey('async_storage_cb');
    let called = false;
    await plain.setItem(key, 'value', () => {
      called = true;
    });
    expect(called).toBe(true);
  });

  test('getItem resolves null for a missing key', async () => {
    expect(await plain.getItem(uniqueKey('async_storage_missing'))).toBeNull();
  });

  test('clearMemoryCache keeps values readable', () => {
    const key = uniqueKey('memcache');
    plain.setString(key, 'cached');
    expect(plain.clearMemoryCache()).toBe(true);
    expect(plain.getString(key)).toBe('cached');
  });

  test('clearStore empties an instance', async () => {
    const storage = new MMKVLoader().withInstanceID(uniqueKey('clearable')).initialize();
    storage.setString('one', 'a');
    storage.setInt('two', 2);
    storage.setMap('three', { c: true });

    expect(storage.clearStore()).toBe(true);
    await flush();

    expect(storage.getString('one')).toBeNull();
    expect(storage.getInt('two')).toBeNull();
    expect(storage.getMap('three')).toBeNull();
  });

  test('clearStore leaves the instance usable', async () => {
    const storage = new MMKVLoader().withInstanceID(uniqueKey('reusable')).initialize();
    storage.setString('before', 'value');
    storage.clearStore();
    await flush();
    storage.setString('after', 'value');
    expect(storage.getString('after')).toBe('value');
  });

  test('getCurrentMMKVInstanceIDs reports loaded instances', () => {
    const ids = plain.getCurrentMMKVInstanceIDs();
    expect(ids).toBeTypeOf('object');
    E2E_INSTANCE_IDS.forEach(id => expect(ids).toHaveProperty(id));
  });

  test('getAllMMKVInstanceIDs returns an array of ids', () => {
    const ids = plain.getAllMMKVInstanceIDs();
    expect(Array.isArray(ids)).toBe(true);
    expect(ids).toContain('e2e_plain');
  });

  test('module level instance id helpers match the instance methods', () => {
    expect(Object.keys(getCurrentMMKVInstanceIDs()).sort()).toEqual(
      Object.keys(plain.getCurrentMMKVInstanceIDs()).sort()
    );
    expect(getAllMMKVInstanceIDs().sort()).toEqual(plain.getAllMMKVInstanceIDs().sort());
  });

  test('IDSTORE_ID matches the platform', () => {
    expect(IDSTORE_ID).toBe(Platform.OS === 'ios' ? 'mmkvIdStore' : 'mmkvIDStore');
  });

  test('getKey returns null values for an unencrypted instance', () => {
    const key = plain.getKey();
    expect(key).toHaveProperty('alias');
    expect(key).toHaveProperty('key');
    expect(key.key).toBeNullish();
  });

  test('instance exposes its options', () => {
    expect(plain.options.instanceID).toBe('e2e_plain');
    expect(plain.options.enableIndexing).toBe(true);
  });
});
