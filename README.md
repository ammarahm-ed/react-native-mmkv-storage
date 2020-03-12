
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

`$ yarn react-native-mmkv-storage`

If you are on react-native@0.59 or below you need to use the following to link the library.

`$ react-native link react-native-mmkv-storage`


**Additional IOS step**

If you encounter this error :

```
ld: warning: Could not find auto-linked framework 'MMKV'
```
You need to manually follow these steps :

- Open up your project in Xcode
- Select the main target (under "Targets"),
- Go to the "Build Settings" tab, and find the "Framework Search Paths" section.
- Add `../node_modules/react-native-fast-storage/ios` (non-recursive) for each of your configurations (e.g. Debug and Release).
- Find the MMKV.framework file in ../node_modules/react-native-fast-storage/ios and drag it into Xcode under the "Frameworks" section. In the dialog that pops up, uncheck "Copy items if needed", choose "Create groups", and ensure your main target is checked under "Add to targets".
- In Xcode, select the project, then select the main target (under "Targets"), then go to the "General" tab and find the "Embedded Binaries" section. Click the "+" icon and select MMKV.framework which appears under "Frameworks" then click "Add".
- In Xcode do "Product" -> "Clean".



<div align="center">
<h1>Storage API</h1>
</div>

#### `MMKV.setString(key,value)`
Sets a string value in storage for the given key.

**Arguments**
| Name | Type |
| ---- | -------- |
| key | String |
| value | String |


```jsx
import MMKV from "react-native-mmkv-storage";

await MMKV.setString('myString','helloworld');
```

**Returns**
`boolean`
#
#### `MMKV.getString(key)`
Gets a string value for a given key.

**Arguments**
| Name | Type |
| ---- | -------- |
| key | String |

```jsx
import MMKV from "react-native-mmkv-storage";

await MMKV.getString('string');
```

**Returns**
`A string value`

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

let myObject = {foo:"foo",bar:"bar"};

await MMKV.setMap('myobject', myObject );
```

**Returns**
`boolean`

#
#### `MMKV.getMap(key)`
Gets an object from storage.

**Arguments**
| Name | Type |
| ---- | -------- |
| key | String |

```jsx
import MMKV from "react-native-mmkv-storage";

await MMKV.getMap('myobject');
```

**Returns**
`An Object`

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

let myArray = ["foo", "bar"]

await MMKV.setArray('myArray', myArray);
```

**Returns**
`boolean`

#
#### `MMKV.getArray(key)`
Sets an array to storage for the given key.

**Arguments**
| Name | Type |
| ---- | -------- |
| key | String |

```jsx
import MMKV from "react-native-mmkv-storage";

await MMKV.getArray('myArray');
```

**Returns**
`An Array`

#
#### `MMKV.getMultipleItems([keys])`
Retrieve multiple Objects for a given array of keys. **Currently will work only if data for all keys is an Object.**

**Arguments**
| Name | Type |
| ---- | -------- |
| keys | Array of Keys |

```jsx
import MMKV from "react-native-mmkv-storage";

await MMKV.getMultipleItems(["foo","bar","loo"]);
```

**Returns**
`An array of objects`


#
#### `MMKV.hasKey(key)`
Check if a key exists in the storage.

**Arguments**
| Name | Type |
| ---- | -------- |
| key | String |

```jsx
import MMKV from "react-native-mmkv-storage";

await MMKV.hasKey(key);
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
