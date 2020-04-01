# Creating an MMKV Instance

The first step is to import the library in your project files

```js
import MMKVStorage from 'react-native-mmkv-storage';
```

Creating a new instance is simple and follows a builder pattern. Here is an example of loading the default instance.

```js
// Create a new Loader Class.

MMKV = new MMKVStorage.Loader();

// Select the default Instance

MMKV.default();

// Initialize it

MMKV.initialize();

// Load the instance to make API Calls

MMKV = MMKV.getInstance();

//
```

or you can simply initialize it in a single statement following builder pattern

```js
MMKV = MMKV.Loader()
  .default()
  .initialize()
  .getInstance();
```
