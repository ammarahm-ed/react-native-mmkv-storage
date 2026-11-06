#include <jsi/jsi.h>
#include <MMKV/MMKV.h>
#include <MMKV/MMKVPredef.h>
#include <MMKV/MMBuffer.h>
#include <algorithm>
#include <unordered_map>
#include <vector>

#include "MMKVInstall.h"

using namespace facebook;
using namespace jsi;
using namespace std;

static std::unordered_map<std::string, MMKV *> mmkvInstances;

static string rPath = "";

extern "C" ssize_t mmkv_secure_get(const char *alias, char *out, size_t capacity);
extern "C" bool mmkv_secure_set(const char *alias, const char *value);
extern "C" bool mmkv_secure_exists(const char *alias);
extern "C" bool mmkv_secure_remove(const char *alias);

static string readSecureKey(const string &alias)
{
    char buffer[512];
    ssize_t length = mmkv_secure_get(alias.c_str(), buffer, sizeof(buffer));
    return length < 0 ? string() : string(buffer, length);
}

static MMKV *getInstance(const string &ID)
{
    auto kv = mmkvInstances.find(ID);
    if (kv == mmkvInstances.end())
    {
        return nullptr;
    }
    return kv->second;
}

static MMKV *createInstance(const string &ID, MMKVMode mode, string key, string path)
{
    MMKV *kv = MMKV::mmkvWithID(ID, mode,
                                key.empty() ? nullptr : &key,
                                path.empty() ? nullptr : &path);

    if (kv != nullptr)
    {
        mmkvInstances[ID] = kv;
    }
    else
    {
        mmkvInstances.erase(ID);
    }
    return kv;
}

// Function to sort a vector
void sortVector(std::vector<std::string> &vec)
{
    std::sort(vec.begin(), vec.end());
}

// Function to add a value to the vector while maintaining sorting order
void addValue(std::vector<std::string> &vec, const std::string &value)
{
    auto insertPosition = std::lower_bound(vec.begin(), vec.end(), value);
    vec.insert(insertPosition, value);
}

// Function to remove a value from the vector
void removeValue(std::vector<std::string> &vec, const std::string &value)
{
    auto position = std::lower_bound(vec.begin(), vec.end(), value);
    if (position != vec.end() && *position == value)
    {
        vec.erase(position);
    }
}

// Function to search for a value in the vector
bool hasValue(const std::vector<std::string> &vec, const std::string &value)
{
    return std::binary_search(vec.begin(), vec.end(), value);
}

std::unordered_map<std::string, bool> indexing_enabled = {};
std::unordered_map<std::string, std::unordered_map<std::string, std::vector<std::string>>> index_cache = {};

static std::vector<std::string> emptyIndex;

static std::vector<std::string> &getIndex(MMKV *kv, const string &type)
{
    if (!indexing_enabled[kv->mmapID()])
    {
        emptyIndex.clear();
        return emptyIndex;
    }

    auto &kvIndex = index_cache[kv->mmapID()];

    auto it = kvIndex.find(type);
    if (it == kvIndex.end())
    {
        std::vector<std::string> loaded;
        if (kv->getVector(type, loaded))
        {
            sortVector(loaded);
        }
        else
        {
            loaded.clear();
        }
        it = kvIndex.emplace(type, std::move(loaded)).first;
    }

    return it->second;
}

std::unordered_map<std::string, std::unordered_map<std::string, bool>> index_dirty = {};

static void markIndexDirty(MMKV *kv, const string &type)
{
    index_dirty[kv->mmapID()][type] = true;
}

static void flushIndexes(MMKV *kv)
{
    auto it = index_dirty.find(kv->mmapID());
    if (it == index_dirty.end())
        return;

    for (auto &entry : it->second)
    {
        if (entry.second)
            kv->set(getIndex(kv, entry.first), entry.first);
    }
    it->second.clear();
}

static const string dataTypes[] = {
    "stringIndex",
    "numberIndex",
    "boolIndex",
    "mapIndex",
    "arrayIndex",
};

