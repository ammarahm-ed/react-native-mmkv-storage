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

All methods have two variants, an **async** variant and a **non-async** variant.

#### `MMKV.setStringAsync(key,value)`

Sets a string value in storage for the given key.

**Arguments**
| Name | Type |
| ---- | -------- |
| key | String |
| value | String |

```jsx
import MMKV from "react-native-mmkv-storage";

await MMKV.setStringAsync("string", "string");
```

**Returns**
`Promise<boolean>`


#### `MMKV.setString(key,value,callback)`

Sets a string value in storage for the given key.

**Arguments**
| Name | Type |
| ---- | -------- |
| key | String |
| value | String |
| callback | Function |

```jsx
import MMKV from "react-native-mmkv-storage";

MMKV.setString("string", "string",(data) => console.log(data));
```

**Returns**
`boolean`


#



#### `MMKV.getStringAsync(key)`

Gets a string value for a given key.

**Arguments**
| Name | Type |
| ---- | -------- |
| key | String |

```jsx
import MMKV from "react-native-mmkv-storage";

let string = await MMKV.getStringAsync("string");
```

**Returns**
`Promise<string>`


#### `MMKV.getString(key,callback)`

Gets a string value for a given key.

**Arguments**
| Name | Type |
| ---- | -------- |
| key | String |
|callback |Function|
```jsx
import MMKV from "react-native-mmkv-storage";

MMKV.getString("string", string => console.log(string));
```

**Returns**
`string`

#


#### `MMKV.setIntAsync(key,value)`

Sets a number value in storage for the given key.

**Arguments**
| Name | Type |
| ---- | -------- |
| key | String |
| value | Number |

```jsx
import MMKV from "react-native-mmkv-storage";

await MMKV.setIntAsync("number", 10);
```

**Returns**
`Promise<boolean>`


#### `MMKV.setInt(key,value,callback)`

Sets a number value in storage for the given key.

**Arguments**
| Name | Type |
| ---- | -------- |
| key | String |
| value | Number |
|callback| Function |

```jsx
import MMKV from "react-native-mmkv-storage";

MMKV.setInt("number", 10, data => console.log(data));
```

**Returns**
`boolean`

#

#### `MMKV.getIntAsync(key)`

Gets a number value for a given key.

**Arguments**
| Name | Type |
| ---- | -------- |
| key | String |

```jsx
import MMKV from "react-native-mmkv-storage";

let number = await MMKV.getIntAsync("number");
```

**Returns**
`Promise<number>`


#### `MMKV.getInt(key,callback)`

Gets a number value for a given key.

**Arguments**
| Name | Type |
| ---- | -------- |
| key | String |
|callback|Function|

```jsx
import MMKV from "react-native-mmkv-storage";

MMKV.getInt("number",number => console.log(number));

```

**Returns**
`number`

#


#### `MMKV.setBoolAsync(key,value)`

Sets a boolean value in storage for the given key.

**Arguments**
| Name | Type |
| ---- | -------- |
| key | String |
| value | boolean |

```jsx
import MMKV from "react-native-mmkv-storage";

await MMKV.setBoolAsync("myBooleanValue", false);
```

**Returns**
`Promise<boolean>`


#### `MMKV.setBool(key,value,callback)`

Sets a boolean value in storage for the given key.

**Arguments**
| Name | Type |
| ---- | -------- |
| key | String |
| value | boolean |
|callback|Function|

```jsx
import MMKV from "react-native-mmkv-storage";

MMKV.setBool("myBooleanValue", false, data => console.log(data));
```

**Returns**
`boolean`

#

#### `MMKV.getBoolAsync(key)`

Gets a boolean value for a given key.

**Arguments**
| Name | Type |
| ---- | -------- |
| key | String |

```jsx
import MMKV from "react-native-mmkv-storage";

let boolean = await MMKV.getBoolAsync("myBooleanValue");
```

**Returns**
`Promise<boolean>`

#### `MMKV.getBool(key,callback)`

Gets a boolean value for a given key.

**Arguments**
| Name | Type |
| ---- | -------- |
| key | String |
|callback|Function|

```jsx
import MMKV from "react-native-mmkv-storage";

MMKV.getBool("myBooleanValue",boolean => console.log(boolean));
```

**Returns**
`boolean`

#


#### `MMKV.setMapAsync(key,value)`

Sets an object to storage for the given key.

**Arguments**
| Name | Type |
| ---- | -------- |
| key | String |
| value | Object |

```jsx
import MMKV from "react-native-mmkv-storage";

let myObject = { foo: "foo", bar: "bar" };

await MMKV.setMapAsync("myobject", myObject);
```

**Returns**
`Promise<boolean>`

#### `MMKV.setMap(key,value,callback)`

Sets an object to storage for the given key.

**Arguments**
| Name | Type |
| ---- | -------- |
| key | String |
| value | Object |
|callback|Function|

