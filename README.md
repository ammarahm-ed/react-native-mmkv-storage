# react-native-fast-storage

react-native-fast-storage is a synchronous drop in replacement for `AsyncStorage`.

## Getting started

`$ npm install react-native-fast-storage --save`

`$ react-native link react-native-fast-storage`

## Usage

```javascript
import FastStorage from "react-native-fast-storage";

FastStorage.setItem("key", "Coucou toi");

const item = FastStorage.getItem("key"); // Coucou toi
```
