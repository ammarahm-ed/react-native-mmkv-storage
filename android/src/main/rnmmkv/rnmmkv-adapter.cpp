#include <jni.h>
#include <jsi/jsi.h>

#include "MMKV.h"
#include "MMKVPredef.h"
#include "MMBuffer.h"

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
    auto it = find_if(mmkvInstances.begin(), mmkvInstances.end(), [&ID](MMKV *inst){
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

static void setIndex(MMKV *kv, const string &type, const string &key) {
    std::vector<string> indexer;
    kv->getVector(type, indexer);

    if (std::find(indexer.begin(), indexer.end(), key) == indexer.end()) {
        indexer.push_back(key);
        kv->set(indexer, type);
    }
}

static vector<string> getIndex(MMKV *kv, const string &type) {
    vector<string> indexer;
    kv->getVector(type, indexer);
    return indexer;
}

/// @brief returns true if the value was removed and @p idx was updated
static bool updateIndex(MMKV *const kv, const string &idx, const string &key)
{
    vector<string> indexes;
    if (!kv->getVector(idx, indexes))
        return false;

    auto it = find(indexes.begin(), indexes.end(), key);
    if (it != indexes.end()) {
        indexes.erase(it);
        kv->set(indexes, idx);
        return true;
    }
    return false;
}

static void removeFromIndex(MMKV *kv, const string &key) {
    static const string idxes[] = { "stringIndex", "numberIndex", "boolIndex", "mapIndex", "arrayIndex", };
    for (const auto &idx : idxes) {
        if (updateIndex(kv, idx, key))
            return;
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

#define CREATE_FUNC(prop, paramCount, func) \
    createFunc(jsiRuntime, prop, paramCount, func)

void install(Runtime &jsiRuntime) {

    CREATE_FUNC("initializeMMKV", 0, [](Runtime &runtime, const Value &thisValue,
                                        const Value *, size_t) {
        MMKV::initializeMMKV(rPath);
        return Value::undefined();
    });

    CREATE_FUNC("setupMMKVInstance", 4, [](Runtime &runtime, const Value &thisValue,
                                           const Value *args, size_t count) -> Value {
        string ID = args[0].getString(runtime).utf8(runtime);
        auto mode = (MMKVMode) (int) args[1].getNumber();
        string cryptKey = args[2].getString(runtime).utf8(runtime);
        MMKVPath_t path = args[3].getString(runtime).utf8(runtime);
        createInstance(ID, mode, cryptKey, path);
        return Value(true);
    });

    CREATE_FUNC("getSecureKey", 1, [](Runtime &runtime, const Value &thisValue,
                                                    const Value *arguments, size_t count) -> Value {
        string alias = arguments[0].getString(runtime).utf8(runtime);

        JNIEnv *env;
        bool attached = vm->AttachCurrentThread(&env, NULL);
        mmkvclass = env->GetObjectClass(mmkvobject);

        jstring jstr1 = string2jstring(env, alias);
        jvalue params[1];
        params[0].l = jstr1;
        jmethodID getSecureKey = env->GetMethodID(mmkvclass, "getSecureKey", "(Ljava/lang/String;)Ljava/lang/String;");
        jobject result = env->CallObjectMethodA(mmkvobject, getSecureKey, params);
        const char *str = env->GetStringUTFChars((jstring) result, NULL);
        string cryptKey = j_string_to_string(env, env->NewStringUTF(str));
        if (attached) {
            vm->DetachCurrentThread();
        }
        return Value(runtime, String::createFromUtf8(runtime, cryptKey));
    });

    CREATE_FUNC("setSecureKey", 2, [](Runtime &runtime, const Value &thisValue,
                                      const Value *arguments, size_t count) -> Value {
        string alias = arguments[0].getString(runtime).utf8(runtime);
        string key = arguments[1].getString(runtime).utf8(runtime);

        JNIEnv *env;
        bool attached = vm->AttachCurrentThread(&env, NULL);
        mmkvclass = env->GetObjectClass(mmkvobject);

        jstring jstr1 = string2jstring(env, alias);
        jstring jstr2 = string2jstring(env, key);

        jvalue params[2];
        params[0].l = jstr1;
        params[1].l = jstr2;

        jmethodID setSecureKey = env->GetMethodID(mmkvclass, "setSecureKey", "(Ljava/lang/String;Ljava/lang/String;)V");
        env->CallVoidMethodA(mmkvobject, setSecureKey, params);
        if (attached) {
            vm->DetachCurrentThread();
        }

        return Value(true);
    });

    CREATE_FUNC("secureKeyExists", 1, [](Runtime &runtime, const Value &thisValue,
                                         const Value *arguments, size_t count) -> Value {
        string alias = arguments[0].getString(runtime).utf8(runtime);

        JNIEnv *env;
        bool attached = vm->AttachCurrentThread(&env, NULL);
        mmkvclass = env->GetObjectClass(mmkvobject);

        jstring jstr1 = string2jstring(env, alias);
        jvalue params[1];
        params[0].l = jstr1;

        jmethodID secureKeyExists = env->GetMethodID(mmkvclass, "secureKeyExists", "(Ljava/lang/String;)Z");
        bool exists = env->CallBooleanMethodA(mmkvobject, secureKeyExists, params);
        if (attached) {
            vm->DetachCurrentThread();
        }
        return Value(exists);
    });

    CREATE_FUNC("removeSecureKey", 1, [](Runtime &runtime, const Value &thisValue,
                                         const Value *arguments, size_t count) -> Value {
        string alias = arguments[0].getString(runtime).utf8(runtime);

        JNIEnv *env;
        bool attached = vm->AttachCurrentThread(&env, NULL);
        mmkvclass = env->GetObjectClass(mmkvobject);

        jstring jstr1 = string2jstring(env, alias);
        jvalue params[1];
        params[0].l = jstr1;

        jmethodID removeSecureKey = env->GetMethodID(mmkvclass, "removeSecureKey", "(Ljava/lang/String;)V");
        env->CallVoidMethodA(mmkvobject, removeSecureKey, params);
        if (attached) {
            vm->DetachCurrentThread();
        }
        return Value(true);
    });

    CREATE_FUNC("setStringMMKV", 3, [](Runtime &runtime, const Value &thisValue,
                                       const Value *arguments, size_t count) -> Value {
        MMKV *kv = getInstance(arguments[2].getString(runtime).utf8(runtime));
        if (!kv) {
            return Value::undefined();
        }

        string key = arguments[0].getString(runtime).utf8(runtime);
        setIndex(kv, "stringIndex", key);
        kv->set(arguments[1].getString(runtime).utf8(runtime), key);
        return Value(true);
    });

    CREATE_FUNC("getStringMMKV", 2, [](Runtime &runtime, const Value &thisValue,
                                       const Value *arguments, size_t count) -> Value {
        MMKV *kv = getInstance(arguments[1].getString(runtime).utf8(runtime));
        if (!kv) {
            return Value::undefined();
        }

        string result;
        bool exists = kv->getString(arguments[0].getString(runtime).utf8(runtime), result);
        if (!exists) {
            return Value::null();
        }
        return Value(runtime, String::createFromUtf8(runtime, result));
    });

    CREATE_FUNC("setMapMMKV", 3, [](Runtime &runtime, const Value &thisValue,
                                    const Value *arguments, size_t count) -> Value {
        MMKV *kv = getInstance(arguments[2].getString(runtime).utf8(runtime));
        if (!kv) {
            return Value::undefined();
        }

        string key = arguments[0].getString(runtime).utf8(runtime);

        setIndex(kv, "mapIndex", key);
        kv->set(arguments[1].getString(runtime).utf8(runtime), key);
        return Value(true);
    });

    CREATE_FUNC("getMapMMKV", 2, [](Runtime &runtime, const Value &thisValue,
                                    const Value *arguments, size_t count) -> Value {
        MMKV *kv = getInstance(arguments[1].getString(runtime).utf8(runtime));
        if (!kv) {
            return Value::undefined();
        }

        string result;
        bool exists = kv->getString(arguments[0].getString(runtime).utf8(runtime), result);
        if (!exists) {
            return Value::null();
        }
        return Value(runtime, String::createFromUtf8(runtime, result));
    });

    CREATE_FUNC("setArrayMMKV", 3, [](Runtime &runtime, const Value &thisValue,
                                                    const Value *arguments, size_t count) -> Value {
        MMKV *kv = getInstance(arguments[2].getString(runtime).utf8(runtime));
        if (!kv) {
            return Value::undefined();
        }

        string key = arguments[0].getString(runtime).utf8(runtime);

        setIndex(kv, "arrayIndex", key);
        kv->set(arguments[1].getString(runtime) .utf8(runtime), key);
        return Value(true);
    });

    CREATE_FUNC("getArrayMMKV", 2, [](Runtime &runtime, const Value &thisValue,
                                const Value *arguments, size_t count) -> Value {
        MMKV *kv = getInstance(arguments[1].getString(runtime).utf8(runtime));

        if (!kv) {
            return Value::undefined();
        }

        string result;
        bool exists = kv->getString(arguments[0].getString(runtime).utf8(runtime), result);
        if (!exists) {
            return Value::null();
        }
        return Value(runtime, String::createFromUtf8(runtime, result));
    });

    CREATE_FUNC("setNumberMMKV", 3, [](Runtime &runtime, const Value &thisValue,
                                        const Value *arguments, size_t count) -> Value {
        MMKV *kv = getInstance(arguments[2].getString(runtime).utf8(runtime));
        if (!kv) {
            return Value::undefined();
        }
        string key = arguments[0].getString(runtime).utf8(runtime);
        setIndex(kv, "numberIndex", key);
        kv->set(arguments[1].getNumber(), key);
        return Value(true);
    });

    CREATE_FUNC("getNumberMMKV", 2, [](Runtime &runtime, const Value &thisValue,
                                       const Value *arguments, size_t count) -> Value {
        MMKV *kv = getInstance(arguments[1].getString(runtime).utf8(runtime));
        if (!kv) {
            return Value::undefined();
        }
        string key = arguments[0].getString(runtime).utf8(runtime);
        string result;
        bool exists = kv->containsKey(key);
        if (!exists) {
            return Value::null();
        }
        return Value(kv->getDouble(key));
    });

    CREATE_FUNC("setBoolMMKV", 3, [](Runtime &runtime, const Value &thisValue,
                                       const Value *arguments, size_t count) -> Value {
        MMKV *kv = getInstance(arguments[2].getString(runtime).utf8(runtime));
        if (!kv) {
            return Value::undefined();
        }
        string key = arguments[0].getString(runtime).utf8(runtime);
        setIndex(kv, "boolIndex", key);
        kv->set(arguments[1].getBool(), key);
        return Value(true);
    });

    CREATE_FUNC("getBoolMMKV", 2, [](Runtime &runtime, const Value &thisValue,
                                     const Value *arguments, size_t count) -> Value {
        MMKV *kv = getInstance(arguments[1].getString(runtime).utf8(runtime));
        if (!kv) {
            return Value::undefined();
        }

        string key = arguments[0].getString(runtime).utf8(runtime);
        string result;
        bool exists = kv->containsKey(key);
        if (!exists) {
            return Value::null();
        }
        return Value(kv->getBool(key));
    });

    CREATE_FUNC("removeValueMMKV", 2, [](Runtime &runtime, const Value &thisValue,
                                     const Value *arguments, size_t count) -> Value {
        MMKV *kv = getInstance(arguments[1].getString(runtime).utf8(runtime));
        if (!kv) {
            return Value::undefined();
        }

        string key = arguments[0].getString(runtime).utf8(runtime);
        removeFromIndex(kv, key);
        kv->removeValueForKey(arguments[0].getString(runtime).utf8(runtime));
        return Value(true);
    });

    CREATE_FUNC("getAllKeysMMKV", 1, [](jsi::Runtime &runtime, const jsi::Value &thisValue,
                                        const jsi::Value *arguments, size_t count) -> jsi::Value {
        MMKV *kv = getInstance(arguments[0].getString(runtime).utf8(runtime));
        if (!kv) {
            return Value::undefined();
        }
        auto keys = kv->allKeys();

        auto array = jsi::Array(runtime, keys.size());
        for (int i = 0; i < keys.size(); i++) {
            auto string = jsi::String::createFromUtf8(runtime, keys[i]);
            array.setValueAtIndex(runtime, i, string);
        }
        return array;
    });

    CREATE_FUNC("getIndexMMKV", 2, [](Runtime &runtime, const Value &thisValue,
                                                const Value *arguments, size_t count) -> Value {
        MMKV *kv = getInstance(arguments[1].getString(runtime).utf8(runtime));
        if (!kv) {
            return Value::undefined();
        }

        auto keys = getIndex(kv, arguments[0].getString(runtime).utf8(runtime));
        auto array = jsi::Array(runtime, keys.size());
        for (int i = 0; i < keys.size(); i++) {
            auto string = jsi::String::createFromUtf8(runtime, keys[i]);
            array.setValueAtIndex(runtime, i, string);
        }
        return array;
    });

    CREATE_FUNC("containsKeyMMKV", 2, [](jsi::Runtime &runtime, const jsi::Value &thisValue,
                                         const jsi::Value *arguments, size_t count) -> jsi::Value {
        MMKV *kv = getInstance(arguments[1].getString(runtime).utf8(runtime));
        if (!kv) {
            return Value::undefined();
        }
        return Value(kv->containsKey(arguments[0].getString(runtime).utf8(runtime)));
    });

    CREATE_FUNC("clearMMKV", 1, [](jsi::Runtime &runtime, const jsi::Value &thisValue,
                                   const jsi::Value *arguments, size_t count) -> jsi::Value {
        MMKV *kv = getInstance(arguments[0].getString(runtime).utf8(runtime));
        if (!kv) {
            return Value::undefined();
        }
        kv->clearAll();
        return Value(true);
    });

    CREATE_FUNC("clearMemoryCache", 1, [](jsi::Runtime &runtime, const jsi::Value &thisValue,
                                          const jsi::Value *arguments, size_t count) -> jsi::Value {
        MMKV *kv = getInstance(arguments[0].getString(runtime).utf8(runtime));
        if (!kv) {
            return Value::undefined();
        }
        kv->clearMemoryCache();
        return Value(true);
    });

    CREATE_FUNC("encryptMMKV", 2, [](jsi::Runtime &runtime, const jsi::Value &thisValue,
                                     const jsi::Value *arguments, size_t count) -> jsi::Value {
        MMKV *kv = getInstance(arguments[1].getString(runtime).utf8(runtime));
        if (!kv) {
            return Value::undefined();
        }

        string cryptKey = arguments[0].getString(runtime).utf8(runtime);
        bool result = kv->reKey(cryptKey);
        return Value(result);
    });

    CREATE_FUNC("decryptMMKV", 1, [](jsi::Runtime &runtime, const jsi::Value &thisValue,
                                     const jsi::Value *arguments, size_t count) -> jsi::Value {
        MMKV *kv = getInstance(arguments[0].getString(runtime).utf8(runtime));
        if (!kv) {
            return Value::undefined();
        }
        kv->reKey("");
        return Value(true);
    });
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
Java_com_ammarahmed_mmkv_MMKV_removeValueForKey(JNIEnv *env, jobject instance, jlong handle, jstring oKey) {
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
Java_com_ammarahmed_mmkv_MMKV_decodeInt(JNIEnv *env, jobject obj, jlong handle, jstring oKey, jint defaultValue) {
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
Java_com_ammarahmed_mmkv_MMKV_encodeString(JNIEnv *env, jobject thiz, jlong handle, jstring oKey, jstring oValue) {
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
Java_com_ammarahmed_mmkv_MMKV_encodeDouble(JNIEnv *env, jobject thiz, jlong handle, jstring oKey, jdouble value) {
    MMKV *kv = reinterpret_cast<MMKV *>(handle);
    if (kv && oKey) {
        string key = jstring2string(env, oKey);
        return (jboolean) kv->set((double) value, key);
    }
    return (jboolean) false;
}

extern "C"
JNIEXPORT jboolean JNICALL
Java_com_ammarahmed_mmkv_MMKV_encodeSet(JNIEnv *env, jobject thiz, jlong handle, jstring oKey, jobjectArray arrStr) {
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
Java_com_ammarahmed_mmkv_MMKV_jniInitialize(JNIEnv *env, jclass clazz, jstring rootDir, jint logLevel) {
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