static const string typeNames[] = {
    "string",
    "number",
    "boolean",
    "object",
    "array",
};

static const string *valueTypeForKey(MMKV *kv, const string &key)
{
    for (int i = 0; i < 5; i++)
    {
        if (hasValue(getIndex(kv, dataTypes[i]), key))
        {
            return &typeNames[i];
        }
    }
    return nullptr;
}

static void removeFromIndex(MMKV *kv, const string &key)
{
    if (!indexing_enabled[kv->mmapID()])
        return;
    for (const auto &idx : dataTypes)
    {
        auto &index = getIndex(kv, idx);
        if (hasValue(index, key))
        {
            removeValue(index, key);
            markIndexDirty(kv, idx);
            return;
        }
    }
}

static void removeKeysFromIndex(MMKV *kv, const vector<string> &arrKeys)
{
    if (!indexing_enabled[kv->mmapID()])
        return;

    std::unordered_map<std::string, bool> modified;

    for (const auto &key : arrKeys)
    {
        for (const auto &idx : dataTypes)
        {
            auto &index = getIndex(kv, idx);
            if (hasValue(index, key))
            {
                removeValue(index, key);
                modified[idx] = true;
                break;
            }
        }
    }

    for (const auto &idx : dataTypes)
    {
        if (modified[idx])
            markIndexDirty(kv, idx);
    }
}

static void setIndex(MMKV *kv, const string &type, const string &key)
{
    if (!indexing_enabled[kv->mmapID()])
        return;
    auto &index = getIndex(kv, type);
    if (!hasValue(index, key))
    {
        addValue(index, key);
        markIndexDirty(kv, type);
    }
}

static void setIndexes(MMKV *kv, const string &type, const std::vector<std::string> keys[])
{
    if (!indexing_enabled[kv->mmapID()])
        return;
    auto &index = getIndex(kv, type);
    int size = keys->size();
    for (int i = 0; i < size; i++)
    {
        if (!hasValue(index, keys->at(i)))
        {
            addValue(index, keys->at(i));
        }
    }
    markIndexDirty(kv, type);
}

template <typename NativeFunc>
static void createFunc(Runtime &jsiRuntime, const char *prop, int paramCount, NativeFunc &&func)
{
    auto f = Function::createFromHostFunction(jsiRuntime,
                                              PropNameID::forAscii(jsiRuntime, prop),
                                              paramCount,
                                              std::forward<NativeFunc>(func));
    jsiRuntime.global().setProperty(jsiRuntime, prop, std::move(f));
}

#define CREATE_FUNCTION(prop, paramCount, block) \
    createFunc(jsiRuntime, prop, paramCount, [](Runtime &runtime, const Value &thisValue, const Value *arguments, size_t count) -> Value { block })

#define CREATE_FUNCTION_CAPTURE(prop, paramCount, block) \
    createFunc(jsiRuntime, prop, paramCount, [=](Runtime &runtime, const Value &thisValue, const Value *arguments, size_t count) -> Value { block })

#define std_string(arg) \
    arg.getString(runtime).utf8(runtime)

#define CALLBACK(returnValue) \
    invoker->invokeAsync([&runtime, cbref] { cbref->call(runtime, returnValue); });

