<div align="center">
<h1>react-native-mmkv-storage</h1>
</div>


[![](https://img.shields.io/npm/v/react-native-mmkv-storage.svg?style=flat-square)](https://www.npmjs.com/package/react-native-mmkv-storage)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](https://www.npmjs.com/package/react-native-mmkv-storage/blob/master/LICENSE)
[![](https://img.shields.io/npm/dt/react-native-mmkv-storage?style=flat-square)](https://www.npmjs.com/package/react-native-mmkv-storage)
[![Android](https://github.com/ammarahm-ed/react-native-mmkv-storage/actions/workflows/main.yml/badge.svg)](https://github.com/ammarahm-ed/react-native-mmkv-storage/actions/workflows/main.yml)
[![iOS](https://github.com/ammarahm-ed/react-native-mmkv-storage/actions/workflows/ios.yml/badge.svg)](https://github.com/ammarahm-ed/react-native-mmkv-storage/actions/workflows/ios.yml)


> An efficient, small & encrypted mobile key-value storage framework for React Native written in C++ using JSI

## What it is

This library aims to provide a fast & reliable solution for you data storage needs in react-native apps. It uses [MMKV](https://github.com/Tencent/MMKV) by Tencent under the hood on Android and iOS both that is used by their WeChat app(more than 1 Billion users). Unlike other storage solutions for React Native, this library lets you store any kind of data type, in any number of database instances, with or without encryption in a very fast and efficient way. Read about it on this blog post I wrote on [dev.to](https://dev.to/ammarahmed/best-data-storage-option-for-react-native-apps-42k)


## Features

- **Written in C++ using JSI**<br/>
  Starting from `v0.5.0` the library has been rewritten in C++ on Android and iOS both. It employs React Native JSI making it the fastest storage option for React Native.
- **Simple and lightweight**<br/>
  (~ 50K Android/30K iOS) and even smaller when packaged.
- **Fast and Efficient (0.0002s Read/Write Speed)**<br/>
  MMKV uses mmap to keep memory synced with file, and protobuf to encode/decode values to achieve best performance.
  You can see the benchmarks here: [Android](https://github.com/Tencent/MMKV/wiki/android_benchmark) & [iOS](https://github.com/Tencent/MMKV/wiki/iOS_benchmark)
- **Reactive using useMMKVStorage Hook**<br/>
  Starting from `v0.5.5`, thanks to the power of JSI, we now have our very own `useMMKVStorage` Hook. Think of it like a persisted state that will always write every change in storage and update your app UI instantly. It doesn't matter if you reload the app or restart it.
- **Multi-Process Support**<br/>
  MMKV supports concurrent read-read and read-write access between processes.
- **Create unlimited Database instances**<br/>
  You can create many database instances. This helps greatly if you have seperate logics/modules in the same app that use data differently, It also helps in better performance since each database instance is small instead of a single bulky database which makes things slower as it grows.
- **Full encryption support**<br/>
  The library supports full encryption on Android and iOS. You can choose to store your encryption key securely for continuious usage. The library uses Keychain on iOS and Android Keystore on android (API 23 and above). On android for lower api levels (API 22 and below), it uses [secure prefrences](https://github.com/scottyab/secure-preferences/) which provides not perfect but incremental security on older Android APIs.
- **Simple indexer and data querying**<br/>
  For each database instance, there is one global key index and then there are indexes of each type of data. So querying is easy and fast.
- **Supports redux-persist**<br/>
  Support for redux persist is also added starting from v0.3.2.


## Links 
  - [Documentation](https://rnmmkv.now.sh/#/)

## Quickstart

  - [Quickstart guide](https://rnmmkv.now.sh/#/gettingstarted)

## Contact & Support
- Create a GitHub issue for bug reports, feature requests, or questions
- Follow [@ammarahm-ed](https://github.com/ammarahm-ed) for announcements
- Add a ⭐️ [star on GitHub](https://github.com/ammarahm-ed/react-native-mmkv-storage/) or ❤️ tweet to support the project!

## RoadMap
You can track the upcoming features, changes and the future of this library in this [issue](https://github.com/ammarahm-ed/react-native-mmkv-storage/issues/13)

## I want to contribute
That is awesome news! There is alot happening at a very fast pace in this library right now. Every little help is precious. You can contribute in many ways:

- Suggest code improvements on native iOS and Android
- If you have suggestion or idea you want to discuss, open an issue.
- [Open an issue](https://github.com/ammarahm-ed/react-native-mmkv-storage/issues/) if you want to make a pull request, and tell me what you want to improve or add so we can discuss
- I am always open to new ideas

## License
This library is licensed under the [MIT license](https://github.com/ammarahm-ed/react-native-mmkv-storage/blob/master/LICENSE).

Copyright © Ammar Ahmed ([@ammarahm-ed](https://github.com/ammarahm-ed))
