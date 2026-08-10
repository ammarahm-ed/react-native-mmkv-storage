# Types

The library is written in TypeScript and ships its own declarations. This page is a reference for the types you will run into when typing storage instances, generic getters and transaction mutators.

## Importing types

`MMKVInstance` and `MMKVLoader` are exported from the package root as both a value and a type:

```ts
import { MMKVLoader } from 'react-native-mmkv-storage';
import type { MMKVInstance } from 'react-native-mmkv-storage';

const storage: MMKVInstance = new MMKVLoader().initialize();
```

::: warning
`MMKVStorage.API` is the deprecated alias for `MMKVInstance`, and the default `MMKVStorage` export is deprecated as a whole. Use named imports.
:::

The remaining type aliases (`StorageOptions`, `DataType`, `IndexType`, `GenericReturnType`) live in `react-native-mmkv-storage/dist/src/types`:

```ts
import type { DataType, GenericReturnType, StorageOptions } from 'react-native-mmkv-storage/dist/src/types';
```

Transaction types come from the transactions module:

```ts
import type { MutatorFunction, Transaction, TransactionType } from 'react-native-mmkv-storage/dist/src/transactions';
```

## DataType

The five data types the library stores.

```ts
type DataType = 'string' | 'number' | 'object' | 'array' | 'boolean';
```

Used by [useIndex](/useindex), [transactions](/transactionmanager), `getMultipleItems` and `setMultipleItemsAsync`.

## IndexType

The internal names of the per-type indexes.

```ts
type IndexType = 'stringIndex' | 'boolIndex' | 'numberIndex' | 'mapIndex' | 'arrayIndex';
```

| `DataType` | `IndexType`     | Indexer                  |
| ---------- | --------------- | ------------------------ |
| `string`   | `stringIndex`   | `storage.indexer.strings`  |
| `number`   | `numberIndex`   | `storage.indexer.numbers`  |
| `boolean`  | `boolIndex`     | `storage.indexer.booleans` |
| `object`   | `mapIndex`      | `storage.indexer.maps`     |
| `array`    | `arrayIndex`    | `storage.indexer.arrays`   |

## GenericReturnType

A `[key, value]` pair, as returned by the indexers' `getAll` and by `getMultipleItems`.

```ts
type GenericReturnType<T> = [key: string, value: T | null | undefined];
```

```ts
type User = { name: string };

const users = await storage.indexer.maps.getAll<User>();
// GenericReturnType<User>[]

for (const [key, user] of users) {
  console.log(key, user?.name);
}
```

## StorageOptions

The configuration an instance is created with. You never build this object by hand — [MMKVLoader](/loaderclass) does it — but it is readable at `storage.options`.

```ts
type StorageOptions = {
  instanceID: string;
  initWithEncryption: boolean;
  secureKeyStorage: boolean;
  accessibleMode: string;
  processingMode: number;
  aliasPrefix: string;
  alias: string | null;
  key: string | null;
  serviceName: string | null;
  initialized: boolean;
  persistDefaults: boolean;
  enableIndexing: boolean;
};
```

| Field                | Default                                       | Description                                                                 |
| -------------------- | --------------------------------------------- | --------------------------------------------------------------------------- |
| `instanceID`         | `'default'`                                   | Id of the instance. Set with `withInstanceID`.                              |
| `initWithEncryption` | `false`                                       | Whether the instance is encrypted. Set with `withEncryption`.               |
| `secureKeyStorage`   | `false`                                       | Whether the encryption key is stored in the Keychain/Keystore.              |
| `accessibleMode`     | `IOSAccessibleStates.AFTER_FIRST_UNLOCK`      | iOS Keychain accessibility. Set with `setAccessibleIOS`.                    |
| `processingMode`     | `ProcessingModes.SINGLE_PROCESS`              | Single or multi process. Set with `setProcessingMode`.                      |
| `aliasPrefix`        | `'com.MMKV.'`                                 | Prefix used to build the Keychain alias.                                    |
| `alias`              | `null`                                        | Alias the encryption key is stored against.                                 |
| `key`                | `null`                                        | The encryption password.                                                    |
| `serviceName`        | `null`                                        | iOS `kSecAttrService` value. Set with `withServiceName`.                    |
| `initialized`        | `false`                                       | Whether the instance has been initialized.                                  |
| `persistDefaults`    | `false`                                       | Persist hook default values. Set with `withPersistedDefaultValues`.         |
| `enableIndexing`     | `true`                                        | Maintain per-type indexes. Turn off with `disableIndexing`.                 |

## MMKVLoader

The builder used to configure and create an instance. Every configuration method returns `this`, so calls chain, and `initialize()` returns an `MMKVInstance`.