#define HOSTFN(name, basecount)           \
jsi::Function::createFromHostFunction( \
runtime, \
jsi::PropNameID::forAscii(runtime, name), \
basecount, \
[=](jsi::Runtime &runtime, const jsi::Value &thisValue, const jsi::Value *args, size_t count) -> jsi::Value

void initIndexForId(std::string id)
{
    index_cache[id] = unordered_map<std::string, std::vector<std::string>>();
    index_dirty[id] = unordered_map<std::string, bool>();
}

void installBindings(Runtime &jsiRuntime)
{

    CREATE_FUNCTION("initializeMMKV", 0, {
        MMKV::initializeMMKV(rPath);
        return Value::undefined();
    });

    CREATE_FUNCTION("setupMMKVInstance", 5, {
        string id = std_string(arguments[0]);
        auto mode = (MMKVMode)(int)arguments[1].getNumber();
        string cryptKey = std_string(arguments[2]);
        MMKVPath_t path = std_string(arguments[3]);
        MMKV *kv = createInstance(id, mode, cryptKey, path);

        if (kv == nullptr)
        {
            return Value(false);
        }

        indexing_enabled[id] = arguments[4].getBool();
        initIndexForId(id);

        return Value(true);
    });

    CREATE_FUNCTION("isSecureKeySynchronizable", 1, {
        return Value(false);
    });

    CREATE_FUNCTION("migrateSecureKeyToSynchronizable", 2, {
        return Value(false);
    });

    CREATE_FUNCTION("removeMMKVStorage", 1, {
        string id = std_string(arguments[0]);

        mmkvInstances.erase(id);
        indexing_enabled.erase(id);
        index_cache.erase(id);
        index_dirty.erase(id);

        bool removed = MMKV::removeStorage(id, &rPath);

        return Value(removed);
    });

    CREATE_FUNCTION("getSecureKey", 1, {
        string cryptKey = readSecureKey(std_string(arguments[0]));
        return Value(runtime, String::createFromUtf8(runtime, cryptKey));
    });

    CREATE_FUNCTION("setSecureKey", 2, {
        return Value(mmkv_secure_set(std_string(arguments[0]).c_str(), std_string(arguments[1]).c_str()));
    });

    CREATE_FUNCTION("secureKeyExists", 1, {
        return Value(mmkv_secure_exists(std_string(arguments[0]).c_str()));
    });

    CREATE_FUNCTION("removeSecureKey", 1, {
        return Value(mmkv_secure_remove(std_string(arguments[0]).c_str()));
    });

    CREATE_FUNCTION("setStringMMKV", 3, {
        MMKV *kv = getInstance(std_string(arguments[2]));
        if (!kv)
        {
            return Value::undefined();
        }

        string key = std_string(arguments[0]);
        setIndex(kv, "stringIndex", key);
        kv->set(std_string(arguments[1]), key);
        return Value(true);
    });

    CREATE_FUNCTION("setMultiMMKV", 4, {
        auto keys = arguments[0].getObject(runtime).asArray(runtime);
        auto values = arguments[1].getObject(runtime).asArray(runtime);
        auto dataType = std_string(arguments[2]);
        auto kvName = std_string(arguments[3]);
        auto kv = getInstance(kvName);
        auto size = keys.length(runtime);

        std::vector<std::string> keysArray = {};
        std::vector<std::string> keysToRemove = {};

        for (int i = 0; i < size; i++)
        {
            auto key = std_string(keys.getValueAtIndex(runtime, i));
            keysArray.push_back(key);
            if (values.getValueAtIndex(runtime, i).isString())
            {
                auto value = std_string(values.getValueAtIndex(runtime, i));
                kv->set(value, key);
            }
            else
            {
                if (kv->containsKey(key))
                {
                    keysToRemove.push_back(key);
                }
            }
        }
        kv->removeValuesForKeys(keysToRemove);
        removeKeysFromIndex(kv, keysToRemove);
        setIndexes(kv, dataType, &keysArray);
        return jsi::Value(true);
    });

    CREATE_FUNCTION("getStringMMKV", 2, {
        MMKV *kv = getInstance(std_string(arguments[1]));
        if (!kv)
        {
            return Value::undefined();
        }

        string result;
        bool exists = kv->getString(std_string(arguments[0]), result);
        if (!exists)
        {
            return Value::null();
        }
        return Value(runtime, String::createFromUtf8(runtime, result));
    });

    CREATE_FUNCTION("getMultiMMKV", 2, {
        auto keys = arguments[0].getObject(runtime).asArray(runtime);
        auto kvName = std_string(arguments[1]);
        auto kv = getInstance(kvName);
        auto size = keys.length(runtime);

        jsi::Array values = jsi::Array(runtime, size);

        for (int i = 0; i < size; i++)
        {
            auto key = std_string(keys.getValueAtIndex(runtime, i));
            std::string result;
            if (kv->getString(key, result))
            {
                values.setValueAtIndex(runtime, i, String::createFromUtf8(runtime, result));
            }
            else
            {
                values.setValueAtIndex(runtime, i, jsi::Value::null());
            }
        }

        return values;
    });

    CREATE_FUNCTION("setMapMMKV", 3, {
        MMKV *kv = getInstance(std_string(arguments[2]));
        if (!kv)
        {
            return Value::undefined();
        }

        string key = std_string(arguments[0]);

        setIndex(kv, "mapIndex", key);
        kv->set(std_string(arguments[1]), key);
        return Value(true);
    });

    CREATE_FUNCTION("getMapMMKV", 2, {
        MMKV *kv = getInstance(std_string(arguments[1]));
        if (!kv)
        {
            return Value::undefined();
        }

        string result;
        bool exists = kv->getString(std_string(arguments[0]), result);
        if (!exists)
        {
            return Value::null();
        }
        return Value(runtime, String::createFromUtf8(runtime, result));
    });

    CREATE_FUNCTION("setArrayMMKV", 3, {
        MMKV *kv = getInstance(std_string(arguments[2]));
        if (!kv)
        {
            return Value::undefined();
        }

        string key = std_string(arguments[0]);

        setIndex(kv, "arrayIndex", key);
        kv->set(std_string(arguments[1]), key);
        return Value(true);
    });

    CREATE_FUNCTION("getArrayMMKV", 2, {
        MMKV *kv = getInstance(std_string(arguments[1]));

        if (!kv)
        {
            return Value::undefined();
        }

        string result;
        bool exists = kv->getString(std_string(arguments[0]), result);
        if (!exists)
        {
            return Value::null();
        }
        return Value(runtime, String::createFromUtf8(runtime, result));
    });

    CREATE_FUNCTION("setNumberMMKV", 3, {
        MMKV *kv = getInstance(std_string(arguments[2]));
        if (!kv)
        {
            return Value::undefined();
        }
        string key = std_string(arguments[0]);
        setIndex(kv, "numberIndex", key);
        kv->set(arguments[1].getNumber(), key);
        return Value(true);
    });

    CREATE_FUNCTION("getNumberMMKV", 2, {
        MMKV *kv = getInstance(std_string(arguments[1]));
        if (!kv)
        {
            return Value::undefined();
        }
        string key = std_string(arguments[0]);
        bool exists = false;
        double result = kv->getDouble(key, 0, &exists);
        if (!exists)
        {
            return Value::null();
        }
        return Value(result);
    });

    CREATE_FUNCTION("setBoolMMKV", 3, {
        MMKV *kv = getInstance(std_string(arguments[2]));
        if (!kv)
        {
            return Value::undefined();
        }
        string key = std_string(arguments[0]);
        setIndex(kv, "boolIndex", key);
        kv->set(arguments[1].getBool(), key);
        return Value(true);
    });

    CREATE_FUNCTION("getBoolMMKV", 2, {
        MMKV *kv = getInstance(std_string(arguments[1]));
        if (!kv)
        {
            return Value::undefined();
        }

        string key = std_string(arguments[0]);
        bool exists = false;
        bool result = kv->getBool(key, false, &exists);
        if (!exists)
        {
            return Value::null();
        }
        return Value(result);
    });

    CREATE_FUNCTION("removeValueMMKV", 2, {
        MMKV *kv = getInstance(std_string(arguments[1]));
        if (!kv)
        {
            return Value::undefined();
        }

        string key = std_string(arguments[0]);

        kv->removeValueForKey(key);
        removeFromIndex(kv, key);

        return Value(true);
    });

    CREATE_FUNCTION("removeValuesMMKV", 2, {
        MMKV *kv = getInstance(std_string(arguments[1]));
        auto keys = arguments[0].getObject(runtime).asArray(runtime);

        if (!kv)
        {
            return Value::undefined();
        }

        std::vector<std::string> keys_vec = {};
        auto size = keys.length(runtime);
        for (int i = 0; i < size; i++)
        {
            auto key = std_string(keys.getValueAtIndex(runtime, i));
            keys_vec.push_back(key);
        }

        kv->removeValuesForKeys(keys_vec);
        removeKeysFromIndex(kv, keys_vec);

        return Value(true);
    });

    CREATE_FUNCTION("getAllKeysMMKV", 1, {
        MMKV *kv = getInstance(std_string(arguments[0]));
        if (!kv)
        {
            return Value::undefined();
        }
        auto keys = kv->allKeys();

        auto array = jsi::Array(runtime, keys.size());
        auto size = keys.size();
        for (int i = 0; i < size; i++)
        {
            auto string = jsi::String::createFromUtf8(runtime, keys[i]);
            array.setValueAtIndex(runtime, i, string);
        }
        return array;
    });

    CREATE_FUNCTION("getIndexMMKV", 2, {
        MMKV *kv = getInstance(std_string(arguments[1]));
        if (!kv)
        {
            return Value::undefined();
        }

        const auto &keys = getIndex(kv, std_string(arguments[0]));
        auto size = keys.size();
        auto array = jsi::Array(runtime, size);
        for (int i = 0; i < size; i++)
        {
            auto string = jsi::String::createFromUtf8(runtime, keys[i]);
            array.setValueAtIndex(runtime, i, string);
        }
        return array;
    });

    CREATE_FUNCTION("indexContainsKeyMMKV", 3, {
        MMKV *kv = getInstance(std_string(arguments[2]));
        if (!kv)
        {
            return Value::undefined();
        }
        return Value(hasValue(getIndex(kv, std_string(arguments[0])), std_string(arguments[1])));
    });

    CREATE_FUNCTION("getValueTypeMMKV", 2, {
        MMKV *kv = getInstance(std_string(arguments[1]));
        if (!kv)
        {
            return Value::undefined();
        }

        const string *type = valueTypeForKey(kv, std_string(arguments[0]));

        if (type == nullptr)
        {
            return Value::null();
        }

        return Value(runtime, String::createFromUtf8(runtime, *type));
    });

    CREATE_FUNCTION("containsKeyMMKV", 2, {
        MMKV *kv = getInstance(std_string(arguments[1]));
        if (!kv)
        {
            return Value::undefined();
        }
        return Value(kv->containsKey(std_string(arguments[0])));
    });

    CREATE_FUNCTION("clearMMKV", 1, {
        MMKV *kv = getInstance(std_string(arguments[0]));
        if (!kv)
        {
            return Value::undefined();
        }
        kv->clearAll();
        initIndexForId(kv->mmapID());

        return Value(true);
    });

    CREATE_FUNCTION("flushIndexesMMKV", 1, {
        MMKV *kv = getInstance(std_string(arguments[0]));
        if (!kv)
        {
            return Value::undefined();
        }
        flushIndexes(kv);
        return Value(true);
    });

    CREATE_FUNCTION("clearMemoryCache", 1, {
        MMKV *kv = getInstance(std_string(arguments[0]));
        if (!kv)
        {
            return Value::undefined();
        }
        kv->clearMemoryCache();
        return Value(true);
    });

    CREATE_FUNCTION("encryptMMKV", 2, {
        MMKV *kv = getInstance(std_string(arguments[1]));
        if (!kv)
        {
            return Value::undefined();
        }

        string cryptKey = std_string(arguments[0]);
        bool result = kv->reKey(cryptKey);
        return Value(result);
    });

    CREATE_FUNCTION("decryptMMKV", 1, {
        MMKV *kv = getInstance(std_string(arguments[0]));
        if (!kv)
        {
            return Value::undefined();
        }
        kv->reKey("");
        return Value(true);
    });
}


void installMMKV(Runtime &runtime, const std::string &rootPath)
{
    rPath = rootPath;
    MMKV::initializeMMKV(rPath);
    installBindings(runtime);
    createInstance("mmkvIDStore", MMKV_SINGLE_PROCESS, "", "");
}
