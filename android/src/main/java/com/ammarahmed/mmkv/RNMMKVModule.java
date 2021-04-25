package com.ammarahmed.mmkv;

import android.os.Bundle;
import android.os.Parcel;
import android.os.Parcelable;
import android.util.Log;

import androidx.annotation.Nullable;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.google.gson.Gson;
import com.ammarahmed.mmkv.MMKV;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class RNMMKVModule extends ReactContextBaseJavaModule {

    private final ReactApplicationContext reactContext;
    private SecureKeystore secureKeystore;

    static {
        System.loadLibrary("rnmmkv");
    }

    private native void nativeInstall(long jsi, String rootPath);

    private native void destroy();

    public RNMMKVModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
        secureKeystore = new SecureKeystore(reactContext);
        
    }



    @Override
    public void initialize() {
        super.initialize();
        if (this.getReactApplicationContext().getJavaScriptContextHolder().get() != 0) {
            nativeInstall(
                    this.getReactApplicationContext().getJavaScriptContextHolder().get(),
                    this.getReactApplicationContext().getFilesDir().getAbsolutePath() + "/mmkv"
            );
            migrate();

        } else {
            Log.e("RNMMKVModule","JSI Runtime is not available in debug mode");
        }

    }



    public void migrate() {
        MMKV.initialize(reactContext);
        MMKV kv = MMKV.mmkvWithID("mmkvIDStore");
        boolean hasKey = kv.containsKey("mmkvIdStore");
        HashMap<String, Object> IdStore = new HashMap<>();
        if (hasKey) {
            Bundle mmkvIdStore = kv.decodeParcelable("mmkvIdStore", Bundle.class);
            IdStore = (HashMap<String, Object>) mmkvIdStore.getSerializable("mmkvIdStore");
            Set<String> keys = IdStore.keySet();
            for (String key : keys) {
                Object entry = IdStore.get(key);
                Gson gson = new Gson();
                String json = gson.toJson(entry);
                kv.putString(key, json);
                HashMap<String, Object> child = (HashMap<String, Object>) IdStore.get(key);

                if ((boolean) child.get("encrypted")) {
                    String alias = (String) child.get("alias");
                    if (secureKeystore.secureKeyExists(alias)) {
                        String cKey = secureKeystore.getSecureKey(alias);
                        MMKV kvv = MMKV.mmkvWithID(key, MMKV.SINGLE_PROCESS_MODE, cKey);
                        writeToJSON(kvv);
                    }
                } else {
                    MMKV kvv = MMKV.mmkvWithID(key, MMKV.SINGLE_PROCESS_MODE);
                    writeToJSON(kvv);
                }

            }
            kv.removeValueForKey("mmkvIdStore");
        }
    }

    public void writeToJSON(MMKV kvv) {
        Gson gson = new Gson();
        Set<String> mapIndex = new HashSet<>();
        mapIndex = kvv.decodeStringSet("mapIndex", mapIndex);
        if (mapIndex != null) {
            for (String string : mapIndex) {
                Bundle bundle = kvv.decodeParcelable(string, Bundle.class);
                WritableMap map = Arguments.fromBundle(bundle);
                String obj = gson.toJson(map.toHashMap());
                kvv.putString(string, obj);
            }
        }
        Set<String> arrayIndex = new HashSet<>();
        arrayIndex = kvv.decodeStringSet("arrayIndex", arrayIndex);
        if (arrayIndex != null) {
            for (String string : arrayIndex) {
                Bundle bundle = kvv.decodeParcelable(string, Bundle.class);
                WritableMap map = Arguments.fromBundle(bundle);

                List<Object> subChild = Arguments.toList(map.getArray(string));
                String obj = gson.toJson(subChild);
                kvv.putString(string, obj);
            }
        }


        Set<String> intIndex = new HashSet<>();
        if (intIndex != null) {
            intIndex = kvv.decodeStringSet("intIndex", intIndex);
            for (String key : intIndex) {
                int val = kvv.decodeInt(key);
                double d = val;
                kvv.encode(key, d);
            }
            kvv.encode("numberIndex", intIndex);
        }


    }

    @Override
    public String getName() {
        return "MMKVStorage";
    }

    public boolean secureKeyExists(String key) {
        return secureKeystore.secureKeyExists(key);
    }

    public void removeSecureKey(String key) {
        secureKeystore.removeSecureKey(key);
    }

    public void setSecureKey(String key, String value) {
        secureKeystore.setSecureKey(key, value);
    }

    public String getSecureKey(String key) {
        return secureKeystore.getSecureKey(key);
    }


    @Override
    public void onCatalystInstanceDestroy() {
        super.onCatalystInstanceDestroy();
        destroy();
    }
}