# Reactive Apps with useMMKVStorage Hook

Starting from `v0.5.5`, thanks to the power of JSI, we now have our very own `useMMKVStorage` Hook. Think of it like a persisted state that will always write every change in storage and update your app UI instantly. It doesn't matter if you reload the app or restart it. Everything will be in place on app load. Let's see how this works:

Import `MMKVStorage` and `useMMKVStorage` Hook.

```js
import MMKVStorage, { useMMKVStorage } from "react-native-mmkv-storage";
```

Initialize the `MMKVStorage` instance.

```js
const MMKV = new MMKVStorage.Loader().initialize();
```

Next, in our component we are going to register our hook.

```jsx
const App = () => {
  const [user, setUser] = useMMKVStorage("user", MMKV);

  return (
    <View>
      <Text>{user}</Text>
    </View>
  );
};
```

Now whenever you update value of `"user"` in storage, your `App` component will automatically rerender.

```jsx
setUser("andrew");
//or you cal call setUser without a value to remove the value
setUser(); //removes the value from storage.

// or you can do this too anywhere in your app:
MMKV.setString("user", "andrew");
```

Simple right? now refresh the app or restart it. When it loads, it will always show andrew as the user until you update it.
The ideal way which I would recommend for better development experience would to wrap `useMMKVStorage` hook in a custom hook as follows:

```jsx
const MMKV = new MMKVStorage.Loader().initialize();

export const useStorage = (key) => {
  const [value, setValue] = useMMKVStorage(key, MMKV);
  return [value, setValue];
};
```
You should use the `create` function from `v0.5.9` onwards:
```jsx
import MMKVStorage, {create} from "react-native-mmkv-storage";
const MMKV = new MMKVStorage.Loader().initialize();

export const useStorage = create(MMKV);
```

Now you don't have to import `MMKV` everywhere in your app but only once. If you use TypeScript you can do something like below to get nice intellisense in your editor.

```tsx
const MMKV: MMKVStorage.API = new MMKVStorage.Loader().initialize();
type LiteralUnion<T extends U, U = string> = T | (U & {});

export const useStorage = (key: LiteralUnion<"user" | "password">) => {
  const [value, setValue] = useMMKVStorage(key, MMKV);
  return [value, setValue];
};
```
