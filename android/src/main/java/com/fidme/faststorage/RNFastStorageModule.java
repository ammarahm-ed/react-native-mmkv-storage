
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
import com.tencent.mmkv.MMKV;

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
            promise.reject("Error", "Unable to setItem");
        } catch (Exception e) {
            promise.reject("Error", "Unable to setItem");
        }
    }


    @ReactMethod
    public void getString(String key, Promise promise) {
        try {
            MMKV kv = MMKV.defaultMMKV();

            promise.resolve(kv.decodeString(key));

        } catch (Error e) {
            promise.reject("Error", "Unable to getItem");
        } catch (Exception e) {
            promise.reject("Error", "Unable to getItem");
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
            promise.reject("Error", "Unable to setItem");
        } catch (Exception e) {
            promise.reject("Error", "Unable to setItem");
        }
    }


    @ReactMethod
    public void getMap(String key, Promise promise) {
        try {
            MMKV kv = MMKV.defaultMMKV();
            Bundle bundle = kv.decodeParcelable(key, Bundle.class);
            WritableMap map = Arguments.fromBundle(bundle);
            promise.resolve(map);
        } catch (Error e) {
            promise.reject("Error", "Unable to getItem");
        } catch (Exception e) {
            promise.reject("Error", "Unable to getItem");
        }
    }





    @ReactMethod
    public void getMultipleItems(ReadableArray keys, Promise promise) {

        try {
            WritableArray args = Arguments.createArray();
            MMKV kv = MMKV.defaultMMKV();
            for (int i = 0; i < keys.size(); i++) {
                String key = keys.getString(i);
                Bundle bundle = kv.decodeParcelable(key, Bundle.class);
                WritableMap value = Arguments.fromBundle(bundle);
                WritableArray item = Arguments.createArray();
                item.pushString(key);
                item.pushMap(value);
                args.pushArray(item);
            }
            promise.resolve(args);

        } catch (Error e) {
            promise.reject("Error", "Unable to getItem");
        } catch (Exception e) {
            promise.reject("Error", "Unable to getItem");
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