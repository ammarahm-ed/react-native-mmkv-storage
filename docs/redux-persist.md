# Support for redux-persist

The library provides support for redux-persist so you can replace it directly with AsyncStorage.

First we create an MMKV instance, it could be with or without encryption. 

```js
import MMKVStorage from "react-native-mmkv-storage";

const storage = new MMKVStorage.Loader().initialize();
```

Then we pass the storage to persistConfig.

```js
const persistConfig = {
  //...
  storage,
};
```
