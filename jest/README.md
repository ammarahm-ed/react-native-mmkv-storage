## Testing with Jest
The library supports mocking the storage in memory to support read/write during tests. Follow the guide below to make it work with jest.

Add `mmkvJestSetup.js` and `transformIgnorePatterns` in `jest.config.js`.

```js
module.exports = {
  preset: 'react-native',
  setupFiles: [
    './node_modules/react-native-mmkv-storage/jest/mmkvJestSetup.js',
  ],
  transformIgnorePatterns: ['/!node_modules\\/react-native-mmkv-storage/'], 
};

```

You will need to mock the storage when your tests run as follows:

```js
import 'react-native';
import MMKVStorage, {isLoaded} from 'react-native-mmkv-storage'; // Import the library as normal.

describe('MMKV Storage mock functionality', () => {

  beforeEach(function () {
    // Install the in-memory adapter
    let mmkvMock = require('react-native-mmkv-storage/jest/dist/jest/memoryStore.js');
    mmkvMock.unmock(); // Cleanup if already mocked
    mmkvMock.mock(); // Mock the storage
  });

  // Use the storage methods as needed. Everything is mocked now
  it('Mock bindings are installed', () => {
    expect(isLoaded()).toBe(true);
  });

  it('Init an instance', () => {
    let instance = new MMKVStorage.Loader().initialize();
    expect(instance.instanceID).toBe('default');
    expect(instance.getString('unknown')).toBe(null);
  });

});
```
