import {
  MMKVLoader,
  MMKVInstance,
  ProcessingModes,
  IOSAccessibleStates,
  init,
  isLoaded
} from 'react-native-mmkv-storage';
import { suite, test, expect } from '../../testing/framework';
import { uniqueKey } from '../../testing/async';

suite('Loader', () => {
  test('bindings are installed', () => {
    expect(isLoaded()).toBe(true);
    expect(init()).toBe(true);
  });

  test('initialize returns an MMKVInstance', () => {
    const storage = new MMKVLoader().withInstanceID(uniqueKey('loader')).initialize();
    expect(storage).toBeInstanceOf(MMKVInstance);
    expect(storage.instanceID).toBeTypeOf('string');
  });

  test('builder methods are chainable and return the loader', () => {
    const loader = new MMKVLoader();
    expect(loader.withInstanceID('chain')).toBe(loader);
    expect(loader.withEncryption()).toBe(loader);
    expect(loader.setProcessingMode(ProcessingModes.SINGLE_PROCESS)).toBe(loader);
    expect(loader.withPersistedDefaultValues()).toBe(loader);
    expect(loader.disableIndexing()).toBe(loader);
    expect(loader.generateKey()).toBe(loader);
    expect(loader.withServiceName('service')).toBe(loader);
    expect(loader.setAccessibleIOS(IOSAccessibleStates.WHEN_UNLOCKED)).toBe(loader);
  });

  test('withInstanceID sets the instance id', () => {
    const id = uniqueKey('instance');
    const storage = new MMKVLoader().withInstanceID(id).initialize();
    expect(storage.instanceID).toBe(id);
  });

  test('default instance id is "default"', () => {
    const loader = new MMKVLoader();
    expect(loader.options.instanceID).toBe('default');
  });

  test('withEncryption generates a key and an alias', () => {
    const id = uniqueKey('enc');
    const loader = new MMKVLoader().withInstanceID(id).withEncryption();
    expect(loader.options.initWithEncryption).toBe(true);
    expect(loader.options.secureKeyStorage).toBe(true);
    expect(loader.options.key).toBeTypeOf('string');
    expect((loader.options.key as string).length).toBeGreaterThan(2);
    expect(loader.options.alias).toBeTypeOf('string');
  });

  test('generateKey produces a new random key each call', () => {
    const loader = new MMKVLoader().withInstanceID(uniqueKey('gen'));
    const first = loader.generateKey().options.key;
    const second = loader.generateKey().options.key;
    expect(first).toBeTypeOf('string');
    expect(second).toBeTypeOf('string');
    expect(first).not.toBe(second);
  });

  test('encryptWithCustomKey stores the provided key', () => {
    const id = uniqueKey('custom');
    const storage = new MMKVLoader()
      .withInstanceID(id)
      .withEncryption()
      .encryptWithCustomKey('custom-encryption-key')
      .initialize();
    expect(storage.getKey().key).toBe('custom-encryption-key');
  });

  test('setProcessingMode stores the mode', () => {
    const loader = new MMKVLoader().setProcessingMode(ProcessingModes.MULTI_PROCESS);
    expect(loader.options.processingMode).toBe(ProcessingModes.MULTI_PROCESS);
    expect(ProcessingModes.SINGLE_PROCESS).toBe(1);
    expect(ProcessingModes.MULTI_PROCESS).toBe(2);
  });

  test('disableIndexing turns off indexing', () => {
    const loader = new MMKVLoader().disableIndexing();
    expect(loader.options.enableIndexing).toBe(false);
  });

  test('withPersistedDefaultValues sets persistDefaults', () => {
    const loader = new MMKVLoader().withPersistedDefaultValues();
    expect(loader.options.persistDefaults).toBe(true);
  });

  test('a key shorter than three characters throws on initialize', () => {
    const id = uniqueKey('shortkey');
    expect(() =>
      new MMKVLoader().withInstanceID(id).withEncryption().encryptWithCustomKey('ab').initialize()
    ).toThrow();
  });

  test('IOSAccessibleStates exposes the documented values', () => {
    expect(IOSAccessibleStates.WHEN_UNLOCKED).toBe('AccessibleWhenUnlocked');
    expect(IOSAccessibleStates.AFTER_FIRST_UNLOCK).toBe('AccessibleAfterFirstUnlock');
    expect(IOSAccessibleStates.ALWAYS).toBe('AccessibleAlways');
    expect(IOSAccessibleStates.WHEN_PASSCODE_SET_THIS_DEVICE_ONLY).toBe(
      'AccessibleWhenPasscodeSetThisDeviceOnly'
    );
    expect(IOSAccessibleStates.WHEN_UNLOCKED_THIS_DEVICE_ONLY).toBe('AccessibleWhenUnlockedThisDeviceOnly');
    expect(IOSAccessibleStates.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY).toBe(
      'AccessibleAfterFirstUnlockThisDeviceOnly'
    );
    expect(IOSAccessibleStates.ALWAYS_THIS_DEVICE_ONLY).toBe('AccessibleAlwaysThisDeviceOnly');
  });

  test('two instances keep separate data', () => {
    const key = uniqueKey('separate');
    const a = new MMKVLoader().withInstanceID(uniqueKey('a')).initialize();
    const b = new MMKVLoader().withInstanceID(uniqueKey('b')).initialize();
    a.setString(key, 'from-a');
    b.setString(key, 'from-b');
    expect(a.getString(key)).toBe('from-a');
    expect(b.getString(key)).toBe('from-b');
  });
});
