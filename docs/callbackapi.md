# Sync API

All reads and writes are synchronous and run directly over JSI, which makes them several times faster than the promise-based [Async API](/asyncapi). Prefer these methods unless you need a promise for interoperability.

Every example below assumes a loaded instance:

```js
import { MMKVLoader } from 'react-native-mmkv-storage';

const storage = new MMKVLoader().initialize();
```

::: tip
Setting a key to `null` or `undefined` removes it and returns `true`. Setters throw when the value does not match the method's type — `storage.setString('user', 5)` throws `Trying to set number as a string.`
:::

## setString

Stores a string.

```ts
setString(key: string, value: string): boolean | undefined
```

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `key` | `string` | yes | Key to write to. |
| `value` | `string` | yes | The string to store. |

**Returns:** `boolean | undefined` — `true` on success, `undefined` if the instance is not loaded.

```js
storage.setString('user', 'robert'); // => true
```

## getString

Reads a string.

```ts
getString(
  key: string,
  callback?: (error: any, value: string | null | undefined) => void
): string | null | undefined
```

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `key` | `string` | yes | Key to read. |
| `callback` | `(error, value) => void` | no | Called synchronously with the value. Provided for convenience only; the value is also returned. |

**Returns:** `string | null | undefined` — the stored string, `null` if the key does not exist, `undefined` if the instance is not loaded.

```js
storage.getString('user'); // => 'robert'

storage.getString('user', (error, value) => {
  console.log(value); // => 'robert'
});
```

## setInt

Stores a number.

```ts
setInt(key: string, value: number): boolean | undefined
```

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `key` | `string` | yes | Key to write to. |
| `value` | `number` | yes | The number to store. |

**Returns:** `boolean | undefined`

```js
storage.setInt('age', 24); // => true
```

## getInt

Reads a number.

```ts
getInt(
  key: string,
  callback?: (error: any, value: number | null | undefined) => void
): number | null | undefined
```

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `key` | `string` | yes | Key to read. |
| `callback` | `(error, value) => void` | no | Called synchronously with the value. |

**Returns:** `number | null | undefined`

```js
storage.getInt('age'); // => 24
```

## setBool

Stores a boolean.

```ts
setBool(key: string, value: boolean): boolean | undefined
```

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `key` | `string` | yes | Key to write to. |
| `value` | `boolean` | yes | The boolean to store. |

**Returns:** `boolean | undefined`

```js
storage.setBool('darkMode', true); // => true
```

## getBool

Reads a boolean.

```ts
getBool(
  key: string,
  callback?: (error: any, value: boolean | null | undefined) => void
): boolean | null | undefined
```

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `key` | `string` | yes | Key to read. |
| `callback` | `(error, value) => void` | no | Called synchronously with the value. |

**Returns:** `boolean | null | undefined`

```js
storage.getBool('darkMode'); // => true
```

## setMap

Stores a plain object. The value is serialized with `JSON.stringify`.

```ts
setMap(key: string, value: object): boolean | undefined
```

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `key` | `string` | yes | Key to write to. |
| `value` | `object` | yes | The object to store. |

**Returns:** `boolean | undefined`

::: warning
This does not work with the JavaScript `Map` data type — only plain, JSON-serializable objects.
:::

```js
storage.setMap('profile', { name: 'robert', age: 24 }); // => true
```

## getMap

Reads an object.

```ts
getMap<T>(
  key: string,
  callback?: (error: any, value: T | null | undefined) => void
): T | null | undefined
```

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `key` | `string` | yes | Key to read. |
| `callback` | `(error, value) => void` | no | Called synchronously with the value. |

**Returns:** `T | null | undefined` — `null` if the key does not exist or the stored value is not valid JSON.

```ts
const profile = storage.getMap<{ name: string; age: number }>('profile');

profile.name; // => 'robert'
```

## setArray

Stores an array. The value is serialized with `JSON.stringify`.

```ts
setArray(key: string, value: any[]): boolean | undefined
```

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `key` | `string` | yes | Key to write to. |
| `value` | `any[]` | yes | The array to store. |

**Returns:** `boolean | undefined`

```js
storage.setArray('tags', ['foo', 'bar']); // => true
```

## getArray

Reads an array.

```ts
getArray<T>(
  key: string,
  callback?: (error: any, value: T[] | null | undefined) => void
): T[] | null | undefined
```

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `key` | `string` | yes | Key to read. |
| `callback` | `(error, value) => void` | no | Called synchronously with the value. |

**Returns:** `T[] | null | undefined`

```ts
const tags = storage.getArray<string>('tags'); // => ['foo', 'bar']
```

## getMultipleItems

Reads several keys of the same type at once. This call is synchronous.

```ts
getMultipleItems<T>(
  keys: string[],
  type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'map'
): [string, T][] | undefined
```

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `keys` | `string[]` | yes | Keys to read. |
| `type` | `'string' \| 'number' \| 'boolean' \| 'object' \| 'array' \| 'map'` | yes | The data type stored under every key. `'map'` is an alias for `'object'`. |

**Returns:** `[string, T][] | undefined` — one `[key, value]` tuple per requested key, in the order the keys were given. Returns `undefined` if `type` is not one of the values above.

```js
storage.setMap('user1', { name: 'robert' });
storage.setMap('user2', { name: 'alex' });

const items = storage.getMultipleItems(['user1', 'user2'], 'object');
// => [['user1', { name: 'robert' }], ['user2', { name: 'alex' }]]

items[0][0]; // => 'user1'
items[0][1]; // => { name: 'robert' }
```

::: warning
Use `'boolean'`, not `'bool'`. An unrecognised type returns `undefined` rather than throwing.
:::

Mixed-type keys are not supported in a single call — group your keys by type and call once per type.
