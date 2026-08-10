import { MMKVLoader } from 'react-native-mmkv-storage';
import { suite, test, expect } from '../../testing/framework';
import { uniqueKey } from '../../testing/async';
import { encrypted } from '../storages';

suite('Encryption', () => {
  test('an encrypted instance reads and writes normally', () => {
    const key = uniqueKey('enc_value');
    encrypted.setString(key, 'secret value');
    expect(encrypted.getString(key)).toBe('secret value');
  });

  test('getKey returns the alias and key of an encrypted instance', () => {
    const result = encrypted.getKey();
    expect(result.key).toBeTypeOf('string');
    expect(result.alias).toBeTypeOf('string');
    expect((result.key as string).length).toBeGreaterThan(2);
  });

  test('encrypt returns true and keeps existing values readable', () => {
    const storage = new MMKVLoader().withInstanceID(uniqueKey('enc_runtime')).initialize();
    const key = uniqueKey('enc_before');
    storage.setString(key, 'written before encryption');

    expect(storage.encryption.encrypt()).toBe(true);
    expect(storage.getString(key)).toBe('written before encryption');
  });

  test('encrypt accepts a custom key', () => {
    const storage = new MMKVLoader().withInstanceID(uniqueKey('enc_custom')).initialize();
    expect(storage.encryption.encrypt('a-custom-key-value')).toBe(true);
    expect(storage.getKey().key).toBe('a-custom-key-value');
  });

  test('values written after runtime encryption are readable', () => {
    const storage = new MMKVLoader().withInstanceID(uniqueKey('enc_after')).initialize();
    storage.encryption.encrypt();
    const key = uniqueKey('enc_after_value');
    storage.setString(key, 'after encryption');
    expect(storage.getString(key)).toBe('after encryption');
  });

  test('changeEncryptionKey swaps the key and keeps data readable', () => {
    const storage = new MMKVLoader().withInstanceID(uniqueKey('enc_change')).initialize();
    const key = uniqueKey('enc_change_value');
    storage.encryption.encrypt('first-key-value');
    storage.setString(key, 'stable value');

    expect(storage.encryption.changeEncryptionKey('second-key-value')).toBe(true);
    expect(storage.getKey().key).toBe('second-key-value');
    expect(storage.getString(key)).toBe('stable value');
  });

  test('decrypt returns true and leaves values readable', () => {
    const storage = new MMKVLoader().withInstanceID(uniqueKey('enc_decrypt')).initialize();
    const key = uniqueKey('enc_decrypt_value');
    storage.encryption.encrypt('key-to-remove');
    storage.setString(key, 'still readable');

    expect(storage.encryption.decrypt()).toBe(true);
    expect(storage.getString(key)).toBe('still readable');
  });

  test('encryption methods are synchronous', () => {
    const storage = new MMKVLoader().withInstanceID(uniqueKey('enc_sync')).initialize();
    const result = storage.encryption.encrypt('sync-check-key');
    expect((result as any)?.then).toBeUndefined();
    expect(result).toBe(true);
  });

  test('an instance created with withEncryption exposes its options', () => {
    expect(encrypted.options.initWithEncryption).toBe(true);
    expect(encrypted.options.secureKeyStorage).toBe(true);
    expect(encrypted.options.alias).toBeTypeOf('string');
  });

  test('all data types work on an encrypted instance', () => {
    const prefix = uniqueKey('enc_types');
    encrypted.setString(`${prefix}_s`, 'string');
    encrypted.setInt(`${prefix}_n`, 12);
    encrypted.setBool(`${prefix}_b`, true);
    encrypted.setMap(`${prefix}_m`, { encrypted: true });
    encrypted.setArray(`${prefix}_a`, [1, 2]);

    expect(encrypted.getString(`${prefix}_s`)).toBe('string');
    expect(encrypted.getInt(`${prefix}_n`)).toBe(12);
    expect(encrypted.getBool(`${prefix}_b`)).toBe(true);
    expect(encrypted.getMap(`${prefix}_m`)).toEqual({ encrypted: true });
    expect(encrypted.getArray(`${prefix}_a`)).toEqual([1, 2]);
  });

  test('the indexer works on an encrypted instance', async () => {
    const key = uniqueKey('enc_indexed');
    encrypted.setString(key, 'indexed');
    expect(await encrypted.indexer.strings.getKeys()).toContain(key);
  });
});
