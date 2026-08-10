# useIndex

`useIndex` takes an array of keys and returns the values stored against them. It is meant to be used together with [Transactions](/transactionmanager): once you have built a custom index, this hook gives you a quick way to load its values and keep them up to date. The hook subscribes to write events for every key in the index, so the list re-renders whenever any of those keys change.

## Signature

```ts
function useIndex<T>(
  keys: string[],
  type: DataType,
  storage: MMKVInstance
): [
  values: (T | null | undefined)[],
  update: (key: string, value: T) => void,
  remove: (key: string) => void
];
```

**Arguments**

| Name    | Required | Type                                                     | Description                                            |
| ------- | -------- | -------------------------------------------------------- | ------------------------------------------------------ |
| keys    | yes      | `string[]`                                               | The keys whose values should be loaded.                |
| type    | yes      | `'string' \| 'number' \| 'boolean' \| 'object' \| 'array'` | The data type of every value in the index.             |
| storage | yes      | `MMKVInstance`                                           | Instance created with `new MMKVLoader().initialize()`. |

::: warning
`storage` is required. Calling `useIndex(keys, type)` without an instance throws, because the hook reads from and subscribes to that instance.
:::

**Returns:** `[values, update, remove]`

### values

An array of the values only — the keys are stripped, and `null` entries are filtered out. The order follows the order of `keys`.

### update(key, value)

Writes `value` to `key` using the setter for `type`. If `value` is falsy the call is forwarded to `remove(key)`, so `update('post.1', null)` deletes the entry.

### remove(key)

Removes the key from storage. The hook drops it from `values`.

## How to use

```jsx
import React from 'react';
import { FlatList, Text, View } from 'react-native';
import { MMKVLoader, useIndex, useMMKVStorage } from 'react-native-mmkv-storage';

const MMKV = new MMKVLoader().initialize();

const Posts = () => {
  const [postsIndex] = useMMKVStorage('postsIndex', MMKV, []);
  const [posts, update, remove] = useIndex(postsIndex, 'object', MMKV);

  return (
    <View>
      <FlatList
        data={posts}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <Text onPress={() => remove(`post.${item.id}`)}>{item.title}</Text>
        )}
      />
    </View>
  );
};

export default Posts;
```

Adding or editing an entry goes through `update`:

```jsx
update('post.1', { id: '1', title: 'Hello world' });
```

## TypeScript

```tsx
import { MMKVLoader, useIndex } from 'react-native-mmkv-storage';
import type { MMKVInstance } from 'react-native-mmkv-storage';

const MMKV: MMKVInstance = new MMKVLoader().initialize();

type Post = { id: string; title: string };

export const usePosts = (keys: string[]) => useIndex<Post>(keys, 'object', MMKV);
```

## See also

- [Transactions](/transactionmanager) for building the index itself.
- [useMMKVStorage](/usemmkvstorage) for holding the array of keys.
