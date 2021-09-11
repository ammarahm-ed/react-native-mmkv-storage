#include <jni.h>
#include <jsi/jsi.h>

#include "MMKV.h"
#include "MMKVPredef.h"
#include "MMBuffer.h"

using namespace facebook;
using namespace jsi;
using namespace std;

static vector<MMKV *> mmkvInstances;

string rPath = "";
JavaVM *vm;
jclass mmkvclass;
jobject mmkvobject;


static string jstring2string(JNIEnv *env, jstring str) {
    if (str) {
        const char *kstr = env->GetStringUTFChars(str, nullptr);
        if (kstr) {
            string result(kstr);
            env->ReleaseStringUTFChars(str, kstr);
            return result;
        }
    }
    return "";
}


std::string j_string_to_string(JNIEnv *env, jstring jStr) {
    if (!jStr) return "";

    const auto stringClass = env->GetObjectClass(jStr);
    const auto getBytes = env->GetMethodID(stringClass, "getBytes", "(Ljava/lang/String;)[B");
    const auto stringJbytes = (jbyteArray) env->CallObjectMethod(jStr, getBytes,
                                                                 env->NewStringUTF("UTF-8"));

    auto length = (size_t) env->GetArrayLength(stringJbytes);
    auto pBytes = env->GetByteArrayElements(stringJbytes, nullptr);

    std::string ret = std::string((char *) pBytes, length);
    env->ReleaseByteArrayElements(stringJbytes, pBytes, JNI_ABORT);

    env->DeleteLocalRef(stringJbytes);
    env->DeleteLocalRef(stringClass);
    return ret;
}


static jstring string2jstring(JNIEnv *env, const string &str) {
    return (*env).NewStringUTF(str.c_str());
}

static jobjectArray vector2jarray(JNIEnv *env, const vector<string> &arr) {
    if (!arr.empty()) {
        jobjectArray result = env->NewObjectArray(arr.size(), env->FindClass("java/lang/String"),
                                                  nullptr);
        if (result) {
            for (size_t index = 0; index < arr.size(); index++) {
                jstring value = string2jstring(env, arr[index]);
                env->SetObjectArrayElement(result, index, value);
                env->DeleteLocalRef(value);
            }
        }
        return result;
    }
    return nullptr;
}


static vector<string> jarray2vector(JNIEnv *env, jobjectArray array) {
    vector<string> keys;
    if (array) {
        jsize size = env->GetArrayLength(array);
        keys.reserve(size);
        for (jsize i = 0; i < size; i++) {
            jstring str = (jstring) env->GetObjectArrayElement(array, i);
            if (str) {
                keys.push_back(jstring2string(env, str));
                env->DeleteLocalRef(str);
            }
        }
    }
    return keys;
}

static MMKV *getInstance(string ID) {
    auto kv = std::find_if(mmkvInstances.begin(), mmkvInstances.end(), [&ID](MMKV *inst) {
        return inst->mmapID() == ID;
    });

    if (kv == mmkvInstances.end()) {
        return nullptr;
    }
    return *kv;
}


static MMKV *createInstance(string ID, MMKVMode mode, string key, string path) {

    MMKV *kv;

    for (int i = 0; i < mmkvInstances.size(); i++) {
        MMKV *instance = mmkvInstances[i];
        if (instance->mmapID() == ID) {
            *mmkvInstances.erase(mmkvInstances.begin() + i);
        }
    }

    if (key == "" && path != "") {
        kv = MMKV::mmkvWithID(ID, mmkv::DEFAULT_MMAP_SIZE, mode, nullptr, &path);
    } else if (path == "" && key != "") {
        kv = MMKV::mmkvWithID(ID, mmkv::DEFAULT_MMAP_SIZE, mode, &key);
        kv->clearMemoryCache();
    } else if (path != "" && key != "") {
        kv = MMKV::mmkvWithID(ID, mmkv::DEFAULT_MMAP_SIZE, mode, &key, &path);
    } else {
        kv = MMKV::mmkvWithID(ID, mmkv::DEFAULT_MMAP_SIZE, mode);
    }


    mmkvInstances.push_back(kv);
    return kv;
}

static void setIndex(MMKV *kv, string type, string key) {
    vector<string> indexer;
    kv->getVector(type, indexer);

    if (find(indexer.begin(), indexer.end(), key) == indexer.end()) {
        indexer.insert(indexer.end(), key);
        kv->set(indexer, type);
        return;
    }
}

static vector<string> getIndex(MMKV *kv, string type) {
    vector<string> indexer;
    kv->getVector(type, indexer);

    return indexer;
}

