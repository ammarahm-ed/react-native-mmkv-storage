package com.mmkvstorageexample

import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.util.Log
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "MmkvStorageExample"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)

    Handler(Looper.getMainLooper())
        .postDelayed(
            {
              try {
                com.tencent.mmkv.MMKV.initialize(this)
                val kv = com.tencent.mmkv.MMKV.mmkvWithID("e2e_plain")
                Log.i(
                    "NativeInterop",
                    "NATIVE_INTEROP value=" + kv?.decodeString("__native_interop__"))
              } catch (e: Throwable) {
                Log.i("NativeInterop", "NATIVE_INTEROP failed=$e")
              }
            },
            12000)
  }
}
