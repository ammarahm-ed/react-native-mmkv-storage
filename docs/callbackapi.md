# Synchronous API

Synchronous calls is 8 to 10 times faster than Asynchronous calls. 

However If you are on <=0.5.3 at the very start of your app lifecycle, you cannot use Synchronous API with return values, only callbacks. A callback function can be optionally provided in case you need some value at the very beginning of app load, usually you won't need to.

Starting from `0.5.4` all calls are Synchronous and you should not use the callbacks anymore.

First we create a default MMKV Instance

```js
import { MMKVLoader } from "react-native-mmkv-storage";

MMKV = new MMKVLoader().initialize();
```

## setString

Sets a string value in storage for the given key.

**Arguments**

| Name     | Type     |
|----------|----------|
| key      | String   |
| value    | String   |

```js
MMKV.setString("string", "string");
```

## getString

Gets a string value for a given key.

**Arguments**

| Name     | Type     |
|----------|----------|
| key      | String   |

```js
MMKV.getString("string");
```

**Returns**
`string`

## setInt

Sets a number value in storage for the given key.

**Arguments**

| Name     | Type     |
|----------|----------|
| key      | String   |
| value    | Number   |
| callback | Function |

```js
MMKV.setInt("number", 10);
```

## getInt

Gets a number value for a given key.

**Arguments**

| Name     | Type     |
|----------|----------|
| key      | String   |
| callback | Function |

```js
MMKV.getInt("number");
```

**Returns**
`number`

## setBool

Sets a boolean value in storage for the given key.

**Arguments**

| Name     | Type     |
|----------|----------|
| key      | String   |
| value    | boolean  |
| callback | Function |

```js
MMKV.setBool("boolean", true);
```

## getBool

Gets a boolean value for a given key.

**Arguments**

| Name     | Type     |
|----------|----------|
| key      | String   |
| callback | Function |

```js
MMKV.getBool("boolean");
```

**Returns**
`boolean`

## setMap

Sets an object to storage for the given key.

**Arguments**

| Name     | Type     |
|----------|----------|
| key      | String   |
| value    | Object   |
| callback | Function |

```js
let object = {
  foo: "foo",
  bar: "bar",
};

MMKV.setMap("object", object);
```

## getMap

Gets an object from storage.

**Arguments**

| Name     | Type     |
|----------|----------|
| key      | String   |
| callback | Function |

```js
let object = MMKV.getMap("object");
```

**Returns**
`object`

## setArray

Sets an array to storage for the given key.

**Arguments**

| Name     | Type     |
|----------|----------|
| key      | String   |
| value    | Array    |
| callback | Function |

```js
let array = ["foo", "bar"];

MMKV.setArray("array", array);
```

## getArray

Sets an array to storage for the given key.

**Arguments**

| Name     | Type     |
|----------|----------|
| key      | String   |
| callback | Function |

```js
let array = MMKV.getArray("array");
```

**Returns**
`Array<>`

## getMultipleItems

Retrieve multiple Objects for a given array of keys. **Currently will work only if data for all keys is an Object.**

**Arguments**

| Name     | Type                                   |
|----------|----------------------------------------|
| keys     | Array of Keys                          |
| type     | "string","bool","number","map","array" |
| callback | Function                               |

```js
import MMKV from "react-native-mmkv-storage";

let items = MMKV.getMultipleItems(["foo", "bar", "loo"], "map");
```

**Returns**
`Array<[]>`

The Array returned has the following structure:

```js
[
    ["foo", Object < any > ],
    ["bar", Object < any > ]
];
```

The first item in each array is the `key` for the object, and the second item is object itself.

If the value for the key is not an object but an array, the array will be wrapped in an object having key as the key in database and its value as the Array.

**Returns**
`Promise<boolean>`
