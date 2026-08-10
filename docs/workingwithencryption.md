# Working with encryption

An MMKV instance can be encrypted when it is created, or at any later point in the app's lifecycle without destroying the data it already holds.

::: tip
Every method on `instance.encryption` is **synchronous**. They return `boolean`, not promises — do not `await` them.
:::

## Encrypting at creation

The loader handles the common case. `withEncryption()` takes no arguments: it generates a strong key, stores it in the iOS Keychain / Android Keystore, and retrieves it automatically on every later launch.

```js
import { MMKVLoader } from 'react-native-mmkv-storage';

const storage = new MMKVLoader()
  .withInstanceID('secure')
  .withEncryption()
  .initialize();
```

See [Creating an instance](/creatinginstance) for custom keys and aliases.

## Encrypting at runtime

Suppose you created a plain instance at first launch:

```js
import { MMKVLoader } from 'react-native-mmkv-storage';

const storage = new MMKVLoader().initialize();
```

Later you decide the data should be encrypted. Call `encrypt()` on the existing instance:

```js
storage.encryption.encrypt(); // => true
```

The signature is `encrypt(key?, secureKeyStorage = true, alias?, accessibleMode?)`.

With no arguments a key is generated for you and stored securely under the default alias, which is derived from the instance ID. This is the recommended path.

To supply your own key:

```js
storage.encryption.encrypt('my-encryption-key');
```

To supply your own key without writing it to secure storage:

```js
storage.encryption.encrypt('my-encryption-key', false);
```

And to store it under a custom alias:

```js
storage.encryption.encrypt('my-encryption-key', true, 'myCustomAlias');
```

::: warning
You do **not** need to change the loader code for this instance afterwards. The library records that the instance is encrypted, and on the next launch it fetches the key from secure storage and opens the instance with it.
:::

## Where the key lives

When `secureKeyStorage` is `true` (the default for `encrypt()`), the key is written to the iOS Keychain or the Android Keystore under an alias derived from `com.MMKV.` plus the instance ID, or plus the alias you pass. On later launches the library reads the key back from there itself, so a generated key never has to be handled by your code.

When `secureKeyStorage` is `false`, nothing is persisted. **You** are responsible for supplying the same key on every launch through `encryptWithCustomKey(key)`; without it the instance cannot be opened.

## Reading the key back

`getKey()` returns the alias and key currently in use for the instance.

```js
const { alias, key } = storage.getKey();
```

## Changing the key

`changeEncryptionKey(key, secureKeyStorage = true, alias?, accessibleMode?)` re-encrypts the instance with a new key. Unlike `encrypt()`, the `key` argument is **required**.

```js
storage.encryption.changeEncryptionKey('my-new-encryption-key'); // => true
```

To rotate the key without persisting it:

```js
storage.encryption.changeEncryptionKey('my-new-encryption-key', false);
```

::: warning
If you manage the key yourself (`secureKeyStorage` set to `false`), changing the key means the old key in your loader is now wrong. On the next launch you must initialize with the new key, or the instance will not load.

```js
const storage = new MMKVLoader()
  .withInstanceID('secure')
  .withEncryption()
  .encryptWithCustomKey('my-new-encryption-key')
  .initialize();
```

Migrating your app from the old key to the new one is up to you. This is the main reason to let the library store the key for you.
:::

## Decrypting

`decrypt()` removes encryption from the instance and deletes the stored key.

```js
storage.encryption.decrypt(); // => true
```

## iOS-only options

The last two parameters of `encrypt()` and `changeEncryptionKey()` — `alias` and `accessibleMode` — map onto iOS Keychain attributes. `accessibleMode` takes a value from `IOSAccessibleStates` and controls when the key can be read; the default is `AFTER_FIRST_UNLOCK`.

```js
import { MMKVLoader, IOSAccessibleStates } from 'react-native-mmkv-storage';

const storage = new MMKVLoader().withInstanceID('secure').initialize();

storage.encryption.encrypt(
  undefined,
  true,
  'myCustomAlias',
  IOSAccessibleStates.WHEN_UNLOCKED
);
```

The keychain service attribute (`kSecAttrService`) can only be set at creation time, with `withServiceName(name)` on the loader. Both `accessibleMode` and `serviceName` are ignored on Android, where the key is stored in the Android Keystore.
