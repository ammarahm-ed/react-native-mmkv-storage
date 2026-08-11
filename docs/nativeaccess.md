# Using MMKV from native code

The library ships the official MMKV native libraries and, on Android, the official
`com.tencent.mmkv` Java API. Both platforms read and write the same files that the
JavaScript API uses, so a value written from JavaScript is immediately visible to
native code and the other way around.

## Android

`com.tencent.mmkv.MMKV` is available to your app without adding any dependency:

```kotlin
import com.tencent.mmkv.MMKV

MMKV.initialize(this)
val storage = MMKV.mmkvWithID("default")
val token = storage?.decodeString("auth_token")
```

The instance ID is the one you passed to `MMKVLoader().withInstanceID(...)`, or
`"default"` if you did not set one.

### Do not add a separate MMKV dependency

Because this library already provides the `com.tencent.mmkv` classes, adding MMKV
again from Maven will conflict:

```groovy
dependencies {
    implementation("com.tencent:mmkv:1.3.9")
}
```

Gradle reports this as a capability conflict:

```
Cannot select module with conflict on capability 'com.tencent:mmkv:2.2.3'
also provided by ['com.tencent:mmkv:1.3.9' (compile)]
```

Remove the dependency. Two copies of MMKV in one process would open the same files
with separate locks, which risks corrupting them.

If a transitive dependency pulls MMKV in, exclude it:

```groovy
dependencies {
    implementation("some.library:that-uses-mmkv:1.0.0") {
        exclude group: "com.tencent", module: "mmkv"
    }
}
```

## iOS

MMKV comes from CocoaPods, so the Objective-C API is available directly:

```objc
#import <MMKV/MMKV.h>

[MMKV initializeMMKV:nil];
MMKV *storage = [MMKV mmkvWithID:@"default"];
NSString *token = [storage getStringForKey:@"auth_token"];
```

## Building MMKV from source

The Android build links a prebuilt `libmmkv.so` that ships with the package. It is
compiled from the vendored MMKV source in `MMKV/` against `c++_shared`, so there is
only one C++ runtime in your app.

The prebuilt libraries are compiled with the NDK pinned in `scripts/mmkv.env`, which
is the oldest NDK used by any supported React Native version (26.1.10909125, shipped
with React Native 0.76). React Native 0.78 and later use 27.1.12297006.

To compile MMKV from source as part of your own build instead, set this in
`android/gradle.properties`:

```properties
MmkvStorage_buildMmkvFromSource=true
```

This makes builds slower but is useful if you target an NDK older than the one the
prebuilt libraries were compiled with, or if you want to audit and build everything
from source yourself.
