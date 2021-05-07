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

Plug MMKV in `MainApplication.java`

```java
import com.ammarahmed.mmkv.RNMMKVJSIModulePackage; // <- add here
import com.facebook.react.bridge.JSIModulePackage; // <- add here
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
          @Override
          protected JSIModulePackage getJSIModulePackage() {
              return new RNMMKVJSIModulePackage();
          }
		//  
      };
```
If you are using `react-native-reanimated` library, follow the steps below instead.

1. Go to `node_modules/react-native-mmkv-storage/android/src/java/com/ammarahmed/mmkv` and copy file named `RNMMKVJSIModulePackage.java` to `Your Project/android/app/src/main/java/com/your/project/name/` and paste the file there.

2. Rename the file to `CustomMMKVJSIModulePackage.java`

2. Open the file in VSCode and make the following changes:

```java
package com.ammarahmed.mmkv; // <-- CHANGE TO YOUR PACKAGE NAME

import com.facebook.react.bridge.JSIModulePackage;
import com.facebook.react.bridge.JSIModuleSpec;
import com.facebook.react.bridge.JavaScriptContextHolder;
import com.facebook.react.bridge.ReactApplicationContext;
import java.util.Collections;
import java.util.List;

import com.swmansion.reanimated.ReanimatedJSIModulePackage; // <-- ADD THIS
import com.ammarahmed.mmkv.RNMMKVModule; // <-- ADD THIS


public class RNMMKVJSIModulePackage implements ReanimatedJSIModulePackage  { // <--- REPLACE RNMMKVJSIModulePackage implements JSIModulePackage with CustomMMKVJSIModulePackage extends ReanimatedJSIModulePackage
    @Override
    public List<JSIModuleSpec> getJSIModules(ReactApplicationContext reactApplicationContext, JavaScriptContextHolder jsContext) {
	    super.getJSIModules(reactApplicationContext, jsContext); // <-- ADD THIS
	
        reactApplicationContext.getNativeModule(RNMMKVModule.class).installLib(jsContext, reactApplicationContext.getFilesDir().getAbsolutePath() + "/mmkv");

        return Collections.emptyList();
    }
}

```
then import this file instead in `MainApplication.java` as mentioned above and make the following changes:

```java
import com.your.project.name.CustomMMKVJSIModulePackage; // <- add here
import com.facebook.react.bridge.JSIModulePackage; // <-- ADD THIS
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
          @Override
          protected JSIModulePackage getJSIModulePackage() {
              return new CustomMMKVJSIModulePackage();
          }
		//  
      };
```





if your build fails, check your NDK version & CMake version selected in Android Studio SDK Manager. Preferred selected version of NDK is 20.xx and CMake 3.10.2. Also make sure you do not have multiple CMake & NDK versions selected in SDK Manager.[Refer to this comment](https://github.com/ammarahm-ed/react-native-mmkv-storage/issues/67#issuecomment-801467636)

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
