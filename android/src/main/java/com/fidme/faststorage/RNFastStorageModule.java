
package com.fidme.faststorage;

import android.os.Bundle;

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

    private MMKV mmkv;
    public static volatile DispatchQueue dispatchQueue;

    public RNFastStorageModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
        dispatchQueue = new DispatchQueue("FastStorage.Queue");

    }

    @Override
    public String getName() {
        return "RNFastStorage";
    }


    @ReactMethod
    public void setupLibrary() {

        MMKV.initialize(getReactApplicationContext());
        mmkv = MMKV.defaultMMKV();


    }


    @ReactMethod
    public void setString(final String key, final String value, final Promise promise) {
        dispatchQueue.postRunnable(new Runnable() {
            @Override
            public void run() {

                mmkv.encode(key, value);
                promise.resolve(true);

            }
        });


    }

    @ReactMethod
    public void getString(final String key, final Promise promise) {

        dispatchQueue.postRunnable(new Runnable() {
            @Override
            public void run() {
                if (mmkv.containsKey(key)) {
                    promise.resolve(mmkv.decodeString(key));
                } else {
                    promise.reject("Error", "Value for key does not exist");
                }
            }
        });

    }


    @ReactMethod
    public void setBool(final String key, final boolean value, final Promise promise) {

        mmkv.encode(key, value);
        promise.resolve(true);

    }


    @ReactMethod
    public void getBool(final String key, final Promise promise) {
        if (mmkv.containsKey(key)) {
            promise.resolve(mmkv.decodeBool(key));
        } else {
            promise.reject("Error", "Value for key does not exist");
        }
    }

    @ReactMethod
    public void setInt(final String key, final int value, final Promise promise) {

        mmkv.encode(key, value);
        promise.resolve(true);

    }


    @ReactMethod
    public void getInt(final String key, final Promise promise) {

        if (mmkv.containsKey(key)) {
            promise.resolve(mmkv.decodeInt(key));
        } else {
            promise.reject("Error", "Value for key does not exist");
        }

    }


    @ReactMethod
    public void setMap(final String key, final ReadableMap value, final Promise promise) {

        dispatchQueue.postRunnable(new Runnable() {
            @Override
            public void run() {
                Bundle bundle = Arguments.toBundle(value);
                mmkv.encode(key, bundle);
                promise.resolve(true);

            }
        });

    }


    @ReactMethod
    public void getMap(final String key, final Promise promise) {

        dispatchQueue.postRunnable(new Runnable() {
            @Override
            public void run() {
                if (mmkv.containsKey(key)) {
                    Bundle bundle = mmkv.decodeParcelable(key, Bundle.class);
                    WritableMap map = Arguments.fromBundle(bundle);

                    promise.resolve(map);
                } else {
                    promise.reject("Error", "Value for key does not exist");
                }

            }
        });
    }

    @ReactMethod
    public void hasKey(final String key, final Promise promise) {

        promise.resolve(mmkv.containsKey(key));

    }


    @ReactMethod
    public void getMultipleItems(final ReadableArray keys, final Promise promise) {

        dispatchQueue.postRunnable(new Runnable() {
            @Override
            public void run() {

                WritableArray args = Arguments.createArray();

                for (int i = 0; i < keys.size(); i++) {
                    String key = keys.getString(i);
                    if (mmkv.containsKey(key)) {
                        Bundle bundle = mmkv.decodeParcelable(key, Bundle.class);
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
            }
        });


    }


    @ReactMethod
    public void removeItem(final String key, final Promise promise) {

        if (mmkv.containsKey(key)) {
            mmkv.removeValueForKey(key);
            promise.resolve(key);
        } else {
            promise.resolve(true);
        }
    }

    @ReactMethod
    public void clearStore(final Promise promise) {

        mmkv.clearAll();
        promise.resolve(true);

    }
}