# useMMKVRef hook

A persisted ref that will always write every change to it's `current` value to storage. It doesn't matter if you reload the app or restart it. Everything will be in place on app load. Let's see how this works:

### `useMMKVRef`
A `useRef` like hook that allows you to easily manage values in storage.

**Arguments**

| Name              | Required | Type              | Description                                                        |
|-------------------|----------|-------------------|--------------------------------------------------------------------|
| key               | yes      | String            | The key against which to get the value                             |
| `MMKVStorage.API` | yes      | `MMKVStorage.API` | MMKV storage instance created from `new MMKVLoader().initialize()` |
| defaultValue      | no       | String            | Pass a default value for the hook if any                           |

**returns:** `{current: RefObject<T>, reset: () => void}`. 

The `reset` function can be used to reset the value to `defaultValue`.

### `createMMKVRefHookForStorage`
A helper function that returns `useMMKVRef` which can then be used inside a component.
**Arguments**

| Name              | Required | Type    | Description                                                        |
|-------------------|----------|---------|--------------------------------------------------------------------|
| `MMKVStorage.API` | yes      | boolean | MMKV storage instance created from `new MMKVLoader().initialize()` |

**returns:** `useMMKVRef(key:string, defaultValue:any)`

### How to use

Import `MMKVLoader` and `useMMKVRef` Hook.

```js
import { MMKVLoader, useMMKVRef } from "react-native-mmkv-storage";
```

Initialize the `MMKVLoader` instance.

```js
const MMKV = new MMKVLoader().initialize();
```

Next, in our component we are going to register our hook.

```jsx
const App = () => {
  const name = useMMKVRef("username", MMKV);

  return (
    <View>
      <TextInput
        defaultValue={name.current}
        onChangeText={(value) => {
          name.current = value;
        }}
      />
    </View>
  );
};
```
Now whenever you update `current` value, it will be stored in storage, until you call `reset` function;

