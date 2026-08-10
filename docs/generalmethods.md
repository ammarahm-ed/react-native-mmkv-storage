# General Methods

Instance-level utilities for deleting data and inspecting storage, plus the module-level helpers exported from `react-native-mmkv-storage`.

```js
import { MMKVLoader } from 'react-native-mmkv-storage';

const storage = new MMKVLoader().initialize();
```

## Instance methods

### removeItem

Removes a single key. Synchronous.

```ts
removeItem(key: string): boolean | undefined
```

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `key` | `string` | yes | Key to delete. |

**Returns:** `boolean | undefined` — `true` on success, `undefined` if the instance is not loaded.

```js
storage.setString('user', 'robert');
storage.removeItem('user'); // => true
storage.getString('user'); // => null
```

### removeItems

Removes many keys in one native call. Prefer this over looping `removeItem` for bulk deletes. Synchronous.

```ts
removeItems(keys: string[]): boolean | undefined
```

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `keys` | `string[]` | yes | Keys to delete. |

**Returns:** `boolean | undefined`

```js
storage.setString('user1', 'robert');
storage.setString('user2', 'alex');

storage.removeItems(['user1', 'user2']); // => true
```

### clearStore

Removes every key and value from the instance.

```ts
clearStore(): boolean | undefined
```

**Parameters:** none.

**Returns:** `boolean | undefined`

```js
storage.clearStore(); // => true
```

### clearMemoryCache

Drops the in-memory cache of the instance. Data on disk is untouched; it is re-read on the next access.

```ts
clearMemoryCache(): boolean | undefined
```

**Parameters:** none.

**Returns:** `boolean | undefined`

```js
storage.clearMemoryCache(); // => true
```

### getCurrentMMKVInstanceIDs

Returns the instances that have been loaded in the current app session, as an object keyed by instance ID whose values report whether that instance has finished initializing.

```ts
getCurrentMMKVInstanceIDs(): { [id: string]: boolean }
```

**Parameters:** none.

**Returns:** `{ [id: string]: boolean }`

```js
storage.getCurrentMMKVInstanceIDs(); // => { default: true }

Object.keys(storage.getCurrentMMKVInstanceIDs()); // => ['default']
```

### getAllMMKVInstanceIDs

Returns the IDs of every instance ever created on this device, whether or not it was loaded this session.

```ts
getAllMMKVInstanceIDs(): string[]
```

**Parameters:** none.

**Returns:** `string[]`

```js
storage.getAllMMKVInstanceIDs(); // => ['default', 'user-storage']
```

### getKey

Returns the encryption key of the instance and the alias it is stored under in the Keychain/Keystore. Both are `null` for an unencrypted instance.

```ts
getKey(): { alias: string | null; key: string | null }
```

**Parameters:** none.

**Returns:** `{ alias: string | null; key: string | null }`

```js
import { MMKVLoader } from 'react-native-mmkv-storage';

const secure = new MMKVLoader().withInstanceID('secure').withEncryption().initialize();

secure.getKey(); // => { alias: '636f6d2e...', key: 'gY7...' }
```

## AsyncStorage-compatible methods

These exist so the instance can be dropped into libraries that expect an `AsyncStorage`-shaped object, such as [redux-persist](/redux-persist) and zustand's persist middleware.

### setItem