```ts
import { MMKVLoader, IOSAccessibleStates, ProcessingModes } from 'react-native-mmkv-storage';
import type { MMKVInstance } from 'react-native-mmkv-storage';

const storage: MMKVInstance = new MMKVLoader()
  .withInstanceID('user-storage')
  .withEncryption()
  .setAccessibleIOS(IOSAccessibleStates.WHEN_UNLOCKED)
  .setProcessingMode(ProcessingModes.SINGLE_PROCESS)
  .initialize();
```

See [Loader class](/loaderclass) for the full list of methods.

## MMKVInstance

The object returned by `initialize()`. Alongside the getters and setters it exposes four members worth typing against:

```ts
class MMKVInstance {
  instanceID: string;
  options: StorageOptions;
  indexer: indexer;
  transactions: transactions;
  ev: EventManager;
  encryption: encryption;
}
```

| Member         | Documentation                                       |
| -------------- | --------------------------------------------------- |
| `indexer`      | [Querying and indexing](/queryingandindexing)       |
| `transactions` | [Transactions](/transactionmanager)                 |
| `ev`           | [Events](/events)                                   |
| `encryption`   | [Encryption](/encryption)                           |

## ProcessingModes

```ts
const ProcessingModes = {
  SINGLE_PROCESS: 1,
  MULTI_PROCESS: 2
};
```

Use `MULTI_PROCESS` when the storage is shared with app widgets or extensions.

## IOSAccessibleStates

Accessibility values for the iOS Keychain, passed to `setAccessibleIOS`.

```ts
const IOSAccessibleStates = {
  WHEN_UNLOCKED: 'AccessibleWhenUnlocked',
  AFTER_FIRST_UNLOCK: 'AccessibleAfterFirstUnlock',
  ALWAYS: 'AccessibleAlways',
  WHEN_PASSCODE_SET_THIS_DEVICE_ONLY: 'AccessibleWhenPasscodeSetThisDeviceOnly',
  WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'AccessibleWhenUnlockedThisDeviceOnly',
  AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY: 'AccessibleAfterFirstUnlockThisDeviceOnly',
  ALWAYS_THIS_DEVICE_ONLY: 'AccessibleAlwaysThisDeviceOnly'
};
```

::: warning
`ALWAYS` and `ALWAYS_THIS_DEVICE_ONLY` are deprecated by Apple in iOS 16+.
:::

## Transaction types

```ts
type TransactionType = 'beforewrite' | 'onwrite' | 'onread' | 'ondelete';

type MutatorFunction = (key: string, value?: unknown) => any;

type Transaction = { [name: string]: MutatorFunction | null };
```

`MutatorFunction` takes **positional** arguments. `Transaction` is the internal map of data type to mutator that the manager keeps for each lifecycle event.

```ts
import { MMKVLoader } from 'react-native-mmkv-storage';
import type { MutatorFunction } from 'react-native-mmkv-storage/dist/src/transactions';

const storage = new MMKVLoader().initialize();

const addTimestamp: MutatorFunction = (key, value) => ({
  ...(value as object),
  timestamp: Date.now()
});

const unregister = storage.transactions.register('object', 'beforewrite', addTimestamp);
```

## Typing generic getters

`getMap`, `getArray`, `getMapAsync`, `getArrayAsync`, `getMultipleItems` and the indexers' `getAll` all take a type parameter:

```ts
type User = {
  name: string;
  age: number;
};

const user = storage.getMap<User>('user');
// User | null | undefined

const users = storage.getArray<User>('users');
// User[] | null | undefined

const many = storage.getMultipleItems<User>(['user', 'admin'], 'object');
// [string, User][]
```

For a strongly typed application-wide hook, combine the instance type with your key union:

```tsx
import { MMKVLoader, useMMKVStorage } from 'react-native-mmkv-storage';
import type { MMKVInstance } from 'react-native-mmkv-storage';

const storage: MMKVInstance = new MMKVLoader().initialize();

type Schema = {
  user: { name: string; age: number };
  theme: string;
  onboarded: boolean;
};

export const useStorage = <K extends keyof Schema>(key: K, defaultValue: Schema[K]) =>
  useMMKVStorage<Schema[K]>(key, storage, defaultValue);
```

## null vs undefined

The getters return `T | null | undefined`, and the two empty values mean different things:

- `null` — the value is missing, was removed, or could not be read or parsed.
- `undefined` — the call could not reach the instance, typically because it has not been initialized yet.

Treat both as "no value" when reading, but a persistent `undefined` points at an initialization problem rather than an empty key.

## See also

- [Loader class](/loaderclass)
- [Supported data types](/datatypes)
- [Querying and indexing](/queryingandindexing)
