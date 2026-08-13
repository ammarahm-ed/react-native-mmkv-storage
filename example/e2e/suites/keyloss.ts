import { MMKVLoader } from 'react-native-mmkv-storage';
import { suite, test, expect } from '../../testing/framework';
import { uniqueKey } from '../../testing/async';

const dropSecureKey = (alias: string) => {
  const remove = (globalThis as any).removeSecureKey;
  if (!remove) throw new Error('removeSecureKey binding is not installed');
  return remove(alias);
};

suite('Key loss', () => {
  test('initializing an encrypted storage whose key is gone throws', () => {
    const id = uniqueKey('keyloss_throw');
    const storage = new MMKVLoader().withInstanceID(id).withEncryption().initialize();
    storage.setString('secret', 'written before key loss');
    expect(storage.getString('secret')).toBe('written before key loss');

    const alias = storage.getKey().alias as string;
    dropSecureKey(alias);

    expect(() => {
      new MMKVLoader().withInstanceID(id).withEncryption().initialize();
    }).toThrow('could not be read');
  });

  test('the thrown error names the instance it belongs to', () => {
    const id = uniqueKey('keyloss_named');
    const storage = new MMKVLoader().withInstanceID(id).withEncryption().initialize();
    storage.setString('secret', 'value');
    dropSecureKey(storage.getKey().alias as string);

    let caught: any = null;
    try {
      new MMKVLoader().withInstanceID(id).withEncryption().initialize();
    } catch (e) {
      caught = e;
    }

    expect(caught).toBeTruthy();
    expect(caught.name).toBe('KeyUnavailableError');
    expect(caught.instanceID).toBe(id);
  });

  test('recoverOnKeyLoss resets the storage instead of throwing', () => {
    const id = uniqueKey('keyloss_recover');
    const storage = new MMKVLoader().withInstanceID(id).withEncryption().initialize();
    storage.setString('secret', 'written before key loss');
    dropSecureKey(storage.getKey().alias as string);

    const recovered = new MMKVLoader()
      .withInstanceID(id)
      .withEncryption()
      .recoverOnKeyLoss()
      .initialize();

    expect(recovered.getString('secret')).toBeNullish();
  });

  test('a recovered storage is writable and readable again', () => {
    const id = uniqueKey('keyloss_writable');
    const storage = new MMKVLoader().withInstanceID(id).withEncryption().initialize();
    storage.setString('secret', 'old value');
    dropSecureKey(storage.getKey().alias as string);

    const recovered = new MMKVLoader()
      .withInstanceID(id)
      .withEncryption()
      .recoverOnKeyLoss()
      .initialize();

    recovered.setString('secret', 'new value');
    expect(recovered.getString('secret')).toBe('new value');
  });

  test('a recovered storage has a usable encryption key again', () => {
    const id = uniqueKey('keyloss_rekeyed');
    const storage = new MMKVLoader().withInstanceID(id).withEncryption().initialize();
    dropSecureKey(storage.getKey().alias as string);

    const recovered = new MMKVLoader()
      .withInstanceID(id)
      .withEncryption()
      .recoverOnKeyLoss()
      .initialize();

    const key = recovered.getKey();
    expect(key.key).toBeTypeOf('string');
    expect((key.key as string).length).toBeGreaterThan(2);
  });

  test('an unencrypted storage is unaffected by a missing secure key', () => {
    const id = uniqueKey('keyloss_plain');
    const storage = new MMKVLoader().withInstanceID(id).initialize();
    storage.setString('value', 'plain value');

    const reopened = new MMKVLoader().withInstanceID(id).initialize();
    expect(reopened.getString('value')).toBe('plain value');
  });
});
