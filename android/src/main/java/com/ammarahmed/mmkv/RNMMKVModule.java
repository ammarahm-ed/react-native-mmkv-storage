
package com.ammarahmed.mmkv;

import android.os.Bundle;

import androidx.annotation.Nullable;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.google.gson.Gson;
import com.tencent.mmkv.MMKV;

import java.util.HashMap;
import java.util.Set;

public class RNMMKVModule extends ReactContextBaseJavaModule {

    private final ReactApplicationContext reactContext;
    private SecureKeystore secureKeystore;

    static {
        System.loadLibrary("rnmmkv");
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

        MMKV.initialize(reactContext);
        MMKV kv = MMKV.mmkvWithID("mmkvIDStore");
        boolean hasKey = kv.containsKey("mmkvIdStore");
        HashMap<String, Object> IdStore = new HashMap<>();
        if (hasKey) {
            Bundle mmkvIdStore = kv.decodeParcelable("mmkvIdStore", Bundle.class);
            IdStore = (HashMap<String, Object>) mmkvIdStore.getSerializable("mmkvIdStore");
            Set<String> keys = IdStore.keySet();
            for (String key: keys) {
                Object entry = IdStore.get(key);
                Gson gson = new Gson();
                String json = gson.toJson(entry);
                kv.putString(key,json);
            }
            kv.removeValueForKey("mmkvIdStore");
        }



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