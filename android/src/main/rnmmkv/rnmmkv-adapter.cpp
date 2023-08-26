#include <jni.h>
#include <jsi/jsi.h>
#include <ReactCommon/CallInvokerHolder.h>
#include <fbjni/fbjni.h>
#include "MMKV.h"
#include "MMKVPredef.h"
#include "MMBuffer.h"
#include "ThreadPool.h"
#include <algorithm>

using namespace facebook;
using namespace jsi;
using namespace std;

static vector<MMKV *> mmkvInstances;

static string rPath = "";
static JavaVM *vm;
static jclass mmkvclass;
static jobject mmkvobject;

static string jstring2string(JNIEnv *env, jstring str) {
    string result;
    if (!str)
        return result;

    const char *kstr = env->GetStringUTFChars(str, nullptr);
    if (kstr) {
        string result(kstr);
        env->ReleaseStringUTFChars(str, kstr);
        return result;
    }
    return result;
}


static std::string j_string_to_string(JNIEnv *env, jstring jStr) {
    if (!jStr) return {};

    const auto stringClass = env->GetObjectClass(jStr);
    const auto getBytes = env->GetMethodID(stringClass, "getBytes", "(Ljava/lang/String;)[B");
    const auto stringJbytes = (jbyteArray) env->CallObjectMethod(jStr, getBytes,
                                                                 env->NewStringUTF("UTF-8"));

    jsize length = (size_t) env->GetArrayLength(stringJbytes);
    jbyte *pBytes = env->GetByteArrayElements(stringJbytes, nullptr);

    std::string ret = std::string(reinterpret_cast<char *>(pBytes), length);
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
    if (!array)
        return keys;

    jsize size = env->GetArrayLength(array);
    keys.reserve(size);
    for (jsize i = 0; i < size; i++) {
        jstring str = (jstring) env->GetObjectArrayElement(array, i);
        if (str) {
            keys.push_back(jstring2string(env, str));
            env->DeleteLocalRef(str);
        }
    }
    return keys;
}

static MMKV *getInstance(const string &ID) {
    auto kv = std::find_if(mmkvInstances.begin(), mmkvInstances.end(), [&ID](MMKV *inst) {
        return inst->mmapID() == ID;
    });

    if (kv == mmkvInstances.end()) {
        return nullptr;
    }
    return *kv;
}

static MMKV *createInstance(const string &ID, MMKVMode mode, string key, string path) {
    auto it = find_if(mmkvInstances.begin(), mmkvInstances.end(), [&ID](MMKV *inst) {
        return inst->mmapID() == ID;
    });
    if (it != mmkvInstances.end())
        mmkvInstances.erase(it);

    MMKV *kv = MMKV::mmkvWithID(ID, mmkv::DEFAULT_MMAP_SIZE, mode,
                                key.empty() ? nullptr : &key,
                                path.empty() ? nullptr : &path);

    mmkvInstances.push_back(kv);
    return kv;
}


// Function to sort a vector
void sortVector(std::vector<std::string> &vec) {
    std::sort(vec.begin(), vec.end());
}

// Function to add a value to the vector while maintaining sorting order
void addValue(std::vector<std::string> &vec, std::string value) {
    auto insertPosition = std::lower_bound(vec.begin(), vec.end(), value);
    vec.insert(insertPosition, value);
}

// Function to remove a value from the vector
void removeValue(std::vector<std::string> &vec, std::string value) {
    auto position = std::lower_bound(vec.begin(), vec.end(), value);
    if (position != vec.end() && *position == value) {
        vec.erase(position);
    }
}

// Function to search for a value in the vector
bool hasValue(const std::vector<std::string> &vec, std::string value) {
    return std::binary_search(vec.begin(), vec.end(), value);
}

std::unordered_map<std::string, bool> indexing_enabled = {};
std::unordered_map<std::string, std::unordered_map<std::string, std::vector<std::string>>> index_cache = {};

static vector<string> getIndex(MMKV *kv, const string &type) {
    if (!indexing_enabled[kv->mmapID()]) return {};

    auto kvIndex = index_cache[kv->mmapID()];

    if (kvIndex.count(type) == 0) {
        auto exists = kv->getVector(type, kvIndex[type]);
        if (!exists) {
            kvIndex[type] = std::vector<std::string>();
        } else {
            sortVector(kvIndex[type]);
        }
    }

    return kvIndex[type];
}

