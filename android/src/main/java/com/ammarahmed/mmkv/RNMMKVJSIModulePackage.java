package com.ammarahmed.mmkv;

import com.facebook.react.bridge.JSIModulePackage;
import com.facebook.react.bridge.JSIModuleSpec;
import com.facebook.react.bridge.JavaScriptContextHolder;
import com.facebook.react.bridge.ReactApplicationContext;
import java.util.Collections;
import java.util.List;

public class RNMMKVJSIModulePackage implements JSIModulePackage {
    @Override
    public List<JSIModuleSpec> getJSIModules(ReactApplicationContext reactApplicationContext, JavaScriptContextHolder jsContext) {
        RNMMKVModule.libLoaded = false;
        RNMMKVModule.installLib(jsContext, reactApplicationContext.getFilesDir().getAbsolutePath() + "/mmkv");
        return Collections.emptyList();
    }
}
