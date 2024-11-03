package com.ammarahmed.mmkv

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.Promise

abstract class MmkvStorageSpec internal constructor(context: ReactApplicationContext) :
  ReactContextBaseJavaModule(context) {



  abstract fun install(): Boolean
}
