
package com.ammarahmed.mmkv;


import android.util.Log;

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
import com.tencent.mmkv.MMKV;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;


public class RNMMKVModule extends ReactContextBaseJavaModule {

    private final ReactApplicationContext reactContext;

    public StorageIndexer indexer;

    private IDStore IdStore;

    private Map<String, MMKV> mmkvMap = new HashMap<String, MMKV>();

    private StorageGetters storageGetters;

    private SecureKeystore secureKeystore;


    private StorageSetters storageSetters;

    public RNMMKVModule(ReactApplicationContext reactContext) {
        super(reactContext);

        this.reactContext = reactContext;

        MMKV.initialize(getReactApplicationContext());

        IdStore = new IDStore(MMKV.mmkvWithID("mmkvIDStore"));

        indexer = new StorageIndexer(reactContext);

        secureKeystore = new SecureKeystore(reactContext);

        storageGetters = new StorageGetters(indexer);

        storageSetters = new StorageSetters(indexer);

    }


    @Override
    public String getName() {
        return "MMKVStorage";
    }


    @ReactMethod
    public void setup(String ID, int mode, Callback callback) {

        if (ID == null) return;

        MMKV kv = MMKV.mmkvWithID(ID, mode);

        if (!IdStore.exists(ID)) {

            mmkvMap.put(ID, kv);
            kv.encode(ID, true);
            IdStore.add(ID, false, null);
            callback.invoke(null, true);

        } else {

            if (kv.containsKey(ID)) {
                mmkvMap.put(ID, kv);
                callback.invoke(null, true);
            } else {

                encryptionHandler(ID, mode, callback);
            }


        }

    }


    @ReactMethod
    public void setupWithEncryption(String ID, int mode, String cryptKey, @Nullable String alias, Callback callback) {

        MMKV kv = MMKV.mmkvWithID(ID, mode, cryptKey);

        if (!IdStore.exists(ID)) {
            IdStore.add(ID, true, alias);
            kv.encode(ID, true);
            mmkvMap.put(ID, kv);
            callback.invoke(null, true);
        } else {
            if (kv.containsKey(ID)) {
                mmkvMap.put(ID, kv);
                callback.invoke(null, true);
            } else {
                encryptionHandler(ID, mode, callback);
            }
        }


    }


    public void encryptionHandler(String ID, int mode, @Nullable Callback callback) {

        MMKV kv = null;

        String alias = IdStore.getAlias(ID);

        if (IdStore.encrypted(ID)) {


            if (secureKeystore.secureKeyExists(alias, null)) {


                String cryptKey = secureKeystore.getSecureKey(alias, null);


                kv = MMKV.mmkvWithID(ID, mode, cryptKey);

                mmkvMap.put(ID, kv);
                if (callback != null) {

                    callback.invoke(null, true);
                }


            } else {
                callback.invoke("Wrong password or storage corrupt", null);
            }


        } else {

            kv = MMKV.mmkvWithID(ID, mode);
            mmkvMap.put(ID, kv);
            if (callback != null) {

                callback.invoke(null, true);
            }


        }


    }


    @ReactMethod
    public void getCurrentMMKVInstanceIDs(Promise promise) {

        WritableArray array = Arguments.createArray();
        Set<String> strings = mmkvMap.keySet();

        for (String string : strings) {

            array.pushString(string);

        }

        promise.resolve(array);


    }


    @ReactMethod
    public void getAllMMKVInstanceIDs(Promise promise) {

        HashMap<String, Object> allIDs = IdStore.getAll();

        WritableArray array = Arguments.createArray();
        for (String string : allIDs.keySet()) {
            array.pushString(string);
        }

        promise.resolve(array);


    }


    @ReactMethod
    public void setString(final String ID, final String key, final String value, @Nullable final Callback callback) {

        storageSetters.setItem(ID, key, Constants.DATA_TYPE_STRING, value, 0, false, null, false, mmkvMap, callback);
    }


    @ReactMethod
    public void setBool(final String ID, final String key, final boolean value, @Nullable final Callback callback) {
        storageSetters.setItem(ID, key, Constants.DATA_TYPE_BOOL, null, 0, value, null, false, mmkvMap, callback);
    }


    @ReactMethod
    public void setInt(final String ID, final String key, final int value, @Nullable final Callback callback) {

        storageSetters.setItem(ID, key, Constants.DATA_TYPE_INT, null, value, false, null, false, mmkvMap, callback);

    }