static void removeFromIndex(MMKV *kv, string key) {
    vector<string> sindexer;
    kv->getVector("stringIndex", sindexer);
    if (find(sindexer.begin(), sindexer.end(), key) != sindexer.end()) {
        sindexer.erase(std::remove(sindexer.begin(), sindexer.end(), key), sindexer.end());
        return;
    }

    vector<string> nindexer;
    kv->getVector("numberIndex", nindexer);
    if (find(nindexer.begin(), nindexer.end(), key) != nindexer.end()) {
        nindexer.erase(std::remove(nindexer.begin(), nindexer.end(), key), nindexer.end());
        return;
    }

    vector<string> bindexer;
    kv->getVector("boolIndex", bindexer);
    if (find(bindexer.begin(), bindexer.end(), key) != bindexer.end()) {
        bindexer.erase(std::remove(bindexer.begin(), bindexer.end(), key), bindexer.end());
        return;
    }

    vector<string> mindexer;
    kv->getVector("mapIndex", mindexer);
    if (find(mindexer.begin(), mindexer.end(), key) != mindexer.end()) {
        mindexer.erase(std::remove(mindexer.begin(), mindexer.end(), key), mindexer.end());
        return;
    }

    vector<string> aindexer;
    kv->getVector("arrayIndex", aindexer);
    if (find(aindexer.begin(), aindexer.end(), key) != aindexer.end()) {
        aindexer.erase(std::remove(aindexer.begin(), aindexer.end(), key), aindexer.end());
        return;
    }
}


