package com.ammarahmed.mmkv;

import android.os.Bundle;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.tencent.mmkv.MMKV;

import java.util.HashSet;
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

    public Set<String> getStringsIndex(MMKV kv) {

        Set<String> stringsIndex = new HashSet<>();
        stringsIndex = kv.decodeStringSet("stringsIndex", stringsIndex);

        if (stringsIndex != null) {
            return stringsIndex;
        } else {
            return null;
        }

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

    public Set<String> getMapIndex(MMKV kv) {

        Set<String> stringsIndex = new HashSet<>();
        stringsIndex = kv.decodeStringSet("mapIndex", stringsIndex);

        if (stringsIndex != null) {
            return stringsIndex;
        } else {
            return null;
        }

    }

    public WritableArray getAllMaps(MMKV kv) {

        Set<String> stringsIndex = new HashSet<>();
        stringsIndex = kv.decodeStringSet("mapIndex", stringsIndex);

        if (stringsIndex == null) return null;

        WritableArray array = Arguments.createArray();

        for (String string : stringsIndex) {

            WritableArray child = Arguments.createArray();
            child.pushString(string);
            Bundle bundle = kv.decodeParcelable(string,Bundle.class);
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

    public Set<String> getArrayIndex(MMKV kv) {

        Set<String> stringsIndex = new HashSet<>();
        stringsIndex = kv.decodeStringSet("arrayIndex", stringsIndex);

        if (stringsIndex != null) {
            return stringsIndex;
        } else {
            return null;
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
            Bundle bundle = kv.decodeParcelable(string,Bundle.class);
            WritableMap map = Arguments.fromBundle(bundle);
            child.pushArray(map.getArray(string));
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

    public Set<String> getIntIndex(MMKV kv) {

        Set<String> stringsIndex = new HashSet<>();
        stringsIndex = kv.decodeStringSet("intIndex", stringsIndex);

        if (stringsIndex != null) {
            return stringsIndex;
        } else {
            return null;
        }

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

    public Set<String> getBoolIndex(MMKV kv) {

        Set<String> stringsIndex = new HashSet<>();
        stringsIndex = kv.decodeStringSet("boolIndex", stringsIndex);

        if (stringsIndex != null) {
            return stringsIndex;
        } else {
            return null;
        }

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