```jsx
import MMKV from "react-native-mmkv-storage";

let object = { foo: "foo", bar: "bar" };

MMKV.setMap("object", object,data => console.log(data));
```

**Returns**
`boolean`

#

#### `MMKV.getMapAsync(key)`

Gets an object from storage.

**Arguments**
| Name | Type |
| ---- | -------- |
| key | String |

```jsx
import MMKV from "react-native-mmkv-storage";

let object = await MMKV.getMapAsync("object");
```

**Returns**
`Promise<object>`

#### `MMKV.getMap(key,callback)`

Gets an object from storage.

**Arguments**
| Name | Type |
| ---- | -------- |
| key | String |
|callback|Function|

```jsx
import MMKV from "react-native-mmkv-storage";

MMKV.getMap("object", object => console.log(object));
```

**Returns**
`object`

#

#### `MMKV.setArrayAsync(key,value)`

Sets an array to storage for the given key.

**Arguments**
| Name | Type |
| ---- | -------- |
| key | String |
| value | Array |

```jsx
import MMKV from "react-native-mmkv-storage";

let array = ["foo", "bar"];

await MMKV.setArrayAsync("array", array);
```

**Returns**
`Promise<boolean>`

#### `MMKV.setArray(key,value,callback)`

Sets an array to storage for the given key.

**Arguments**
| Name | Type |
| ---- | -------- |
| key | String |
| value | Array |
|callback|Function|

```jsx
import MMKV from "react-native-mmkv-storage";

let array = ["foo", "bar"];

MMKV.setArray("array", array, data => console.log(data));
```

**Returns**
`boolean`

#



#### `MMKV.getArrayAsync(key)`

Sets an array to storage for the given key.

**Arguments**
| Name | Type |
| ---- | -------- |
| key | String |

```jsx
import MMKV from "react-native-mmkv-storage";

let myArray = await MMKV.getArrayAsync("array");
```

**Returns**
`Promise<Array<>>`

#### `MMKV.getArray(key,callback)`

Sets an array to storage for the given key.

**Arguments**
| Name | Type |
| ---- | -------- |
| key | String |
| callback | Function |

```jsx
import MMKV from "react-native-mmkv-storage";

MMKV.getArray("array" array => console.log(array));
```

**Returns**
`Array<>`

#

#### `MMKV.getMultipleItemsAsync([keys])`

Retrieve multiple Objects for a given array of keys. **Currently will work only if data for all keys is an Object.**

**Arguments**
| Name | Type |
| ---- | -------- |
| keys | Array of Keys |

```jsx
import MMKV from "react-native-mmkv-storage";

let multipleItems = await MMKV.getMultipleItemsAsync(["foo", "bar", "loo"]);
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

If the value for the key is not an object but an array, the array will be wrapped in an object having key as the key in database and its value as the Array.

#

#### `MMKV.getMultipleItems([keys],callback)`

Retrieve multiple Objects for a given array of keys. **Currently will work only if data for all keys is an Object.**

**Arguments**
| Name | Type |
| ---- | -------- |
| keys | Array of Keys |
|callback|Function|

```jsx
import MMKV from "react-native-mmkv-storage";

MMKV.getMultipleItems(["foo", "bar", "loo"], objects => console.log(objects));
```

**Returns**
`Array<[]>`

The Array returned has the following structure:

```jsx
[
  ["foo", Object<any>],
  ["bar", Object<any>]
];
```
The first item in each array is the `key` for the object, and the second item is object itself. 

If the value for the key is not an object but an array, the array will be wrapped in an object having key as the key in database and its value as the Array.

#

#### `MMKV.hasKeyAsync(key)`

Check if a key exists in the storage.

**Arguments**
| Name | Type |
| ---- | -------- |
| key | String |

```jsx
import MMKV from "react-native-mmkv-storage";

MMKV.hasKeyAsync(key).then(result => {
  if (result) {
    // if true do this.
  } else {
    // if false do this.
  }
});
```

**Returns**
`Promise<boolean>`

#### `MMKV.hasKey(key,callback)`

Check if a key exists in the storage.

**Arguments**
| Name | Type |
| ---- | -------- |
| key | String |
|callback|Function|

```jsx
import MMKV from "react-native-mmkv-storage";

MMKV.hasKey(key,result => {
  if (result) {
    // if true do this.
  } else {
    // if false do this.
  }
});
```

**Returns**
`boolean`

#

#### `MMKV.getKeysAsync()`

Get all the keys in the storage.

```jsx
import MMKV from "react-native-mmkv-storage";

let keys = await MMKV.getKeysAsync();
});
```
**Returns**
`Promise<boolean>`

#### `MMKV.getKeys(callback)`

Get all the keys in the storage.

**Arguments**
| Name | Type |
| ---- | -------- |
| callback | Function |

```jsx
import MMKV from "react-native-mmkv-storage";

MMKV.getKeys(keys => console.log(keys));
```
**Returns**
`boolean`


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
