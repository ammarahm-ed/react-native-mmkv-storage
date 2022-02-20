import 'react-native';
import MMKVStorage, {isLoaded} from 'react-native-mmkv-storage';

describe('MMKV Storage mock tests', () => {
  beforeEach(function () {
    let mmkvMock = require('../../jest/dist/jest/memoryStore');
    mmkvMock.unmock();
    mmkvMock.mock();
  });

  it('Mock bindings are installed', () => {
    expect(isLoaded()).toBe(true);
  });

  it('Init an instance', () => {
    let instance = new MMKVStorage.Loader().initialize();
    expect(instance.instanceID).toBe('default');
    expect(instance.getString('unknown')).toBe(null);
  });

  it('Get/Set a string in storage', () => {
    let instance = new MMKVStorage.Loader().initialize();
    const testValue = 'testValue';
    const testKey = 'test';
    let result = instance.setString(testKey, testValue);
    expect(result).toBe(true);
    let value = instance.getString(testKey);
    expect(value).toBe(testValue);
  });
});
