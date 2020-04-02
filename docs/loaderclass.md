# Loader Class

The `Loader Class` helps you create an MMKV Instance. Once the instance is loaded, you can then use it to read and write data in database. It follows a builder pattern. You need to tell the Loader class everything about the MMKV Instance you want to create and the finally call `initialize` to create it and get the instance by calling `getInstance`.

## Create a Loader

You can simply create a new Loader as follows:

```js
import MMKVStorage from "react-native-mmkv-storage";

const MMKV = new MMKVStorage.Loader();
```

Now you know how to create a loader class, lets get into the API and see how it works.

## default

The simplest way to create an instance is to call `default` to select the default instance and then initialize it.

```js
import MMKVStorage from "react-native-mmkv-storage";

const MMKV = new MMKVStorage.Loader();

MMKV.default();
```

**Returns:** `this`;

## initialize

Initialize the MMKV Instance with the selected properties.

```js
import MMKVStorage from "react-native-mmkv-storage";

const MMKV = new MMKVStorage.Loader();
// continuing from previous defination

MMKV.default().initialize();
```

**Returns:** `this`

## getInstance

Gets the initialized MMKV instance. Always call it after calling `initialize()`.

```js
import MMKVStorage from "react-native-mmkv-storage";

const MMKV = new MMKVStorage.Loader();

MMKV = MMKV.default();
```

**Returns:** `this`

## withInstanceID

Specifies that the MMKV Instance should be created with the given ID. This way multiple intances can be created.

**Arguments**

| Name | Type   |
| ---- | ------ |
| ID   | String |

```js
import MMKVStorage from "react-native-mmkv-storage";

const MMKV = new MMKVStorage.Loader();

MMKV = MMKV.withInstanceID("mmkvInstanceWithID");
```

**Returns:** `this`;

## withEncryption

Encrypt the MMKV instance on initialization. By default the library generates a strong password and stores it in Keychain on iOS and Android Keystore in Android.

**Arguments**

| Name | Type   |
| ---- | ------ |
| ID   | String |

```js
import MMKVStorage from "react-native-mmkv-storage";

const MMKV = new MMKVStorage.Loader();

MMKV = MMKV.withEncryption();
```

**Returns:** `this`;



## encryptWithCustomKey

You can also specify your own password to encrypt the storage.

**Arguments**

| Name             | Required | Type    | Description                                                                           |
| ---------------- | -------- | ------- | ------------------------------------------------------------------------------------- |
| cryptKey         | yes      | String  | Password to encrypt the storage                                                       |
| secureKeyStorage | no       | boolean | Set to true of you want the library to store the password securely                    |
| alias            | no       | String  | You can provide a custom alias for storage of password, by default instanceID is used |

```js
import MMKVStorage from "react-native-mmkv-storage";

const MMKV = new MMKVStorage.Loader();

MMKV = MMKV.default()
  .withEncryption()
  .encryptWithCustomKey("encryptionKey");
```

**Returns:** `this`;

## setProcessingMode

You can choose between single process or multiprocess MMKV instance.

**Arguments**

| Name | Required | Type              | Description                |
| ---- | -------- | ----------------- | -------------------------- |
| mode | yes      | MMKVStorage.MODES | Select the processing mode |

```js
import MMKVStorage from "react-native-mmkv-storage";

const MMKV = new MMKVStorage.Loader();

MMKV = MMKV.default().setProcessingMode(MMKVStorage.MODES.SINGLE_PROCESS); // OR MMKVStorage.MODES.MULTI_PROCESS
```

**Returns:** `this`;

## Putting it together

Now you know about the loader class, lets create a MMKV Instance with an ID.

```js
import MMKVStorage from "react-native-mmkv-storage";

MMKV = new MMKVStorage.Loader().
.withInstanceID('mmkvInstanceID')
.setProcessingMode(MMKVStorage.MODES.MULTI_PROCESS)
.withEncryption()
.encryptWithCustomKey('encryptionKey',true, 'customAlias')
.initialize()
.getInstance();

// then use it


  await MMKV.setStringAsync("string", "string");

  let string = await MMKV.getStringAsync("string");

```
