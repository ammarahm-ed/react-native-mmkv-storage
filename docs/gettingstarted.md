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

#### Installing with `npx mmkv-link`

If you're using RN 0.60 or higher, you can benefit from autolinking for some of the necessary installation steps. But unlike most other libraries, `react-native-mmkv-storage` requires you to make a few changes to native files.

We've simplified the process through a set of scripts. So to make all the necessary changes automatically, in your project's root folder run:

```bash
npx mmkv-link
```

Make sure to commit the changes introduced by the mmkv-link script.

#### Manual Installation

If installation with `npx mmkv-link` did not work, follow the manual installation steps below.

Plug MMKV in `MainApplication.java`, skip to next part if you are using `react-native-reanimated@v2` library, follow the steps below instead.

```diff
+import com.ammarahmed.mmkv.RNMMKVJSIModulePackage; // <- add here
+import com.facebook.react.bridge.JSIModulePackage; // <- add here
public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost =
      new ReactNativeHost(this) {
        @Override
        public boolean getUseDeveloperSupport() {
          return BuildConfig.DEBUG;
        }

        @Override
        protected List<ReactPackage> getPackages() {
          @SuppressWarnings("UnnecessaryLocalVariable")
          List<ReactPackage> packages = new PackageList(this).getPackages();
          // Packages that cannot be autolinked yet can be added manually here, for example:
          // packages.add(new MyReactNativePackage());
          return packages;
        }

        @Override
        protected String getJSMainModuleName() {
          return "index";
        }

		// add this method to load our JSI Module.
+          @Override
+          protected JSIModulePackage getJSIModulePackage() {
+              return new RNMMKVJSIModulePackage();
+          }
		//
      };
```

If you are using `react-native-reanimated@v2` library, follow the steps below instead.

1. Go to `node_modules/react-native-mmkv-storage/android/src/java/com/ammarahmed/mmkv` and copy file named `RNMMKVJSIModulePackage.java` to `Your Project/android/app/src/main/java/com/your/project/name/` and paste the file there.

2. Rename the file to `CustomMMKVJSIModulePackage.java`

3. Open the file in VSCode and make the following changes:

```diff
+package com.ammarahmed.mmkv; // <-- CHANGE TO YOUR PACKAGE NAME

import com.facebook.react.bridge.JSIModulePackage;
import com.facebook.react.bridge.JSIModuleSpec;
import com.facebook.react.bridge.JavaScriptContextHolder;
import com.facebook.react.bridge.ReactApplicationContext;
import java.util.Collections;
import java.util.List;

+import com.swmansion.reanimated.ReanimatedJSIModulePackage; // <-- ADD THIS
+import com.ammarahmed.mmkv.RNMMKVModule; // <-- ADD THIS


+public class RNMMKVJSIModulePackage implements ReanimatedJSIModulePackage  { // <--- REPLACE RNMMKVJSIModulePackage implements JSIModulePackage with CustomMMKVJSIModulePackage extends ReanimatedJSIModulePackage
    @Override
    public List<JSIModuleSpec> getJSIModules(ReactApplicationContext reactApplicationContext, JavaScriptContextHolder jsContext) {
        reactApplicationContext.getNativeModule(RNMMKVModule.class).installLib(jsContext, reactApplicationContext.getFilesDir().getAbsolutePath() + "/mmkv");

+        return super.getJSIModules(reactApplicationContext, jsContext); // <-- ADD THIS
    }
}

```

then import this file instead in `MainApplication.java` as mentioned above and make the following changes:

```diff
+import com.your.project.name.CustomMMKVJSIModulePackage; // <- add here
+import com.facebook.react.bridge.JSIModulePackage; // <-- ADD THIS
public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost =
      new ReactNativeHost(this) {
        @Override
        public boolean getUseDeveloperSupport() {
          return BuildConfig.DEBUG;
        }

        @Override
        protected List<ReactPackage> getPackages() {
          @SuppressWarnings("UnnecessaryLocalVariable")
          List<ReactPackage> packages = new PackageList(this).getPackages();
          // Packages that cannot be autolinked yet can be added manually here, for example:
          // packages.add(new MyReactNativePackage());
          return packages;
        }

        @Override
        protected String getJSMainModuleName() {
          return "index";
        }

		// add this method to load our CustomMMKVJSIModulePackage.
+          @Override
+          protected JSIModulePackage getJSIModulePackage() {
+              return new CustomMMKVJSIModulePackage();
+          }
		//
      };
```

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
+        classpath 'com.android.tools.build:gradle:3.2.0'
-        classpath 'com.android.tools.build:gradle:4.2.2'

// When SDK 29
buildscript {
    build {
         compileSdkVersion = 29
         targetSdkVersion = 29
+        ndkVersion = "21.1.6352462"
    }
    dependencies {
+        classpath 'com.android.tools.build:gradle:3.2.0'
-        classpath 'com.android.tools.build:gradle:4.1.0'
```

Update Gradle version

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