static const string dataTypes[] = {"stringIndex", "numberIndex", "boolIndex", "mapIndex",
                                   "arrayIndex",};

static void removeFromIndex(MMKV *kv, const string &key) {
    if (!indexing_enabled[kv->mmapID()]) return;
    for (const auto &idx: dataTypes) {
        auto index = getIndex(kv, idx);
        if (hasValue(index, key)) {
            removeValue(index, key);
            kv->set(index, idx);
            return;
        }
    }
}

static void setIndex(MMKV *kv, const string &type, const string &key) {
    if (!indexing_enabled[kv->mmapID()]) return;
    auto index = getIndex(kv, type);
    if (!hasValue(index, key)) {
        addValue(index, key);
        kv->set(index, type);
    }
}

template<typename NativeFunc>
static void createFunc(Runtime &jsiRuntime, const char *prop, int paramCount, NativeFunc &&func) {
    auto f = Function::createFromHostFunction(jsiRuntime,
                                              PropNameID::forAscii(jsiRuntime, prop),
                                              paramCount,
                                              std::forward<NativeFunc>(func));
    jsiRuntime.global().setProperty(jsiRuntime, prop, std::move(f));
}

#define CREATE_FUNCTION(prop, paramCount, block) \
    createFunc(jsiRuntime, prop, paramCount, [](Runtime &runtime, const Value &thisValue,   \
const Value *arguments, size_t count) -> Value { \
block   \
})

#define CREATE_FUNCTION_CAPTURE(prop, paramCount, block) \
    createFunc(jsiRuntime, prop, paramCount, [=](Runtime &runtime, const Value &thisValue,   \
const Value *arguments, size_t count) -> Value { \
block   \
})

#define std_string(arg) \
arg.getString(runtime).utf8(runtime)

#define CALLBACK(returnValue) \
invoker->invokeAsync([&runtime, cbref] { cbref->call(runtime, returnValue); });


