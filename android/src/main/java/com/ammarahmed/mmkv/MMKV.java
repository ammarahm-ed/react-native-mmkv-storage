package com.ammarahmed.mmkv;

import android.content.Context;
import android.os.Parcel;
import android.os.Parcelable;

import androidx.annotation.Nullable;


import java.lang.reflect.Field;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Set;

public class MMKV {

    static public final int SINGLE_PROCESS_MODE = 0x1;
    static public final int MULTI_PROCESS_MODE = 0x2;
    private long nativeHandle;
    private static final Set<Long> checkedHandleSet;
    private String rootDir;

    static {
        checkedHandleSet = Collections.synchronizedSet(new HashSet<Long>());
    }

    // call on program start
    public static String initialize(Context context) {
        String root = context.getFilesDir().getAbsolutePath() + "/mmkv";
       return initialize(root);
    }

    public static String initialize(String rootDir) {

        jniInitialize(rootDir, 0);
        rootDir = rootDir;
        return rootDir;
    }

    private static native void jniInitialize(String rootDir, int level);


    @Nullable
    public static MMKV mmkvWithID(String mmapID) {

        long handle = getMMKVWithID(mmapID, SINGLE_PROCESS_MODE, null, null);
       return  checkProcessMode(handle, mmapID, SINGLE_PROCESS_MODE);
    }

    @Nullable
    public static MMKV mmkvWithID(String mmapID, int mode, @Nullable String cryptKey) {

        long handle = getMMKVWithID(mmapID, mode, cryptKey, null);
        return checkProcessMode(handle, mmapID, mode);
    }

    @Nullable
    public static MMKV mmkvWithID(String mmapID, int mode) {


        long handle = getMMKVWithID(mmapID, mode, null, null);
        return checkProcessMode(handle, mmapID, mode);
    }

    private native static long
    getMMKVWithID(String mmapID, int mode, @Nullable String cryptKey, @Nullable String rootPath);


    @Nullable
    private static MMKV checkProcessMode(long handle, String mmapID, int mode) {
        if (handle == 0) {
            return null;
        }
        if (!checkedHandleSet.contains(handle)) {
            if (!checkProcessMode(handle)) {
                String message;
                if (mode == SINGLE_PROCESS_MODE) {
                    message = "Opening a multi-process MMKV instance [" + mmapID + "] with SINGLE_PROCESS_MODE!";
                } else {
                    message = "Opening a MMKV instance [" + mmapID + "] with MULTI_PROCESS_MODE, ";
                    message += "while it's already been opened with SINGLE_PROCESS_MODE by someone somewhere else!";
                }
                throw new IllegalArgumentException(message);
            }
            checkedHandleSet.add(handle);
        }

        return new MMKV(handle);

    }

    private MMKV(long handle) {
        nativeHandle = handle;
    }

    private static native boolean checkProcessMode(long handle);

    public boolean containsKey(String key) {
        return containsKey(nativeHandle, key);
    }
    private native boolean containsKey(long handle, String key);

    @SuppressWarnings("unchecked")
    @Nullable
    public <T extends Parcelable> T decodeParcelable(String key, Class<T> tClass) {
        return decodeParcelable(key, tClass, null);
    }

    @SuppressWarnings("unchecked")
    @Nullable
    public <T extends Parcelable> T decodeParcelable(String key, Class<T> tClass, @Nullable T defaultValue) {
        if (tClass == null) {
            return defaultValue;
        }

        byte[] bytes = decodeBytes(nativeHandle, key);
        if (bytes == null) {
            return defaultValue;
        }

        Parcel source = Parcel.obtain();
        source.unmarshall(bytes, 0, bytes.length);
        source.setDataPosition(0);

        try {
            String name = tClass.toString();
            Parcelable.Creator<T> creator;
            synchronized (mCreators) {
                creator = (Parcelable.Creator<T>) mCreators.get(name);
                if (creator == null) {
                    Field f = tClass.getField("CREATOR");
                    creator = (Parcelable.Creator<T>) f.get(null);
                    if (creator != null) {
                        mCreators.put(name, creator);
                    }
                }
            }
            if (creator != null) {
                return creator.createFromParcel(source);
            } else {
                throw new Exception("Parcelable protocol requires a "
                        + "non-null static Parcelable.Creator object called "
                        + "CREATOR on class " + name);
            }
        } catch (Exception e) {

        } finally {
            source.recycle();
        }
        return defaultValue;
    }

    private static final HashMap<String, Parcelable.Creator<?>> mCreators = new HashMap<>();

    @Nullable
    private native byte[] decodeBytes(long handle, String key);

    public void removeValueForKey(String key) {
        removeValueForKey(nativeHandle, key);
    }

    private native void removeValueForKey(long handle, String key);

    @Nullable
    public Set<String> decodeStringSet(String key) {
        return decodeStringSet(key, null);
    }

    @Nullable
    public Set<String> decodeStringSet(String key, @Nullable Set<String> defaultValue) {
        return decodeStringSet(key, defaultValue, HashSet.class);
    }

    @Nullable
    private native String[] decodeStringSet(long handle, String key);

    @SuppressWarnings("unchecked")
    @Nullable
    public Set<String> decodeStringSet(String key, @Nullable Set<String> defaultValue, Class<? extends Set> cls) {
        String[] result = decodeStringSet(nativeHandle, key);
        if (result == null) {
            return defaultValue;
        }
        Set<String> a;
        try {
            a = cls.newInstance();
        } catch (IllegalAccessException e) {
            return defaultValue;
        } catch (InstantiationException e) {
            return defaultValue;
        }
        a.addAll(Arrays.asList(result));
        return a;
    }

    public int decodeInt(String key) {
        return decodeInt(nativeHandle, key, 0);
    }

    public int decodeInt(String key, int defaultValue) {
        return decodeInt(nativeHandle, key, defaultValue);
    }

    private native int decodeInt(long handle, String key, int defaultValue);

    public void putString(String key, @Nullable String value) {
        encodeString(nativeHandle, key, value);

    }

    private native boolean encodeString(long handle, String key, @Nullable String value);

    public boolean encode(String key, double value) {
        return encodeDouble(nativeHandle, key, value);
    }

    private native boolean encodeDouble(long handle, String key, double value);


    public boolean encode(String key, @Nullable Set<String> value) {
        return encodeSet(nativeHandle, key, (value == null) ? null : value.toArray(new String[0]));
    }

    private native boolean encodeSet(long handle, String key, @Nullable String[] value);



}