void install(Runtime &jsiRuntime) {

    auto initializeMMKV = Function::createFromHostFunction(jsiRuntime,
                                                           PropNameID::forAscii(jsiRuntime,
                                                                                "initializeMMKV"),
                                                           0,
                                                           [](Runtime &runtime,
                                                              const Value &thisValue,
                                                              const Value *arguments,
                                                              size_t count) -> Value {
                                                               MMKV::initializeMMKV(rPath);
                                                               return Value::undefined();
                                                           });

    jsiRuntime.global().setProperty(jsiRuntime, "initializeMMKV", move(initializeMMKV));

    auto setupMMKVInstance = Function::createFromHostFunction(jsiRuntime,
                                                              PropNameID::forAscii(jsiRuntime,
                                                                                   "setupMMKVInstance"),
                                                              4,
                                                              [](Runtime &runtime,
                                                                 const Value &thisValue,
                                                                 const Value *arguments,
                                                                 size_t count) -> Value {
                                                                  string ID = arguments[0].getString(
                                                                                  runtime)
                                                                          .utf8(runtime);

                                                                  MMKVMode mode = (MMKVMode) (int) arguments[1].getNumber();
                                                                  string cryptKey = arguments[2].getString(
                                                                                  runtime)
                                                                          .utf8(
                                                                                  runtime);

                                                                  MMKVPath_t path = arguments[3].getString(
                                                                                  runtime)
                                                                          .utf8(
                                                                                  runtime);

                                                                  createInstance(ID, mode,
                                                                                 cryptKey,
                                                                                 path);

                                                                  return Value(true);
                                                              });

    jsiRuntime.global().setProperty(jsiRuntime, "setupMMKVInstance", move(setupMMKVInstance));


    auto getSecureKey = Function::createFromHostFunction(jsiRuntime,
                                                         PropNameID::forAscii(jsiRuntime,
                                                                              "getSecureKey"),
                                                         1,
                                                         [](Runtime &runtime,
                                                            const Value &thisValue,
                                                            const Value *arguments,
                                                            size_t count) -> Value {

                                                             string alias = arguments[0].getString(
                                                                             runtime)
                                                                     .utf8(
                                                                             runtime);

                                                             JNIEnv *env;
                                                             bool attached = vm->AttachCurrentThread(
                                                                     &env, NULL);
                                                             mmkvclass = env->GetObjectClass(
                                                                     mmkvobject);

                                                             jstring jstr1 = string2jstring(env,
                                                                                            alias);
                                                             jvalue params[1];
                                                             params[0].l = jstr1;
                                                             jmethodID getSecureKey = env->GetMethodID(
                                                                     mmkvclass, "getSecureKey",
                                                                     "(Ljava/lang/String;)Ljava/lang/String;");
                                                             jobject result = env->CallObjectMethodA(
                                                                     mmkvobject, getSecureKey,
                                                                     params);
                                                             const char *str = env->GetStringUTFChars(
                                                                     (jstring) result, NULL);
                                                             string cryptKey = j_string_to_string(
                                                                     env, env->NewStringUTF(str));
                                                             if (attached) {
                                                                 vm->DetachCurrentThread();
                                                             }
                                                             return Value(runtime,
                                                                          String::createFromUtf8(
                                                                                  runtime,
                                                                                  cryptKey));
                                                         });

    jsiRuntime.global().setProperty(jsiRuntime, "getSecureKey", move(getSecureKey));

    auto setSecureKey = Function::createFromHostFunction(jsiRuntime,
                                                         PropNameID::forAscii(jsiRuntime,
                                                                              "setSecureKey"),
                                                         3,
                                                         [](Runtime &runtime,
                                                            const Value &thisValue,
                                                            const Value *arguments,
                                                            size_t count) -> Value {

                                                             string alias = arguments[0].getString(
                                                                             runtime)
                                                                     .utf8(
                                                                             runtime);
                                                             string key = arguments[1].getString(
                                                                             runtime)
                                                                     .utf8(
                                                                             runtime);


                                                             JNIEnv *env;
                                                             bool attached = vm->AttachCurrentThread(
                                                                     &env, NULL);
                                                             mmkvclass = env->GetObjectClass(
                                                                     mmkvobject);

                                                             jstring jstr1 = string2jstring(env,
                                                                                            alias);
                                                             jstring jstr2 = string2jstring(env,
                                                                                            key);

                                                             jvalue params[2];
                                                             params[0].l = jstr1;
                                                             params[1].l = jstr2;

                                                             jmethodID setSecureKey = env->GetMethodID(
                                                                     mmkvclass, "setSecureKey",
                                                                     "(Ljava/lang/String;Ljava/lang/String;)V");
                                                             env->CallVoidMethodA(mmkvobject,
                                                                                  setSecureKey,
                                                                                  params);
                                                             if (attached) {
                                                                 vm->DetachCurrentThread();
                                                             }

                                                             return Value(true);
                                                         });

    jsiRuntime.global().setProperty(jsiRuntime, "setSecureKey", move(setSecureKey));

    auto secureKeyExists = Function::createFromHostFunction(jsiRuntime,
                                                            PropNameID::forAscii(jsiRuntime,
                                                                                 "secureKeyExists"),
                                                            1,
                                                            [](Runtime &runtime,
                                                               const Value &thisValue,
                                                               const Value *arguments,
                                                               size_t count) -> Value {

                                                                string alias = arguments[0].getString(
                                                                                runtime)
                                                                        .utf8(
                                                                                runtime);

                                                                JNIEnv *env;
                                                                bool attached = vm->AttachCurrentThread(
                                                                        &env, NULL);
                                                                mmkvclass = env->GetObjectClass(
                                                                        mmkvobject);

                                                                jstring jstr1 = string2jstring(env,
                                                                                               alias);
                                                                jvalue params[1];
                                                                params[0].l = jstr1;

                                                                jmethodID secureKeyExists = env->GetMethodID(
                                                                        mmkvclass,
                                                                        "secureKeyExists",
                                                                        "(Ljava/lang/String;)Z");
                                                                bool exists = env->CallBooleanMethodA(
                                                                        mmkvobject, secureKeyExists,
                                                                        params);
                                                                if (attached) {
                                                                    vm->DetachCurrentThread();
                                                                }

                                                                return Value(exists);
                                                            });

    jsiRuntime.global().setProperty(jsiRuntime, "secureKeyExists", move(secureKeyExists));

    auto removeSecureKey = Function::createFromHostFunction(jsiRuntime,
                                                            PropNameID::forAscii(jsiRuntime,
                                                                                 "removeSecureKey"),
                                                            1,
                                                            [](Runtime &runtime,
                                                               const Value &thisValue,
                                                               const Value *arguments,
                                                               size_t count) -> Value {

                                                                string alias = arguments[0].getString(
                                                                                runtime)
                                                                        .utf8(
                                                                                runtime);

                                                                JNIEnv *env;
                                                                bool attached = vm->AttachCurrentThread(
                                                                        &env, NULL);
                                                                mmkvclass = env->GetObjectClass(
                                                                        mmkvobject);

                                                                jstring jstr1 = string2jstring(env,
                                                                                               alias);
                                                                jvalue params[1];
                                                                params[0].l = jstr1;

                                                                jmethodID removeSecureKey = env->GetMethodID(
                                                                        mmkvclass,
                                                                        "removeSecureKey",
                                                                        "(Ljava/lang/String;)V");
                                                                env->CallVoidMethodA(mmkvobject,
                                                                                     removeSecureKey,
                                                                                     params);
                                                                if (attached) {
                                                                    vm->DetachCurrentThread();
                                                                }

                                                                return Value(true);
                                                            });

    jsiRuntime.global().setProperty(jsiRuntime, "removeSecureKey", move(removeSecureKey));


    auto setStringMMKV = Function::createFromHostFunction(jsiRuntime,
                                                          PropNameID::forAscii(jsiRuntime,
                                                                               "setStringMMKV"),
                                                          3,
                                                          [](Runtime &runtime,
                                                             const Value &thisValue,
                                                             const Value *arguments,
                                                             size_t count) -> Value {
                                                              MMKV *kv = getInstance(
                                                                      arguments[2].getString(
                                                                                      runtime)
                                                                              .utf8(runtime));
                                                              if (!kv) {
                                                                  return Value::undefined();
                                                              }

                                                              string key = arguments[0].getString(
                                                                              runtime)
                                                                      .utf8(
                                                                              runtime);

                                                              setIndex(kv, "stringIndex", key);

                                                              kv->set(arguments[1].getString(
                                                                              runtime)
                                                                              .utf8(runtime),
                                                                      key);

                                                              return Value(true);
                                                          });

    jsiRuntime.global().setProperty(jsiRuntime, "setStringMMKV", move(setStringMMKV));

    auto getStringMMKV = Function::createFromHostFunction(jsiRuntime,
                                                          PropNameID::forAscii(jsiRuntime,
                                                                               "getStringMMKV"),
                                                          2,
                                                          [](Runtime &runtime,
                                                             const Value &thisValue,
                                                             const Value *arguments,
                                                             size_t count) -> Value {
                                                              MMKV *kv = getInstance(
                                                                      arguments[1].getString(
                                                                                      runtime)
                                                                              .utf8(runtime));
                                                              if (!kv) {
                                                                  return Value::undefined();
                                                              }

                                                              string result;
                                                              bool exists = kv->getString(
                                                                      arguments[0].getString(
                                                                                      runtime)
                                                                              .utf8(
                                                                                      runtime),
                                                                      result);
                                                              if (!exists) {
                                                                  return Value::null();
                                                              }

                                                              return Value(runtime,
                                                                           String::createFromUtf8(
                                                                                   runtime,
                                                                                   result));
                                                          });

    jsiRuntime.global().setProperty(jsiRuntime, "getStringMMKV", move(getStringMMKV));

    auto setMapMMKV = Function::createFromHostFunction(jsiRuntime,
                                                       PropNameID::forAscii(jsiRuntime,
                                                                            "setMapMMKV"),
                                                       3,
                                                       [](Runtime &runtime,
                                                          const Value &thisValue,
                                                          const Value *arguments,
                                                          size_t count) -> Value {
                                                           MMKV *kv = getInstance(
                                                                   arguments[2].getString(
                                                                                   runtime)
                                                                           .utf8(runtime));
                                                           if (!kv) {
                                                               return Value::undefined();
                                                           }

                                                           string key = arguments[0].getString(
                                                                           runtime)
                                                                   .utf8(
                                                                           runtime);

                                                           setIndex(kv, "mapIndex", key);

                                                           kv->set(arguments[1].getString(
                                                                           runtime)
                                                                           .utf8(runtime),
                                                                   key);

                                                           return Value(true);
                                                       });

    jsiRuntime.global().setProperty(jsiRuntime, "setMapMMKV", move(setMapMMKV));

    auto getMapMMKV = Function::createFromHostFunction(jsiRuntime,
                                                       PropNameID::forAscii(jsiRuntime,
                                                                            "getMapMMKV"),
                                                       2,
                                                       [](Runtime &runtime,
                                                          const Value &thisValue,
                                                          const Value *arguments,
                                                          size_t count) -> Value {
                                                           MMKV *kv = getInstance(
                                                                   arguments[1].getString(
                                                                                   runtime)
                                                                           .utf8(runtime));

                                                           if (!kv) {
                                                               return Value::undefined();
                                                           }

                                                           string result;
                                                           bool exists = kv->getString(
                                                                   arguments[0].getString(
                                                                                   runtime)
                                                                           .utf8(
                                                                                   runtime),
                                                                   result);
                                                           if (!exists) {
                                                               return Value::null();
                                                           }

                                                           return Value(runtime,
                                                                        String::createFromUtf8(
                                                                                runtime,
                                                                                result));
                                                       });

    jsiRuntime.global().setProperty(jsiRuntime, "getMapMMKV", move(getMapMMKV));

    auto setArrayMMKV = Function::createFromHostFunction(jsiRuntime,
                                                         PropNameID::forAscii(jsiRuntime,
                                                                              "setArrayMMKV"),
                                                         3,
                                                         [](Runtime &runtime,
                                                            const Value &thisValue,
                                                            const Value *arguments,
                                                            size_t count) -> Value {
                                                             MMKV *kv = getInstance(
                                                                     arguments[2].getString(
                                                                                     runtime)
                                                                             .utf8(runtime));
                                                             if (!kv) {
                                                                 return Value::undefined();
                                                             }

                                                             string key = arguments[0].getString(
                                                                             runtime)
                                                                     .utf8(
                                                                             runtime);

                                                             setIndex(kv, "arrayIndex", key);

                                                             kv->set(arguments[1].getString(
                                                                             runtime)
                                                                             .utf8(runtime),
                                                                     key);

                                                             return Value(true);
                                                         });

    jsiRuntime.global().setProperty(jsiRuntime, "setArrayMMKV", move(setArrayMMKV));

    auto getArrayMMKV = Function::createFromHostFunction(jsiRuntime,
                                                         PropNameID::forAscii(jsiRuntime,
                                                                              "getArrayMMKV"),
                                                         2,
                                                         [](Runtime &runtime,
                                                            const Value &thisValue,
                                                            const Value *arguments,
                                                            size_t count) -> Value {
                                                             MMKV *kv = getInstance(
                                                                     arguments[1].getString(
                                                                                     runtime)
                                                                             .utf8(runtime));

                                                             if (!kv) {
                                                                 return Value::undefined();
                                                             }

                                                             string result;
                                                             bool exists = kv->getString(
                                                                     arguments[0].getString(
                                                                                     runtime)
                                                                             .utf8(
                                                                                     runtime),
                                                                     result);
                                                             if (!exists) {
                                                                 return Value::null();
                                                             }

                                                             return Value(runtime,
                                                                          String::createFromUtf8(
                                                                                  runtime,
                                                                                  result));
                                                         });

    jsiRuntime.global().setProperty(jsiRuntime, "getArrayMMKV", move(getArrayMMKV));

    auto setNumberMMKV = Function::createFromHostFunction(jsiRuntime,
                                                          PropNameID::forAscii(jsiRuntime,
                                                                               "setNumberMMKV"),
                                                          3,
                                                          [](Runtime &runtime,
                                                             const Value &thisValue,
                                                             const Value *arguments,
                                                             size_t count) -> Value {
                                                              MMKV *kv = getInstance(
                                                                      arguments[2].getString(
                                                                                      runtime)
                                                                              .utf8(runtime));
                                                              if (!kv) {
                                                                  return Value::undefined();
                                                              }
                                                              string key = arguments[0].getString(
                                                                              runtime)
                                                                      .utf8(
                                                                              runtime);
                                                              setIndex(kv, "numberIndex", key);
                                                              kv->set(arguments[1].getNumber(),
                                                                      key);

                                                              return Value(true);
                                                          });

    jsiRuntime.global().setProperty(jsiRuntime, "setNumberMMKV", move(setNumberMMKV));

    auto getNumberMMKV = Function::createFromHostFunction(jsiRuntime,
                                                          PropNameID::forAscii(jsiRuntime,
                                                                               "getNumberMMKV"),
                                                          2,
                                                          [](Runtime &runtime,
                                                             const Value &thisValue,
                                                             const Value *arguments,
                                                             size_t count) -> Value {
                                                              MMKV *kv = getInstance(
                                                                      arguments[1].getString(
                                                                                      runtime)
                                                                              .utf8(runtime));
                                                              if (!kv) {
                                                                  return Value::undefined();
                                                              }
                                                              string key = arguments[0].getString(
                                                                              runtime)
                                                                      .utf8(runtime);
                                                              string result;
                                                              bool exists = kv->containsKey(key);
                                                              if (!exists) {
                                                                  return Value::null();
                                                              }

                                                              return Value(kv->getDouble(key));
                                                          });

    jsiRuntime.global().setProperty(jsiRuntime, "getNumberMMKV", move(getNumberMMKV));

    auto setBoolMMKV = Function::createFromHostFunction(jsiRuntime,
                                                        PropNameID::forAscii(jsiRuntime,
                                                                             "setBoolMMKV"),
                                                        3,
                                                        [](Runtime &runtime, const Value &thisValue,
                                                           const Value *arguments,
                                                           size_t count) -> Value {
                                                            MMKV *kv = getInstance(
                                                                    arguments[2].getString(
                                                                                    runtime)
                                                                            .utf8(runtime));
                                                            if (!kv) {
                                                                return Value::undefined();
                                                            }
                                                            string key = arguments[0].getString(
                                                                            runtime)
                                                                    .utf8(
                                                                            runtime);
                                                            setIndex(kv, "boolIndex", key);

                                                            kv->set(arguments[1].getBool(),
                                                                    key);

                                                            return Value(true);
                                                        });

    jsiRuntime.global().setProperty(jsiRuntime, "setBoolMMKV", move(setBoolMMKV));

    auto getBoolMMKV = Function::createFromHostFunction(jsiRuntime,
                                                        PropNameID::forAscii(jsiRuntime,
                                                                             "getBoolMMKV"),
                                                        2,
                                                        [](Runtime &runtime, const Value &thisValue,
                                                           const Value *arguments,
                                                           size_t count) -> Value {
                                                            MMKV *kv = getInstance(
                                                                    arguments[1].getString(
                                                                                    runtime)
                                                                            .utf8(runtime));
                                                            if (!kv) {
                                                                return Value::undefined();
                                                            }

                                                            string key = arguments[0].getString(
                                                                            runtime)
                                                                    .utf8(runtime);
                                                            string result;
                                                            bool exists = kv->containsKey(key);
                                                            if (!exists) {
                                                                return Value::null();
                                                            }

                                                            return Value(kv->getBool(key));
                                                        });

    jsiRuntime.global().setProperty(jsiRuntime, "getBoolMMKV", move(getBoolMMKV));

    auto removeValueMMKV = jsi::Function::createFromHostFunction(jsiRuntime,
                                                                 jsi::PropNameID::forAscii(
                                                                         jsiRuntime,
                                                                         "removeValueMMKV"),
                                                                 2, // key
                                                                 [](jsi::Runtime &runtime,
                                                                    const jsi::Value &thisValue,
                                                                    const jsi::Value *arguments,
                                                                    size_t count) -> jsi::Value {
                                                                     MMKV *kv = getInstance(
                                                                             arguments[1].getString(
                                                                                             runtime)
                                                                                     .utf8(runtime));
                                                                     if (!kv) {
                                                                         return Value::undefined();
                                                                     }

                                                                     string key = arguments[0].getString(
                                                                                     runtime)
                                                                             .utf8(
                                                                                     runtime);
                                                                     removeFromIndex(kv, key);

                                                                     kv->removeValueForKey(
                                                                             arguments[0].getString(
                                                                                             runtime)
                                                                                     .utf8(
                                                                                             runtime));
                                                                     return Value(true);
                                                                 });
    jsiRuntime.global().setProperty(jsiRuntime, "removeValueMMKV", std::move(removeValueMMKV));

    auto getAllKeysMMKV = jsi::Function::createFromHostFunction(jsiRuntime,
                                                                jsi::PropNameID::forAscii(
                                                                        jsiRuntime,
                                                                        "getAllKeysMMKV"),
                                                                1,
                                                                [](jsi::Runtime &runtime,
                                                                   const jsi::Value &thisValue,
                                                                   const jsi::Value *arguments,
                                                                   size_t count) -> jsi::Value {
                                                                    MMKV *kv = getInstance(
                                                                            arguments[0].getString(
                                                                                            runtime)
                                                                                    .utf8(runtime));
                                                                    if (!kv) {
                                                                        return Value::undefined();
                                                                    }
                                                                    auto keys = kv->allKeys();

                                                                    auto array = jsi::Array(runtime,
                                                                                            keys.size());

                                                                    for (int i = 0;
                                                                         i < keys.size(); i++) {
                                                                        auto string = jsi::String::createFromUtf8(
                                                                                runtime, keys[i]);
                                                                        array.setValueAtIndex(
                                                                                runtime, i, string);
                                                                    }
                                                                    return array;
                                                                });
    jsiRuntime.global().setProperty(jsiRuntime, "getAllKeysMMKV", std::move(getAllKeysMMKV));

    auto getIndexMMKV = jsi::Function::createFromHostFunction(jsiRuntime,
                                                              jsi::PropNameID::forAscii(
                                                                      jsiRuntime,
                                                                      "getIndexMMKV"),
                                                              2,
                                                              [](jsi::Runtime &runtime,
                                                                 const jsi::Value &thisValue,
                                                                 const jsi::Value *arguments,
                                                                 size_t count) -> jsi::Value {
                                                                  MMKV *kv = getInstance(
                                                                          arguments[1].getString(
                                                                                          runtime)
                                                                                  .utf8(runtime));
                                                                  if (!kv) {
                                                                      return Value::undefined();
                                                                  }

                                                                  auto keys = getIndex(kv,
                                                                                       arguments[0].getString(
                                                                                                       runtime)
                                                                                               .utf8(
                                                                                                       runtime));

                                                                  auto array = jsi::Array(runtime,
                                                                                          keys.size());

                                                                  for (int i = 0;
                                                                       i < keys.size(); i++) {
                                                                      auto string = jsi::String::createFromUtf8(
                                                                              runtime, keys[i]);
                                                                      array.setValueAtIndex(
                                                                              runtime, i, string);
                                                                  }
                                                                  return array;
                                                              });

    jsiRuntime.global().setProperty(jsiRuntime, "getIndexMMKV", std::move(getIndexMMKV));

    auto containsKeyMMKV = jsi::Function::createFromHostFunction(jsiRuntime,
                                                                 jsi::PropNameID::forAscii(
                                                                         jsiRuntime,
                                                                         "containsKeyMMKV"),
                                                                 2,
                                                                 [](jsi::Runtime &runtime,
                                                                    const jsi::Value &thisValue,
                                                                    const jsi::Value *arguments,

                                                                    size_t count) -> jsi::Value {
                                                                     MMKV *kv = getInstance(
                                                                             arguments[1].getString(
                                                                                             runtime)
                                                                                     .utf8(runtime));
                                                                     if (!kv) {
                                                                         return Value::undefined();
                                                                     }
                                                                     return Value(kv->containsKey(
                                                                             arguments[0].getString(
                                                                                             runtime)
                                                                                     .utf8(
                                                                                             runtime)));
                                                                 });
    jsiRuntime.global().setProperty(jsiRuntime, "containsKeyMMKV", std::move(containsKeyMMKV));

    auto clearMMKV = jsi::Function::createFromHostFunction(jsiRuntime,
                                                           jsi::PropNameID::forAscii(
                                                                   jsiRuntime,
                                                                   "clearMMKV"),
                                                           1,
                                                           [](jsi::Runtime &runtime,
                                                              const jsi::Value &thisValue,
                                                              const jsi::Value *arguments,

                                                              size_t count) -> jsi::Value {
                                                               MMKV *kv = getInstance(
                                                                       arguments[0].getString(
                                                                                       runtime)
                                                                               .utf8(runtime));
                                                               if (!kv) {
                                                                   return Value::undefined();
                                                               }

                                                               kv->clearAll();

                                                               return Value(true);
                                                           });
    jsiRuntime.global().setProperty(jsiRuntime, "clearMMKV", std::move(clearMMKV));

    auto clearMemoryCache = jsi::Function::createFromHostFunction(jsiRuntime,
                                                           jsi::PropNameID::forAscii(
                                                                   jsiRuntime,
                                                                   "clearMemoryCache"),
                                                           1,
                                                           [](jsi::Runtime &runtime,
                                                              const jsi::Value &thisValue,
                                                              const jsi::Value *arguments,

                                                              size_t count) -> jsi::Value {
                                                               MMKV *kv = getInstance(
                                                                       arguments[0].getString(
                                                                                       runtime)
                                                                               .utf8(runtime));
                                                               if (!kv) {
                                                                   return Value::undefined();
                                                               }

                                                               kv->clearMemoryCache();

                                                               return Value(true);
                                                           });
    jsiRuntime.global().setProperty(jsiRuntime, "clearMemoryCache", std::move(clearMemoryCache));


    auto encryptMMKV = jsi::Function::createFromHostFunction(jsiRuntime,
                                                             jsi::PropNameID::forAscii(
                                                                     jsiRuntime,
                                                                     "encryptMMKV"),
                                                             2,
                                                             [](jsi::Runtime &runtime,
                                                                const jsi::Value &thisValue,
                                                                const jsi::Value *arguments,

                                                                size_t count) -> jsi::Value {
                                                                 MMKV *kv = getInstance(
                                                                         arguments[1].getString(
                                                                                         runtime)
                                                                                 .utf8(runtime));
                                                                 if (!kv) {
                                                                     return Value::undefined();
                                                                 }

                                                                 string cryptKey = arguments[0].getString(
                                                                                 runtime)
                                                                         .utf8(runtime);

                                                                 bool result = kv->reKey(cryptKey);

                                                                 return Value(result);
                                                             });
    jsiRuntime.global().setProperty(jsiRuntime, "encryptMMKV", std::move(encryptMMKV));

    auto decryptMMKV = jsi::Function::createFromHostFunction(jsiRuntime,
                                                             jsi::PropNameID::forAscii(
                                                                     jsiRuntime,
                                                                     "decryptMMKV"),
                                                             1,
                                                             [](jsi::Runtime &runtime,
                                                                const jsi::Value &thisValue,
                                                                const jsi::Value *arguments,

                                                                size_t count) -> jsi::Value {
                                                                 MMKV *kv = getInstance(
                                                                         arguments[0].getString(
                                                                                         runtime)
                                                                                 .utf8(runtime));
                                                                 if (!kv) {
                                                                     return Value::undefined();
                                                                 }

                                                                 kv->reKey("");

                                                                 return Value(true);
                                                             });
    jsiRuntime.global().setProperty(jsiRuntime, "decryptMMKV", std::move(decryptMMKV));


}


