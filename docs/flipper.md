# Flipper support

Thanks to [pnthach95](https://github.com/pnthach95/flipper-plugin-react-native-mmkv-storage/commits?author=pnthach95) Flipper plugin is finally here. It supports logging and manipulating storage values on the fly.

- Desktop plugin: https://github.com/pnthach95/flipper-plugin-react-native-mmkv-storage
- React Native plugin: https://github.com/pnthach95/rn-mmkv-storage-flipper

## Features

- Logging on read/write
- Edit values on the fly. If you use `useMMKVStorage` hook. Values will update automatically.

![gif](https://github.com/pnthach95/flipper-plugin-react-native-mmkv-storage/raw/main/docs/example.gif)

_\* Tested on Flipper v0.152.0, React Native v0.68.2, RN MMKV Storage source code from github_

## Installation

Open Flipper and search on Plugin Manager

![](https://github.com/pnthach95/flipper-plugin-react-native-mmkv-storage/raw/main/docs/manager.png)

On your React Native project, install plugin:

```bash
yarn add react-native-flipper rn-mmkv-storage-flipper --dev
```

or

```bash
npm i react-native-flipper rn-mmkv-storage-flipper -D
```

And update your code:

```js
import {MMKVLoader} from 'react-native-mmkv-storage';
import mmkvFlipper from 'rn-mmkv-storage-flipper';

const MMKV = new MMKVLoader()
  .withInstanceID('test')
  .withEncryption()
  .initialize();

if (__DEV__) {
  mmkvFlipper(MMKV);
}
```
