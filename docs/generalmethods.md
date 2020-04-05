# General Methods

Some useful general methods for each instance with a single variant.

First we create a default MMKV Instance

```js
import MMKVStorage from "react-native-mmkv-storage";

MMKV = new MMKVStorage.Loader().
.default()
.initialize()
.getInstance();

```

## removeItem

Remove an item for a given key.

**Arguments**

| Name | Type   |
| ---- | ------ |
| key  | String |

```js
await MMKV.removeItem(key);
```

## clearStore

Clear the storage.

```js
await MMKV.clearStore();
```

## clearMemoryCache

Clear the memory cache of an instance.

```js
await MMKV.clearMemoryCache();
```

## getAllMMKVInstances

Returns a list of all the MMKV Instance IDs created.

```js
let allInstances = await MMKV.getAllInstanceIDs();
```

## getCurrentMMKVInstances

get the currently initialized instance IDs.

```js
let intializedInstances = await MMKV.getCurrentMMKVInstanceIDs()
```