#define HOSTFN(name, basecount) \
jsi::Function::createFromHostFunction( \
runtime, \
jsi::PropNameID::forAscii(runtime, name), \
basecount, \
[=](jsi::Runtime &runtime, const jsi::Value &thisValue, const jsi::Value *args, size_t count) -> jsi::Value


void initIndexForId(std::string id) {
    index_cache[id] = unordered_map<std::string, std::vector<std::string>>();
}

std::shared_ptr<react::CallInvoker> invoker;
void installBindings(Runtime &jsiRuntime, std::shared_ptr<react::CallInvoker> jsCallInvoker) {
    auto pool = std::make_shared<ThreadPool>();
    invoker = jsCallInvoker;

    CREATE_FUNCTION("initializeMMKV", 0, {
        MMKV::initializeMMKV(rPath);
        return Value::undefined();
    });

    CREATE_FUNCTION("setupMMKVInstance", 5, {
        string id = std_string(arguments[0]);
        auto mode = (MMKVMode) (int) arguments[1].getNumber();
        string cryptKey = std_string(arguments[2]);
        MMKVPath_t path = std_string(arguments[3]);
        createInstance(id, mode, cryptKey, path);

        indexing_enabled[id] = arguments[4].getBool();
        initIndexForId(id);

        return Value(true);
    });

    CREATE_FUNCTION("getSecureKey", 1, {
        string alias = std_string(arguments[0]);

        JNIEnv *env;
        bool attached = vm->AttachCurrentThread(&env, NULL);
        mmkvclass = env->GetObjectClass(mmkvobject);

        jstring jstr1 = string2jstring(env, alias);
        jvalue params[1];
        params[0].l = jstr1;
        jmethodID getSecureKey = env->GetMethodID(mmkvclass, "getSecureKey",
                                                  "(Ljava/lang/String;)Ljava/lang/String;");
        jobject result = env->CallObjectMethodA(mmkvobject, getSecureKey, params);
        const char *str = env->GetStringUTFChars((jstring) result, NULL);
        string cryptKey = j_string_to_string(env, env->NewStringUTF(str));
        if (attached) {
            vm->DetachCurrentThread();
        }
        return Value(runtime, String::createFromUtf8(runtime, cryptKey));
    });

    CREATE_FUNCTION("setSecureKey", 2, {
        string alias = std_string(arguments[0]);
        string key = std_string(arguments[1]);

        JNIEnv *env;
        bool attached = vm->AttachCurrentThread(&env, NULL);
        mmkvclass = env->GetObjectClass(mmkvobject);

        jstring jstr1 = string2jstring(env, alias);
        jstring jstr2 = string2jstring(env, key);

        jvalue params[2];
        params[0].l = jstr1;
        params[1].l = jstr2;

        jmethodID setSecureKey = env->GetMethodID(mmkvclass, "setSecureKey",
                                                  "(Ljava/lang/String;Ljava/lang/String;)V");
        env->CallVoidMethodA(mmkvobject, setSecureKey, params);
        if (attached) {
            vm->DetachCurrentThread();
        }

        return Value(true);
    });

    CREATE_FUNCTION("secureKeyExists", 1, {
        string alias = std_string(arguments[0]);

        JNIEnv *env;
        bool attached = vm->AttachCurrentThread(&env, NULL);
        mmkvclass = env->GetObjectClass(mmkvobject);

        jstring jstr1 = string2jstring(env, alias);
        jvalue params[1];
        params[0].l = jstr1;

        jmethodID secureKeyExists = env->GetMethodID(mmkvclass, "secureKeyExists",
                                                     "(Ljava/lang/String;)Z");
        bool exists = env->CallBooleanMethodA(mmkvobject, secureKeyExists, params);
        if (attached) {
            vm->DetachCurrentThread();
        }
        return Value(exists);
    });

    CREATE_FUNCTION("removeSecureKey", 1, {
        string alias = std_string(arguments[0]);

        JNIEnv *env;
        bool attached = vm->AttachCurrentThread(&env, NULL);
        mmkvclass = env->GetObjectClass(mmkvobject);

        jstring jstr1 = string2jstring(env, alias);
        jvalue params[1];
        params[0].l = jstr1;

        jmethodID removeSecureKey = env->GetMethodID(mmkvclass, "removeSecureKey",
                                                     "(Ljava/lang/String;)V");
        env->CallVoidMethodA(mmkvobject, removeSecureKey, params);
        if (attached) {
            vm->DetachCurrentThread();
        }
        return Value(true);
    });

    CREATE_FUNCTION("setStringMMKV", 3, {
        MMKV *kv = getInstance(std_string(arguments[2]));
        if (!kv) {
            return Value::undefined();
        }

        string key = std_string(arguments[0]);
        setIndex(kv, "stringIndex", key);
        kv->set(std_string(arguments[1]), key);
        return Value(true);
    });

    createFunc(jsiRuntime, "setMultiMMKV", 4,
               [=](Runtime &runtime, const Value &thisValue, const Value *arguments,
                   size_t count) -> Value {
                   auto keysRef = arguments[0].getObject(runtime).asArray(runtime);
                   auto valuesRef = arguments[1].getObject(runtime).asArray(runtime);
                   auto dataType = std_string(arguments[2]);
                   auto kvName = std_string(arguments[3]);
                   auto size = keysRef.length(runtime);

                   auto keys = std::vector<std::string>(size);
                   auto values = std::vector<std::string>(size);
                   for (int i = 0; i < size; i++) {
                       keys[i] = std_string(keysRef.getValueAtIndex(runtime, i));
                       auto value = valuesRef.getValueAtIndex(runtime, i);
                       if (value.isString()) {
                           values[i] = std_string(value);
                       } else {
                           values[i] = "kv.null";
                       }
                   }

                   auto promiseCtr = runtime.global().getPropertyAsFunction(runtime, "Promise");
                   auto promise = promiseCtr.callAsConstructor(runtime, HOSTFN("executor", 2) {
                                                                                                  auto resolve = std::make_shared<jsi::Value>(
                                                                                                          runtime,
                                                                                                          args[0]);
                                                                                                  auto reject = std::make_shared<jsi::Value>(
                                                                                                          runtime,
                                                                                                          args[1]);

                                                                                                  pool->queueWork(
                                                                                                          [&runtime, kvName, keys, values, size, dataType, resolve]() {

                                                                                                              MMKV *kv = getInstance(
                                                                                                                      kvName);
                                                                                                              if (!kv) {
                                                                                                                  invoker->invokeAsync(
                                                                                                                          [&runtime, resolve] {
                                                                                                                              resolve->asObject(
                                                                                                                                      runtime).asFunction(
                                                                                                                                      runtime).call(
                                                                                                                                      runtime,
                                                                                                                                      Value::undefined());
                                                                                                                          });
                                                                                                              }


                                                                                                              for (int i = 0;
                                                                                                                   i <
                                                                                                                   size; i++) {
                                                                                                                  auto key = keys[i];
                                                                                                                  auto value = values[i];
                                                                                                                  if (value !=
                                                                                                                      "kv.null") {
                                                                                                                      kv->set(value,
                                                                                                                              key);
                                                                                                                      setIndex(
                                                                                                                              kv,
                                                                                                                              dataType,
                                                                                                                              key);
                                                                                                                  }
                                                                                                              }

                                                                                                              invoker->invokeAsync(
                                                                                                                      [&runtime, resolve] {
                                                                                                                          resolve->asObject(
                                                                                                                                  runtime).asFunction(
                                                                                                                                  runtime).call(
                                                                                                                                  runtime,
                                                                                                                                  Value(true));
                                                                                                                      });
                                                                                                          });

                                                                                                  return {};
                                                                                              }));
                   return promise;
               });

    CREATE_FUNCTION("getStringMMKV", 2, {
        MMKV *kv = getInstance(std_string(arguments[1]));
        if (!kv) {
            return Value::undefined();
        }

        string result;
        bool exists = kv->getString(std_string(arguments[0]), result);
        if (!exists) {
            return Value::null();
        }
        return Value(runtime, String::createFromUtf8(runtime, result));
    });


    createFunc(jsiRuntime, "getMultiMMKV", 2,
               [=](Runtime &runtime, const Value &thisValue, const Value *arguments,
                   size_t count) -> Value {
                   auto keysRef = arguments[0].getObject(runtime).asArray(runtime);
                   auto kvName = std_string(arguments[1]);
                   auto promiseCtr = runtime.global().getPropertyAsFunction(runtime, "Promise");
                   auto size = keysRef.length(runtime);

                   auto keys = std::vector<std::string>(size);

                   for (int i = 0; i < size; i++) {
                       keys[i] = std_string(keysRef.getValueAtIndex(runtime, i));
                   }

                   auto promise = promiseCtr.callAsConstructor(runtime, HOSTFN("executor", 2) {
                                                                                                  auto resolve = std::make_shared<jsi::Value>(
                                                                                                          runtime,
                                                                                                          args[0]);
                                                                                                  auto reject = std::make_shared<jsi::Value>(
                                                                                                          runtime,
                                                                                                          args[1]);

                                                                                                  pool->queueWork(
                                                                                                          [&runtime, kvName, keys, size, resolve, reject]() {

                                                                                                              MMKV *kv = getInstance(
                                                                                                                      kvName);
                                                                                                              if (!kv) {
                                                                                                                  invoker->invokeAsync(
                                                                                                                          [&runtime, resolve, reject] {
                                                                                                                              resolve->asObject(
                                                                                                                                      runtime).asFunction(
                                                                                                                                      runtime).call(
                                                                                                                                      runtime,
                                                                                                                                      Value::undefined());
                                                                                                                          });
                                                                                                              }

                                                                                                              auto result = std::vector<std::string>(
                                                                                                                      size);

                                                                                                              for (int i = 0;
                                                                                                                   i <
                                                                                                                   size; i++) {
                                                                                                                  auto key = keys[i];
                                                                                                                  string value;
                                                                                                                  bool exists = kv->getString(
                                                                                                                          key,
                                                                                                                          value);
                                                                                                                  if (exists) {
                                                                                                                      result[i] = value;
                                                                                                                  } else {
                                                                                                                      result[i] = "kv.null";
                                                                                                                  }
                                                                                                              }

                                                                                                              invoker->invokeAsync(
                                                                                                                      [&runtime, result, size, resolve, reject] {
                                                                                                                          jsi::Array values = jsi::Array(
                                                                                                                                  runtime,
                                                                                                                                  size);
                                                                                                                          for (int i = 0;
                                                                                                                               i <
                                                                                                                               size; i++) {
                                                                                                                              auto value = result[i];
                                                                                                                              if (value ==
                                                                                                                                  "kv.null") {
                                                                                                                                  values.setValueAtIndex(
                                                                                                                                          runtime,
                                                                                                                                          i,
                                                                                                                                          Value::null());
                                                                                                                              } else {
                                                                                                                                  values.setValueAtIndex(
                                                                                                                                          runtime,
                                                                                                                                          i,
                                                                                                                                          String::createFromUtf8(
                                                                                                                                                  runtime,
                                                                                                                                                  value));
                                                                                                                              }
                                                                                                                          }
                                                                                                                          resolve->asObject(
                                                                                                                                  runtime).asFunction(
                                                                                                                                  runtime).call(
                                                                                                                                  runtime,
                                                                                                                                  std::move(
                                                                                                                                          values));
                                                                                                                      });
                                                                                                          });

                                                                                                  return {};
                                                                                              }));
                   return promise;
               });

    CREATE_FUNCTION("setMapMMKV", 3, {
        MMKV *kv = getInstance(std_string(arguments[2]));
        if (!kv) {
            return Value::undefined();
        }

        string key = std_string(arguments[0]);

        setIndex(kv, "mapIndex", key);
        kv->set(std_string(arguments[1]), key);
        return Value(true);
    });

    CREATE_FUNCTION("getMapMMKV", 2, {
        MMKV *kv = getInstance(std_string(arguments[1]));
        if (!kv) {
            return Value::undefined();
        }

        string result;
        bool exists = kv->getString(std_string(arguments[0]), result);
        if (!exists) {
            return Value::null();
        }
        return Value(runtime, String::createFromUtf8(runtime, result));
    });

    CREATE_FUNCTION("setArrayMMKV", 3, {
        MMKV *kv = getInstance(std_string(arguments[2]));
        if (!kv) {
            return Value::undefined();
        }

        string key = std_string(arguments[0]);

        setIndex(kv, "arrayIndex", key);
        kv->set(std_string(arguments[1]), key);
        return Value(true);
    });


    CREATE_FUNCTION("getArrayMMKV", 2, {
        MMKV *kv = getInstance(std_string(arguments[1]));

        if (!kv) {
            return Value::undefined();
        }

        string result;
        bool exists = kv->getString(std_string(arguments[0]), result);
        if (!exists) {
            return Value::null();
        }
        return Value(runtime, String::createFromUtf8(runtime, result));
    });


    CREATE_FUNCTION("setNumberMMKV", 3, {
        MMKV *kv = getInstance(std_string(arguments[2]));
        if (!kv) {
            return Value::undefined();
        }
        string key = std_string(arguments[0]);
        setIndex(kv, "numberIndex", key);
        kv->set(arguments[1].getNumber(), key);
        return Value(true);
    });

    CREATE_FUNCTION("getNumberMMKV", 2, {
        MMKV *kv = getInstance(std_string(arguments[1]));
        if (!kv) {
            return Value::undefined();
        }
        string key = std_string(arguments[0]);
        string result;
        bool exists = kv->containsKey(key);
        if (!exists) {
            return Value::null();
        }
        return Value(kv->getDouble(key));
    });

    CREATE_FUNCTION("setBoolMMKV", 3, {
        MMKV *kv = getInstance(std_string(arguments[2]));
        if (!kv) {
            return Value::undefined();
        }
        string key = std_string(arguments[0]);
        setIndex(kv, "boolIndex", key);
        kv->set(arguments[1].getBool(), key);
        return Value(true);
    });

    CREATE_FUNCTION("getBoolMMKV", 2, {
        MMKV *kv = getInstance(std_string(arguments[1]));
        if (!kv) {
            return Value::undefined();
        }

        string key = std_string(arguments[0]);
        string result;
        bool exists = kv->containsKey(key);
        if (!exists) {
            return Value::null();
        }
        return Value(kv->getBool(key));
    });

    CREATE_FUNCTION("removeValueMMKV", 2, {
        MMKV *kv = getInstance(std_string(arguments[1]));
        if (!kv) {
            return Value::undefined();
        }

        string key = std_string(arguments[0]);

        kv->removeValueForKey(key);
        removeFromIndex(kv, key);

        return Value(true);
    });

    CREATE_FUNCTION("getAllKeysMMKV", 1, {
        MMKV *kv = getInstance(std_string(arguments[0]));
        if (!kv) {
            return Value::undefined();
        }
        auto keys = kv->allKeys();

        auto array = jsi::Array(runtime, keys.size());
        auto size = keys.size();
        for (int i = 0; i < size; i++) {
            auto string = jsi::String::createFromUtf8(runtime, keys[i]);
            array.setValueAtIndex(runtime, i, string);
        }
        return array;
    });

    CREATE_FUNCTION("getIndexMMKV", 2, {
        MMKV *kv = getInstance(std_string(arguments[1]));
        if (!kv) {
            return Value::undefined();
        }

        auto keys = getIndex(kv, std_string(arguments[0]));
        auto size = keys.size();
        auto array = jsi::Array(runtime, size);
        for (int i = 0; i < size; i++) {
            auto string = jsi::String::createFromUtf8(runtime, keys[i]);
            array.setValueAtIndex(runtime, i, string);
        }
        return array;
    });

    CREATE_FUNCTION("containsKeyMMKV", 2, {
        MMKV *kv = getInstance(std_string(arguments[1]));
        if (!kv) {
            return Value::undefined();
        }
        return Value(kv->containsKey(std_string(arguments[0])));
    });

    CREATE_FUNCTION("clearMMKV", 1, {
        MMKV *kv = getInstance(std_string(arguments[0]));
        if (!kv) {
            return Value::undefined();
        }
        kv->clearAll();
        initIndexForId(kv->mmapID());

        return Value(true);
    });

    CREATE_FUNCTION("clearMemoryCache", 1, {
        MMKV *kv = getInstance(std_string(arguments[0]));
        if (!kv) {
            return Value::undefined();
        }
        kv->clearMemoryCache();
        return Value(true);
    });

    CREATE_FUNCTION("encryptMMKV", 2, {
        MMKV *kv = getInstance(std_string(arguments[1]));
        if (!kv) {
            return Value::undefined();
        }

        string cryptKey = std_string(arguments[0]);
        bool result = kv->reKey(cryptKey);
        return Value(result);
    });

    CREATE_FUNCTION("decryptMMKV", 1, {
        MMKV *kv = getInstance(std_string(arguments[0]));
        if (!kv) {
            return Value::undefined();
        }
        kv->reKey("");
        return Value(true);
    });
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
}

