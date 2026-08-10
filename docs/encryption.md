# Encryption

MMKV encrypts with AES CFB-128. Keys are stored in the Keychain on iOS and the Keystore on Android, or kept out of secure storage entirely if you manage them with your own solution.

These methods live on the `encryption` property of a loaded instance and let you encrypt, decrypt or re-key a storage **after** it has been created. To create a storage that is encrypted from the start, use [`withEncryption()`](/loaderclass#withencryption) on the loader instead.

All three methods are synchronous — do not `await` them.

```js
import { MMKVLoader } from 'react-native-mmkv-storage';

const storage = new MMKVLoader().initialize();
```

## encrypt

Encrypts an existing, unencrypted instance. When called without a key, a strong key is generated for you.

```ts
encrypt(
  key?: string,
  secureKeyStorage?: boolean,
  alias?: string,
  accessibleMode?: string
): boolean
```

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `key` | `string` | no | Key to encrypt the storage with. A random key is generated if omitted. |
| `secureKeyStorage` | `boolean` | no | Store the key in the Keychain/Keystore. Defaults to `true`. |
| `alias` | `string` | no | Alias to store the key under. Defaults to the instance ID. |
| `accessibleMode` | `string` | no | One of the [`IOSAccessibleStates`](/loaderclass#setaccessibleios) values. iOS only. |

**Returns:** `boolean` — `true`. It does not return the key or alias; read those back with [`getKey()`](/generalmethods#getkey).

```js
import { MMKVLoader, IOSAccessibleStates } from 'react-native-mmkv-storage';

const storage = new MMKVLoader().initialize();

storage.encryption.encrypt(); // => true

storage.encryption.encrypt('encryptionKey');

storage.encryption.encrypt('encryptionKey', true, 'customAlias', IOSAccessibleStates.WHEN_UNLOCKED);

storage.getKey(); // => { alias: '636f6d2e...', key: 'encryptionKey' }
```

::: tip
If you pass `secureKeyStorage: false`, the key is never persisted and you must supply it yourself on every app launch, via [`encryptWithCustomKey()`](/loaderclass#encryptwithcustomkey) on the loader.
:::

## decrypt

Removes encryption from an encrypted instance and deletes the key it was encrypted with.

```ts
decrypt(): boolean
```

**Parameters:** none.

**Returns:** `boolean` — `true`.

```js
import { MMKVLoader } from 'react-native-mmkv-storage';

const storage = new MMKVLoader().withInstanceID('secure').withEncryption().initialize();

storage.encryption.decrypt(); // => true
```

::: warning
Once you have decrypted an already created instance, the loader will not encrypt it again when you reload your app. To encrypt it again you must call `encrypt()`. Only newly created instances are encrypted by the loader class — once you modify an existing instance at runtime, `withEncryption()` has no effect on it.
:::

## changeEncryptionKey

Replaces the encryption key of an encrypted instance, for example after the old key has been compromised.

```ts
changeEncryptionKey(
  key: string,
  secureKeyStorage?: boolean,
  alias?: string,
  accessibleMode?: string
): boolean
```

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `key` | `string` | yes | The new key to encrypt the storage with. |
| `secureKeyStorage` | `boolean` | no | Store the new key in the Keychain/Keystore. Defaults to `true`. |
| `alias` | `string` | no | Alias to store the key under. Defaults to the instance ID. |
| `accessibleMode` | `string` | no | One of the [`IOSAccessibleStates`](/loaderclass#setaccessibleios) values. iOS only. |

**Returns:** `boolean` — `true`.

```js
import { MMKVLoader } from 'react-native-mmkv-storage';

const storage = new MMKVLoader().withInstanceID('secure').withEncryption().initialize();

storage.encryption.changeEncryptionKey('newEncryptionKey'); // => true

storage.encryption.changeEncryptionKey('newEncryptionKey', true, 'customAlias');
```

::: warning
After changing the encryption key, you must use the new key wherever you load this instance — including any `encryptWithCustomKey()` call in your loader setup. Loading it with the old key throws and the storage will not load.
:::

For a walkthrough of the common encryption workflows, see [Working with encryption](/workingwithencryption).
