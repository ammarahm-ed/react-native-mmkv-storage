#include <jni.h>
#include <jsi/jsi.h>
#include "MMKV.h"
#include "MMKVPredef.h"

using namespace facebook;
using namespace jsi;
using namespace std;

static vector<MMKV *> mmkvInstances;

//TODO
string rPath = "";


std::string j_string_to_string(JNIEnv *env, jstring jStr) {
    if (!jStr) return "";

    const auto stringClass = env->GetObjectClass(jStr);
    const auto getBytes = env->GetMethodID(stringClass, "getBytes", "(Ljava/lang/String;)[B");
    const auto stringJbytes = (jbyteArray) env->CallObjectMethod(jStr, getBytes, env->NewStringUTF("UTF-8"));

    auto length = (size_t) env->GetArrayLength(stringJbytes);
    auto pBytes = env->GetByteArrayElements(stringJbytes, nullptr);

    std::string ret = std::string((char *)pBytes, length);
    env->ReleaseByteArrayElements(stringJbytes, pBytes, JNI_ABORT);

    env->DeleteLocalRef(stringJbytes);
    env->DeleteLocalRef(stringClass);
    return ret;
}


static MMKV *getInstance(string ID)
{
    auto kv = std::find_if(mmkvInstances.begin(), mmkvInstances.end(), [&ID](MMKV *inst) {
        return inst->mmapID() == ID;
    });

    if (kv == mmkvInstances.end())
    {
        return nullptr;
    }
    return *kv;
}


static MMKV *createInstance(string ID, MMKVMode mode, string key, string path)
{

    MMKV *kv;

    for (int i=0;i < mmkvInstances.size();i++) {
        MMKV *instance = mmkvInstances[i];
        if (instance->mmapID() == ID) {
            *mmkvInstances.erase(mmkvInstances.begin() + i);
        }
    }

    if (key == "" && path != "")
    {
        kv = MMKV::mmkvWithID(ID, mmkv::DEFAULT_MMAP_SIZE, mode, nullptr, &path);
    }
    else if (path == "" && key != "")
    {
        kv = MMKV::mmkvWithID(ID, mmkv::DEFAULT_MMAP_SIZE, mode, &key);
        kv->clearMemoryCache();
    }
    else if (path != "" && key != "")
    {
        kv = MMKV::mmkvWithID(ID, mmkv::DEFAULT_MMAP_SIZE, mode, &key, &path);
    }
    else
    {
        kv = MMKV::mmkvWithID(ID, mmkv::DEFAULT_MMAP_SIZE, mode);
    }


    mmkvInstances.push_back(kv);
    return kv;
}

static void setIndex(MMKV *kv, string type, string key)
{
    vector<string> indexer;
    kv->getVector(type, indexer);

    if (find(indexer.begin(), indexer.end(), key) == indexer.end())
    {
        indexer.insert(indexer.end(), key);
        kv->set(indexer, type);
        return;
    }
}

static vector<string> getIndex(MMKV *kv, string type)
{
    vector<string> indexer;
    kv->getVector(type, indexer);

    return indexer;
}

static void removeFromIndex(MMKV *kv, string key)
{
    vector<string> sindexer;
    kv->getVector("stringIndex", sindexer);
    if (find(sindexer.begin(), sindexer.end(), key) != sindexer.end())
    {
        sindexer.erase(std::remove(sindexer.begin(), sindexer.end(), key), sindexer.end());
        return;
    }

    vector<string> nindexer;
    kv->getVector("numberIndex", nindexer);
    if (find(nindexer.begin(), nindexer.end(), key) != nindexer.end())
    {
        nindexer.erase(std::remove(nindexer.begin(), nindexer.end(), key), nindexer.end());
        return;
    }

    vector<string> bindexer;
    kv->getVector("boolIndex", bindexer);
    if (find(bindexer.begin(), bindexer.end(), key) != bindexer.end())
    {
        bindexer.erase(std::remove(bindexer.begin(), bindexer.end(), key), bindexer.end());
        return;
    }

    vector<string> mindexer;
    kv->getVector("mapIndex", mindexer);
    if (find(mindexer.begin(), mindexer.end(), key) != mindexer.end())
    {
        mindexer.erase(std::remove(mindexer.begin(), mindexer.end(), key), mindexer.end());
        return;
    }

    vector<string> aindexer;
    kv->getVector("arrayIndex", aindexer);
    if (find(aindexer.begin(), aindexer.end(), key) != aindexer.end())
    {
        aindexer.erase(std::remove(aindexer.begin(), aindexer.end(), key), aindexer.end());
        return;
    }
}

