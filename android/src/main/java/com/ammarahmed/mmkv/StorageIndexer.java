package com.ammarahmed.mmkv;

import android.os.Bundle;
import android.util.Log;

import androidx.annotation.Nullable;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.tencent.mmkv.MMKV;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

public class StorageIndexer {

    public StorageIndexer(ReactContext context) {


    }

    public void addToStringsIndex(MMKV kv, String key) {

        Set<String> stringsIndex = new HashSet<>();

        if (kv.containsKey("stringsIndex")) {

            stringsIndex = kv.decodeStringSet("stringsIndex", stringsIndex);
            stringsIndex.add(key);

        } else {

            stringsIndex.add(key);
        }

        kv.encode("stringsIndex", stringsIndex);


    }

    public Set<String> getTypeIndex(String ID, int type, Map<String, MMKV> mmkvMap, @Nullable Promise promise) {


        Set<String> index = new HashSet<>();

        if (mmkvMap.containsKey(ID)) {
            final MMKV kv = mmkvMap.get(ID);


            switch (type) {

                case Constants.DATA_TYPE_STRING:

                    index = kv.decodeStringSet("stringsIndex", index);


                    break;
                case Constants.DATA_TYPE_INT:

                    index = kv.decodeStringSet("intIndex", index);

                    break;
                case Constants.DATA_TYPE_BOOL:

                    index = kv.decodeStringSet("boolIndex", index);


                    break;
                case Constants.DATA_TYPE_MAP:
                    index = kv.decodeStringSet("mapIndex", index);


                    break;

                case Constants.DATA_TYPE_ARRAY:
                    index = kv.decodeStringSet("arrayIndex", index);


                    break;


            }

            if (promise != null) {

                WritableArray array = Arguments.fromJavaArgs(index.toArray());

                promise.resolve(array);


            }

            return index;

        } else {

            if (promise != null) {
                promise.reject("database not initilaized with id " + ID);
            }

            return null;

        }


    }

    public void typeIndexerHasKey(String ID, String key, int type, Map<String, MMKV> mmkvMap, Promise promise) {


        Set<String> index = getTypeIndex(ID, type, mmkvMap, null);

        if (index == null) {
            promise.resolve(null);
        }

        promise.resolve(index.contains(key));


    }


    public WritableArray getAllStrings(MMKV kv) {

        Set<String> stringsIndex = new HashSet<>();
        stringsIndex = kv.decodeStringSet("stringsIndex", stringsIndex);

        if (stringsIndex == null) return null;

        WritableArray array = Arguments.createArray();

        for (String string : stringsIndex) {

            WritableArray child = Arguments.createArray();
            child.pushString(string);
            child.pushString(kv.decodeString(string));
            array.pushArray(child);

        }

        return array;

    }


    public void addToMapIndex(MMKV kv, String key) {

        Set<String> stringsIndex = new HashSet<>();

        if (kv.containsKey("mapIndex")) {

            stringsIndex = kv.decodeStringSet("mapIndex", stringsIndex);
            stringsIndex.add(key);

        } else {

            stringsIndex.add(key);
        }

        kv.encode("mapIndex", stringsIndex);


    }


    public WritableArray getAllMaps(MMKV kv) {

        Set<String> stringsIndex = new HashSet<>();
        stringsIndex = kv.decodeStringSet("mapIndex", stringsIndex);

        if (stringsIndex == null) return null;

        WritableArray array = Arguments.createArray();

        for (String string : stringsIndex) {

            WritableArray child = Arguments.createArray();
            child.pushString(string);
            Bundle bundle = kv.decodeParcelable(string, Bundle.class);
            WritableMap map = Arguments.fromBundle(bundle);
            child.pushMap(map);
            array.pushArray(child);

        }

        return array;

    }

    public void addToArrayIndex(MMKV kv, String key) {

        Set<String> stringsIndex = new HashSet<>();

        if (kv.containsKey("arrayIndex")) {

            stringsIndex = kv.decodeStringSet("arrayIndex", stringsIndex);
            stringsIndex.add(key);

        } else {

            stringsIndex.add(key);
        }

        kv.encode("arrayIndex", stringsIndex);


    }


