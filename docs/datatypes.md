# Data types

Five JavaScript data types can be stored. Each one has a dedicated setter and getter, plus an async variant of both.

| Type | Setter | Getter | Notes |
| --- | --- | --- | --- |
| `string` | `setString(key, value)` | `getString(key)` | Stored as-is |
| `number` | `setInt(key, value)` | `getInt(key)` | Any JS number, integer or float |
| `boolean` | `setBool(key, value)` | `getBool(key)` | |
| `object` | `setMap(key, value)` | `getMap(key)` | Plain object only, JSON serialized |
| `array` | `setArray(key, value)` | `getArray(key)` | JSON serialized |

The JS `Map` type is **not** supported — despite the name, `setMap` takes a plain object.

Setters return `boolean | undefined`. Passing `null` or `undefined` as the value removes the key instead of storing it. Passing a value of the wrong type throws, for example `setString('key', 1)` throws `Trying to set number as a string`.

## null vs undefined

Getters distinguish two kinds of empty result:

- `null` — there is no value for this key, or the stored JSON could not be parsed.
- `undefined` — the instance is not loaded yet, so the read never reached storage.

```js
storage.getString('never-written'); // => null
```

## Strings

```js
import { MMKVLoader } from 'react-native-mmkv-storage';

const storage = new MMKVLoader().initialize();

storage.setString('user.name', 'robert');
storage.getString('user.name'); // => "robert"
```

## Numbers

```js
storage.setInt('user.age', 24);
storage.getInt('user.age'); // => 24
```

## Booleans

```js
storage.setBool('user.isPremium', true);
storage.getBool('user.isPremium'); // => true
```

## Objects

`setMap` accepts a plain object and stores its JSON representation, so only JSON-serializable values survive the round trip — functions, `Symbol`s, `Date`s and `undefined` properties do not.

```js
storage.setMap('user', { name: 'robert', age: 24 });
storage.getMap('user'); // => { name: "robert", age: 24 }
```

In TypeScript the getter is generic:

```ts
type User = { name: string; age: number };

const user = storage.getMap<User>('user');
```

## Arrays

```js
storage.setArray('user.roles', ['admin', 'editor']);
storage.getArray('user.roles'); // => ["admin", "editor"]
```

```ts
const roles = storage.getArray<string>('user.roles');
```

## Async variants

Every setter and getter also has an async form returning a promise: `setStringAsync`, `getStringAsync`, `setIntAsync`, `getIntAsync`, `setBoolAsync`, `getBoolAsync`, `setMapAsync`, `getMapAsync`, `setArrayAsync`, `getArrayAsync`.

```js
await storage.setStringAsync('user.name', 'robert');
await storage.getStringAsync('user.name'); // => "robert"
```

MMKV reads and writes are fast enough that the sync API is a good default; the async variants exist mainly so the library can drop into code written against `AsyncStorage`.
