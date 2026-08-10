package com.ammarahmed.mmkv

import com.facebook.react.bridge.ReactApplicationContext

abstract class MmkvStorageSpec internal constructor(context: ReactApplicationContext) :
  NativeMMKVStorageSpec(context) {
}
