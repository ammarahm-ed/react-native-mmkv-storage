# Callback API

A simple callback API is also available for even better performance boost.

First we create a default MMKV Instance

```js
import MMKVStorage from "react-native-mmkv-storage";

MMKV = await new MMKVStorage.Loader().initialize()

```

## setString

Sets a string value in storage for the given key.

**Arguments**
| Name | Type |
| ---- | -------- |
| key | String |
| value | String |
| callback | Function |

```js
MMKV.setString("string", "string", (error, result) => {
  if (error) {
    console.log(error);
    return;
  }

  console.log(result);
});
```

## getString

Gets a string value for a given key.

**Arguments**
| Name | Type |
| ---- | -------- |
| key | String |
|callback |Function|

```js
MMKV.getString("string", (error, result) => {
  if (error) {
    console.log(error);
    return;
  }

  console.log(result); // Logs 'string';
});
```

**Returns**
`string`

## setInt

Sets a number value in storage for the given key.

**Arguments**
| Name | Type |
| ---- | -------- |
| key | String |
| value | Number |
|callback| Function |

```js
MMKV.setInt("number", 10, (error, result) => {
  if (error) {
    console.log(error);
    return;
  }

  console.log(result); //Logs true;
});
```

**Returns**
`boolean`

## getInt

Gets a number value for a given key.

**Arguments**
| Name | Type |
| ---- | -------- |
| key | String |
|callback|Function|

```js
MMKV.getInt("number", (error, result) => {
  if (error) {
    console.log(error);
    return;
  }

  console.log(result); // logs 10;
});
```

**Returns**
`number`

## setBool

Sets a boolean value in storage for the given key.

**Arguments**
| Name | Type |
| ---- | -------- |
| key | String |
| value | boolean |
|callback|Function|

```js
MMKV.setBool("boolean", true, (error, result) => {
  if (error) {
    console.log(error);
    return;
  }

  console.log(result); // logs true;
});
```

**Returns**
`boolean`

## getBool

Gets a boolean value for a given key.

**Arguments**
| Name | Type |
| ---- | -------- |
| key | String |
|callback|Function|

```js
MMKV.getBool("boolean", (error, result) => {
  if (error) {
    console.log(error);
    return;
  }

  console.log(result); // logs true;
});
```

**Returns**
`boolean`

## setMap

Sets an object to storage for the given key.

**Arguments**
| Name | Type |
| ---- | -------- |
| key | String |
| value | Object |
|callback|Function|

```js
let object = { foo: "foo", bar: "bar" };

MMKV.setMap("object", object, (error, result) => {
  if (error) {
    console.log(error);
    return;
  }

  console.log(result); // logs true;
});
```

**Returns**
`boolean`

#

## getMap

Gets an object from storage.

**Arguments**
| Name | Type |
| ---- | -------- |
| key | String |
|callback|Function|

```js
MMKV.getMap("object", (error, result) => {
  if (error) {
    console.log(error);
    return;
  }

  let object = result;

  console.log(object); // logs object
});
```

**Returns**
`object`

## setArray

Sets an array to storage for the given key.

**Arguments**
| Name | Type |
| ---- | -------- |
| key | String |
| value | Array |
|callback|Function|

```js
let array = ["foo", "bar"];

MMKV.setArray("array", array, (error, result) => {
  if (error) {
    console.log(error);
    return;
  }

  console.log(result); // logs true
});
```

**Returns**
`boolean`

## getArray

Sets an array to storage for the given key.

**Arguments**
| Name | Type |
| ---- | -------- |
| key | String |
| callback | Function |

```js

MMKV.getArray("array" array => console.log(array));
MMKV.getArray("array" , (error, result) => {

 if (error) {
   console.log(error)
   return;
   }

let array = result;

console.log(array) // logs array

});

```

**Returns**
`Array<>`

## getMultipleItems

Retrieve multiple Objects for a given array of keys. **Currently will work only if data for all keys is an Object.**

**Arguments**
| Name | Type |
| ---- | -------- |
| keys | Array of Keys |
|callback|Function|

```js
import MMKV from "react-native-mmkv-storage";

MMKV.getMultipleItems(["foo", "bar", "loo"], objects => console.log(objects));

MMKV.getMultipleItems(["foo", "bar", "loo"], (error, result) => {
  if (error) {
    console.log(error);
    return;
  }

  let objects = result;

  console.log(objects); // logs objects
});
```

**Returns**
`Array<[]>`

The Array returned has the following structure:

```js
[
  ["foo", Object<any>],
  ["bar", Object<any>]
];
```

The first item in each array is the `key` for the object, and the second item is object itself.

If the value for the key is not an object but an array, the array will be wrapped in an object having key as the key in database and its value as the Array.

**Returns**
`Promise<boolean>`
