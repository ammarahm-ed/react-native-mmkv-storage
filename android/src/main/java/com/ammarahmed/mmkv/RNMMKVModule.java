package com.ammarahmed.mmkv;

import android.os.Bundle;
import android.os.Parcel;
import android.os.Parcelable;
import android.util.Log;

import androidx.annotation.Nullable;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.JavaScriptContextHolder;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.module.annotations.ReactModule;
import com.facebook.react.turbomodule.core.CallInvokerHolderImpl;
import com.google.gson.Gson;
import com.ammarahmed.mmkv.MMKV;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@ReactModule(name = RNMMKVModule.NAME)
public class RNMMKVModule extends ReactContextBaseJavaModule {

    public static final String NAME =  "MMKVNative";

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

    public void installLib(JavaScriptContextHolder reactContext, String rootPath) {}

    // Installing JSI Bindings as done by
    // https://github.com/mrousavy/react-native-mmkv
    @ReactMethod(isBlockingSynchronousMethod = true)
    public boolean install() {

        String rootPath = reactContext.getFilesDir().getAbsolutePath() + "/mmkv";
        JavaScriptContextHolder jsContext = getReactApplicationContext().getJavaScriptContextHolder();
        CallInvokerHolderImpl jsCallInvokerHolder = (CallInvokerHolderImpl)reactContext.getCatalystInstance().getJSCallInvokerHolder();

        if (jsContext.get() != 0) {
            migrate();
            this.nativeInstall(
                    jsContext.get(),
                    rootPath
            );
            return true;
        } else {
            Log.e("RNMMKVModule","JSI Runtime is not available in debug mode");
            return false;
        }

    }

    @Override
    public void initialize() {
        super.initialize();
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
                HashMap<String, Object> child = (HashMap<String, Object>) IdStore.get(key);

                boolean isEncrypted = false;
                if (child.containsKey("encrypted")) {
                  isEncrypted  = (boolean) child.get("encrypted");
                }
                if (isEncrypted && !child.containsKey("alias")) {
                    Set<String> storeKeys =  child.keySet();
                    String alias = (String) child.get("alias");
                    for (String storeKey: storeKeys) {
                        if (storeKey == null) continue;
                        if (!storeKey.equals("ID") && !storeKey.equals("encrypted")) {
                            alias = (String) child.get(storeKey);
                        }
                    }
                    child.put("alias",alias);
                }
                Gson gson = new Gson();
                String json = gson.toJson(child);
                kv.encode(key, json);
                
                if (isEncrypted) {
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
                if (bundle != null) {
                    WritableMap map = Arguments.fromBundle(bundle);
                    String obj = gson.toJson(map.toHashMap());
                    kvv.encode(string, obj);
                }

            }
        }
        Set<String> arrayIndex = new HashSet<>();
        arrayIndex = kvv.decodeStringSet("arrayIndex", arrayIndex);
        if (arrayIndex != null) {
            for (String string : arrayIndex) {
                Bundle bundle = kvv.decodeParcelable(string, Bundle.class);
                if (bundle != null) {
                    WritableMap map = Arguments.fromBundle(bundle);
                    if (map.getArray(string) != null) {
                        ArrayList<Object> list = map.getArray(string).toArrayList();
                        String obj = gson.toJson(list);
                        kvv.encode(string, obj);
                    }

                }

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
        return "MMKVNative";
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

}