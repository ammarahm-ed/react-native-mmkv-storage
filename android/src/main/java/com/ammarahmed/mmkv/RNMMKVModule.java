
package com.ammarahmed.mmkv;

import androidx.annotation.Nullable;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;




public class RNMMKVModule extends ReactContextBaseJavaModule {

    private final ReactApplicationContext reactContext;
    private SecureKeystore secureKeystore;

    static {
        System.loadLibrary("cpp");
    }

    private native void nativeInstall(long jsi, String rootPath);

    public RNMMKVModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
        secureKeystore = new SecureKeystore(reactContext);

    }

    @Override
    public void initialize() {
        super.initialize();
        nativeInstall(
                this.getReactApplicationContext().getJavaScriptContextHolder().get(),
                this.getReactApplicationContext().getFilesDir().getAbsolutePath() + "/mmkv"
        );
    }

    @Override
    public String getName() {
        return "MMKVStorage";
    }

    @ReactMethod
    public void setSecureKey(String key, String value, @Nullable ReadableMap options, Callback callback) {
        secureKeystore.setSecureKey(key, value, options, callback);
    }

    @ReactMethod
    public void getSecureKey(String key, Callback callback) {
        secureKeystore.getSecureKey(key, callback);
    }

    @ReactMethod
    public void secureKeyExists(String key, Callback callback) {
        secureKeystore.secureKeyExists(key, callback);
    }

    @ReactMethod
    public void removeSecureKey(String key, Callback callback) {
        secureKeystore.removeSecureKey(key, callback);
    }


}