# Installation

## Supported versions

The library's own C++ is compiled by your app, and the codegen spec is generated at build time, so it builds against whatever React Native version your app uses.

| Architecture | React Native |
| --- | --- |
| New architecture (default since 0.76, the only mode since 0.82) | 0.75+, tested up to 0.87 |
| Old architecture | 0.71+ |

## Platform requirements

The library uses **MMKV 2.2.3**, which sets the platform floors:

| Platform | Requirement |
| --- | --- |
| iOS | Deployment target **13.0** or higher |
| Android | `minSdkVersion` 21 or higher |

::: warning
MMKV 2.x requires iOS 13. If your app's deployment target is lower, the podspec raises it to 13.0 rather than failing to resolve.
:::

On Android, MMKV ships as a prebuilt library and its official Java API comes with the package, so you can also use MMKV from Kotlin or Java. See [Using MMKV from native code](/nativeaccess).

## Install

```bash
npm install react-native-mmkv-storage
```

or

```bash
yarn add react-native-mmkv-storage
```

Then install the iOS pods:

```bash
cd ios && pod install
```

That is everything. Autolinking wires up the native module on both Android and iOS — there are no manual linking steps, Gradle edits or Podfile changes to make.

## Verify the install

```js
import { MMKVLoader } from 'react-native-mmkv-storage';

const storage = new MMKVLoader().initialize();
storage.setString('hello', 'world');
console.log(storage.getString('hello')); // => "world"
```

## Debugging

This is a JSI library: its methods are C++ functions installed directly on the JavaScript runtime's global object.

::: warning
The legacy Chrome remote debugger is not supported. With remote debugging your JavaScript runs in V8 inside the browser, where the JSI bindings do not exist, so the storage cannot reach the native layer.
:::

Use **React Native DevTools** (the Hermes debugger, opened with `j` in the Metro terminal) instead. It runs the JS on device, so JSI works normally and you can debug the library like any other code.

If the library detects that remote debugging is active, it installs an in-memory adapter instead of failing, and logs a warning. Your app keeps running and every API behaves as usual, but nothing is written to disk — values are lost on reload.

::: tip Read next
[Creating an instance](/creatinginstance)
:::
