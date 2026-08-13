# MMKVLoader

`MMKVLoader` creates and loads an MMKV storage instance. It follows a builder pattern: you describe the instance you want with chainable methods, then call [`initialize()`](#initialize) to get an `MMKVInstance` back.

```js
import { MMKVLoader } from 'react-native-mmkv-storage';

const storage = new MMKVLoader()
  .withInstanceID('user-storage')
  .withEncryption()
  .initialize();
```

Every builder method is synchronous and returns `this`, so calls can be chained in any order except where noted under [Ordering constraints](#ordering-constraints).

::: warning
Do not reassign the loader to a `const`. Chain the calls instead — `const storage = new MMKVLoader(); storage = storage.withInstanceID('id')` is an assignment to a constant and will throw.
:::

## initialize

Creates the storage with the configured options and returns the instance you use to read and write data.

```ts
initialize(): MMKVInstance
```

**Parameters:** none.

**Returns:** `MMKVInstance`

**Throws:**

| Error | When |
| --- | --- |
| `MMKVStorage bindings not installed` | The JSI bindings could not be installed. See [`init()`](/generalmethods#init). |
| `Key is null or too short` | Encryption was requested with a key shorter than 3 characters. |
| `KeyUnavailableError` | An encrypted storage exists but its key could not be read, so the data cannot be decrypted. See [Backups and device transfers](/devicetransfer). |
| `InitializationError` | The storage could not be opened. |

::: warning Changed in 13.0.0
`initialize()` previously returned a storage instance even when the underlying storage failed to open, and every read and write on it silently did nothing. It now throws instead. If you encrypt storage, handle `KeyUnavailableError` or opt into [`recoverOnKeyLoss()`](#recoveronkeyloss).
:::

```js
import { MMKVLoader } from 'react-native-mmkv-storage';

const storage = new MMKVLoader().initialize();

storage.setString('user', 'robert');
```

## withInstanceID

Loads the storage with the given ID. If no instance with this ID exists yet, a new one is created. Use this to keep multiple independent storages in one app. The default ID is `default`.

```ts
withInstanceID(id: string): this
```

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | `string` | yes | Unique ID of the storage instance. |

**Returns:** `this`

```js
import { MMKVLoader } from 'react-native-mmkv-storage';

const storage = new MMKVLoader().withInstanceID('user-storage').initialize();
```

## withEncryption

Encrypts the instance on creation. A strong key is generated for you and stored in the Keychain on iOS and the Keystore on Android, under an alias derived from the instance ID.

```ts
withEncryption(): this
```

**Parameters:** none. To supply your own key, chain [`encryptWithCustomKey()`](#encryptwithcustomkey) after this call.

**Returns:** `this`

```js
import { MMKVLoader } from 'react-native-mmkv-storage';

const storage = new MMKVLoader()
  .withInstanceID('secure-storage')
  .withEncryption()
  .initialize();
```

## withSynchronizableKey

Stores the encryption key as a synchronizable iCloud Keychain item so it follows the user onto a new device. Without it, iOS binds keychain backups to the hardware that made them, so restoring an iCloud backup onto a different device leaves the storage encrypted with a key that no longer exists.

```ts
withSynchronizableKey(): this
```

**Parameters:** none.

**Returns:** `this`

```js
const storage = new MMKVLoader()
  .withInstanceID('secure-storage')
  .withEncryption()
  .withSynchronizableKey()
  .initialize();
```

A key stored before you added this call is migrated on the next `initialize()`, keeping its value so existing data stays readable. Use [`isSecureKeySynchronizable()`](#issecurekeysynchronizable) to confirm.

Requires the user to have iCloud Keychain enabled, and has no effect on Android, where Keystore keys cannot be exported. See [Backups and device transfers](/devicetransfer).

## recoverOnKeyLoss

Deletes and recreates an encrypted storage when its key cannot be read, instead of throwing `KeyUnavailableError`.

```ts
recoverOnKeyLoss(): this
```

**Parameters:** none.

**Returns:** `this`

```js
const storage = new MMKVLoader()
  .withInstanceID('cache')
  .withEncryption()
  .recoverOnKeyLoss()
  .initialize();
```

The storage comes back empty with a new key. Data encrypted under the missing key cannot be recovered by any means, so this discards it — opt in for caches, and handle the error for anything the user would miss.

## encryptWithCustomKey

Encrypts the storage with a key you provide instead of a generated one.

```ts
encryptWithCustomKey(key: string, secureKeyStorage?: boolean, alias?: string): this
```

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `key` | `string` | yes | The key to encrypt the storage with. Must be at least 3 characters. |
| `secureKeyStorage` | `boolean` | no | Store the key in the Keychain/Keystore. Defaults to `false`, meaning you are responsible for storing it. |
| `alias` | `string` | no | Alias to store the key under when `secureKeyStorage` is `true`. Defaults to the instance ID. |

**Returns:** `this`

```js
import { MMKVLoader } from 'react-native-mmkv-storage';

const storage = new MMKVLoader()
  .withInstanceID('secure-storage')
  .withEncryption()
  .encryptWithCustomKey('encryptionKey', true, 'customAlias')
  .initialize();
```

::: warning
If you pass `secureKeyStorage: false`, the key is never persisted. You must supply the same key on every app launch or the storage will not load.
:::

## setProcessingMode

Selects whether the storage is accessed by a single process or shared across processes (app widgets, extensions, background services).

```ts
setProcessingMode(mode: number): this
```

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `mode` | `number` | yes | One of the `ProcessingModes` values. |

`ProcessingModes` values:

| Name | Value |
| --- | --- |
| `SINGLE_PROCESS` | `1` |
| `MULTI_PROCESS` | `2` |

**Returns:** `this`

```js
import { MMKVLoader, ProcessingModes } from 'react-native-mmkv-storage';

const storage = new MMKVLoader()
  .withInstanceID('shared-storage')
  .setProcessingMode(ProcessingModes.MULTI_PROCESS)
  .initialize();
```

## setAccessibleIOS

Sets the Keychain accessibility attribute used when storing the encryption key. iOS only; it has no effect on Android.

```ts
setAccessibleIOS(accessible: string): this
```

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `accessible` | `string` | yes | One of the `IOSAccessibleStates` values. Defaults to `AFTER_FIRST_UNLOCK`. |

`IOSAccessibleStates` values:

| Name | Value | Notes |
| --- | --- | --- |
| `WHEN_UNLOCKED` | `AccessibleWhenUnlocked` | |
| `AFTER_FIRST_UNLOCK` | `AccessibleAfterFirstUnlock` | Default |
| `ALWAYS` | `AccessibleAlways` | Deprecated in iOS 16+ |
| `WHEN_PASSCODE_SET_THIS_DEVICE_ONLY` | `AccessibleWhenPasscodeSetThisDeviceOnly` | |
| `WHEN_UNLOCKED_THIS_DEVICE_ONLY` | `AccessibleWhenUnlockedThisDeviceOnly` | |
| `AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY` | `AccessibleAfterFirstUnlockThisDeviceOnly` | |
| `ALWAYS_THIS_DEVICE_ONLY` | `AccessibleAlwaysThisDeviceOnly` | Deprecated in iOS 16+ |

**Returns:** `this`

```js
import { MMKVLoader, IOSAccessibleStates } from 'react-native-mmkv-storage';

const storage = new MMKVLoader()
  .withInstanceID('secure-storage')
  .withEncryption()
  .setAccessibleIOS(IOSAccessibleStates.WHEN_UNLOCKED)
  .initialize();
```

::: tip
Pick the strictest state your app can tolerate. `WHEN_UNLOCKED` prevents the key from being read while the device is locked, so avoid it if the storage is read from a background task.
:::

## withServiceName

Sets the [`kSecAttrService`](https://developer.apple.com/documentation/security/ksecattrservice) attribute on the Keychain entry holding the encryption key. iOS only. Useful when you also read the key through `react-native-keychain`, which expects a service name.

```ts
withServiceName(serviceName: string): this
```

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `serviceName` | `string` | yes | The Keychain service name. |

**Returns:** `this`

```js
import { MMKVLoader } from 'react-native-mmkv-storage';

const storage = new MMKVLoader()
  .withInstanceID('secure-storage')
  .withEncryption()
  .withServiceName('com.MMKV.example')
  .initialize();
```

## withPersistedDefaultValues

By default, a default value passed to [`useMMKVStorage`](/usemmkvstorage) is returned by the hook but never written to storage, so a later `getItem` call returns `null`. Enabling this option writes the default value to storage the first time the hook renders with an empty key.

```ts
withPersistedDefaultValues(): this
```

**Parameters:** none.

**Returns:** `this`

```jsx
import React from 'react';
import { Text } from 'react-native';
import { MMKVLoader, useMMKVStorage } from 'react-native-mmkv-storage';

const storage = new MMKVLoader().withPersistedDefaultValues().initialize();

export default function App() {
  const [theme] = useMMKVStorage('theme', storage, 'dark');

  return <Text>{theme}</Text>;
}

storage.getString('theme'); // => 'dark' after App has rendered once
```

## disableIndexing

Turns off indexing of keys by data type. Indexing costs a little write time and storage, so disabling it can help for very large storages that never query by type.

```ts
disableIndexing(): this
```

**Parameters:** none.

**Returns:** `this`

```js
import { MMKVLoader } from 'react-native-mmkv-storage';

const storage = new MMKVLoader()
  .withInstanceID('logs')
  .disableIndexing()
  .initialize();
```

::: warning
With indexing disabled, the type indexers described in [Querying and indexing](/queryingandindexing) are unavailable, and [`useMMKVStorage`](/usemmkvstorage) can no longer resolve a key's initial value or its type on mount — the hook starts with `null` until the key is written. Only disable indexing if you use neither.
:::

## generateKey

Generates a random encryption key and stores it on the loader options, replacing any key set earlier. This is done for you by [`withEncryption()`](#withencryption); call it explicitly only when you want a fresh key on an otherwise custom-keyed configuration.

```ts
generateKey(): this
```

**Parameters:** none.

**Returns:** `this`

```js
import { MMKVLoader } from 'react-native-mmkv-storage';

const storage = new MMKVLoader()
  .withInstanceID('secure-storage')
  .withEncryption()
  .generateKey()
  .initialize();

storage.getKey(); // => { alias: '...', key: '...' }
```

## Ordering constraints

The builder mutates a single options object, so a few calls depend on order:

- Call `withInstanceID()` **before** `withEncryption()`. `withEncryption()` derives the Keychain alias from the current instance ID, so calling it first would bind the key to the `default` instance.
- Call `withEncryption()` **before** `encryptWithCustomKey()`. `withEncryption()` generates and assigns a key, which would overwrite your custom key if called afterwards.
- `initialize()` must be last — it consumes the options and returns the instance.

```js
import { MMKVLoader, ProcessingModes } from 'react-native-mmkv-storage';

const storage = new MMKVLoader()
  .withInstanceID('user-storage')
  .setProcessingMode(ProcessingModes.MULTI_PROCESS)
  .withEncryption()
  .encryptWithCustomKey('encryptionKey', true, 'customAlias')
  .initialize();

storage.setString('user', 'robert');
storage.getString('user'); // => 'robert'
```

Next, see the [Sync API](/callbackapi) and [Async API](/asyncapi) for reading and writing data.
