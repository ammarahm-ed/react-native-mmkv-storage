
package com.fidme.faststorage;

import android.os.Bundle;
import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeArray;
import com.tencent.mmkv.MMKV;

import java.util.Map;

public class RNFastStorageModule extends ReactContextBaseJavaModule {

    private final ReactApplicationContext reactContext;

    public RNFastStorageModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Override
    public String getName() {
        return "RNFastStorage";
    }

    @ReactMethod
    public void setupLibrary() {
        MMKV.initialize(getReactApplicationContext());
    }

    @ReactMethod
    public void setString(String key, String value, Promise promise) {
        try {
            MMKV kv = MMKV.defaultMMKV();
            kv.encode(key, value);
            promise.resolve("done");
        } catch (Error e) {
            promise.reject("Error", "Unable to set String");
        } catch (Exception e) {
            promise.reject("Error", "Unable to set String");
        }
    }


    @ReactMethod
    public void getString(String key, Promise promise) {
        try {
            MMKV kv = MMKV.defaultMMKV();

            promise.resolve(kv.decodeString(key));

        } catch (Error e) {
            promise.reject("Error", "Unable to get String");
        } catch (Exception e) {
            promise.reject("Error", "Unable to get String");
        }
    }


    @ReactMethod
    public void setBool(String key, boolean value, Promise promise) {
        try {
            MMKV kv = MMKV.defaultMMKV();

            kv.encode(key, value);

            promise.resolve("done");
        } catch (Error e) {
            promise.reject("Error", "Unable to set String");
        } catch (Exception e) {
            promise.reject("Error", "Unable to set String");
        }
    }


    @ReactMethod
    public void getBool(String key, Promise promise) {
        try {
            MMKV kv = MMKV.defaultMMKV();

            promise.resolve(kv.decodeBool(key));

        } catch (Error e) {
            promise.reject("Error", "Unable to get String");
        } catch (Exception e) {
            promise.reject("Error", "Unable to get String");
        }
    }

    @ReactMethod
    public void setInt(String key, int value, Promise promise) {
        try {
            MMKV kv = MMKV.defaultMMKV();
            kv.encode(key, value);

            promise.resolve("done");
        } catch (Error e) {
            promise.reject("Error", "Unable to set String");
        } catch (Exception e) {
            promise.reject("Error", "Unable to set String");
        }
    }


    @ReactMethod
    public void getInt(String key, Promise promise) {
        try {
            MMKV kv = MMKV.defaultMMKV();

            promise.resolve(kv.decodeInt(key));

        } catch (Error e) {
            promise.reject("Error", "Unable to get String");
        } catch (Exception e) {
            promise.reject("Error", "Unable to get String");
        }
    }


    @ReactMethod
    public void setMap(String key, ReadableMap value, Promise promise) {
        try {
            MMKV kv = MMKV.defaultMMKV();
            Bundle bundle = Arguments.toBundle(value);
            kv.encode(key, bundle);
            promise.resolve("done");
        } catch (Error e) {
            promise.reject("Error", "Unable to set Map");
        } catch (Exception e) {
            promise.reject("Error", "Unable to set Map");
        }
    }


    @ReactMethod
    public void getMap(String key, Promise promise) {
        try {

            MMKV kv = MMKV.defaultMMKV();
            if (kv.containsKey(key)) {
                Bundle bundle = kv.decodeParcelable(key, Bundle.class);
                WritableMap map = Arguments.fromBundle(bundle);

                promise.resolve(map);
            } else {
                promise.resolve(null);
            }

        } catch (Error e) {
            promise.reject("Error", "Unable to get Map");
        } catch (Exception e) {
            promise.reject("Error", "Unable to get Map");
        }
    }

    @ReactMethod
    public void hasKey(String key, Promise promise) {
        try {

            MMKV kv = MMKV.defaultMMKV();
            promise.resolve(kv.containsKey(key));

        } catch (Error e) {
            promise.reject("Error", "Unable to check if key exists");
        }


    }


    @ReactMethod
    public void getMultipleItems(ReadableArray keys, Promise promise) {

        try {
            WritableArray args = Arguments.createArray();
            MMKV kv = MMKV.defaultMMKV();
            for (int i = 0; i < keys.size(); i++) {
                String key = keys.getString(i);
                if (kv.containsKey(key)) {
                    Bundle bundle = kv.decodeParcelable(key, Bundle.class);
                    WritableMap value = Arguments.fromBundle(bundle);
                    WritableArray item = Arguments.createArray();
                    item.pushString(key);
                    item.pushMap(value);
                    args.pushArray(item);
                } else {
                    WritableArray item = Arguments.createArray();
                    item.pushString(key);
                    item.pushMap(null);
                }

            }
            promise.resolve(args);

        } catch (Error e) {
            promise.reject("Error", "Unable to get Multiple Items");
        } catch (Exception e) {
            promise.reject("Error", "Unable to get Multiple Items");
        }

    }


    @ReactMethod
    public void removeItem(String key, Promise promise) {
        try {
            MMKV kv = MMKV.defaultMMKV();
            kv.removeValueForKey(key);
            promise.resolve(key);
        } catch (Error e) {
            promise.reject("Error", "Unable to removeItem");
        } catch (Exception e) {
            promise.reject("Error", "Unable to removeItem");
        }
    }

    @ReactMethod
    public void clearStore(Promise promise) {
        try {
            MMKV kv = MMKV.defaultMMKV();
            kv.clearAll();
            promise.resolve("Done");
        } catch (Error e) {
            promise.reject("Error", "Unable to removeItem");
        } catch (Exception e) {
            promise.reject("Error", "Unable to removeItem");
        }
    }
}