void install(Runtime &jsiRuntime)
{

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

                                                                  MMKVMode mode = (MMKVMode)(int)arguments[1].getNumber();
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

                                                                  return Value::null();
                                                              });

    jsiRuntime.global().setProperty(jsiRuntime, "setupMMKVInstance", move(setupMMKVInstance));

    auto setStringMMKV = Function::createFromHostFunction(jsiRuntime,
                                                          PropNameID::forAscii(jsiRuntime,
                                                                               "setStringMMKV"),
                                                          3,
                                                          [](Runtime &runtime,
                                                             const Value &thisValue,
                                                             const Value *arguments,
                                                             size_t count) -> Value {
                                                              MMKV *kv = getInstance(arguments[2].getString(
                                                                                                     runtime)
                                                                                         .utf8(runtime));
                                                              if (!kv)
                                                              {
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

                                                              return Value::null();
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
                                                              MMKV *kv = getInstance(arguments[1].getString(
                                                                                                     runtime)
                                                                                         .utf8(runtime));
                                                              if (!kv)
                                                              {
                                                                  return Value::null();
                                                              }

                                                              string result;
                                                              bool exists = kv->getString(
                                                                  arguments[0].getString(
                                                                                  runtime)
                                                                      .utf8(
                                                                          runtime),
                                                                  result);
                                                              if (!exists)
                                                              {
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
                                                           MMKV *kv = getInstance(arguments[2].getString(
                                                                                                  runtime)
                                                                                      .utf8(runtime));
                                                           if (!kv)
                                                           {
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

                                                           return Value::null();
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
                                                           MMKV *kv = getInstance(arguments[1].getString(
                                                                                                  runtime)
                                                                                      .utf8(runtime));

                                                           if (!kv)
                                                           {
                                                               return Value::undefined();
                                                           }

                                                           string result;
                                                           bool exists = kv->getString(
                                                               arguments[0].getString(
                                                                               runtime)
                                                                   .utf8(
                                                                       runtime),
                                                               result);
                                                           if (!exists)
                                                           {
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
                                                             MMKV *kv = getInstance(arguments[2].getString(
                                                                                                    runtime)
                                                                                        .utf8(runtime));
                                                             if (!kv)
                                                             {
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

                                                             return Value::null();
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
                                                             MMKV *kv = getInstance(arguments[1].getString(
                                                                                                    runtime)
                                                                                        .utf8(runtime));

                                                             if (!kv)
                                                             {
                                                                 return Value::undefined();
                                                             }

                                                             string result;
                                                             bool exists = kv->getString(
                                                                 arguments[0].getString(
                                                                                 runtime)
                                                                     .utf8(
                                                                         runtime),
                                                                 result);
                                                             if (!exists)
                                                             {
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
                                                              MMKV *kv = getInstance(arguments[2].getString(
                                                                                                     runtime)
                                                                                         .utf8(runtime));
                                                              if (!kv)
                                                              {
                                                                  return Value::undefined();
                                                              }
                                                              string key = arguments[0].getString(
                                                                                           runtime)
                                                                               .utf8(
                                                                                   runtime);
                                                              setIndex(kv, "numberIndex", key);
                                                              kv->set(arguments[1].getNumber(),
                                                                      key);

                                                              return Value::null();
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
                                                              MMKV *kv = getInstance(arguments[1].getString(
                                                                                                     runtime)
                                                                                         .utf8(runtime));
                                                              if (!kv)
                                                              {
                                                                  return Value::undefined();
                                                              }
                                                              string key = arguments[0].getString(
                                                                                           runtime)
                                                                               .utf8(runtime);
                                                              string result;
                                                              bool exists = kv->containsKey(key);
                                                              if (!exists)
                                                              {
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
                                                            MMKV *kv = getInstance(arguments[2].getString(
                                                                                                   runtime)
                                                                                       .utf8(runtime));
                                                            if (!kv)
                                                            {
                                                                return Value::undefined();
                                                            }
                                                            string key = arguments[0].getString(
                                                                                         runtime)
                                                                             .utf8(
                                                                                 runtime);
                                                            setIndex(kv, "boolIndex", key);

                                                            kv->set(arguments[1].getBool(),
                                                                    key);

                                                            return Value::null();
                                                        });

    jsiRuntime.global().setProperty(jsiRuntime, "setBoolMMKV", move(setBoolMMKV));

    auto getBoolMMKV = Function::createFromHostFunction(jsiRuntime,
                                                        PropNameID::forAscii(jsiRuntime,
                                                                             "getBoolMMKV"),
                                                        2,
                                                        [](Runtime &runtime, const Value &thisValue,
                                                           const Value *arguments,
                                                           size_t count) -> Value {
                                                            MMKV *kv = getInstance(arguments[1].getString(
                                                                                                   runtime)
                                                                                       .utf8(runtime));
                                                            if (!kv)
                                                            {
                                                                return Value::undefined();
                                                            }

                                                            string key = arguments[0].getString(
                                                                                         runtime)
                                                                             .utf8(runtime);
                                                            string result;
                                                            bool exists = kv->containsKey(key);
                                                            if (!exists)
                                                            {
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
                                                                     MMKV *kv = getInstance(arguments[1].getString(
                                                                                                            runtime)
                                                                                                .utf8(runtime));
                                                                     if (!kv)
                                                                     {
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
                                                                     return jsi::Value::null();
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
                                                                    MMKV *kv = getInstance(arguments[0].getString(
                                                                                                           runtime)
                                                                                               .utf8(runtime));
                                                                    if (!kv)
                                                                    {
                                                                        return Value::undefined();
                                                                    }
                                                                    auto keys = kv->allKeys();

                                                                    auto array = jsi::Array(runtime,
                                                                                            keys.size());

                                                                    for (int i = 0;
                                                                         i < keys.size(); i++)
                                                                    {
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
                                                                  MMKV *kv = getInstance(arguments[1].getString(
                                                                                                         runtime)
                                                                                             .utf8(runtime));
                                                                  if (!kv)
                                                                  {
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
                                                                       i < keys.size(); i++)
                                                                  {
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
                                                                     MMKV *kv = getInstance(arguments[1].getString(
                                                                                                            runtime)
                                                                                                .utf8(runtime));
                                                                     if (!kv)
                                                                     {
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
                                                               MMKV *kv = getInstance(arguments[0].getString(
                                                                                                      runtime)
                                                                                          .utf8(runtime));
                                                               if (!kv)
                                                               {
                                                                   return Value::undefined();
                                                               }

                                                               kv->clearAll();

                                                               return Value::null();
                                                           });
    jsiRuntime.global().setProperty(jsiRuntime, "clearMMKV", std::move(clearMMKV));


    auto encryptMMKV = jsi::Function::createFromHostFunction(jsiRuntime,
                                                           jsi::PropNameID::forAscii(
                                                                   jsiRuntime,
                                                                   "encryptMMKV"),
                                                           2,
                                                           [](jsi::Runtime &runtime,
                                                              const jsi::Value &thisValue,
                                                              const jsi::Value *arguments,

                                                              size_t count) -> jsi::Value {
                                                               MMKV *kv = getInstance(arguments[1].getString(
                                                                               runtime)
                                                                                              .utf8(runtime));
                                                               if (!kv)
                                                               {
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
                                                               MMKV *kv = getInstance(arguments[0].getString(
                                                                               runtime)
                                                                                              .utf8(runtime));
                                                               if (!kv)
                                                               {
                                                                   return Value::undefined();
                                                               }

                                                               kv->reKey(nullptr);

                                                               return Value::null();
                                                           });
    jsiRuntime.global().setProperty(jsiRuntime, "decryptMMKV", std::move(decryptMMKV));





}

extern "C"
JNIEXPORT void JNICALL
Java_com_ammarahmed_mmkv_RNMMKVModule_nativeInstall(JNIEnv *env, jobject clazz, jlong jsi, jstring rootPath) {
    rPath = j_string_to_string(env, rootPath);
    MMKV::initializeMMKV(rPath);
    auto runtime = reinterpret_cast<jsi::Runtime*>(jsi);
    install(*runtime);
    createInstance("mmkvIDStore",MMKV_SINGLE_PROCESS,"","");
}