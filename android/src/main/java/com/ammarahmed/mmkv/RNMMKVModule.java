
package com.ammarahmed.mmkv;

import android.content.SharedPreferences;
import android.os.Build;
import android.os.Bundle;
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
import com.facebook.react.uimanager.IllegalViewOperationException;
import com.securepreferences.SecurePreferences;
import com.tencent.mmkv.MMKV;
import java.io.FileNotFoundException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import java.util.Set;


public class RNMMKVModule extends ReactContextBaseJavaModule {

    public static volatile DispatchQueue dispatchQueue;
    private final ReactApplicationContext reactContext;
    public StorageIndexer indexer;
    private IDStore IdStore;
    private Map<String, MMKV> mmkvMap = new HashMap<String, MMKV>();
    private SharedPreferences prefs;
    private SecureKeystore rnKeyStore;

    public RNMMKVModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
        MMKV.initialize(getReactApplicationContext());

        IdStore = new IDStore(MMKV.mmkvWithID("mmkvIDStore"));

        indexer = new StorageIndexer(reactContext);

        dispatchQueue = new DispatchQueue("MMKVStorage.Queue");
        if (useKeystore()) {
            rnKeyStore = new SecureKeystore();
        } else {
            prefs = new SecurePreferences(getReactApplicationContext(), (String) null, "e4b001df9a082298dd090bb7455c45d92fbd5ddd.xml");
        }

    }

    public static boolean isRTL(Locale locale) {

        final int directionality = Character.getDirectionality(locale.getDisplayName().charAt(0));
        return directionality == Character.DIRECTIONALITY_RIGHT_TO_LEFT ||
                directionality == Character.DIRECTIONALITY_RIGHT_TO_LEFT_ARABIC;
    }

    @Override
    public String getName() {
        return "MMKVStorage";
    }

    @ReactMethod
    public void setupDefaultLibrary() {

        MMKV mmkv = MMKV.defaultMMKV();

        boolean isPresent = IdStore.exists("default");

        if (!isPresent) {
            IdStore.add("default");
        }

        mmkvMap.put("default", mmkv);

    }

    @ReactMethod
    public void setupDefaultLibraryWithEncryption(int mode, String cryptKey, Callback callback) {

        MMKV kv;

        if (cryptKey.equals("")) {
            kv = MMKV.defaultMMKV(mode, null);
        } else {
            kv = MMKV.defaultMMKV(mode, cryptKey);
        }

        boolean isPresent = IdStore.exists("default");

        if (!isPresent) {
            IdStore.add("default");
            kv.encode("default", true);
            mmkvMap.put("default", kv);
            callback.invoke(null, true);
        } else {
            boolean isCorrectInstance = kv.containsKey("default");
            if (isCorrectInstance) {
                mmkvMap.put("default", kv);
                callback.invoke(null, true);
            } else {
                callback.invoke("Wrong password", false);
            }
        }

    }

    @ReactMethod
    public void setupLibraryWithInstanceID(String ID, int mode) {

        if (ID == null) return;

        MMKV kv = MMKV.mmkvWithID(ID, mode);

        if (kv != null) {

            boolean isPresent = IdStore.exists(ID);

            if (!isPresent) {
                IdStore.add(ID);
            }

            mmkvMap.put(ID, kv);
        }

    }

    @ReactMethod
    public void setupLibraryWithInstanceIDAndEncryption(String ID, int mode, String cryptKey, Callback callback) {

        if (ID == null || cryptKey == null) return;

        MMKV kv = MMKV.mmkvWithID(ID, mode, cryptKey);

        if (kv != null) {

            boolean isPresent = IdStore.exists(ID);

            if (!isPresent) {
                IdStore.add(ID);
                kv.encode(ID, true);
                mmkvMap.put(ID, kv);

                callback.invoke(null, true);
            } else {

                boolean isCorrectInstance = kv.containsKey(ID);

                if (isCorrectInstance) {
                    mmkvMap.put(ID, kv);
                    callback.invoke(null, true);
                } else {
                    callback.invoke("Wrong Password", false);
                }
            }


        }

    }

    @ReactMethod
    public void getAllMMKVInstanceIDs(Promise promise) {
        WritableArray array = Arguments.createArray();
        Set<String> strings = mmkvMap.keySet();

        for (String string : strings) {

            array.pushString(string);

        }

        promise.resolve(array);

    }

    @ReactMethod
    public void encrypt(String ID, String key, Promise promise) {

        if (mmkvMap.containsKey(ID)) {
            final MMKV kv = mmkvMap.get(ID);
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
            kv.reKey(null);
            promise.resolve(true);

        } else {

            promise.reject("Error", "database not initialized with given id");
        }

    }

    @ReactMethod
    public void changeEncryptionKey(String ID, String key, Promise promise) {

        if (mmkvMap.containsKey(ID)) {
            final MMKV kv = mmkvMap.get(ID);
            kv.reKey(key);

            promise.resolve(true);

        } else {

            promise.reject("Error", "database not initialized with given id");
        }

    }

    @ReactMethod
    public void setStringAsync(final String ID, final String key, final String value, final Promise promise) {

        if (mmkvMap.containsKey(ID)) {

            final MMKV kv = mmkvMap.get(ID);

            dispatchQueue.postRunnable(new Runnable() {
                @Override
                public void run() {

                    kv.encode(key, value);
                    promise.resolve(true);
                    indexer.addToStringsIndex(kv, key);

                }
            });

        } else {

            promise.reject("Error", "database not initialized with given id " + ID);
        }


    }

    @ReactMethod
    public void setString(final String ID, final String key, final String value, @Nullable final Callback callback) {

        if (mmkvMap.containsKey(ID)) {

            final MMKV kv = mmkvMap.get(ID);

            dispatchQueue.postRunnable(new Runnable() {
                @Override
                public void run() {

                    kv.encode(key, value);
                    callback.invoke(null, true);
                    indexer.addToStringsIndex(kv, key);

                }
            });

        } else {

            callback.invoke("database not initilaized with id " + ID, null);
        }


    }

    @ReactMethod
    public void getStringAsync(final String ID, final String key, final Promise promise) {

        if (mmkvMap.containsKey(ID)) {
            final MMKV kv = mmkvMap.get(ID);

            dispatchQueue.postRunnable(new Runnable() {
                @Override
                public void run() {
                    if (kv.containsKey(key)) {
                        promise.resolve(kv.decodeString(key));
                    } else {
                        promise.reject("Error", "Value for key does not exist");
                    }
                }
            });

        } else {
            promise.reject("Error", "database not initialized with given id");
        }


    }


    @ReactMethod
    public void getString(final String ID, final String key, final Callback callback) {


        if (mmkvMap.containsKey(ID)) {
            final MMKV kv = mmkvMap.get(ID);

            dispatchQueue.postRunnable(new Runnable() {
                @Override
                public void run() {
                    if (kv.containsKey(key)) {
                        callback.invoke(null,kv.decodeString(key));
                    } else {

                        callback.invoke("key does not exist",null);
                    }
                }
            });



        } else {

            callback.invoke("database not initilaized with id " + ID, null);
        }

    }

    @ReactMethod
    public void setBoolAsync(final String ID, final String key, final boolean value, final Promise promise) {




        if (mmkvMap.containsKey(ID)) {
            final MMKV kv = mmkvMap.get(ID);
            kv.encode(key, value);
            promise.resolve(true);
            indexer.addToBoolIndex(kv,key);

        } else {
            promise.reject("Error", "database not initialized with given id");
        }

    }

    @ReactMethod
    public void setBool(final String ID, final String key, final boolean value, @Nullable final Callback callback) {


        if (mmkvMap.containsKey(ID)) {
            final MMKV kv = mmkvMap.get(ID);

            kv.encode(key, value);
            callback.invoke(null, true);
            indexer.addToBoolIndex(kv,key);

        } else {

            callback.invoke("database not initilaized with id " + ID, null);
        }

    }





    @ReactMethod
    public void getBoolAsync(final String ID, final String key, final Promise promise) {

        if (mmkvMap.containsKey(ID)) {
            final MMKV kv = mmkvMap.get(ID);

            if (kv.containsKey(key)) {
                promise.resolve(kv.decodeBool(key));
            } else {
                promise.reject("Error", "Value for key does not exist");
            }


        } else {
            promise.reject("Error", "database not initialized with given id");
        }

    }

    @ReactMethod
    public void getBool(final String ID, final String key, final Callback callback) {


        if (mmkvMap.containsKey(ID)) {
            final MMKV kv = mmkvMap.get(ID);

            if (kv.containsKey(key)) {

                callback.invoke( null, kv.decodeBool(key));

            } else {

                callback.invoke("Value for key does not exist", null);
            }

        } else {

            callback.invoke("database not initilaized with id " + ID, null);
        }

    }


    @ReactMethod
    public void setIntAsync(final String ID, final String key, final int value, final Promise promise) {

        if (mmkvMap.containsKey(ID)) {
            final MMKV kv = mmkvMap.get(ID);

            kv.encode(key, value);
            promise.resolve(true);
            indexer.addToIntIndex(kv,key);
        } else {
            promise.reject("Error", "database not initialized with given id");
        }



    }

    @ReactMethod
    public void setInt(final String ID, final String key, final int value, @Nullable final Callback callback) {

        if (mmkvMap.containsKey(ID)) {
            final MMKV kv = mmkvMap.get(ID);

            kv.encode(key, value);
            callback.invoke(null,true);
            indexer.addToIntIndex(kv,key);

        } else {

            callback.invoke("database not initilaized with id " + ID, null);
        }


    }

    @ReactMethod
    public void getIntAsync(final String ID, final String key, final Promise promise) {


        if (mmkvMap.containsKey(ID)) {
            final MMKV kv = mmkvMap.get(ID);

            if (kv.containsKey(key)) {
                promise.resolve(kv.decodeInt(key));
            } else {
                promise.reject("Error", "Value for key does not exist");
            }


        } else {
            promise.reject("Error", "database not initialized with given id");
        }

    }

    @ReactMethod
    public void getInt(final String ID, final String key, final Callback callback) {

        if (!mmkvMap.containsKey(ID)) {
            final MMKV kv = mmkvMap.get(ID);


            if (kv.containsKey(key)) {
                callback.invoke(kv.decodeInt(key));
            } else {

                callback.invoke("Value for key does not exist",null);
            }



        } else {

            callback.invoke("database not initilaized with id " + ID, null);
        }


    }

    @ReactMethod
    public void setMapAsync(final String ID, final String key, final ReadableMap value, final boolean isArray, final Promise promise) {

        if (mmkvMap.containsKey(ID)) {
            final MMKV kv = mmkvMap.get(ID);

            dispatchQueue.postRunnable(new Runnable() {
                @Override
                public void run() {
                    Bundle bundle = Arguments.toBundle(value);
                    kv.encode(key, bundle);
                    promise.resolve(true);
                    if (isArray) {
                        indexer.addToArrayIndex(kv,key);
                    } else {
                        indexer.addToMapIndex(kv,key);
                    }


                }
            });


        } else {
            promise.reject("Error", "database not initialized with given id");
        }

    }

    @ReactMethod
    public void getMapAsync(final String ID, final String key, final Promise promise) {

        if (mmkvMap.containsKey(ID)) {
            final MMKV kv = mmkvMap.get(ID);

            dispatchQueue.postRunnable(new Runnable() {
                @Override
                public void run() {
                    if (kv.containsKey(key)) {
                        Bundle bundle = kv.decodeParcelable(key, Bundle.class);
                        WritableMap map = Arguments.fromBundle(bundle);

                        promise.resolve(map);
                    } else {
                        promise.reject("Error", "Value for key does not exist");
                    }

                }
            });

        } else {
            promise.reject("Error", "database not initialized with given id");
        }

    }

    @ReactMethod
    public void setMap(final String ID, final String key, final ReadableMap value,final boolean isArray, @Nullable final Callback callback) {

        if (mmkvMap.containsKey(ID)) {
            final MMKV kv = mmkvMap.get(ID);

            dispatchQueue.postRunnable(new Runnable() {
                @Override
                public void run() {
                    Bundle bundle = Arguments.toBundle(value);
                    kv.encode(key, bundle);
                    callback.invoke(null, true);
                    if (isArray) {
                        indexer.addToArrayIndex(kv,key);
                    } else {
                        indexer.addToMapIndex(kv,key);
                    }


                }
            });


        } else {

            callback.invoke("database not initilaized with id " + ID, null);
        }

    }

    @ReactMethod
    public void getMap(final String ID, final String key, final Callback callback) {


        if (mmkvMap.containsKey(ID)) {
            final MMKV kv = mmkvMap.get(ID);

            dispatchQueue.postRunnable(new Runnable() {
                @Override
                public void run() {
                    if (kv.containsKey(key)) {

                        Bundle bundle = kv.decodeParcelable(key, Bundle.class);
                        WritableMap map = Arguments.fromBundle(bundle);
                        callback.invoke( null, map);

                    } else {

                        callback.invoke("Value for key does not exist",null);
                    }

                }
            });


        } else {

            callback.invoke("database not initilaized with id " + ID, null);
        }

    }

    @ReactMethod
    public void hasKeyAsync(final String ID, final String key, final Promise promise) {

        if (mmkvMap.containsKey(ID)) {
            final MMKV kv = mmkvMap.get(ID);

            promise.resolve(kv.containsKey(key));

        } else {
            promise.reject("Error", "database not initialized with given id");
        }




    }

    @ReactMethod
    public void hasKey(final String ID, final String key, final Callback callback) {


        if (mmkvMap.containsKey(ID)) {
            final MMKV kv = mmkvMap.get(ID);

            callback.invoke(null,kv.containsKey(key));


        } else {

            callback.invoke("database not initilaized with id " + ID, null);
        }



    }

    @ReactMethod
    public void getKeysAsync(final String ID, final Promise promise) {

        if (mmkvMap.containsKey(ID)) {
            final MMKV kv = mmkvMap.get(ID);

            dispatchQueue.postRunnable(new Runnable() {
                @Override
                public void run() {

                    String[] keys = kv.allKeys();
                    if (keys != null) {
                        WritableArray array = Arguments.fromJavaArgs(keys);
                        promise.resolve(array);
                    } else {
                        promise.reject("Error", "database appears to be empty");
                    }
                }
            });


        } else {
            promise.reject("Error", "database not initialized with given id");
        }
    }

    @ReactMethod
    public void getKeys(final String ID, final Callback callback) {

        if (mmkvMap.containsKey(ID)) {
            final MMKV kv = mmkvMap.get(ID);


            dispatchQueue.postRunnable(new Runnable() {
                @Override
                public void run() {

                    String[] keys = kv.allKeys();
                    if (keys != null) {

                        WritableArray array = Arguments.fromJavaArgs(keys);
                        callback.invoke(null, array);

                    } else {

                        callback.invoke("database appears to be empty",null);

                    }


                }
            });

        } else {

            callback.invoke("database not initilaized with id " + ID, null);
        }
    }

    @ReactMethod
    public void getMultipleItemsAsync(final String ID, final ReadableArray keys, final Promise promise) {

        if (mmkvMap.containsKey(ID)) {
            final MMKV kv = mmkvMap.get(ID);

            dispatchQueue.postRunnable(new Runnable() {
                @Override
                public void run() {

                    WritableArray args = Arguments.createArray();

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
                }
            });


        } else {
            promise.reject("Error", "database not initialized with given id");
        }
    }

    @ReactMethod
    public void getMultipleItems(final String ID, final ReadableArray keys, final Callback callback) {

        if (mmkvMap.containsKey(ID)) {
            final MMKV kv = mmkvMap.get(ID);

            dispatchQueue.postRunnable(new Runnable() {
                @Override
                public void run() {

                    WritableArray args = Arguments.createArray();

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
                    callback.invoke(null, args);
                }
            });


        } else {

            callback.invoke("database not initilaized with id " + ID, null);
        }



    }

    @ReactMethod
    public void removeItem(final String ID, final String key, final Promise promise) {

        if (mmkvMap.containsKey(ID)) {
            final MMKV kv = mmkvMap.get(ID);

            if (kv.containsKey(key)) {
                kv.removeValueForKey(key);
                promise.resolve(key);
            } else {
                promise.resolve(true);
            }


        } else {
            promise.reject("Error", "database not initialized with given id");
        }
    }

    @ReactMethod
    public void clearStore(final String ID, final Promise promise) {

        if (mmkvMap.containsKey(ID)) {
            final MMKV kv = mmkvMap.get(ID);
            kv.clearAll();
            kv.encode(ID,true);
            promise.resolve(true);

        } else {
            promise.reject("Error", "database not initialized with given id");
        }

    }


    @ReactMethod
    public void clearMemoryCache(final  String ID, final Promise promise) {

        if (mmkvMap.containsKey(ID)) {

            MMKV kv = mmkvMap.get(ID);
            kv.clearMemoryCache();
            promise.resolve(true);
        } else {

            promise.reject("Error","database is not initialized");
        }

    }



    @ReactMethod
    public  void getAllStringsAsync(final String ID, final Promise promise) {

        if (mmkvMap.containsKey(ID)) {
            dispatchQueue.postRunnable(new Runnable() {
                @Override
                public void run() {

                    MMKV kv = mmkvMap.get(ID);
                    promise.resolve(indexer.getAllStrings(kv));

                }
            });


        } else {

            promise.reject("Error","database is not initialized");
        }
    }

    @ReactMethod
    public  void getAllMapsAsync(final String ID, final Promise promise) {

        if (mmkvMap.containsKey(ID)) {
            dispatchQueue.postRunnable(new Runnable() {
                @Override
                public void run() {

                    MMKV kv = mmkvMap.get(ID);
                    promise.resolve(indexer.getAllMaps(kv));

                }
            });


        } else {

            promise.reject("Error","database is not initialized");
        }
    }

    @ReactMethod
    public  void getAllArraysAsync(final String ID, final Promise promise) {

        if (mmkvMap.containsKey(ID)) {
            dispatchQueue.postRunnable(new Runnable() {
                @Override
                public void run() {

                    MMKV kv = mmkvMap.get(ID);
                    promise.resolve(indexer.getAllArrays(kv));

                }
            });


        } else {

            promise.reject("Error","database is not initialized");
        }
    }



    @ReactMethod
    public  void getAllIntsAsync(final String ID, final Promise promise) {

        if (mmkvMap.containsKey(ID)) {
            dispatchQueue.postRunnable(new Runnable() {
                @Override
                public void run() {

                    MMKV kv = mmkvMap.get(ID);
                    promise.resolve(indexer.getAllInts(kv));

                }
            });


        } else {

            promise.reject("Error","database is not initialized");
        }


    }

    @ReactMethod
    public  void getAllBooleansAsync(final String ID, final Promise promise) {

        if (mmkvMap.containsKey(ID)) {
            dispatchQueue.postRunnable(new Runnable() {
                @Override
                public void run() {

                    MMKV kv = mmkvMap.get(ID);
                    promise.resolve(indexer.getAllBooleans(kv));

                }
            });


        } else {

            promise.reject("Error","database is not initialized");
        }
    }

    @ReactMethod
    public void getAllStrings(final String ID, final Callback callback) {

        if (mmkvMap.containsKey(ID)) {
            dispatchQueue.postRunnable(new Runnable() {
                @Override
                public void run() {

                    MMKV kv = mmkvMap.get(ID);
                    callback.invoke(null,indexer.getAllStrings(kv) );

                }
            });


        } else {

            callback.invoke("database is not initialized with ID " + ID,null);

        }
    }

    @ReactMethod
    public void getAllInts(final String ID, final Callback callback) {

        if (mmkvMap.containsKey(ID)) {
            dispatchQueue.postRunnable(new Runnable() {
                @Override
                public void run() {

                    MMKV kv = mmkvMap.get(ID);
                    callback.invoke(null,indexer.getAllInts(kv) );

                }
            });


        } else {

            callback.invoke("database is not initialized with ID " + ID,null);

        }
    }


    @ReactMethod
    public void getAllBooleans(final String ID, final Callback callback) {

        if (mmkvMap.containsKey(ID)) {
            dispatchQueue.postRunnable(new Runnable() {
                @Override
                public void run() {

                    MMKV kv = mmkvMap.get(ID);
                    callback.invoke(null,indexer.getAllBooleans(kv) );

                }
            });


        } else {

            callback.invoke("database is not initialized with ID " + ID,null);

        }
    }

    @ReactMethod
    public void getAllMaps(final String ID, final Callback callback) {

        if (mmkvMap.containsKey(ID)) {
            dispatchQueue.postRunnable(new Runnable() {
                @Override
                public void run() {

                    MMKV kv = mmkvMap.get(ID);
                    callback.invoke(null,indexer.getAllMaps(kv) );

                }
            });


        } else {

            callback.invoke("database is not initialized with ID " + ID,null);

        }
    }

    @ReactMethod
    public void getAllArrays(final String ID, final Callback callback) {

        if (mmkvMap.containsKey(ID)) {
            dispatchQueue.postRunnable(new Runnable() {
                @Override
                public void run() {

                    MMKV kv = mmkvMap.get(ID);
                    callback.invoke(null,indexer.getAllArrays(kv) );

                }
            });

        } else {

            callback.invoke("database is not initialized with ID " + ID,null);

        }
    }


    // SECURE STORAGE



    private boolean useKeystore() {
        return Build.VERSION.SDK_INT >= Build.VERSION_CODES.M;
    }

    @ReactMethod
    public void setSecureKey(String key, String value, @Nullable ReadableMap options, Callback callback) {


        if (useKeystore()) {

            try {
                Locale initialLocale = Locale.getDefault();
                if (isRTL(initialLocale)) {
                    Locale.setDefault(Locale.ENGLISH);
                    rnKeyStore.setCipherText(getReactApplicationContext(), key, value);
                    callback.invoke(false, true);
                    Locale.setDefault(initialLocale);
                } else {
                    rnKeyStore.setCipherText(getReactApplicationContext(), key, value);
                    callback.invoke(false, true);
                }
            } catch (Exception e) {
                callback.invoke(e.getMessage(), false);
            }

        } else {
            try {
                SharedPreferences.Editor editor = prefs.edit();
                editor.putString(key, value);
                editor.apply();
                callback.invoke(false, true);
            } catch (Exception e) {
                callback.invoke(e.getMessage(), false);
            }
        }
    }

    @ReactMethod
    public void getSecureKey(String key, Callback callback) {
        if (useKeystore()) {
            try {
                String value = rnKeyStore.getPlainText(getReactApplicationContext(), key);
                callback.invoke(null, value);
            } catch (FileNotFoundException fnfe) {
                callback.invoke(fnfe.getMessage(), null);
            } catch (Exception e) {
                callback.invoke(e.getMessage(), null);
            }
        } else {
            try {
                String value = prefs.getString(key, null);
                callback.invoke(null, value);

            } catch (IllegalViewOperationException e) {
                callback.invoke(e.getMessage(), null);
            }
        }
    }

    @ReactMethod
    public void secureKeyExists(String key, Callback callback) {
        if (useKeystore()) {
            try {

                boolean exists = rnKeyStore.exists(getReactApplicationContext(), key);
                callback.invoke(null, exists);

            } catch (Exception e) {
                callback.invoke(e.getMessage(), null);
            }
        } else {
            try {
                boolean exists = prefs.contains(key);
                callback.invoke(null, exists);
            } catch (IllegalViewOperationException e) {
                callback.invoke(e.getMessage(), null);
            }
        }
    }

    @ReactMethod
    public void removeSecureKey(String key, Callback callback) {
        ArrayList<Boolean> fileDeleted = new ArrayList<Boolean>();
        if (useKeystore()) {
            try {
                for (String filename : new String[]{
                        Constants.SKS_DATA_FILENAME + key,
                        Constants.SKS_KEY_FILENAME + key,
                }) {
                    fileDeleted.add(getReactApplicationContext().deleteFile(filename));
                }
                if (!fileDeleted.get(0) || !fileDeleted.get(1)) {
                    callback.invoke("404: Key not found", null);
                } else {
                    callback.invoke(null, true);

                }
            } catch (Exception e) {
                callback.invoke(e.getMessage(), null);
            }
        } else {
            try {
                if (prefs.getString(key, null) == null) {
                    callback.invoke("404: Key not found", null);
                } else {
                    SharedPreferences.Editor editor = prefs.edit();
                    editor.remove(key).apply();
                    callback.invoke(null, true);
                }
            } catch (Exception e) {
                callback.invoke(e.getMessage(), null);
            }
        }
    }

}