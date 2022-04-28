# Querying and Indexing

MMKV provides a simple querying system. You can check if a key exists in the database and you can query all keys. This library adds an extra layer of indexing. Each data type for every instance of MMKV maintains its own index. Hence you can also check if a key exists in a specific data type index, for example you can check if a key exists in strings or maps etc. Also you can query all keys for a specific data type.

First we create a default MMKV Instance

```js
import { MMKVLoader } from "react-native-mmkv-storage";

MMKV = new MMKVLoader().initialize();
```

# Instance Indexer

Stores keys of all types in one place.

##### hasKey

Check if any data exists for a given key.

**Arguments**
| Name | Type   |
|------|--------|
| key  | String |

```jsx
MMKV.indexer.hasKey("your key").then((result) => {
  if (result) {
    // if true do this.
  } else {
    // if false do this.
  }
});
```

**Returns**
`Promise<boolean>`

##### getKeys

Get all the keys in the storage for all stored items.

```jsx

let keys = await MMKV.indexer.getKeys();
});
```

**Returns**
`Promise<string[]>`

# Strings Indexer

Index of all the strings in storage.

##### hasKey

Check if any data exists for a given key.

**Arguments**
| Name | Type   |
|------|--------|
| key  | String |

```jsx
MMKV.indexer.strings.hasKey("your key").then((result) => {
  if (result) {
    // if true do this.
  } else {
    // if false do this.
  }
});
```

**Returns**
`Promise<boolean>`

##### getKeys

Get all the keys in the Storage indexer for all stored items.

```jsx

let keys = await MMKV.indexer.strings.getKeys();
});
```

**Returns**
`Promise<boolean>`

##### getAll

Get all strings in the storage.

```jsx

let strings = await MMKV.indexer.strings.getAll();

});
```

**Returns**
`Promise<Array<>>`

The Array returned has the following structure:

```js
[
  [key, data],
  [key, data],
];
```

The first item in each array is the `key` for the data, and the second item is object itself.

# Number Indexer

Index of all the numbers in storage.

##### hasKey

Check if any number exists for a given key.

**Arguments**
| Name | Type   |
|------|--------|
| key  | String |

```jsx
MMKV.indexer.numbers.hasKey("your key").then((result) => {
  if (result) {
    // if true do this.
  } else {
    // if false do this.
  }
});
```

**Returns**
`Promise<boolean>`

##### getKeys

Get all the keys in the number indexer for all stored items.

```jsx

let keys = await MMKV.indexer.numbers.getKeys();
});
```

**Returns**
`Promise<boolean>`

##### getAll

Get all numbers stored in the storage.

```jsx

let numbers = await MMKV.indexer.numbers.getAll();

});
```

**Returns**
`Promise<Array<>>`

The Array returned has the following structure:

```js
[
  [key, data],
  [key, data],
];
```

The first item in each array is the `key` for the data, and the second item is object itself.

# Boolean Indexer

Index of all the booleans in storage.

##### hasKey

Check if any boolean exists for a given key.

**Arguments**
| Name | Type   |
|------|--------|
| key  | String |

```jsx
MMKV.indexer.booleans.hasKey("your key").then((result) => {
  if (result) {
    // if true do this.
  } else {
    // if false do this.
  }
});
```

**Returns**
`Promise<boolean>`

##### getKeys

Get all the keys in the boolean indexer for all stored items.

```jsx

let keys = await MMKV.indexer.booleans.getKeys();
});
```

**Returns**
`Promise<boolean>`

##### getAll

Get all booleans stored in the storage.

```jsx

let booleans = await MMKV.indexer.booleans.getAll();

});
```

**Returns**
`Promise<Array<>>`

The Array returned has the following structure:

```js
[
  [key, data],
  [key, data],
];
```

The first item in each array is the `key` for the data, and the second item is object itself.

# Map Indexer

Index of all the objects in storage.

##### hasKey

Check if any objects exists for a given key.

**Arguments**
| Name | Type   |
|------|--------|
| key  | String |

```jsx
MMKV.indexer.maps.hasKey("your key").then((result) => {
  if (result) {
    // if true do this.
  } else {
    // if false do this.
  }
});
```

**Returns**
`Promise<boolean>`

##### getKeys

Get all the keys in the objects indexer for all stored items.

```jsx

let keys = await MMKV.indexer.maps.getKeys();
});
```

**Returns**
`Promise<boolean>`

##### getAll

Get all objects stored in the storage.

```jsx

let numbers = await MMKV.indexer.maps.getAll();

});
```

**Returns**
`Promise<Array<>>`

The Array returned has the following structure:

```js
[
  [key, data],
  [key, data],
];
```

The first item in each array is the `key` for the data, and the second item is object itself.

# Arrays Indexer

Index of all the arrays in storage.

##### hasKey

Check if any array exists for a given key.

**Arguments**
| Name | Type   |
|------|--------|
| key  | String |

```jsx
MMKV.indexer.arrays.hasKey("your key").then((result) => {
  if (result) {
    // if true do this.
  } else {
    // if false do this.
  }
});
```

**Returns**
`Promise<boolean>`

##### getKeys

Get all the keys in the array indexer for all stored items.

```jsx

let keys = await MMKV.indexer.arrays.getKeys();
});
```

**Returns**
`Promise<boolean>`

##### getAll

Get all arrays stored in the storage.

```jsx

let numbers = await MMKV.indexer.arrays.getAll();

});
```

**Returns**
`Promise<Array<>>`

The Array returned has the following structure:

```js
[
  [key, data],
  [key, data],
];
```

The first item in each array is the `key` for the data, and the second item is object itself.
