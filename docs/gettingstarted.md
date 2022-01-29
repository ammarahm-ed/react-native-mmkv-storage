# Installation

Add the library to your React Native project.

```bash
npm install react-native-mmkv-storage
```
or

```bash
yarn add react-native-mmkv-storage
```

It's recommended that you upgrade your project to latest version of react native. However if you are on react native < 0.66.x run the following:

```
npx mmkv-link
```

### iOS Steps

```bash
pod install
```

### Manual Installation (For React Native 0.65.x & older)
If `npx mmkv-link` fails for some reason. You can follow the steps below and make the changes manually.

Update the Android Gradle plugin to `4.1+` (`android/build.gradle`) and `ndkVersion` define property:

```diff
// When SDK 30
buildscript {
    build {
         compileSdkVersion = 30
         targetSdkVersion = 30
+        ndkVersion = "21.4.7075529"
    }
    dependencies {
-        classpath 'com.android.tools.build:gradle:3.2.0'
+        classpath 'com.android.tools.build:gradle:4.2.2'

// When SDK 29
buildscript {
    build {
         compileSdkVersion = 29
         targetSdkVersion = 29
+        ndkVersion = "21.1.6352462"
    }
    dependencies {
-        classpath 'com.android.tools.build:gradle:3.2.0'
+        classpath 'com.android.tools.build:gradle:4.1.0'
```

Update Gradle version in `android/gradle/wrapper/gradle-wrapper.properties`

```diff
distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
-distributionUrl=https\://services.gradle.org/distributions/gradle-6.2-all.zip

// When SDK 30
+distributionUrl=https\://services.gradle.org/distributions/gradle-6.9-all.zip

// When SDK 29
+distributionUrl=https\://services.gradle.org/distributions/gradle-6.7-all.zip
```

#### Troubleshooting

if your build fails, check your NDK version & CMake version installed in Android Studio SDK Manager.
Also make sure you do not have multiple CMake & NDK versions selected in SDK Manager.[Refer to this comment](https://github.com/ammarahm-ed/react-native-mmkv-storage/issues/67#issuecomment-801467636)

##### `CMake 3.9.0 or higher is required. You are running version 3.6.0-rc2`

You can specify newer cmake version on CI using `local.properties`:

```bash
echo "cmake.dir=$ANDROID_HOME/cmake/3.10.2.4988404" >> android/local.properties

# Check installed cmake on CI
ls $ANDROID_HOME/cmake/ # 3.10.2.4988404  3.6.4111459
```

### iOS

1. Update your project deployment target to `11.0`

2. Update your deployment target in project Podfile

```
platform :ios, '11.0'
```

## No Debug Mode

You cannot attach chrome debugger if you are using >=0.5.0 version of this library since debugging is not available when JSI modules are used. You can use Flipper to debug if necessary.

##

**Read Next:** [Creating an MMKV Instance](creatinginstance.md)
