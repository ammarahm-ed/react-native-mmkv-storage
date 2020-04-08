package com.ammarahmed.mmkv;

import android.os.Bundle;

import androidx.annotation.Nullable;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.tencent.mmkv.MMKV;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

public class IDStore {

    private MMKV store;


    public IDStore(MMKV kv) {

        store = kv;
    }


    public void add(String ID, boolean encrypted, @Nullable String alias) {

        boolean hasKey = store.containsKey("mmkvIdStore");
        HashMap<String, Object> IdStore = new HashMap<>();
        if (hasKey) {
            Bundle mmkvIdStore = store.decodeParcelable("mmkvIdStore", Bundle.class);
            IdStore = (HashMap<String, Object>) mmkvIdStore.getSerializable("mmkvIdStore");

        }

        HashMap<String, Object> child = new HashMap<>();
        child.put("ID", ID);
        child.put("encrypted", encrypted);
        child.put(alias, alias);
        IdStore.put(ID, child);

        Bundle bundle = new Bundle();
        bundle.putSerializable("mmkvIdStore", IdStore);

        store.encode("mmkvIdStore", bundle);

    }

    public boolean encrypted(String ID) {

        boolean hasKey = store.containsKey("mmkvIdStore");
        HashMap<String, Object> IdStore = new HashMap<>();

        if (!hasKey) {
            return false;
        }
        Bundle mmkvIdStore = store.decodeParcelable("mmkvIdStore", Bundle.class);
        IdStore = (HashMap<String, Object>) mmkvIdStore.getSerializable("mmkvIdStore");

        HashMap<String, Object> child = (HashMap<String, Object>) IdStore.get(ID);


        return (boolean) child.get("encrypted");


    }

    public String getAlias(String ID) {

        boolean hasKey = store.containsKey("mmkvIdStore");
        HashMap<String, Object> IdStore = new HashMap<>();

        if (!hasKey) {
            return null;
        }
        Bundle mmkvIdStore = store.decodeParcelable("mmkvIdStore", Bundle.class);
        IdStore = (HashMap<String, Object>) mmkvIdStore.getSerializable("mmkvIdStore");

        HashMap<String, Object> child = (HashMap<String, Object>) IdStore.get(ID);

        return (String) child.get("alias");

    }


    public HashMap<String, Object> getAll() {

        boolean hasKey = store.containsKey("mmkvIdStore");
        HashMap<String, Object> IdStore = new HashMap<>();

        if (!hasKey) {
            return null;
        }
        Bundle mmkvIdStore = store.decodeParcelable("mmkvIdStore", Bundle.class);
        IdStore = (HashMap<String, Object>) mmkvIdStore.getSerializable("mmkvIdStore");


        return IdStore;

    }


    public boolean exists(String ID) {
        boolean hasKey = store.containsKey("mmkvIdStore");
        if (hasKey) {
            Set<String> IdStore = new HashSet<>();
            IdStore = store.decodeStringSet("mmkvIdStore", IdStore);

            return IdStore.contains(ID);

        } else {

            return false;
        }

    }

}
