import { MMKVLoader } from 'react-native-mmkv-storage';
import { Platform } from 'react-native';
import { suite, test, expect } from '../../testing/framework';
import { uniqueKey } from '../../testing/async';

const isSynchronizable = (alias: string) => {
  const check = (globalThis as any).isSecureKeySynchronizable;
  if (!check) throw new Error('isSecureKeySynchronizable binding is not installed');
  return check(alias);
};

const iosOnly = Platform.OS === 'ios';

suite('Synchronizable key', () => {
  test('a key is not synchronizable by default', () => {
    const storage = new MMKVLoader()
      .withInstanceID(uniqueKey('sync_default'))
      .withEncryption()
      .initialize();

    expect(isSynchronizable(storage.getKey().alias as string)).toBe(false);
  });

  test('withSynchronizableKey stores the key as synchronizable', () => {
    const storage = new MMKVLoader()
      .withInstanceID(uniqueKey('sync_new'))
      .withEncryption()
      .withSynchronizableKey()
      .initialize();

    expect(isSynchronizable(storage.getKey().alias as string)).toBe(iosOnly);
  });

  test('an existing key is migrated when the app opts in later', () => {
    const id = uniqueKey('sync_migrate');
    const before = new MMKVLoader().withInstanceID(id).withEncryption().initialize();
    const alias = before.getKey().alias as string;
    expect(isSynchronizable(alias)).toBe(false);

    new MMKVLoader().withInstanceID(id).withEncryption().withSynchronizableKey().initialize();

    expect(isSynchronizable(alias)).toBe(iosOnly);
  });

  test('migration keeps the same encryption key', () => {
    const id = uniqueKey('sync_samekey');
    const before = new MMKVLoader().withInstanceID(id).withEncryption().initialize();
    const originalKey = before.getKey().key;

    const after = new MMKVLoader()
      .withInstanceID(id)
      .withEncryption()
      .withSynchronizableKey()
      .initialize();

    expect(after.getKey().key).toBe(originalKey);
  });

  test('data written before migration is still readable after it', () => {
    const id = uniqueKey('sync_data');
    const before = new MMKVLoader().withInstanceID(id).withEncryption().initialize();
    before.setString('secret', 'written before migration');

    const after = new MMKVLoader()
      .withInstanceID(id)
      .withEncryption()
      .withSynchronizableKey()
      .initialize();

    expect(after.getString('secret')).toBe('written before migration');
  });

  test('a migrated storage is still writable', () => {
    const id = uniqueKey('sync_write');
    const before = new MMKVLoader().withInstanceID(id).withEncryption().initialize();
    before.setString('secret', 'old');

    const after = new MMKVLoader()
      .withInstanceID(id)
      .withEncryption()
      .withSynchronizableKey()
      .initialize();

    after.setString('secret', 'new');
    expect(after.getString('secret')).toBe('new');
  });

  test('migration runs only once and is stable on repeat launches', () => {
    const id = uniqueKey('sync_repeat');
    const first = new MMKVLoader().withInstanceID(id).withEncryption().initialize();
    const alias = first.getKey().alias as string;
    const key = first.getKey().key;

    new MMKVLoader().withInstanceID(id).withEncryption().withSynchronizableKey().initialize();
    const third = new MMKVLoader()
      .withInstanceID(id)
      .withEncryption()
      .withSynchronizableKey()
      .initialize();

    expect(isSynchronizable(alias)).toBe(iosOnly);
    expect(third.getKey().key).toBe(key);
  });
});
