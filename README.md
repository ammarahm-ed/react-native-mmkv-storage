# react-native-fast-storage

react-native-fast-storage is a drop in replacement for `AsyncStorage`.

This library is the React Native implementation of https://github.com/Tencent/MMKV.

It provides very fast read and write access.

## Getting started

`$ npm install react-native-fast-storage --save`

`$ react-native link react-native-fast-storage`

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

## Usage

```javascript
import FastStorage,{setArray, getArray} from "react-native-fast-storage";

await FastStorage.setString("key", "Coucou toi");

const item = await FastStorage.getString("key");

await setArray('array',['a','b']);

const array = await getArray('array');

await FastStorage.setMap('map',{a:"a"});

const map = await FastStorage.getMap('map');



```

## Methods

All methods are asynchronous.

| Prop       |     Params      | Returns  | Description                    |
| :--------- | :-------------: | :------: | :----------------------------- |
| setString    |  `key`, `value` |  boolean |  Allows to set an String       |
| getString   |      `key`      |  value |  Retrieve the String            |
| setMap    |  `key`, `value` |  boolean |  Allows to set a Map     |
| getMap   |      `key`      |  Map |  Retrieve the Map           |
| setArray    |  `key`, `value` |  boolean |  Allows to set an Array     |
| getArray   |      `key`      |  Array |  Retrieve the Array         |
| getMultipleItems   |      `Array of Keys`      |  Array of Objects (Only works with keys which have Object as value) |  Retrieve Multiple Objects in a single request        |
| hasKey |      `key`      |   boolean   |  Check if a key exists |
| removeItem |      `key`      |   null   |  Remove an item from the store |
| clearStore |       none      |   null   |  Clear the entire store        |