extern "C"
JNIEXPORT void JNICALL
Java_com_ammarahmed_mmkv_RNMMKVModule_nativeInstall(JNIEnv *env, jobject clazz, jlong jsi,
                                                    jstring rootPath) {

    rPath = j_string_to_string(env, rootPath);
    MMKV::initializeMMKV(rPath);

    env->GetJavaVM(&vm);
    auto runtime = reinterpret_cast<jsi::Runtime *>(jsi);

    mmkvobject = env->NewGlobalRef(clazz);

    if (runtime) {
        install(*runtime);
    }
    createInstance("mmkvIDStore", MMKV_SINGLE_PROCESS, "", "");

}



extern "C"
JNIEXPORT jlong JNICALL
Java_com_ammarahmed_mmkv_MMKV_getMMKVWithID(JNIEnv *env, jclass clazz, jstring mmapID, jint mode,
                                            jstring cryptKey, jstring rootPath) {
    MMKV *kv = nullptr;
    if (!mmapID) {
        return (jlong) kv;
    }
    string str = jstring2string(env, mmapID);

    bool done = false;
    if (cryptKey) {
        string crypt = jstring2string(env, cryptKey);
        if (crypt.length() > 0) {
            if (rootPath) {
                string path = jstring2string(env, rootPath);
                kv = MMKV::mmkvWithID(str, mmkv::DEFAULT_MMAP_SIZE, (MMKVMode) mode, &crypt, &path);
            } else {
                kv = MMKV::mmkvWithID(str, mmkv::DEFAULT_MMAP_SIZE, (MMKVMode) mode, &crypt,
                                      nullptr);
            }
            done = true;
        }
    }
    if (!done) {
        if (rootPath) {
            string path = jstring2string(env, rootPath);
            kv = MMKV::mmkvWithID(str, mmkv::DEFAULT_MMAP_SIZE, (MMKVMode) mode, nullptr, &path);
        } else {
            kv = MMKV::mmkvWithID(str, mmkv::DEFAULT_MMAP_SIZE, (MMKVMode) mode, nullptr, nullptr);
        }
    }

    return (jlong) kv;
}






