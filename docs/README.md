## react-native-mmkv-storage

> An efficient, small mobile key-value storage framework for React Native

## What it is

This library aims to provide a fast & reliable solution for you data storage needs in react-native apps. It uses [MMKV](https://github.com/Tencent/MMKV) by Tencent under the hood on Android and iOS both that is used by their WeChat app(more than 1 Billion users). Unlike other storage solutions for React Native, this library lets you store any kind of data type, in any number of database instances, with or without encryption in a very fast and efficient way. Read about it on this blog post I wrote on [dev.to](https://dev.to/ammarahmed/best-data-storage-option-for-react-native-apps-42k)

See the [Quick start](gettingstarted.md) guide for more details.

## Features

- **Simple and lightweight**<br/>
 (~ 50K Android/30K iOS) and even smaller when packaged.
- **Fast and Efficient**<br/>
MMKV uses mmap to keep memory synced with file, and protobuf to encode/decode values to achieve best performance.
  You can see the benchmarks here: [Android](https://github.com/Tencent/MMKV/wiki/android_benchmark) & [iOS](https://github.com/Tencent/MMKV/wiki/iOS_benchmark) 
- **Multi-Process Support**<br/>
MMKV supports concurrent read-read and read-write access between processes.
- **Create unlimited Database instances**<br/>
  You can create many database instances. This helps greatly if you have seperate logics/modules in the same app that use data differently, It also helps in better performance since each database instance is small instead of a single bulky database which makes things slower as it grows.
- **Full encryption support**<br/>
  The library supports full encryption on Android and iOS. Encryption key is securely stored for continuious usage. It uses Keychain on iOS and Android Keystore on android (API 23 and above). On android for lower api levels, it uses [secure prefrences](https://github.com/scottyab/secure-preferences/). 
- **Simple indexer and data querying**<br/>
  For each database instance, there is one global key index and then there are indexes of each type of data. So querying is easy and fast. You can get one type of data in a simple function easily.

- **All read/write occur on seperate dispatchQueue Thread**<br/>

## Contact & Support
- Create a GitHub issue for bug reports, feature requests, or questions
- Follow @ammarahm-ed for announcements
- Add a ⭐️ star on GitHub or ❤️ tweet to support the project!

## RoadMap
You can track the upcoming features, changes and the future of this library in this [issue](https://github.com/ammarahm-ed/react-native-mmkv-storage/issues/1)


## I want to contribute
That is awesome news! There is alot happening at a very fast pace in this library right now. Every little help is precious. You can contribute in many ways:

- Suggest code improvements on native iOS and Android
- Create an issue if you find a bug or have a suggestion
- Open an issue if you want to make a pull request, and tell me what you want to improve or add so we can discuss
- I am always open to new ideas

## License
This library is licensed under the [MIT license](https://github.com/ammarahm-ed/react-native-mmkv-storage/blob/master/LICENSE).

Copyright © Ammar Ahmed ([@ammarahm-ed](https://github.com/ammarahm-ed))
