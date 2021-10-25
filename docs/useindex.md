# useIndex hook

A hook that will take an array of keys and returns an array of values for those keys. This is supposed to work in combination with [Transactions](transactionmanager.md). When you have build your custom index, you will need an easy and quick way to load values for your index. useIndex hook actively listens to all read/write changes and updates the values accordingly.

**Arguments**
| Name | Required | Type | Description |
|-------------------|----------|------------------------------------------------------|----------------------------------------------------------------------------|
| index | yes | Array | The type of data you want to register the function for. |
| type | yes | "string" / "number" / "object" / "array" / "boolean" | Type of values in index |
| [`MMKVStorage.API`](callbackapi.md) | no | `MMKVStorage.API` | MMKV storage instance created from `new MMKVStorage.Loader().initialize()` |

**returns:** `[values,update,remove]`

#### `values`

An array of values for the given index

#### `update(key:string,value:any)`

A function that allows to update a key in an index. You can also add new ones.

#### `remove(key:string)`

Remove an item from index and storage.

### How to use

Here's a simple example use case

```js
const MyComponent = () => {
    const postsIndex = useMMKVStorage("postsIndex",MMKV,[]);
    const [posts] = useIndex(postsIndex,"object" MMKV);

    return <View>
    <FlatList
    data={posts}
    renderItem={...}
    >
</View>

}
```