extern "C"
JNIEXPORT jboolean JNICALL
Java_com_ammarahmed_mmkv_MMKV_containsKey(JNIEnv *env, jobject instance, jlong handle,
                                          jstring oKey) {
    MMKV *kv = reinterpret_cast<MMKV *>(handle);
    if (kv && oKey) {
        string key = jstring2string(env, oKey);
        return (jboolean) kv->containsKey(key);
    }
    return (jboolean) false;
}

extern "C"
JNIEXPORT jbyteArray JNICALL
Java_com_ammarahmed_mmkv_MMKV_decodeBytes(JNIEnv *env, jobject obj, jlong handle, jstring oKey) {
    MMKV *kv = reinterpret_cast<MMKV *>(handle);
    if (kv && oKey) {
        string key = jstring2string(env, oKey);
        mmkv::MMBuffer value = kv->getBytes(key);
        if (value.length() > 0) {
            jbyteArray result = env->NewByteArray(value.length());
            env->SetByteArrayRegion(result, 0, value.length(), (const jbyte *) value.getPtr());
            return result;
        }
    }
    return nullptr;
}

extern "C"
JNIEXPORT void JNICALL
Java_com_ammarahmed_mmkv_MMKV_removeValueForKey(JNIEnv *env, jobject instance, jlong handle,
                                                jstring oKey) {
    MMKV *kv = reinterpret_cast<MMKV *>(handle);
    if (kv && oKey) {
        string key = jstring2string(env, oKey);
        kv->removeValueForKey(key);
    }
}

