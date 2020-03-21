<div align="center">
<h1>react-native-mmkv-storage</h1>
</div>
<div
align="center"
style="width:100%;"
>
<a
href="https://github.com/ammarahm-ed/react-native-mmkv-storage/pulls"
target="_blank"
>
<img  src="https://img.shields.io/badge/PRs-welcome-green"/>
</a>
<a
href="https://www.npmjs.com/package/react-native-mmkv-storage"
target="_blank"
>
<img src="https://img.shields.io/npm/v/react-native-mmkv-storage?color=green"/>
</a>
<a
href="https://www.npmjs.com/package/react-native-mmkv-storage"
target="_blank"
>
<img  src="https://img.shields.io/npm/dt/react-native-mmkv-storage?color=green"/>
</a> 
</div>
<p align="center">
This library is the React Native wrapper for https://github.com/Tencent/MMKV. which is very fast, efficient and easy to use solution for storing data. This project uses part of code from the original <a href="https://github.com/FidMe/react-native-fast-storage">react-native-fast-storage</a> project and allows setting data types other than just strings.
</p>

<div align="center">
<h2>Features</h2>
</div>

**Efficient:** MMKV uses mmap to keep memory synced with file, and protobuf to encode/decode values, making the most of iOS/macOS to achieve best performance.

**Easy-to-use:** You can use MMKV as you go, no configurations needed. All changes are saved immediately, no synchronize calls needed.

**Small:** A handful of files: MMKV contains encode/decode helpers and mmap logics and nothing more. It's really tidy.
Less than 30K in binary size: MMKV adds less than 30K per architecture on App size, and much less when zipped (ipa).

<div align="center">
<h2>Installation</h2>
</div>

`$ npm install react-native-mmkv-storage --save`
OR

`$ yarn add react-native-mmkv-storage`

If you are on react-native@0.59 or below you need to use the following to link the library.

`$ react-native link react-native-mmkv-storage`

**iOS**

run `pod install` inside ios folder.

<div align="center">
<h1>Storage API</h1>
</div>

All methods are asynchronous

#### `MMKV.setString(key,value)`

Sets a string value in storage for the given key.

**Arguments**
| Name | Type |
| ---- | -------- |
| key | String |
| value | String |

```jsx
import MMKV from "react-native-mmkv-storage";

await MMKV.setString("myString", "helloworld");
```

**Returns**
`Promise<boolean>`

#

#### `MMKV.getString(key)`

Gets a string value for a given key.

**Arguments**
| Name | Type |
| ---- | -------- |
| key | String |

```jsx
import MMKV from "react-native-mmkv-storage";

let myString = await MMKV.getString("myString");
```

**Returns**
`Promise<string>`

#

#### `MMKV.setInt(key,value)`

Sets a number value in storage for the given key.

**Arguments**
| Name | Type |
| ---- | -------- |
| key | String |
| value | Number |

```jsx
import MMKV from "react-native-mmkv-storage";

await MMKV.setInt("myNumber", 10);
```

**Returns**
`Promise<boolean>`

#

#### `MMKV.getInt(key)`

Gets a number value for a given key.

**Arguments**
| Name | Type |
| ---- | -------- |
| key | String |

```jsx
import MMKV from "react-native-mmkv-storage";

let myNumber = await MMKV.getInt("myNumber");
```

**Returns**
`Promise<number>`

#

#### `MMKV.setBool(key,value)`

Sets a boolean value in storage for the given key.

**Arguments**
| Name | Type |
| ---- | -------- |
| key | String |
| value | boolean |

```jsx
import MMKV from "react-native-mmkv-storage";

await MMKV.setString("myBooleanValue", false);
```

**Returns**
`Promise<boolean>`

#

#### `MMKV.getBool(key)`

Gets a boolean value for a given key.

**Arguments**
| Name | Type |
| ---- | -------- |
| key | String |

```jsx
import MMKV from "react-native-mmkv-storage";

let myBooleanValue = await MMKV.getString("myBooleanValue");
```

**Returns**
`Promise<boolean>`

#

#### `MMKV.setMap(key,value)`

Sets an object to storage for the given key.

**Arguments**
| Name | Type |
| ---- | -------- |
| key | String |
| value | Object |

```jsx
import MMKV from "react-native-mmkv-storage";

let myObject = { foo: "foo", bar: "bar" };

await MMKV.setMap("myobject", myObject);
```

**Returns**
`Promise<boolean>`

#### `MMKV.getMap(key)`

Gets an object from storage.

**Arguments**
| Name | Type |
| ---- | -------- |
| key | String |

```jsx
import MMKV from "react-native-mmkv-storage";

let myObject = await MMKV.getMap("myobject");
```

**Returns**
`Promise<object>`

#

#### `MMKV.setArray(key,value)`

Sets an array to storage for the given key.

**Arguments**
| Name | Type |
| ---- | -------- |
| key | String |
| value | Array |

```jsx
import MMKV from "react-native-mmkv-storage";

let myArray = ["foo", "bar"];

await MMKV.setArray("myArray", myArray);
```

**Returns**
`Promise<boolean>`

#

#### `MMKV.getArray(key)`

Sets an array to storage for the given key.

**Arguments**
| Name | Type |
| ---- | -------- |
| key | String |

```jsx
import MMKV from "react-native-mmkv-storage";

let myArray = await MMKV.getArray("myArray");
```

**Returns**
`Promise<Array<>>`

#

#### `MMKV.getMultipleItems([keys])`

Retrieve multiple Objects for a given array of keys. **Currently will work only if data for all keys is an Object.**

**Arguments**
| Name | Type |
| ---- | -------- |
| keys | Array of Keys |

```jsx
import MMKV from "react-native-mmkv-storage";

let multipleItems = await MMKV.getMultipleItems(["foo", "bar", "loo"]);
```

**Returns**
`Promise<Array<[]>>`

The Array returned has the following structure:

```jsx
[
  ["foo", Object<any>],
  ["bar", Object<any>]
];
```
The first item in each array is the `key` for the object, and the second item is object itself.

#

#### `MMKV.hasKey(key)`

Check if a key exists in the storage.

**Arguments**
| Name | Type |
| ---- | -------- |
| key | String |

```jsx
import MMKV from "react-native-mmkv-storage";

MMKV.hasKey(key).then(result => {
  if (result) {
    // if true do this.
  } else {
    // if false do this.
  }
});
```

**Returns**
`Promise<boolean>`

#

#### `MMKV.removeItem(key)`

Remove an item for a given key.

**Arguments**
| Name | Type |
| ---- | -------- |
| key | String |

```jsx
import MMKV from "react-native-mmkv-storage";

await MMKV.removeItem(key);
```

#

#### `MMKV.clearStore()`

Clear the storage.

```jsx
import MMKV from "react-native-mmkv-storage";

await MMKV.clearStore();
```

#

## Find this library useful? ❤️

Support it by joining stargazers for this repository. ⭐️ and follow me for my next creations!

#

### MMKV is Licenced under[ BSD 3-Clause Licence](https://github.com/Tencent/MMKV/blob/master/LICENSE.TXT)

#### This library is MIT Licenced
