
package com.ammarahmed.mmkv;

import java.util.Map;
import java.util.HashMap;

import androidx.annotation.Nullable;

import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.TurboReactPackage;
import com.facebook.react.module.model.ReactModuleInfo;
import com.facebook.react.module.model.ReactModuleInfoProvider;

public class RNMMKVPackage extends TurboReactPackage {
  @Nullable
  @Override
  public NativeModule getModule(String name, ReactApplicationContext reactContext) {
    if (name.equals(RNMMKVModule.NAME)) {
      return new RNMMKVModule(reactContext);
    } else {
      return null;
    }
  }

  @Override
  public ReactModuleInfoProvider getReactModuleInfoProvider() {
    return () -> {
      final Map<String, ReactModuleInfo> moduleInfos = new HashMap<>();
      boolean isTurboModule = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED;
      moduleInfos.put(
              RNMMKVModule.NAME,
              new ReactModuleInfo(
                      RNMMKVModule.NAME,
                      RNMMKVModule.NAME,
                      false, // canOverrideExistingModule
                      false, // needsEagerInit
                      true, // hasConstants
                      false, // isCxxModule
                      true // isTurboModule
              ));
      return moduleInfos;
    };
  }
}