extern "C"
JNIEXPORT jobjectArray JNICALL
Java_com_ammarahmed_mmkv_MMKV_decodeStringSet(JNIEnv *env, jobject, jlong handle, jstring oKey) {
    MMKV *kv = reinterpret_cast<MMKV *>(handle);
    if (kv && oKey) {
        string key = jstring2string(env, oKey);
        vector<string> value;
        bool hasValue = kv->getVector(key, value);
        if (hasValue) {
            return vector2jarray(env, value);
        }
    }
    return nullptr;
}
extern "C"
JNIEXPORT jint JNICALL
Java_com_ammarahmed_mmkv_MMKV_decodeInt(JNIEnv *env, jobject obj, jlong handle, jstring oKey,
                                        jint defaultValue) {
    MMKV *kv = reinterpret_cast<MMKV *>(handle);
    if (kv && oKey) {
        string key = jstring2string(env, oKey);
        return (jint) kv->getInt32(key, defaultValue);
    }
    return defaultValue;
}

extern "C"
JNIEXPORT jboolean JNICALL
Java_com_ammarahmed_mmkv_MMKV_checkProcessMode(JNIEnv *env, jclass clazz, jlong handle) {
    MMKV *kv = reinterpret_cast<MMKV *>(handle);
    if (kv) {
        return kv->checkProcessMode();
    }
    return false;
}extern "C"
JNIEXPORT jboolean JNICALL
Java_com_ammarahmed_mmkv_MMKV_encodeString(JNIEnv *env, jobject thiz, jlong handle, jstring oKey,
                                           jstring oValue) {
    MMKV *kv = reinterpret_cast<MMKV *>(handle);
    if (kv && oKey) {
        string key = jstring2string(env, oKey);
        if (oValue) {
            string value = jstring2string(env, oValue);
            return (jboolean) kv->set(value, key);
        } else {
            kv->removeValueForKey(key);
            return (jboolean) true;
        }
    }
    return (jboolean) false;
}