    public void removeKeyFromIndexer(String ID, Map<String, MMKV> mmkvMap, String key) {


        Set<String> index = getTypeIndex(ID, Constants.DATA_TYPE_STRING, mmkvMap, null);


        final MMKV kv = mmkvMap.get(ID);

        if (index != null && index.contains(key)){
            Log.d("REMOVE","HERE REMOVINGG");
            index.remove(key);

            kv.encode("stringsIndex", index);

            return;
        }
        index = getTypeIndex(ID, Constants.DATA_TYPE_INT, mmkvMap, null);

        if (index != null && index.contains(key)) {
            index.remove(key);
            kv.encode("intIndex", index);
            return;
        }

        index = getTypeIndex(ID, Constants.DATA_TYPE_BOOL, mmkvMap, null);

        if (index != null && index.contains(key)) {
            index.remove(key);
            kv.encode("boolIndex", index);
            return;
        }

        index = getTypeIndex(ID, Constants.DATA_TYPE_ARRAY, mmkvMap, null);

        if (index != null && index.contains(key)) {
            index.remove(key);
            kv.encode("arrayIndex", index);
            return;
        }

        index = getTypeIndex(ID, Constants.DATA_TYPE_MAP, mmkvMap, null);

        if (index != null && index.contains(key)) {
            index.remove(key);
            kv.encode("mapIndex", index);
            return;
        }
    }



    public WritableArray getAllArrays(MMKV kv) {

        Set<String> stringsIndex = new HashSet<>();
        stringsIndex = kv.decodeStringSet("arrayIndex", stringsIndex);

        if (stringsIndex == null) return null;

        WritableArray array = Arguments.createArray();

        for (String string : stringsIndex) {

            WritableArray child = Arguments.createArray();
            child.pushString(string);
            Bundle bundle = kv.decodeParcelable(string, Bundle.class);
            WritableMap map = Arguments.fromBundle(bundle);

            List<Object> subChild = Arguments.toList(map.getArray(string));

            child.pushArray(Arguments.fromList(subChild));

            array.pushArray(child);

        }

        return array;

    }


    public void addToIntIndex(MMKV kv, String key) {

        Set<String> stringsIndex = new HashSet<>();

        if (kv.containsKey("intIndex")) {

            stringsIndex = kv.decodeStringSet("intIndex", stringsIndex);
            stringsIndex.add(key);

        } else {

            stringsIndex.add(key);
        }

        kv.encode("intIndex", stringsIndex);


    }


    public WritableArray getAllInts(MMKV kv) {

        Set<String> stringsIndex = new HashSet<>();
        stringsIndex = kv.decodeStringSet("intIndex", stringsIndex);

        if (stringsIndex == null) return null;

        WritableArray array = Arguments.createArray();

        for (String string : stringsIndex) {

            WritableArray child = Arguments.createArray();
            child.pushString(string);
            child.pushInt(kv.decodeInt(string));
            array.pushArray(child);

        }

        return array;

    }


    public void addToBoolIndex(MMKV kv, String key) {

        Set<String> stringsIndex = new HashSet<>();

        if (kv.containsKey("boolIndex")) {

            stringsIndex = kv.decodeStringSet("boolIndex", stringsIndex);
            stringsIndex.add(key);

        } else {

            stringsIndex.add(key);
        }

        kv.encode("boolIndex", stringsIndex);


    }


    public WritableArray getAllBooleans(MMKV kv) {

        Set<String> stringsIndex = new HashSet<>();
        stringsIndex = kv.decodeStringSet("boolIndex", stringsIndex);

        if (stringsIndex == null) return null;

        WritableArray array = Arguments.createArray();

        for (String string : stringsIndex) {

            WritableArray child = Arguments.createArray();
            child.pushString(string);
            child.pushBoolean(kv.decodeBool(string));
            array.pushArray(child);

        }

        return array;

    }

}
