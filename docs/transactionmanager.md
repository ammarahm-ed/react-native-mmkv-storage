# Transactions

Transactions let you listen to a value's lifecycle and mutate it on the way in or out. You register lifecycle functions on a storage instance for `beforewrite`, `onwrite`, `onread` and `ondelete`, which gives you a single place to observe and transform storage traffic — and makes building custom indexes a few lines of work.

Transactions live on `instance.transactions`:

```js
import { MMKVLoader } from 'react-native-mmkv-storage';

const MMKV = new MMKVLoader().initialize();

MMKV.transactions.register('object', 'onwrite', (key, value) => {
  console.log('object written', key, value);
});
```

::: warning
Mutator functions receive **positional arguments**, `(key, value)`. The older `({ key, value }) => ...` destructuring form does not work: `key` and `value` would be read off the key string.
:::

## register

Registers a mutator for a data type and a lifecycle event.

```ts
function register(
  type: DataType,
  transaction: TransactionType,
  mutator: (key: string, value?: unknown) => any
): () => void;
```

**Arguments**

| Name        | Required | Type                                                       | Description                                       |
| ----------- | -------- | ---------------------------------------------------------- | ------------------------------------------------- |
| type        | yes      | `'string' \| 'number' \| 'object' \| 'array' \| 'boolean'`  | The data type to register the mutator for.        |
| transaction | yes      | `'beforewrite' \| 'onwrite' \| 'onread' \| 'ondelete'`      | When the mutator should run.                      |
| mutator     | yes      | `(key: string, value?: unknown) => any`                    | The function that observes or transforms a value. |

**Returns:** an unregister function. Calling it is equivalent to `unregister(type, transaction)`.

```js
const unsubscribe = MMKV.transactions.register('object', 'onwrite', (key, value) => {
  console.log(key, value);
});

unsubscribe();
```

All three arguments are required — `register` throws `All parameters are required` otherwise.

## unregister

```ts
function unregister(type: DataType, transaction: TransactionType): void;
```

```js
MMKV.transactions.unregister('object', 'onwrite');
```

## clear

Removes every registered mutator on the instance. Observers added with `subscribe` are left in place.

```js
MMKV.transactions.clear();
```

## subscribe

Observes a lifecycle event without taking part in it.

```ts
function subscribe(
  type: DataType,
  transaction: TransactionType,
  observer: (key: string, value?: unknown) => void
): () => void;
```

**Returns:** a function that removes this observer, and only this one.

Unlike `register`, any number of observers can watch the same type and transaction, and none of them replaces a mutator or another observer. An observer's return value is ignored, so it cannot change what is written, read or deleted.

```js
const unsubscribe = MMKV.transactions.subscribe('object', 'onwrite', (key, value) => {
  console.log('wrote', key, value);
});

unsubscribe();
```

Observers receive the **final** value — after any `beforewrite` or `onread` mutator has run — so what an `onwrite` observer sees is what was actually stored.

::: tip Which one do I want?
Use `register` when you need to *change* a value or build an index. Use `subscribe` when you only need to *watch*, and especially in reusable code: a library that called `register` would silently replace whatever the app had registered for that type. This is how the [DevTools panel](/devtools) observes storage.
:::

## Lifecycle events

| Event         | When it runs                        | Return value                                            |
| ------------- | ----------------------------------- | ------------------------------------------------------- |
| `beforewrite` | Before the value is written         | Replaces the value that gets written                    |
| `onwrite`     | After the value has been written    | Ignored                                                 |
| `onread`      | After the value has been read       | Replaces the value returned to the caller               |
| `ondelete`    | When a key is removed               | Ignored, and the mutator receives no value              |

## Behaviour to keep in mind

- **One mutator per (type, transaction) pair.** Registering a second mutator for `('object', 'onwrite')` replaces the first one; there is no listener list.
- **`ondelete` is global, not per type.** It is stored once per instance regardless of the `type` you pass, and it always fires with type `'string'`. Registering `ondelete` for two different types means the second registration wins.
- **A mutator cannot null out a value.** If the mutator returns `undefined` or `null`, the original value is used instead. Use `removeItem` if you want a value gone.
- **Removing a key still triggers `ondelete` for every removed key**, including through `removeItems` and `clearStore`.

## 1. Developer tooling

Trace what your app writes, in one place.

```js
import { MMKVLoader } from 'react-native-mmkv-storage';

const MMKV = new MMKVLoader().initialize();

MMKV.transactions.register('object', 'onwrite', (key, value) => {
  console.log(MMKV.instanceID, 'object:onwrite', key, value);
});

MMKV.transactions.register('object', 'ondelete', key => {
  console.log(MMKV.instanceID, 'ondelete', key);
});
```

## 2. Custom indexing

Suppose posts are stored under a `post.` prefix and every post carries a tag. We keep an index of post keys per tag, maintained automatically on write.

```js
import { MMKVLoader } from 'react-native-mmkv-storage';

const MMKV = new MMKVLoader().initialize();

MMKV.transactions.register('object', 'beforewrite', (key, value) => {
  if (!key.startsWith('post.')) return;

  const indexKey = `${value.tag}-index`;
  const index = MMKV.getArray(indexKey) || [];

  if (!index.includes(key)) {
    MMKV.setArray(indexKey, [...index, key]);
  }
});
```

And the index is consumed by a component with [useIndex](/useindex):

```jsx
import React from 'react';
import { FlatList, Text, View } from 'react-native';
import { MMKVLoader, useIndex, useMMKVStorage } from 'react-native-mmkv-storage';

const MMKV = new MMKVLoader().initialize();

const PostsByTag = ({ tag }) => {
  const [tagIndex] = useMMKVStorage(`${tag}-index`, MMKV, []);
  const [posts] = useIndex(tagIndex, 'object', MMKV);

  return (
    <View>
      <FlatList
        data={posts}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <Text>{item.title}</Text>}
      />
    </View>
  );
};

export default PostsByTag;
```

## 3. Derived data

Keep a counter in sync with the posts in storage without sprinkling the logic across the app.

```js
import { MMKVLoader } from 'react-native-mmkv-storage';

const MMKV = new MMKVLoader().initialize();

MMKV.transactions.register('object', 'onwrite', key => {
  if (!key.startsWith('post.')) return;

  const count = MMKV.getInt('postsCount') || 0;
  MMKV.setInt('postsCount', count + 1);
});

MMKV.transactions.register('object', 'ondelete', key => {
  if (!key.startsWith('post.')) return;

  const count = MMKV.getInt('postsCount') || 0;
  MMKV.setInt('postsCount', Math.max(0, count - 1));
});
```

::: tip
`onwrite` fires on every write, including overwrites of an existing key. If you only want to count new posts, check `MMKV.indexer.maps.hasKey(key)` from a `beforewrite` mutator, where the previous state is still visible.
:::

## 4. On-the-fly mutations

`beforewrite` can transform the value that actually reaches storage — return the new value rather than writing it again yourself.

```js
import { MMKVLoader } from 'react-native-mmkv-storage';

const MMKV = new MMKVLoader().initialize();

MMKV.transactions.register('object', 'beforewrite', (key, value) => {
  if (!key.startsWith('post.')) return;
  if (value.timestamp) return;

  return { ...value, timestamp: Date.now() };
});
```

`onread` works the same way, transforming values on their way out:

```js
MMKV.transactions.register('object', 'onread', (key, value) => {
  if (!value) return;
  return { ...value, readAt: Date.now() };
});
```

## See also

- [useIndex](/useindex)
- [Querying and indexing](/queryingandindexing)
- [Events](/events)
