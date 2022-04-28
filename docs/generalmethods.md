# General Methods

Some useful general methods for each instance with a single variant.

First we create a default MMKV Instance

```js
import { MMKVLoader } from "react-native-mmkv-storage";

MMKV = new MMKVLoader().initialize();
```

## removeItem

Remove an item for a given key.

**Arguments**

| Name | Type   |
|------|--------|
| key  | String |

```js
MMKV.removeItem(key);
```

## clearStore

Clear the storage.

```js
MMKV.clearStore();
```

## clearMemoryCache

Clear the storage from memory.

```js
MMKV.clearMemoryCache();
```

## getAllMMKVInstanceIDs

Returns a list of all the MMKV Instance IDs created.

```js
let allInstances = MMKV.getAllMMKVInstanceIDs();
```

## getCurrentMMKVInstances

get the currently initialized instance IDs.

```js
let intializedInstances = MMKV.getCurrentMMKVInstanceIDs();
```

## getKey

get the encryption key for the current MMKV instance

```js
let key = MMKV.getKey();
```
