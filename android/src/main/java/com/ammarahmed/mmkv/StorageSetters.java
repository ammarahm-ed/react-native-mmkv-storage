package com.ammarahmed.mmkv;

import android.os.Bundle;

import androidx.annotation.Nullable;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReadableMap;
import com.tencent.mmkv.MMKV;

import java.util.Map;

public class StorageSetters {

    private StorageIndexer indexer;

    public StorageSetters(StorageIndexer storageIndexer) {

        indexer = storageIndexer;

    }

    public void setItem(String ID, String key, int type, @Nullable String string, int number, boolean bool, @Nullable ReadableMap map, boolean isArray, Map<String, MMKV> mmkvMap, Callback callback) {


        if (mmkvMap.containsKey(ID)) {
            final MMKV kv = mmkvMap.get(ID);


            switch (type) {

                case Constants.DATA_TYPE_STRING:

                    kv.encode(key, string);
                    callback.invoke(null, true);
                    indexer.addToStringsIndex(kv, key);

                    break;
                case Constants.DATA_TYPE_INT:
                    kv.encode(key, number);
                    callback.invoke(null, true);
                    indexer.addToIntIndex(kv, key);
                    break;
                case Constants.DATA_TYPE_BOOL:
                    kv.encode(key, bool);
                    callback.invoke(null, true);
                    indexer.addToBoolIndex(kv, key);
                    break;
                case Constants.DATA_TYPE_MAP:

                    Bundle bundle = Arguments.toBundle(map);
                    kv.encode(key, bundle);

                    callback.invoke(null, true);

                    if (isArray) {
                        indexer.addToArrayIndex(kv, key);
                    } else {
                        indexer.addToMapIndex(kv, key);
                    }
                    break;

                default:
                    break;
            }

        } else {

            callback.invoke("database not initilaized with id " + ID, null);
        }


    }

}
