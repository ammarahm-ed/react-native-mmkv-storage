# General Methods

Some useful general methods for each instance with a single variant.

First we create a default MMKV Instance

```js
import MMKVStorage from "react-native-mmkv-storage";

MMKV = new MMKVStorage.Loader().initialize();
```

## removeItem

Remove an item for a given key.

**Arguments**

| Name | Type   |
| ---- | ------ |
| key  | String |

```js
MMKV.removeItem(key);
```

## clearStore

Clear the storage.

```js
MMKV.clearStore();
```

## getAllMMKVInstances

Returns a list of all the MMKV Instance IDs created.

```js
let allInstances = MMKV.getAllInstanceIDs();
```

## getCurrentMMKVInstances

get the currently initialized instance IDs.

```js
let intializedInstances = MMKV.getCurrentMMKVInstanceIDs();
```
