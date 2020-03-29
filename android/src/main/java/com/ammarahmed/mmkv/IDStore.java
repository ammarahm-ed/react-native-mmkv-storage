package com.ammarahmed.mmkv;

import com.tencent.mmkv.MMKV;

import java.util.HashSet;
import java.util.Set;

public class IDStore {

    private MMKV store;


    public IDStore(MMKV kv) {

        store = kv;
    }


    public void add(String ID) {

        boolean hasKey = store.containsKey("mmkvIdStore");

        if (hasKey) {
            Set<String> IdStore = new HashSet<>();
            IdStore = store.decodeStringSet("mmkvIdStore", IdStore);
            IdStore.add(ID);
            store.encode("mmkvIdStore", IdStore);
        } else {
            Set<String> IdStore = new HashSet<>();
            IdStore.add(ID);
            store.encode("mmkvIdStore", IdStore);
        }

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