extern "C"
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
}

extern "C"
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
    vm = nullptr;
}


struct RNMMKVModule : jni::JavaClass<RNMMKVModule> {
    static constexpr auto kJavaDescriptor = "Lcom/ammarahmed/mmkv/RNMMKVModule;";

    static void registerNatives() {
        javaClassStatic()->registerNatives(
                {// initialization for JSI
                        makeNativeMethod("nativeInstall",
                                         RNMMKVModule::install)});
    }

private:
    static void install(
            jni::alias_ref<jni::JObject> thiz, jlong jsi,
            jni::alias_ref<react::CallInvokerHolder::javaobject> jsCallInvokerHolder,
            jni::alias_ref<jni::JString> rootPath) {

        rPath = rootPath->toStdString();
        auto jsCallInvoker = jsCallInvokerHolder->cthis()->getCallInvoker();

        MMKV::initializeMMKV(rPath);

        jni::Environment::current()->GetJavaVM(&vm);
        auto runtime = reinterpret_cast<jsi::Runtime *>(jsi);

        mmkvobject = jni::Environment::current()->NewGlobalRef(thiz.get());
        if (runtime) {
            installBindings(*runtime, jsCallInvoker);
        }
        createInstance("mmkvIDStore", MMKV_SINGLE_PROCESS, "", "");
    }
};

JNIEXPORT jint JNI_OnLoad(JavaVM *jvm, void *) {
    return jni::initialize(vm, [] { RNMMKVModule::registerNatives(); });
}

