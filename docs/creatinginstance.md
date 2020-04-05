# Creating an MMKV Instance

The first step is to import the library in your project files

```js
import MMKVStorage from "react-native-mmkv-storage";
```

Creating a new instance is simple and follows a builder pattern. Here is an example of loading the default instance.

```js
// Create a new Loader Class.

const MMKV = new MMKVStorage.Loader();

// Select the default Instance

MMKV.default();

// Initialize it

await MMKV.initialize(); // Returns an MMKV Instance on promise resolved


// Then make are read/write requests

await MMKV.setStringAsync("string", "string");

let string = await MMKV.getStringAsync("string");

//
```

or you can simply initialize it in a single statement following builder pattern

```js
const MMKV = await new MMKVStorage.Loader()
  .default()
  .initialize();

// Then make are read/write requests

await MMKV.setStringAsync("string", "string");

let string = await MMKV.getStringAsync("string");
```

## MMKV Instance with ID

The library allows you to create as many instances of MMKV as you might need giving a unique ID to each instance.

```js
const MMKVwithID = await new MMKVStorage.Loader()
  .withInstanceID("mmkvWithID")
  .initialize()

// Then make are read/write requests

await MMKV.setStringAsync("string", "string");

let string = await MMKV.getStringAsync("string");
```

## MMKV Instance with Encryption

You can also encrypt MMKV Instance when you initialize it. By default the library generates a strong encryption key and saves it in Keychain on iOS and Android Keystore on Android for continuious usage

```js
const MMKVwithEncryption = await new MMKVStorage.Loader()
  .default()
  .withEncryption()
  .initialize()

// OR if you are initializing with an instance ID

const MMKVwithEncryptionAndID = await new MMKVStorage.Loader()
  .withInstanceID("mmkvWithEncryptionAndID")
  .withEncryption()
  .initialize()
```


!> Remember that if you encrypt an already created instance using the loader class, it will create a new MMKV instance even if the instance exists. To encrypt an already existing instance, use encrypt() method. Read in detail about Encryption API here.

## Encryption with custom key

While the library can handle the encryption itself, you can choose to provide your own custom encryption key etc. For example, you maybe want to encrypt the storage with a token or user password.

```js
const MMKVwithEncryptionKey = await new MMKVStorage.Loader()
  .default()
  .withEncryption()
  .withCustomKey("encryptionKey")
  .initialize()
```

And if you want the library to store the encryption key you provided, you can choose to do so too.

```js
const MMKVwithEncryptionKey = await new MMKVStorage.Loader()
  .default()
  .withEncryption()
  .withCustomKey("encryptionKey", true)
  .initialize()
```


