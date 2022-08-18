import 'react-native';
import MMKVStorage, {isLoaded} from '../../';

const mmkvMock = require('../../jest/dist/jest/memoryStore.js');

const dateReviver = (_, date) => {
  const dateRegex = /(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/;

  if (typeof date === 'string' && dateRegex.exec(date)) {
    return new Date(date);
  }
  return date;
};

describe('MMKVStorage mock functionality', () => {
  beforeEach(function () {
    // Reset the storage before each test.
    mmkvMock.unmock();
    mmkvMock.mock();
  });

  it('mock bindings are shoudld be installed', () => {
    expect(isLoaded()).toBe(true);
  });

  it('should init the default instance', () => {
    let instance = new MMKVStorage.Loader().initialize();
    expect(instance.instanceID).toBe('default');
  });

  it('should init instance with custom id', () => {
    let instance = new MMKVStorage.Loader()
      .withInstanceID('test_id')
      .initialize();
    expect(instance.instanceID).toBe('test_id');
  });

  it('should init instance with encryption', () => {
    let id = 'encrypted_instance_id';
    let instance = new MMKVStorage.Loader()
      .withInstanceID(id)
      .withEncryption()
      .initialize();
    expect(instance.instanceID).toBe(id);
    expect(instance.getKey()).toBeTruthy();
  });

  it('should init instance with custom key', () => {
    let id = 'encrypted_instance_id';
    let key = 'my_key';
    let instance = new MMKVStorage.Loader()
      .withInstanceID(id)
      .withEncryption()
      .encryptWithCustomKey(key, false, false)
      .initialize();
    expect(instance.instanceID).toBe(id);
    expect(instance.getKey().key).toBe(key);
  });

  it('should init instance with custom key and save it in secure storage', () => {
    let id = 'encrypted_instance_id';
    let key = 'my_key';
    let instance = new MMKVStorage.Loader()
      .withInstanceID(id)
      .withEncryption()
      .encryptWithCustomKey(key, true)
      .initialize();
    expect(instance.instanceID).toBe(id);
    expect(instance.getKey().key).toBe(key);
    expect(MMKVStorage._jsiModule.getSecureKey(instance.getKey().alias)).toBe(
      key,
    );
  });

  it('should get/set a string from storage', () => {
    let instance = new MMKVStorage.Loader().initialize();
    const testValue = 'testValue';
    const testKey = 'test';
    let result = instance.setString(testKey, testValue);
    expect(result).toBe(true);
    let value = instance.getString(testKey);
    expect(value).toBe(testValue);

    expect(instance.indexer.hasKey(testKey)).toBe(true);
    expect(instance.indexer.strings.hasKey(testKey)).toBe(true);
  });

  it('should get/set a boolean from storage', () => {
    let instance = new MMKVStorage.Loader().initialize();
    const testValue = true;
    const testKey = 'test';
    let result = instance.setBool(testKey, testValue);
    expect(result).toBe(true);
    let value = instance.getBool(testKey);
    expect(value).toBe(testValue);

    expect(instance.indexer.hasKey(testKey)).toBe(true);
    expect(instance.indexer.booleans.hasKey(testKey)).toBe(true);
  });

  it('should get/set a number from storage', () => {
    let instance = new MMKVStorage.Loader().initialize();
    const testValue = 100;
    const testKey = 'test';
    let result = instance.setInt(testKey, testValue);
    expect(result).toBe(true);
    let value = instance.getInt(testKey);
    expect(value).toBe(testValue);

    expect(instance.indexer.hasKey(testKey)).toBe(true);
    expect(instance.indexer.numbers.hasKey(testKey)).toBe(true);
  });

  it('should get/set an object from storage', () => {
    let instance = new MMKVStorage.Loader().initialize();
    const testValue = {a: 'b'};
    const testKey = 'test';
    let result = instance.setMap(testKey, testValue);
    expect(result).toBe(true);
    let value = instance.getMap(testKey);
    expect(value).toStrictEqual(testValue);

    expect(instance.indexer.hasKey(testKey)).toBe(true);
    expect(instance.indexer.maps.hasKey(testKey)).toBe(true);
  });

  it('should get/set an object from storage with reviver', () => {
    let instance = new MMKVStorage.Loader().initialize();
    const testValue = {a: new Date(0)};
    const testKey = 'test';
    let result = instance.setMap(testKey, testValue);
    expect(result).toBe(true);
    let value = instance.getMap(testKey, undefined, dateReviver);
    expect(value).toStrictEqual(testValue);

    expect(instance.indexer.hasKey(testKey)).toBe(true);
    expect(instance.indexer.maps.hasKey(testKey)).toBe(true);
  });

  it('failt to get/set an object from storage without reviver', () => {
    let instance = new MMKVStorage.Loader().initialize();
    const testValue = {a: new Date(0)};
    const testKey = 'test';
    let result = instance.setMap(testKey, testValue);
    expect(result).toBe(true);
    let value = instance.getMap(testKey);
    expect(value.a).not.toBe(testValue);
    expect(typeof value.a).toBe('string');

    expect(instance.indexer.hasKey(testKey)).toBe(true);
    expect(instance.indexer.maps.hasKey(testKey)).toBe(true);
  });

  it('should get/set an array from storage', () => {
    let instance = new MMKVStorage.Loader().initialize();
    const testValue = ['a', 'b'];
    const testKey = 'test';
    let result = instance.setArray(testKey, testValue);
    expect(result).toBe(true);
    let value = instance.getArray(testKey);
    expect(value).toStrictEqual(testValue);

    expect(instance.indexer.hasKey(testKey)).toBe(true);
    expect(instance.indexer.arrays.hasKey(testKey)).toBe(true);
  });

  it('should get/set an array of dates from storage with reviver', () => {
    let instance = new MMKVStorage.Loader().initialize();
    const testValue = [new Date(0), new Date(100)];
    const testKey = 'test';
    let result = instance.setArray(testKey, testValue);

    expect(result).toBe(true);

    let value = instance.getArray(testKey, undefined, dateReviver);
    expect(value).toStrictEqual(testValue);

    expect(instance.indexer.hasKey(testKey)).toBe(true);
    expect(instance.indexer.arrays.hasKey(testKey)).toBe(true);
  });

  it('should fail to get/set an array of dates from storage without reviver', () => {
    let instance = new MMKVStorage.Loader().initialize();
    const testValue = [new Date(0), new Date(100)];
    const testKey = 'test';
    let result = instance.setArray(testKey, testValue);

    expect(result).toBe(true);
    let value = instance.getArray(testKey, undefined);
    expect(value).not.toBe(testValue);
    expect(typeof value[0]).toBe('string');
    expect(typeof value[1]).toBe('string');

    expect(instance.indexer.hasKey(testKey)).toBe(true);
    expect(instance.indexer.arrays.hasKey(testKey)).toBe(true);
  });

  it('should get/set a string from storage async', async () => {
    let instance = new MMKVStorage.Loader().initialize();
    const testValue = 'testValue';
    const testKey = 'test';
    let result = await instance.setStringAsync(testKey, testValue);
    expect(result).toBe(true);
    let value = await instance.getStringAsync(testKey);
    expect(value).toBe(testValue);

    expect(instance.indexer.hasKey(testKey)).toBe(true);
    expect(instance.indexer.strings.hasKey(testKey)).toBe(true);
  });

  it('should get/set a boolean from storage async ', async () => {
    let instance = new MMKVStorage.Loader().initialize();
    const testValue = true;
    const testKey = 'test';
    let result = await instance.setBoolAsync(testKey, testValue);
    expect(result).toBe(true);
    let value = await instance.getBoolAsync(testKey);
    expect(value).toBe(testValue);

    expect(instance.indexer.hasKey(testKey)).toBe(true);
    expect(instance.indexer.booleans.hasKey(testKey)).toBe(true);
  });

  it('should get/set a number from storage async', async () => {
    let instance = new MMKVStorage.Loader().initialize();
    const testValue = 100;
    const testKey = 'test';
    let result = await instance.setIntAsync(testKey, testValue);
    expect(result).toBe(true);
    let value = await instance.getIntAsync(testKey);
    expect(value).toBe(testValue);

    expect(instance.indexer.hasKey(testKey)).toBe(true);
    expect(instance.indexer.numbers.hasKey(testKey)).toBe(true);
  });

  it('should get/set an object from storage async', async () => {
    let instance = new MMKVStorage.Loader().initialize();
    const testValue = {a: 'b'};
    const testKey = 'test';
    let result = await instance.setMapAsync(testKey, testValue);
    expect(result).toBe(true);
    let value = await instance.getMapAsync(testKey);
    expect(value).toStrictEqual(testValue);

    expect(instance.indexer.hasKey(testKey)).toBe(true);
    expect(instance.indexer.maps.hasKey(testKey)).toBe(true);
  });

  it('should get/set an array from storage async', async () => {
    let instance = new MMKVStorage.Loader().initialize();
    const testValue = ['a', 'b'];
    const testKey = 'test';
    let result = await instance.setArrayAsync(testKey, testValue);
    expect(result).toBe(true);
    let value = await instance.getArrayAsync(testKey);
    expect(value).toStrictEqual(testValue);

    expect(instance.indexer.hasKey(testKey)).toBe(true);
    expect(instance.indexer.arrays.hasKey(testKey)).toBe(true);
  });

  it('should delete value from storage', () => {
    let instance = new MMKVStorage.Loader().initialize();
    const testValue = 'testValue';
    const testKey = 'test';
    let result = instance.setString(testKey, testValue);
    expect(result).toBe(true);
    let value = instance.getString(testKey);
    expect(value).toBe(testValue);

    expect(instance.indexer.hasKey(testKey)).toBe(true);
    expect(instance.indexer.strings.hasKey(testKey)).toBe(true);

    instance.removeItem(testKey);
    expect(instance.getString(testValue)).toBe(null);

    expect(instance.indexer.hasKey(testKey)).toBe(false);
    expect(instance.indexer.strings.hasKey(testKey)).toBe(false);
  });

  it('should get all keys from storage', async () => {
    let instance = new MMKVStorage.Loader().initialize();
    const testValue = 'testValue';
    const testKey = 'test';

    const testValue1 = 'testValue1';
    const testKey1 = 'test1';
    instance.setString(testKey, testValue);
    instance.setString(testKey1, testValue1);
    let allkeys = await instance.indexer.getKeys();
    expect(allkeys.length).toBe(3);
    expect(allkeys.includes(testKey) && allkeys.includes(testKey1)).toBe(true);
  });

  it('should clear the storage', async () => {
    let instance = new MMKVStorage.Loader().initialize();
    let result = instance.clearStore();
    expect(result).toBe(true);
    expect(await (await instance.indexer.getKeys()).length).toBe(1);
  });
});