extern "C"
JNIEXPORT jboolean JNICALL
Java_com_ammarahmed_mmkv_MMKV_encodeDouble(JNIEnv *env, jobject thiz, jlong handle, jstring oKey,
                                           jdouble value) {
    MMKV *kv = reinterpret_cast<MMKV *>(handle);
    if (kv && oKey) {
        string key = jstring2string(env, oKey);
        return (jboolean) kv->set((double) value, key);
    }
    return (jboolean) false;
}extern "C"
JNIEXPORT jboolean JNICALL
Java_com_ammarahmed_mmkv_MMKV_encodeSet(JNIEnv *env, jobject thiz, jlong handle, jstring oKey,
                                        jobjectArray arrStr) {
    MMKV *kv = reinterpret_cast<MMKV *>(handle);
    if (kv && oKey) {
        string key = jstring2string(env, oKey);
        if (arrStr) {
            vector<string> value = jarray2vector(env, arrStr);
            return (jboolean) kv->set(value, key);
        } else {
            kv->removeValueForKey(key);
            return (jboolean) true;
        }
    }
    return (jboolean) false;
}


extern "C"
JNIEXPORT void JNICALL
Java_com_ammarahmed_mmkv_MMKV_jniInitialize(JNIEnv *env, jclass clazz, jstring rootDir,
                                            jint logLevel) {
    if (!rootDir) {
        return;
    }

    const char *kstr = env->GetStringUTFChars(rootDir, nullptr);
    if (kstr) {
        MMKV::initializeMMKV(kstr, (MMKVLogLevel) logLevel);
        env->ReleaseStringUTFChars(rootDir, kstr);
    }
}

extern "C"
JNIEXPORT void JNICALL
Java_com_ammarahmed_mmkv_RNMMKVModule_destroy(JNIEnv *env, jobject thiz) {
    env->DeleteGlobalRef(mmkvobject);

}