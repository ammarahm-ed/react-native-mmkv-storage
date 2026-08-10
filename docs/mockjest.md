# Testing with Jest

The library's storage lives behind JSI bindings that only exist on a device, so it cannot run in Jest as-is. Instead, the package ships an in-memory adapter that replaces those bindings with plain JavaScript objects, letting your tests read and write for real without a native runtime.

## Configure Jest

Two things are needed in `jest.config.js`: the shipped setup file, which stubs the native module so the bindings can be installed, and a `transformIgnorePatterns` entry that lets the library's source through Babel.

```js
module.exports = {
  preset: 'react-native',
  setupFiles: ['./node_modules/react-native-mmkv-storage/jest/mmkvJestSetup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|react-native-mmkv-storage)/)'
  ]
};
```

`transformIgnorePatterns` is a list of patterns whose matches are **not** transformed, so the negative lookahead is what carves the listed packages out of the ignore rule. Add any other untranspiled dependencies to the same alternation.

## Install the in-memory adapter

The adapter is shipped compiled at `react-native-mmkv-storage/jest/dist/jest/memoryStore.js` and exposes two functions, `mock()` and `unmock()`. Call them in `beforeEach` so each test starts from an empty store.

```js
import { MMKVLoader, isLoaded } from 'react-native-mmkv-storage';

const mmkvMock = require('react-native-mmkv-storage/jest/dist/jest/memoryStore.js');

describe('MMKV storage', () => {
  beforeEach(() => {
    mmkvMock.unmock();
    mmkvMock.mock();
  });

  it('installs the mock bindings', () => {
    expect(isLoaded()).toBe(true);
  });

  it('creates an instance', () => {
    const storage = new MMKVLoader().initialize();
    expect(storage.instanceID).toBe('default');
    expect(storage.getString('unknown')).toBe(null);
  });

  it('reads back what it writes', () => {
    const storage = new MMKVLoader().initialize();
    storage.setString('user.name', 'robert');
    storage.setInt('user.age', 24);
    storage.setMap('user', { name: 'robert' });

    expect(storage.getString('user.name')).toBe('robert');
    expect(storage.getInt('user.age')).toBe(24);
    expect(storage.getMap('user')).toEqual({ name: 'robert' });
  });
});
```

Encryption is mocked too: `withEncryption()`, `encryptWithCustomKey()` and the `instance.encryption` methods all succeed, and the keychain is a plain in-memory object. Nothing is actually encrypted, so tests should assert on behaviour, not on ciphertext.

## Clearing state between tests

::: warning
The adapter keeps everything in memory only. Nothing persists across test files, and within a file the store survives from one test to the next until you reset it.
:::

`unmock()` throws away both the memory store and the mock keychain, and `mock()` recreates them empty — that pair in `beforeEach`, as above, is the cleanest reset. Note that you must re-create your instances afterwards, since the previous store they were pointing at is gone.

If your instance is created at module scope (the usual pattern in app code), reset the modules along with the store:

```js
beforeEach(() => {
  const mmkvMock = require('react-native-mmkv-storage/jest/dist/jest/memoryStore.js');
  mmkvMock.unmock();
  mmkvMock.mock();
  jest.resetModules();
});
```

To clear a single instance without tearing down the adapter, use the normal API:

```js
storage.clearStore();
```