Stores a **string** value. Non-string values will throw — use [`setMap`](/callbackapi#setmap) or [`setArray`](/callbackapi#setarray) for structured data.

```ts
setItem(key: string, value: string, callback?: (err?: Error | null) => void): Promise<boolean | undefined>
```

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `key` | `string` | yes | Key to write to. |
| `value` | `string` | yes | The string to store. |
| `callback` | `(err) => void` | no | Called with `null` after the write. |

**Returns:** `Promise<boolean | undefined>`

```js
await storage.setItem('user', 'robert'); // => true
```

### getItem

Reads a string value.

```ts
getItem(
  key: string,
  callback?: (error?: Error | null, result?: string | null) => void
): Promise<string | null | undefined>
```

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `key` | `string` | yes | Key to read. |
| `callback` | `(error, result) => void` | no | Called with the value. |

**Returns:** `Promise<string | null | undefined>`

```js
const user = await storage.getItem('user'); // => 'robert'
```

::: warning
`setItem` and `getItem` return promises, but [`removeItem`](#removeitem) is **synchronous** and returns a boolean, not a promise. Most consumers tolerate this because `await` on a non-promise resolves immediately, but if you write a custom storage adapter, wrap it yourself: `removeItem: async key => storage.removeItem(key)`.
:::

## Module methods

Imported directly from the package rather than from an instance.

### init

Installs the JSI bindings. This happens automatically the first time you call `initialize()` on a loader, so you rarely need it — reach for it only if you want to install the bindings eagerly at app start.

```ts
init(): boolean
```

**Parameters:** none.

**Returns:** `boolean` — `true` if the bindings are installed, `false` if installation failed (the error is logged to the console).

```js
import { init } from 'react-native-mmkv-storage';

init(); // => true
```

### isLoaded

Reports whether the JSI bindings are currently installed, without attempting to install them.

```ts
isLoaded(): boolean
```

**Parameters:** none.

**Returns:** `boolean`

```js
import { init, isLoaded } from 'react-native-mmkv-storage';

if (!isLoaded()) {
  init();
}
```

### getCurrentMMKVInstanceIDs

The module-level form of [the instance method](#getcurrentmmkvinstanceids), usable before any instance exists.

```ts
getCurrentMMKVInstanceIDs(): { [id: string]: boolean }
```

**Parameters:** none.

**Returns:** `{ [id: string]: boolean }`

```js
import { getCurrentMMKVInstanceIDs } from 'react-native-mmkv-storage';

getCurrentMMKVInstanceIDs(); // => { default: true }
```

### getAllMMKVInstanceIDs

The module-level form of [the instance method](#getallmmkvinstanceids).

```ts
getAllMMKVInstanceIDs(): string[]
```

**Parameters:** none.

**Returns:** `string[]`

```js
import { getAllMMKVInstanceIDs } from 'react-native-mmkv-storage';

getAllMMKVInstanceIDs(); // => ['default', 'user-storage']
```

### IDSTORE_ID

The ID of the internal storage the library uses to record which instances exist and whether they are encrypted. Exported so you can exclude it when iterating instances.

```ts
const IDSTORE_ID: string
```

**Type:** `string` — the value differs per platform (`mmkvIdStore` on iOS, `mmkvIDStore` on Android), so compare against this export rather than hard-coding a literal.

```js
import { getAllMMKVInstanceIDs, IDSTORE_ID } from 'react-native-mmkv-storage';

const ids = getAllMMKVInstanceIDs().filter(id => id !== IDSTORE_ID);
```

::: warning
Never write to the ID store yourself. Corrupting it can make encrypted instances unloadable.
:::

## Deprecated

The default export and its members still work but are deprecated. Use the named exports instead.

| Deprecated | Replacement |
| --- | --- |
| `MMKVStorage.Loader` | `import { MMKVLoader } from 'react-native-mmkv-storage'` |
| `MMKVStorage.API` | `import { MMKVInstance } from 'react-native-mmkv-storage'` |
| `MMKVStorage.MODES` | `import { ProcessingModes } from 'react-native-mmkv-storage'` |
| `MMKVStorage.ACCESSIBLE` | `import { IOSAccessibleStates } from 'react-native-mmkv-storage'` |
| `MMKVStorage.getAllMMKVInstanceIDs` | `import { getAllMMKVInstanceIDs } from 'react-native-mmkv-storage'` |
| `MMKVStorage.getCurrentMMKVInstanceIDs` | `import { getCurrentMMKVInstanceIDs } from 'react-native-mmkv-storage'` |
| `MMKVStorage.IDSTORE_ID` | `import { IDSTORE_ID } from 'react-native-mmkv-storage'` |

```js
import MMKVStorage from 'react-native-mmkv-storage';

const storage = new MMKVStorage.Loader()
  .setProcessingMode(MMKVStorage.MODES.MULTI_PROCESS)
  .initialize();
```

The equivalent, using named exports:

```js
import { MMKVLoader, ProcessingModes } from 'react-native-mmkv-storage';

const storage = new MMKVLoader()
  .setProcessingMode(ProcessingModes.MULTI_PROCESS)
  .initialize();
```
