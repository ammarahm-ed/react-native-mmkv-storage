# Creating an instance

Instances are created with `MMKVLoader`, which follows a builder pattern. Every builder method is synchronous and returns the loader, so calls can be chained. `initialize()` ends the chain and returns an `MMKVInstance`. It is synchronous and throws if the storage could not be created.

```js
import { MMKVLoader } from 'react-native-mmkv-storage';

const storage = new MMKVLoader().initialize();

storage.setString('user', 'robert');
storage.getString('user'); // => "robert"
```

Create the instance once at module scope and import it wherever you need it. Loading the same instance again returns the same underlying storage.

## Instance IDs

Each instance is identified by an ID. When none is given, the ID is `default`. Give an instance its own ID to keep its keys in a separate storage file.

```js
import { MMKVLoader } from 'react-native-mmkv-storage';

const storage = new MMKVLoader().withInstanceID('cache').initialize();
```

## Multiple instances

You can create as many instances as you need. They are fully independent — the same key in two instances holds two different values.

```js
import { MMKVLoader } from 'react-native-mmkv-storage';

export const userStorage = new MMKVLoader().withInstanceID('user').initialize();
export const cacheStorage = new MMKVLoader().withInstanceID('cache').initialize();

userStorage.setString('id', 'u_1');
cacheStorage.setString('id', 'c_1');

userStorage.getString('id'); // => "u_1"
cacheStorage.getString('id'); // => "c_1"
```

## Encryption

`withEncryption()` takes no arguments. It generates a strong key for you, stores it in the iOS Keychain / Android Keystore and reuses it on every later launch, so the loader code never changes.

```js
import { MMKVLoader } from 'react-native-mmkv-storage';

const storage = new MMKVLoader()
  .withInstanceID('secure')
  .withEncryption()
  .initialize();
```

::: warning Call `withInstanceID()` first
The alias under which the key is stored in the keychain is derived from the instance ID at the moment `withEncryption()` runs. Calling `withInstanceID()` after `withEncryption()` stores the key under the wrong alias.
:::

### Encryption with a custom key

Use `encryptWithCustomKey(key, secureKeyStorage?, alias?)` when you want to supply the key yourself — a user password or a token, for example.

```js
import { MMKVLoader } from 'react-native-mmkv-storage';

const storage = new MMKVLoader()
  .withInstanceID('secure')
  .withEncryption()
  .encryptWithCustomKey('my-encryption-key')
  .initialize();
```

By default your key is not written to secure storage, which means you must supply the same key on every app launch. Pass `true` to have the library store it for you:

```js
const storage = new MMKVLoader()
  .withInstanceID('secure')
  .withEncryption()
  .encryptWithCustomKey('my-encryption-key', true)
  .initialize();
```

And pass a third argument to control the alias the key is stored under:

```js
const storage = new MMKVLoader()
  .withInstanceID('secure')
  .withEncryption()
  .encryptWithCustomKey('my-encryption-key', true, 'myCustomAlias')
  .initialize();
```

::: warning Order matters
`withEncryption()` generates a key and overwrites `options.key`, so it must be called **before** `encryptWithCustomKey()`. Reversing the order silently discards your key.
:::

::: danger
A key shorter than 3 characters makes `initialize()` throw `Key is null or too short`.
:::

::: warning
Encrypting an already created instance through the loader creates a **new** MMKV instance rather than encrypting the existing one. To encrypt an instance that already exists, use the runtime API — see [Working with encryption](/workingwithencryption).
:::

### Generating a key without encrypting

`generateKey()` puts a freshly generated strong key on the loader without turning on secure key storage. It is useful when you want to manage the key material yourself.

```js
const storage = new MMKVLoader().withInstanceID('secure').generateKey().initialize();
```

## iOS-only options

The two methods below configure the iOS Keychain and have no effect on Android. They are safe to call unconditionally, but only apply when the key is actually stored securely.

### `withServiceName(name)`

Sets the `kSecAttrService` attribute for the keychain entry.

```js
const storage = new MMKVLoader()
  .withInstanceID('secure')
  .withEncryption()
  .withServiceName('com.myapp.storage')
  .initialize();
```

### `setAccessibleIOS(state)`

Controls when the key can be read from the Keychain. The default is `AFTER_FIRST_UNLOCK`.

```js
import { MMKVLoader, IOSAccessibleStates } from 'react-native-mmkv-storage';

const storage = new MMKVLoader()
  .withInstanceID('secure')
  .withEncryption()
  .setAccessibleIOS(IOSAccessibleStates.WHEN_UNLOCKED)
  .initialize();
```

Available states:

| State | Notes |
| --- | --- |
| `WHEN_UNLOCKED` | Readable only while the device is unlocked |
| `AFTER_FIRST_UNLOCK` | Default |
| `ALWAYS` | Deprecated on iOS 16+ |
| `WHEN_PASSCODE_SET_THIS_DEVICE_ONLY` | Not migrated to a new device |
| `WHEN_UNLOCKED_THIS_DEVICE_ONLY` | Not migrated to a new device |
| `AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY` | Not migrated to a new device |
| `ALWAYS_THIS_DEVICE_ONLY` | Deprecated on iOS 16+ |

## Processing mode

`setProcessingMode(mode)` takes a value from `ProcessingModes`, which is `{ SINGLE_PROCESS: 1, MULTI_PROCESS: 2 }`. The default is `SINGLE_PROCESS`. Use `MULTI_PROCESS` when the same storage is read or written from another process — an Android app widget, an iOS widget or share extension backed by an app group, or a background service.

```js
import { MMKVLoader, ProcessingModes } from 'react-native-mmkv-storage';

const storage = new MMKVLoader()
  .withInstanceID('shared')
  .setProcessingMode(ProcessingModes.MULTI_PROCESS)
  .initialize();
```

## Persisting default values from hooks

By default, the `defaultValue` you pass to `useMMKVStorage` is only returned by the hook; it is never written to storage, so `getString`/`getInt` for that key still return `null`. With `withPersistedDefaultValues()`, the hook writes the default into storage the first time it renders with no stored value, so every other reader sees it too.

```js
import { MMKVLoader } from 'react-native-mmkv-storage';

const storage = new MMKVLoader().withPersistedDefaultValues().initialize();
```

## Disabling indexing

The library keeps one index per data type so it can tell which type a key was stored as. `disableIndexing()` turns those indexes off.

```js
const storage = new MMKVLoader().disableIndexing().initialize();
```

::: warning Tradeoff
With indexing disabled, `storage.indexer.strings`, `storage.indexer.numbers`, `storage.indexer.booleans`, `storage.indexer.maps` and `storage.indexer.arrays` return nothing, and `useIndex` has nothing to read. `useMMKVStorage` also stops resolving an initial value and type for a key, because that lookup goes through the indexer — the hook will start from `null` (or the default value you pass) even when a value is stored.
:::

## Read next

- [Loader class reference](/loaderclass) for every builder method and its exact signature
- [Working with encryption](/workingwithencryption) for encrypting, re-keying and decrypting at runtime
