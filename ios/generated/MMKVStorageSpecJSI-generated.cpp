/**
 * This code was generated by [react-native-codegen](https://www.npmjs.com/package/react-native-codegen).
 *
 * Do not edit this file as changes may cause incorrect behavior and will be lost
 * once the code is regenerated.
 *
 * @generated by codegen project: GenerateModuleCpp.js
 */

#include "MMKVStorageSpecJSI.h"

namespace facebook::react {

static jsi::Value __hostFunction_NativeMMKVStorageCxxSpecJSI_install(jsi::Runtime &rt, TurboModule &turboModule, const jsi::Value* args, size_t count) {
  return static_cast<NativeMMKVStorageCxxSpecJSI *>(&turboModule)->install(
    rt
  );
}

NativeMMKVStorageCxxSpecJSI::NativeMMKVStorageCxxSpecJSI(std::shared_ptr<CallInvoker> jsInvoker)
  : TurboModule("MMKVStorage", jsInvoker) {
  methodMap_["install"] = MethodMetadata {0, __hostFunction_NativeMMKVStorageCxxSpecJSI_install};
}


} // namespace facebook::react