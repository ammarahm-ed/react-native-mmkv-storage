package com.ammarahmed.mmkv; // Change to your android package name

import com.facebook.react.bridge.JSIModulePackage;
import com.facebook.react.bridge.JSIModuleSpec;
import com.facebook.react.bridge.JavaScriptContextHolder;
import com.facebook.react.bridge.ReactApplicationContext;
import java.util.Collections;
import java.util.List;

//import com.swmansion.reanimated.ReanimatedJSIModulePackage; // <-- ADD THIS
//import com.ammarahmed.mmkv.RNMMKVModule; // <-- ADD THIS

public class RNMMKVJSIModulePackage implements JSIModulePackage { // Replace with ReanimatedJSIModulePackage 
    @Override
    public List<JSIModuleSpec> getJSIModules(ReactApplicationContext reactApplicationContext, JavaScriptContextHolder jsContext) {

        reactApplicationContext.getNativeModule(RNMMKVModule.class).installLib(jsContext, reactApplicationContext.getFilesDir().getAbsolutePath() + "/mmkv");

        return Collections.emptyList();
    }
}
