package com.ammarahmed.mmkv;

import android.os.Bundle;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.tencent.mmkv.MMKV;

import java.util.Map;

public class StorageGetters {

    private StorageIndexer storageIndexer;

    public StorageGetters(StorageIndexer indexer) {


        storageIndexer = indexer;


    }


    public void getItem(String ID, String key, int type, Map<String, MMKV> mmkvMap, Callback callback) {


        if (mmkvMap.containsKey(ID)) {
            final MMKV kv = mmkvMap.get(ID);

            String string;

            if (kv.containsKey(key)) {

                switch (type) {

                    case Constants.DATA_TYPE_STRING:

                        string = kv.decodeString(key);
                        callback.invoke(null, string != null? string : null);

                        break;
                    case Constants.DATA_TYPE_INT:

                        callback.invoke(null, kv.decodeInt(key));
                        break;
                    case Constants.DATA_TYPE_BOOL:

                        callback.invoke(null, kv.decodeBool(key));

                        break;
                    case Constants.DATA_TYPE_MAP:
                    case Constants.DATA_TYPE_ARRAY:
                        Bundle bundle = kv.decodeParcelable(key, Bundle.class);
                        WritableMap map = Arguments.fromBundle(bundle);
                        callback.invoke(null, map != null ? map : null);
                        break;
                    
                }

            } else {

                callback.invoke("Value for key does not exist", null);
            }


        } else {

            callback.invoke("database not initilaized with id " + ID, null);
        }


    }


    public void getMultipleItems(final String ID, final ReadableArray keys, Map<String, MMKV> mmkvMap, final Callback callback) {

        if (mmkvMap.containsKey(ID)) {
            final MMKV kv = mmkvMap.get(ID);


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


        } else {

            callback.invoke("database not initilaized with id " + ID, null);
        }


    }


    public void getItemsForType(String ID, int type, Map<String, MMKV> mmkvMap, Callback callback) {


        if (mmkvMap.containsKey(ID)) {
            final MMKV kv = mmkvMap.get(ID);


            switch (type) {

                case Constants.DATA_TYPE_STRING:


                    callback.invoke(null, storageIndexer.getAllStrings(kv));

                    break;
                case Constants.DATA_TYPE_INT:
                    callback.invoke(null, storageIndexer.getAllInts(kv));

                    break;
                case Constants.DATA_TYPE_BOOL:

                    callback.invoke(null, storageIndexer.getAllBooleans(kv));
                    break;
                case Constants.DATA_TYPE_MAP:

                    callback.invoke(null, storageIndexer.getAllMaps(kv));
                    break;
                case Constants.DATA_TYPE_ARRAY:

                    callback.invoke(null, storageIndexer.getAllArrays(kv));

                    break;

            }


        } else {

            callback.invoke("database not initilaized with id " + ID, null);
        }


    }


}
