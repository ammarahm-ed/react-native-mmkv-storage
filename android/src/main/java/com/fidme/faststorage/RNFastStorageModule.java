
package com.fidme.faststorage;

import android.os.Bundle;
import android.telecom.Call;

import androidx.annotation.Nullable;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
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
    public void setStringAsync(final String key, final String value,  final Promise promise) {
        dispatchQueue.postRunnable(new Runnable() {
            @Override
            public void run() {

                mmkv.encode(key, value);
                promise.resolve(true);

            }
        });


    }

    @ReactMethod
    public void setString(final String key, final String value, @Nullable final Callback callback) {
        dispatchQueue.postRunnable(new Runnable() {
            @Override
            public void run() {

                mmkv.encode(key, value);
                callback.invoke(true);

            }
        });

    }


    @ReactMethod
    public void getStringAsync(final String key,  final Promise promise) {

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
    public void getString(final String key, final Callback callback) {

        dispatchQueue.postRunnable(new Runnable() {
            @Override
            public void run() {
                if (mmkv.containsKey(key)) {
                    callback.invoke(mmkv.decodeString(key));
                } else {
                    WritableMap map = Arguments.createMap();
                    map.putString("Error", "Value for key does not exist");
                    callback.invoke(map);
                }
            }
        });

    }


    @ReactMethod
    public void setBoolAsync(final String key, final boolean value, final Promise promise) {

        mmkv.encode(key, value);
        promise.resolve(true);

    }

    @ReactMethod
    public void setBool(final String key, final boolean value,@Nullable final Callback callback) {

        mmkv.encode(key, value);
        callback.invoke(true);

    }


    @ReactMethod
    public void getBoolAsync(final String key, final Promise promise) {
        if (mmkv.containsKey(key)) {
            promise.resolve(mmkv.decodeBool(key));
        } else {
            promise.reject("Error", "Value for key does not exist");
        }
    }


    @ReactMethod
    public void getBool(final String key, final Callback callback) {
        if (mmkv.containsKey(key)) {

            callback.invoke(mmkv.decodeBool(key));

        } else {
            WritableMap map = Arguments.createMap();
            map.putString("Error", "Value for key does not exist");
            callback.invoke(map);
        }
    }





    @ReactMethod
    public void setIntAsync(final String key, final int value, final Promise promise) {

        mmkv.encode(key, value);
        promise.resolve(true);

    }


    @ReactMethod
    public void setInt(final String key, final int value, @Nullable final Callback callback) {

        mmkv.encode(key, value);
        callback.invoke(true);

    }


    @ReactMethod
    public void getIntAsync(final String key, final Promise promise) {

        if (mmkv.containsKey(key)) {
            promise.resolve(mmkv.decodeInt(key));
        } else {
            promise.reject("Error", "Value for key does not exist");
        }

    }




    @ReactMethod
    public void getInt(final String key, final Callback callback) {

        if (mmkv.containsKey(key)) {
            callback.invoke(mmkv.decodeInt(key));
        } else {
            WritableMap map = Arguments.createMap();
            map.putString("Error", "Value for key does not exist");
            callback.invoke(map);
        }

    }


    @ReactMethod
    public void setMapAsync(final String key, final ReadableMap value, final Promise promise) {

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
    public void getMapAsync(final String key, final Promise promise) {

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
    public void setMap(final String key, final ReadableMap value, @Nullable final Callback callback) {

        dispatchQueue.postRunnable(new Runnable() {
            @Override
            public void run() {
                Bundle bundle = Arguments.toBundle(value);
                mmkv.encode(key, bundle);
                callback.invoke(true);

            }
        });

    }


    @ReactMethod
    public void getMap(final String key, final Callback callback) {

        dispatchQueue.postRunnable(new Runnable() {
            @Override
            public void run() {
                if (mmkv.containsKey(key)) {

                    Bundle bundle = mmkv.decodeParcelable(key, Bundle.class);
                    WritableMap map = Arguments.fromBundle(bundle);
                    callback.invoke(map);

                } else {

                    WritableMap map = Arguments.createMap();
                    map.putString("Error", "Value for key does not exist");
                    callback.invoke(map);
                }

            }
        });
    }



    @ReactMethod
    public void hasKeyAsync(final String key, final Promise promise) {

        promise.resolve(mmkv.containsKey(key));

    }


    @ReactMethod
    public void hasKey(final String key, final Callback callback) {

        callback.invoke(mmkv.containsKey(key));

    }


    @ReactMethod
    public void getKeysAsync(final Promise promise) {

        dispatchQueue.postRunnable(new Runnable() {
            @Override
            public void run() {

                String[] keys = mmkv.allKeys();
                if (keys != null) {
                    WritableArray array = Arguments.fromJavaArgs(keys);
                    promise.resolve(array);
                } else {
                    promise.reject("Error", "database appears to be empty");
                }


            }
        });


    }



    @ReactMethod
    public void getKeys(final Callback callback) {

        dispatchQueue.postRunnable(new Runnable() {
            @Override
            public void run() {

                String[] keys = mmkv.allKeys();
                if (keys != null) {

                    WritableArray array = Arguments.fromJavaArgs(keys);
                    callback.invoke(array);

                } else {

                    WritableMap map = Arguments.createMap();
                    map.putString("Error", "database appears to be empty");
                    callback.invoke(map);

                }


            }
        });


    }


    @ReactMethod
    public void getMultipleItemsAsync(final ReadableArray keys, final Promise promise) {

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
    public void getMultipleItems(final ReadableArray keys, final Callback callback) {

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
                callback.invoke(args);
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