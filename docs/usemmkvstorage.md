# useMMKVStorage

`useMMKVStorage` is a `useState` like hook backed by storage. Every change is written to the MMKV instance and every component using the same key updates instantly. It does not matter if you reload or restart the app, the value will be there on the next load.

```jsx
import React from 'react';
import { Text, View } from 'react-native';
import { MMKVLoader, useMMKVStorage } from 'react-native-mmkv-storage';

const MMKV = new MMKVLoader().initialize();

const App = () => {
  const [user, setUser] = useMMKVStorage('user', MMKV, 'robert');

  return (
    <View>
      <Text onPress={() => setUser('andrew')}>{user}</Text>
    </View>
  );
};

export default App;
```

## Signature

```ts
function useMMKVStorage<T>(
  key: string,
  storage: MMKVInstance,
  defaultValue?: T,
  equalityFn?: (prev: T | undefined, next: T | undefined) => boolean
): [value: T, setValue: (value: T | ((prevValue: T) => T)) => void];
```

**Arguments**

| Name         | Required | Type                                                  | Description                                                          |
| ------------ | -------- | ----------------------------------------------------- | -------------------------------------------------------------------- |
| key          | yes      | `string`                                              | The key to read and write.                                           |
| storage      | yes      | `MMKVInstance`                                        | Instance created with `new MMKVLoader().initialize()`.               |
| defaultValue | no       | any supported type                                    | Returned when the key holds no value. See [Data types](/datatypes).  |
| equalityFn   | no       | `(prev, next) => boolean`                             | Return `true` to skip the state update for an incoming change.       |

**Returns:** `[value, setValue]`

## Updating the value

The setter accepts a value or an updater function, just like `useState`:

```jsx
setUser('andrew');
setUser(prev => prev.toUpperCase());
```

Writing to the same key anywhere else in the app updates the hook too:

```js
MMKV.setString('user', 'andrew');
```

Passing `null` or `undefined` removes the key from storage:

```jsx
setUser(null);
```

## equalityFn

`equalityFn` is called with the previous and the incoming value whenever a write for the key is observed. Returning `true` means "these are equal", so the component does not re-render. This is useful for objects, where a rewrite of an identical payload would otherwise render again.

```jsx
import React from 'react';
import { Text, View } from 'react-native';
import { MMKVLoader, useMMKVStorage } from 'react-native-mmkv-storage';

const MMKV = new MMKVLoader().initialize();

const Profile = () => {
  const [user, setUser] = useMMKVStorage(
    'user',
    MMKV,
    { name: 'robert', age: 30 },
    (prev, next) => prev?.name === next?.name
  );

  return (
    <View>
      <Text onPress={() => setUser({ ...user, age: user.age + 1 })}>{user.name}</Text>
    </View>
  );
};

export default Profile;
```

## create

`create` binds a storage instance to the hook so you only import the instance once.

```ts
function create(storage: MMKVInstance): <T>(
  key: string,
  defaultValue?: T,
  equalityFn?: (prev: T | undefined, next: T | undefined) => boolean
) => [value: T, setValue: (value: T | ((prevValue: T) => T)) => void];
```

```jsx
import React from 'react';
import { Text, View } from 'react-native';
import { MMKVLoader, create } from 'react-native-mmkv-storage';

const MMKV = new MMKVLoader().initialize();

export const useStorage = create(MMKV);

const App = () => {
  const [user, setUser] = useStorage('user', 'robert');

  return (
    <View>
      <Text onPress={() => setUser('andrew')}>{user}</Text>
    </View>
  );
};

export default App;
```

The returned hook throws `Key and Storage are required parameters.` if it is called without a key, or if `create` was given no storage instance.

## TypeScript

Type the instance with `MMKVInstance` and let the hook infer or receive the value type:

```tsx
import { MMKVLoader, useMMKVStorage } from 'react-native-mmkv-storage';
import type { MMKVInstance } from 'react-native-mmkv-storage';

const MMKV: MMKVInstance = new MMKVLoader().initialize();

type User = { name: string; age: number };

export const useUser = () => useMMKVStorage<User>('user', MMKV, { name: 'robert', age: 30 });
```

::: warning
`MMKVStorage.API` is deprecated. Use the named `MMKVInstance` type instead.
:::

## Behaviour to keep in mind

- **The type is locked to the first value observed for a key.** Once the hook has seen a string for `"user"`, setting a number logs a warning in `__DEV__` and does nothing. Setting `null` or `undefined` removes the key and clears the type lock, so the next write can use a different type.
- **Async functions are not accepted as setters.** Passing one logs a `__DEV__` warning and the write is skipped. Resolve the value first, then call the setter.
- **The initial value is resolved through the indexer.** The hook uses the type indexes to work out how to read the key on mount, so an instance created with `disableIndexing()` will not restore values into the hook. See [Querying and indexing](/queryingandindexing).
- **Default values are not persisted by default.** `getItem` for an unwritten key returns `null` even though the hook returns the default. Use `new MMKVLoader().withPersistedDefaultValues().initialize()` to have the default written to storage on mount.
- **Falsy stored values are returned as-is.** `defaultValue` is only used when the key holds nothing. A stored `false`, `0` or `""` is returned unchanged rather than falling back to the default, and an updater function receives the stored falsy value rather than the default.

## See also

- [useIndex](/useindex)
- [useMMKVRef](/usemmkvref)
- [Events](/events) for reacting to changes outside React.