    @ReactMethod
    public void setMap(final String ID, final String key, final ReadableMap value, final boolean isArray, @Nullable final Callback callback) {

        storageSetters.setItem(ID, key, Constants.DATA_TYPE_MAP, null, 0, false, value, isArray, mmkvMap, callback);

    }


    @ReactMethod
    public void getItem(final String ID, final String key, final int type, final Callback callback) {


        storageGetters.getItem(ID, key, type, mmkvMap, callback);
    }


    @ReactMethod
    public void hasKey(final String ID, final String key, final Promise promise) {

        if (mmkvMap.containsKey(ID)) {
            final MMKV kv = mmkvMap.get(ID);

            promise.resolve(kv.containsKey(key));

        } else {
            promise.reject("Error", "database not initialized with given id");
        }

    }


    @ReactMethod
    public void getKeys(final String ID, final Promise promise) {

        if (mmkvMap.containsKey(ID)) {
            final MMKV kv = mmkvMap.get(ID);


            String[] keys = kv.allKeys();
            if (keys != null) {
                WritableArray array = Arguments.fromJavaArgs(keys);
                promise.resolve(array);
            } else {
                promise.reject("Error", "database appears to be empty");
            }

        } else {
            promise.reject("Error", "database not initialized with given id");
        }
    }


    @ReactMethod
    public void getMultipleItems(final String ID, final ReadableArray keys, final Callback callback) {

        storageGetters.getMultipleItems(ID, keys, mmkvMap, callback);

    }

    @ReactMethod
    public void getItemsForType(final String ID, final int type, final Callback callback) {
        storageGetters.getItemsForType(ID, type, mmkvMap, callback);
    }

    @ReactMethod
    public void getTypeIndex(final String ID, final int type, Promise promise) {

        indexer.getTypeIndex(ID, type, mmkvMap, promise);

    }

    @ReactMethod
    public void typeIndexerHasKey(final String ID, String key, int type, Promise promise) {

        indexer.typeIndexerHasKey(ID, key, type, mmkvMap, promise);
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


    @ReactMethod
    public void removeItem(final String ID, final String key, final Promise promise) {

        if (mmkvMap.containsKey(ID)) {
            final MMKV kv = mmkvMap.get(ID);
            //Log.d("REMOVE","HERE RE" + ID  + key + String.valueOf(kv.containsKey(key)) );

            if (kv.contains(key)) {
                Log.d("REMOVE","HERE REMO");
                kv.removeValueForKey(key);

                indexer.removeKeyFromIndexer(ID,mmkvMap,key);
                Log.d("REMOVE","HERE REMOVI");

                promise.resolve(key);
            } else {
                promise.resolve(true);
            }


        } else {
            promise.reject("Error", "database not initialized with given id");
        }
    }


    @ReactMethod
    public void encrypt(String ID, String key, String alias, Promise promise) {

        if (mmkvMap.containsKey(ID)) {
            final MMKV kv = mmkvMap.get(ID);

            kv.encode(ID, true);
            IdStore.add(ID, true, alias);

            kv.reKey(key);

            promise.resolve(true);

        } else {

            promise.reject("Error", "database not initialized with given id");

        }

    }

    @ReactMethod
    public void decrypt(String ID, Promise promise) {

        if (mmkvMap.containsKey(ID)) {
            final MMKV kv = mmkvMap.get(ID);
            kv.encode(ID, true);
            IdStore.add(ID, false, null);
            kv.reKey(null);
            promise.resolve(true);

        } else {

            promise.reject("Error", "database not initialized with given id");
        }

    }

    @ReactMethod
    public void changeEncryptionKey(String ID, String key, String alias, Promise promise) {

        if (mmkvMap.containsKey(ID)) {
            final MMKV kv = mmkvMap.get(ID);

            kv.encode(ID, true);
            IdStore.add(ID, true, alias);
            kv.reKey(key);

            promise.resolve(true);

        } else {

            promise.reject("Error", "database not initialized with given id");
        }

    }


    @ReactMethod
    public void clearStore(final String ID, final Promise promise) {


        if (mmkvMap.containsKey(ID)) {
            final MMKV kv = mmkvMap.get(ID);
            kv.clearAll();
            kv.encode(ID, true);
            promise.resolve(true);

        } else {
            promise.reject("Error", "database not initialized with given id");
        }

    }


    @ReactMethod
    public void clearMemoryCache(final String ID, final Promise promise) {

        if (mmkvMap.containsKey(ID)) {

            MMKV kv = mmkvMap.get(ID);
            kv.clearMemoryCache();
            promise.resolve(true);
        } else {

            promise.reject("Error", "database is not initialized");
        }

    }

}