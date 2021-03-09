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

Add this to your `android/app/build.gradle` file.

```
android {

...
packagingOptions {
    pickFirst '**/*.so'
    }

}
```

### iOS

1. Update your project deployment target to `11.0`

2. Update your deployment target in project Podfile

```
platform :ios, '11.0'
```

**Read Next:** [Creating an MMKV Instance](creatinginstance.md)
