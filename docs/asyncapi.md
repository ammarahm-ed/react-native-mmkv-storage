# Promise API

A promise based api is provided.

First we create a default MMKV Instance

```js
import MMKVStorage from "react-native-mmkv-storage";

MMKV = new MMKVStorage.Loader().initialize();
```

## setStringAsync

Sets a string value in storage for the given key.

**Arguments**

| Name  | Type   |
|-------|--------|
| key   | String |
| value | String |

```js
await MMKV.setStringAsync("string", "string");
```

**Returns**
`Promise<boolean>`

## getStringAsync

Gets a string value for a given key.

**Arguments**

| Name | Type   |
|------|--------|
| key  | String |

```js
let string = await MMKV.getStringAsync("string");
```

**Returns**
`Promise<string>`

## setIntAsync

Sets a number value in storage for the given key.

**Arguments**

| Name  | Type   |
|-------|--------|
| key   | String |
| value | Number |

```js
await MMKV.setIntAsync("number", 10);
```

**Returns**
`Promise<boolean>`

## getIntAsync

Gets a number value for a given key.

**Arguments**

| Name | Type   |
|------|--------|
| key  | String |

```js
let number = await MMKV.getIntAsync("number");
```

**Returns**
`Promise<number>`

## setBoolAsync

Sets a boolean value in storage for the given key.

**Arguments**

| Name  | Type    |
|-------|---------|
| key   | String  |
| value | boolean |

```js
await MMKV.setBoolAsync("myBooleanValue", false);
```

**Returns**
`Promise<boolean>`

## getBoolAsync

Gets a boolean value for a given key.

**Arguments**

| Name | Type   |
|------|--------|
| key  | String |

```js
let boolean = await MMKV.getBoolAsync("myBooleanValue");
```

**Returns**
`Promise<boolean>`

## setMapAsync

Sets an object to storage for the given key.

**Arguments**

| Name  | Type   |
|-------|--------|
| key   | String |
| value | Object |

```js
let myObject = { foo: "foo", bar: "bar" };

await MMKV.setMapAsync("myobject", myObject);
```

**Returns**
`Promise<boolean>`

## getMapAsync

Gets an object from storage.

**Arguments**

| Name | Type   |
|------|--------|
| key  | String |

```js
let object = await MMKV.getMapAsync("object");
```

**Returns**
`Promise<object>`

## setArrayAsync

Sets an array to storage for the given key.

**Arguments**

| Name  | Type   |
|-------|--------|
| key   | String |
| value | Array  |

```js
let array = ["foo", "bar"];

await MMKV.setArrayAsync("array", array);
```

**Returns**
`Promise<boolean>`

## getArrayAsync

Sets an array to storage for the given key.

**Arguments**

| Name | Type   |
|------|--------|
| key  | String |

```js
let myArray = await MMKV.getArrayAsync("array");
```

**Returns**
`Promise<Array<>>`

## getMultipleItemsAsync

Retrieve multiple Objects for a given array of keys. **Currently will work only if data for all keys is an Object.**

**Arguments**


| Name | Type          |
|------|---------------|
| keys | Array of Keys |

```js
let multipleItems = await MMKV.getMultipleItemsAsync(["foo", "bar", "loo"]);
```

**Returns**
`Promise<Array<[]>>`

The Array returned has the following structure:

```js
[
  ["foo", Object<any>],
  ["bar", Object<any>]
];
```

The first item in each array is the `key` for the object, and the second item is object itself.

If the value for the key is not an object but an array, the array will be wrapped in an object having key as the key in database and its value as the Array.
