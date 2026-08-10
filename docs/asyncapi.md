# Async API

Every method on the [Sync API](/callbackapi) has a promise-returning counterpart, for code that is already written against `async/await` or an `AsyncStorage`-shaped interface.

```js
import { MMKVLoader } from 'react-native-mmkv-storage';

const storage = new MMKVLoader().initialize();
```

::: tip
These are thin wrappers: the underlying read or write still happens synchronously on the JS thread and the promise resolves with the result. They exist for ergonomic parity, not to move work off the JS thread. If you have the choice, use the [Sync API](/callbackapi).
:::

Across this page:

- Setters resolve `boolean | null | undefined`.
- Getters resolve `null` when the key does not exist, and `undefined` when the instance is not loaded.

## setStringAsync

```ts
setStringAsync(key: string, value: string): Promise<boolean | null | undefined>
```

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `key` | `string` | yes | Key to write to. |
| `value` | `string` | yes | The string to store. |

**Returns:** `Promise<boolean | null | undefined>`

```js
await storage.setStringAsync('user', 'robert'); // => true
```

## getStringAsync

```ts
getStringAsync(key: string): Promise<string | null | undefined>
```

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `key` | `string` | yes | Key to read. |

**Returns:** `Promise<string | null | undefined>`

```js
const user = await storage.getStringAsync('user'); // => 'robert'
```

## setIntAsync

```ts
setIntAsync(key: string, value: number): Promise<boolean | null | undefined>
```

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `key` | `string` | yes | Key to write to. |
| `value` | `number` | yes | The number to store. |

**Returns:** `Promise<boolean | null | undefined>`

```js
await storage.setIntAsync('age', 24); // => true
```

## getIntAsync

```ts
getIntAsync(key: string): Promise<number | null | undefined>
```

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `key` | `string` | yes | Key to read. |

**Returns:** `Promise<number | null | undefined>`

```js
const age = await storage.getIntAsync('age'); // => 24
```

## setBoolAsync

```ts
setBoolAsync(key: string, value: boolean): Promise<boolean | null | undefined>
```

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `key` | `string` | yes | Key to write to. |
| `value` | `boolean` | yes | The boolean to store. |

**Returns:** `Promise<boolean | null | undefined>`

```js
await storage.setBoolAsync('darkMode', true); // => true
```

## getBoolAsync

```ts
getBoolAsync(key: string): Promise<boolean | null | undefined>
```

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `key` | `string` | yes | Key to read. |

**Returns:** `Promise<boolean | null | undefined>`

```js
const darkMode = await storage.getBoolAsync('darkMode'); // => true
```

## setMapAsync

Stores a plain, JSON-serializable object. Does not work with the JavaScript `Map` data type.

```ts
setMapAsync(key: string, value: object): Promise<boolean | null | undefined>
```

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `key` | `string` | yes | Key to write to. |
| `value` | `object` | yes | The object to store. |

**Returns:** `Promise<boolean | null | undefined>`

```js
await storage.setMapAsync('profile', { name: 'robert', age: 24 }); // => true
```

## getMapAsync

```ts
getMapAsync<T>(key: string): Promise<T | null | undefined>
```

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `key` | `string` | yes | Key to read. |

**Returns:** `Promise<T | null | undefined>`

```ts
const profile = await storage.getMapAsync<{ name: string; age: number }>('profile');

profile.name; // => 'robert'
```

## setArrayAsync

```ts
setArrayAsync(key: string, value: any[]): Promise<boolean | null | undefined>
```

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `key` | `string` | yes | Key to write to. |
| `value` | `any[]` | yes | The array to store. |

**Returns:** `Promise<boolean | null | undefined>`

```js
await storage.setArrayAsync('tags', ['foo', 'bar']); // => true
```

## getArrayAsync

```ts
getArrayAsync<T>(key: string): Promise<T[] | null | undefined>
```

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `key` | `string` | yes | Key to read. |

**Returns:** `Promise<T[] | null | undefined>`

```ts
const tags = await storage.getArrayAsync<string>('tags'); // => ['foo', 'bar']
```

## setMultipleItemsAsync

Writes several keys of the same type in one call.

```ts
setMultipleItemsAsync(
  items: [string, any][],
  type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'map'
): Promise<true>
```

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `items` | `[string, any][]` | yes | `[key, value]` tuples to write. |
| `type` | `'string' \| 'number' \| 'boolean' \| 'object' \| 'array' \| 'map'` | yes | The data type of every value. `'object'` is normalised to `'map'`. |

**Returns:** `Promise<true>` — always resolves `true`, regardless of whether each individual write succeeded.

`'string'`, `'array'` and `'map'`/`'object'` values go through a single native bulk write, which is why this is the fastest way to store many values at once. `'boolean'` and `'number'` are looped internally and offer no advantage over calling `setBool`/`setInt` yourself.

```js
await storage.setMultipleItemsAsync(
  [
    ['user1', { name: 'robert' }],
    ['user2', { name: 'alex' }]
  ],
  'object'
); // => true

storage.getMap('user1'); // => { name: 'robert' }
```

## getMultipleItemsAsync

Reads several keys of the same type at once.

```ts
getMultipleItemsAsync<T>(
  keys: string[],
  type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'map'
): Promise<[string, T][]>
```

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `keys` | `string[]` | yes | Keys to read. |
| `type` | `'string' \| 'number' \| 'boolean' \| 'object' \| 'array' \| 'map'` | yes | The data type stored under every key. `'map'` is an alias for `'object'`. |

**Returns:** `Promise<[string, T][]>` — one `[key, value]` tuple per requested key, in the order the keys were given.

```js
const items = await storage.getMultipleItemsAsync(['user1', 'user2'], 'object');
// => [['user1', { name: 'robert' }], ['user2', { name: 'alex' }]]

items[0][0]; // => 'user1'
items[0][1]; // => { name: 'robert' }
```

::: warning
Use `'boolean'`, not `'bool'`. An unrecognised type resolves `undefined` rather than throwing. Mixed-type keys are not supported — group keys by type and call once per type.
:::
