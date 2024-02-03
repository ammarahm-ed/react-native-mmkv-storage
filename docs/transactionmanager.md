# Lifecycle Control with Transaction Manager

Listen to a value's lifecycle and mutate it on the go. Transactions lets you register lifecycle functions with your storage instance such as `onwrite`, `beforewrite`, `onread`, `ondelete`. This allows for a better and more managed control over the storage and also let's you build custom indexes with a few lines of code.

### `register`

Allows you to register a lifecycle function for a given data type.

**Arguments**

| Name                              | Required | Type                                                 | Description                                             |
| --------------------------------- | -------- | ---------------------------------------------------- | ------------------------------------------------------- |
| type                              | yes      | "string" / "number" / "object" / "array" / "boolean" | The type of data you want to register the function for. |
| transaction                       | yes      | "beforewrite" / "onwrite" /"onread" / "ondelete"     | When should the function be called                      |
| `mutator({key:string,value:any})` | no       | function                                             | The function that allows to mutate the value            |

### `unregister`

Unregister a lifecycle function for a given data type.

**Arguments**

| Name        | Required | Type                                                 | Description                                               |
| ----------- | -------- | ---------------------------------------------------- | --------------------------------------------------------- |
| type        | yes      | "string" / "number" / "object" / "array" / "boolean" | The type of data you want to unregister the function for. |
| transaction | yes      | "beforewrite" / "onwrite" / "onread" / "ondelete"    | type of transaction to unregister                         |

### `clear`

Clear all registered functions.

### How to use

Import `MMKVStorage` and `useMMKVStorage` Hook.

```js
import { MMKVLoader, useMMKVStorage } from 'react-native-mmkv-storage';
```

Initialize the `MMKVStorage` instance.

```js
const MMKV = new MMKVLoader().initialize();
```

### 1. Simple Developer Tooling

Debug what is happening during the lifecycle of your app. Track every single change and have better control and understanding your storage.

```js
MMKV.transactions.register('object', 'onwrite', ({ key, value }) => {
  console.log(MMKV.instanceID, 'object:onwrite: ', key, value);
});
```

### 2. Enable Custom Indexing

Building and storing custom indexes with a simple key/value storage can become difficult to manage. Transaction manager makes it a breeze to create and manage complex indexes.

Let's assume that we are storing user posts in storage and each post as a specific tag.

```js
MMKV.transactions.register('object', 'beforewrite', ({ key, value }) => {
  if (key.startsWith('post.')) {
    // Call this only when the key has the post prefix.
    let indexForTag = MMKV.getArray(`${value.tag}-index`) || [];
    MMKV.setArray(indexForTag.push(key));
  }
});
```

And then we use that index in a component that shows posts by tag.

```js
const PostByTag = ({tag}) => {
const [tagIndex,setTagIndex] = useMMKVStorage(`${tag}-index`,MMKV,[]);
const [posts,update,remove] = useIndex(tagIndex,"object", MMKV);

return <View>
    <FlatList
    data={posts}
    renderItem={...}
    >
</View>

}
```

This is a basic example but you can imagine the level of control you can achieve with this.

### 3. Enable Lower-Level Data Management

Abstraction of data in your storage. Anything that is affected by multiple factors in your storage can be put here. This also allows for easier debugging since such data is mutated in one place instead of tens of different places in the app, you can know exactly what is happening.

```js
MMKV.transactions.register('object', 'onwrite', ({ key, value }) => {
  if (!key.startsWith('posts.')) return; // only look at "posts." prefix keys
  // developer can update other fields based on this transaction
  MMKV.setIntAsync('postsCount', oldValue + 1);
});

MMKV.transactions.register('object', 'ondelete', ({ key }) => {
  if (!key.startsWith('posts.')) return; // only look at "posts." prefix keys
  // developer can update other fields based on this transaction
  MMKV.setIntAsync('postsCount', oldValue - 1);
});
```

### 4. Enable On-the-Fly Mutations

Mutate a value before read/write.

```js
const injectTimestamp = record => ({ ...record, timestamp: Date.now() });

MMKV.transactions.register('object', 'beforewrite', ({ key, value }) => {
  if (!key.startsWith('posts.')) return; // only look at "posts." namespace
  if (!!value.timestamp) return; // only run if timestamp is not in record already

  // Setup new transaction with properly structured data
  MMKV.setMapAsync(key, injectTimestamp(value));
});
```
