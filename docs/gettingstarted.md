# Installation

Add the library to your existing React Native project.

```bash
npm install react-native-mmkv-storage
```

or

```bash
yarn add react-native-mmkv-storage
```

Run the following inside ios folder in your project to add the MMKV.framework

```bash
pod install
```

## >=0.5.0 Installation Steps

### Android

No extra steps are required on android. However, if your build fails, check your NDK version & CMake version selected in Android Studio SDK Manager. Preferred selected version of NDK is 20.xx and CMake 3.10.2. Also make sure you do not have multiple CMake & NDK versions selected in SDK Manager.[Refer to this comment](https://github.com/ammarahm-ed/react-native-mmkv-storage/issues/67#issuecomment-801467636)

### iOS


1. Update your project deployment target to `11.0`

2. Update your deployment target in project Podfile

```
platform :ios, '11.0'
```

## No Debug Mode
You cannot attach chrome debugger if you are using >=0.5.0 version of this library since debugging is not available when JSI modules are used. You can use Flipper to debug if necessary.

**Read Next:** [Creating an MMKV Instance](creatinginstance.md)
