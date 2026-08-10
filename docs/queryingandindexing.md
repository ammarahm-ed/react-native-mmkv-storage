# Querying and indexing

MMKV provides a simple querying system: you can check whether a key exists and you can list all keys in an instance. On top of that, this library maintains a separate index per data type for every storage instance, so you can also list only the string keys, only the object keys, and so on, or read every value of a given type in one call.

All examples on this page assume an initialized instance:

```js
import { MMKVLoader } from 'react-native-mmkv-storage';

const MMKV = new MMKVLoader().initialize();
```

::: warning
Indexing can be turned off with `new MMKVLoader().disableIndexing().initialize()`. With indexing disabled, the type indexers (`strings`, `numbers`, `booleans`, `maps`, `arrays`) have nothing to read from and return empty or `undefined` results. `indexer.getKeys()` and `indexer.hasKey()` keep working because they query the storage itself, not the index.
:::

## indexer

Available on every instance as `MMKV.indexer`. It covers all keys in the instance regardless of their data type.

### getKeys

Get every key stored in the instance.

```js
const keys = await MMKV.indexer.getKeys();
// => ["user", "settings", "posts"]
```

**Returns:** `Promise<string[] | undefined | null>`

### hasKey

Check whether a key exists in the instance.

| Name | Type     | Required |
| ---- | -------- | -------- |
| key  | `string` | yes      |

```js
if (MMKV.indexer.hasKey('user')) {
  console.log(MMKV.getMap('user'));
}
```

**Returns:** `boolean | undefined`

::: warning
`hasKey` is **synchronous**. It returns a boolean, not a promise, so `MMKV.indexer.hasKey('user').then(...)` throws `TypeError: .then is not a function`. The same applies to `hasKey` on every type indexer below.
:::

## Type indexers

Each data type has its own indexer, reachable from `MMKV.indexer`:

| Indexer                  | Data type | Values returned by `getAll`      |
| ------------------------ | --------- | -------------------------------- |
| `MMKV.indexer.strings`   | `string`  | `string`                         |
| `MMKV.indexer.numbers`   | `number`  | `number`                         |
| `MMKV.indexer.booleans`  | `boolean` | `boolean`                        |
| `MMKV.indexer.maps`      | `object`  | parsed object, or `null`         |
| `MMKV.indexer.arrays`    | `array`   | parsed array, or `null`          |

They all expose the same three methods.

### getKeys

Get all keys of that type.

```js
const stringKeys = await MMKV.indexer.strings.getKeys();
// => ["username", "token"]

const objectKeys = await MMKV.indexer.maps.getKeys();
// => ["user", "settings"]
```

**Returns:** `Promise<string[] | undefined | null>`

### hasKey

Check whether a key exists in that type's index. This is a synchronous linear scan over the index, so prefer `MMKV.indexer.hasKey` when you do not care about the type.

```js
if (MMKV.indexer.maps.hasKey('user')) {
  console.log('user is stored as an object');
}
```

**Returns:** `boolean | undefined`

### getAll

Read every key/value pair of that type.

```js
const users = await MMKV.indexer.maps.getAll();
// => [["user", { name: "robert" }], ["admin", { name: "andrew" }]]
```

**Returns:** `Promise<[key: string, value: T | null | undefined][]>`

Each entry is a `[key, value]` pair: the first item is the key, the second is the value.

```js
const numbers = await MMKV.indexer.numbers.getAll();

for (const [key, value] of numbers) {
  console.log(key, value);
}
```

::: tip
`maps.getAll()` and `arrays.getAll()` `JSON.parse` each stored value. If a value cannot be parsed the entry's value is `null`, so guard for it before using the result.
:::

`getAll` on `maps` and `arrays` accepts a type parameter so the resulting pairs are typed:

```ts
type User = { name: string; age: number };

const users = await MMKV.indexer.maps.getAll<User>();
// users: [key: string, value: User | null | undefined][]
```

## Listing every value of every type

```js
const dump = async () => {
  const [strings, numbers, booleans, maps, arrays] = await Promise.all([
    MMKV.indexer.strings.getAll(),
    MMKV.indexer.numbers.getAll(),
    MMKV.indexer.booleans.getAll(),
    MMKV.indexer.maps.getAll(),
    MMKV.indexer.arrays.getAll()
  ]);

  return { strings, numbers, booleans, maps, arrays };
};
```

## See also

- [Transactions](/transactionmanager) for building your own custom indexes.
- [useIndex](/useindex) for loading the values of an index inside a component.
