# Loader Class

The `Loader Class` helps you create an MMKV Instance. Once the instance is loaded, you can then use it to read and write data in database. It follows a builder pattern. You need to tell the Loader class everything about the MMKV Instance you want to create and then finally call `initialize` to create and get the instance.

## Create a Loader

You can simply create a new Loader as follows:

```js
import { MMKVLoader } from 'react-native-mmkv-storage';

const MMKV = new MMKVLoader();
```

## initialize

Initialize the MMKV Instance with the selected properties. Returns an MMKV Instance that you can use.

```js
import { MMKVLoader } from 'react-native-mmkv-storage';

const MMKV = new MMKVLoader();

MMKV.initialize();
```

**Returns:** `API`

## withInstanceID

Specifies that the MMKV Instance should be created with the given ID. This way multiple intances can be created.

**Arguments**

| Name | Type   |
| ---- | ------ |
| ID   | String |

```js
import { MMKVLoader } from 'react-native-mmkv-storage';

const MMKV = new MMKVLoader();

MMKV = MMKV.withInstanceID('mmkvInstanceWithID');
```

**Returns:** `this`;

## withEncryption

Encrypt the MMKV instance on initialization. By default the library generates a strong password and stores it in Keychain on iOS and Android Keystore in Android.

**Arguments**

| Name | Type   |
| ---- | ------ |
| ID   | String |

```js
import { MMKVLoader } from 'react-native-mmkv-storage';

const MMKV = new MMKVLoader();

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
import { MMKVLoader } from 'react-native-mmkv-storage';

const MMKV = new MMKVLoader();

MMKV = MMKV.withEncryption().encryptWithCustomKey('encryptionKey');
```

**Returns:** `this`;

## setProcessingMode

You can choose between single process or multiprocess MMKV instance.

**Arguments**

| Name | Required | Type            | Description                |
| ---- | -------- | --------------- | -------------------------- |
| mode | yes      | ProcessingModes | Select the processing mode |

```js
import { MMKVLoader, ProcessingModes } from 'react-native-mmkv-storage';

const MMKV = new MMKVLoader();

MMKV = MMKV.setProcessingMode(ProcessingModes.SINGLE_PROCESS); // OR MMKVStorage.MODES.MULTI_PROCESS
```

## setAccessibleMode (iOS only)

Choose the accessibility mode for secure key storage (IOS ONLY);

**Arguments**

| Name       | Required | Type                   | Description                   |
| ---------- | -------- | ---------------------- | ----------------------------- |
| accessible | yes      | MMKVStorage.ACCESSIBLE | Choose the accessibility mode |

```js
import { MMKVLoader, IOSAccessibleStates } from 'react-native-mmkv-storage';

const MMKV = new MMKVLoader();

MMKV = MMKV.setAccessibleMode(IOSAccessibleStates.WHEN_UNLOCKED);
```

```ts
type IOSAccessibleStates = {
  WHEN_UNLOCKED: string;
  AFTER_FIRST_UNLOCK: string;
  /** @deprected in iOS 16+ */
  ALWAYS: string;
  WHEN_PASSCODE_SET_THIS_DEVICE_ONLY: string;
  WHEN_UNLOCKED_THIS_DEVICE_ONLY: string;
  AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY: string;
  /** @deprected in iOS 16+ */
  ALWAYS_THIS_DEVICE_ONLY: string;
};
```

**Returns:** `this`;

## withServiceName (iOS only)

Sets the [kSecAttrService](https://developer.apple.com/documentation/security/ksecattrservice) option for secure key storage (IOS ONLY);

**Arguments**

| Name        | Required | Type   | Description      |
| ----------- | -------- | ------ | ---------------- |
| serviceName | yes      | String | The service name |

```js
import { MMKVLoader } from 'react-native-mmkv-storage';

const MMKV = new MMKVLoader();

MMKV = MMKV.withServiceName('com.MMKV.example');
```

**Returns:** `this`;

## withReviver

Specifies a reviver function (same as `JSON.parse`'s, [see docs for that](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse#reviver)) to be used when retrieving objects or arrays from storage.

**Arguments**

| Name    | Type     |
| ------- | -------- |
| reviver | Function |

```js
import { MMKVLoader } from 'react-native-mmkv-storage';

const MMKV = new MMKVLoader();

const myReviver = (key, value) => (key === 'foo' ? 'bar' : value);

MMKV = MMKV.withReviver(myReviver);
```

**Returns:** `this`;

## Putting it together

Now you know about the loader class, lets create a MMKV Instance with an ID.

```js
import { MMKVLoader } from "react-native-mmkv-storage";

MMKV = new MMKVLoader().
.withInstanceID('mmkvInstanceID')
.setProcessingMode(MMKVStorage.MODES.MULTI_PROCESS)
.withEncryption()
.encryptWithCustomKey('encryptionKey',true, 'customAlias')
.initialize()

// then use it


  await MMKV.setStringAsync("string", "string");

  let string = await MMKV.getStringAsync("string");

```
