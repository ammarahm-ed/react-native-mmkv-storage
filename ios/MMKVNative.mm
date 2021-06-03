#import "MMKVNative.h"
#import "YeetJSIUtils.h"

#import "SecureStorage.h"
#import <MMKV/MMKV.h>
#import <React/RCTBridge+Private.h>
#import <React/RCTUtils.h>
#import <jsi/jsi.h>

using namespace facebook;
using namespace jsi;
using namespace std;

@implementation MMKVNative
@synthesize bridge = _bridge;
@synthesize methodQueue = _methodQueue;
NSString *rPath = @"";
NSMutableDictionary *mmkvInstances;
SecureStorage *_secureStorage;

RCT_EXPORT_MODULE()

+ (BOOL)requiresMainQueueSetup {
    
    return YES;
}

MMKV *getInstance(NSString *ID) {
    if ([[mmkvInstances allKeys] containsObject:ID]) {
        MMKV *kv = [mmkvInstances objectForKey:ID];
        
        return kv;
    } else {
        return NULL;
    }
}

- (void)setBridge:(RCTBridge *)bridge {
    _bridge = bridge;
    _setBridgeOnMainQueue = RCTIsMainQueue();
    [self installLibrary];
}
BOOL functionDiedBeforeCompletion = YES;
- (void)installLibrary {
    
    RCTCxxBridge *cxxBridge = (RCTCxxBridge *)self.bridge;
    
    if (!cxxBridge.runtime) {
        
        dispatch_after(dispatch_time(DISPATCH_TIME_NOW, 0.001 * NSEC_PER_SEC),
                       dispatch_get_main_queue(), ^{
            /**
             When refreshing the app while debugging, the setBridge
             method is called too soon. The runtime is not ready yet
             quite often. We need to install library as soon as runtime
             becomes available.
             */
            [self installLibrary];
        });
        return;
    }
    
    mmkvInstances = [NSMutableDictionary dictionary];
    
    NSArray *paths = NSSearchPathForDirectoriesInDomains(NSLibraryDirectory,
                                                         NSUserDomainMask, YES);
    NSString *libraryPath = (NSString *)[paths firstObject];
    NSString *rootDir = [libraryPath stringByAppendingPathComponent:@"mmkv"];
    rPath = rootDir;
    _secureStorage = [[SecureStorage alloc] init];
    [MMKV initializeMMKV:rootDir];
    install(*(jsi::Runtime *)cxxBridge.runtime);
    [self migrate];
}

MMKV *createInstance(NSString *ID, MMKVMode mode, NSString *key,
                     NSString *path) {
    
    MMKV *kv;
    
    if (![key isEqual:@""] && [path isEqual:@""]) {
        NSData *cryptKey = [key dataUsingEncoding:NSUTF8StringEncoding];
        kv = [MMKV mmkvWithID:ID cryptKey:cryptKey mode:mode];
    } else if (![path isEqual:@""] && [key isEqual:@""]) {
        kv = [MMKV mmkvWithID:ID mode:mode];
    } else if (![path isEqual:@""] && ![key isEqual:@""]) {
        NSData *cryptKey = [key dataUsingEncoding:NSUTF8StringEncoding];
        kv = [MMKV mmkvWithID:ID cryptKey:cryptKey mode:mode];
    } else {
        kv = [MMKV mmkvWithID:ID mode:mode];
    }
    [mmkvInstances setObject:kv forKey:ID];
    return kv;
}

void setIndex(MMKV *kv, NSString *type, NSString *key) {
    
    NSMutableArray *indexer = [NSMutableArray array];
    
    if ([kv containsKey:type]) {
        indexer = [kv getObjectOfClass:NSMutableArray.class forKey:type];
    }
    if (![indexer containsObject:key]) {
        [indexer addObject:key];
        [kv setObject:indexer forKey:type];
    }
}

NSMutableArray *getIndex(MMKV *kv, NSString *type) {
    
    NSMutableArray *indexer = [NSMutableArray array];
    
    if ([kv containsKey:type]) {
        return [kv getObjectOfClass:NSMutableArray.class forKey:type];
    } else {
        return indexer;
    }
}

void removeKeyFromIndexer(MMKV *kv, NSString *key) {
    
    NSMutableArray *index = getIndex(kv, @"stringIndex");
    
    if (index != NULL && [index containsObject:key]) {
        
        [index removeObject:key];
        [kv setObject:index forKey:@"stringIndex"];
        return;
    }
    
    index = getIndex(kv, @"numberIndex");
    
    if (index != NULL && [index containsObject:key]) {
        
        [index removeObject:key];
        [kv setObject:index forKey:@"numberIndex"];
        return;
    }
    
    index = getIndex(kv, @"boolIndex");
    
    if (index != NULL && [index containsObject:key]) {
        
        [index removeObject:key];
        [kv setObject:index forKey:@"boolIndex"];
        return;
    }
    
    index = getIndex(kv, @"mapIndex");
    
    if (index != NULL && [index containsObject:key]) {
        
        [index removeObject:key];
        [kv setObject:index forKey:@"mapIndex"];
        return;
    }
    
    index = getIndex(kv, @"arrayIndex");
    
    if (index != NULL && [index containsObject:key]) {
        
        [index removeObject:key];
        [kv setObject:index forKey:@"arrayIndex"];
        return;
    }
}

static void install(jsi::Runtime &jsiRuntime) {
    
    auto initializeMMKV = Function::createFromHostFunction(
                                                           jsiRuntime, PropNameID::forAscii(jsiRuntime, "initializeMMKV"), 0,
                                                           [](Runtime &runtime, const Value &thisValue, const Value *arguments,
                                                              size_t count) -> Value {
        [MMKV initializeMMKV:rPath];
        return Value::undefined();
    });
    
    jsiRuntime.global().setProperty(jsiRuntime, "initializeMMKV",
                                    move(initializeMMKV));
    
    auto setupMMKVInstance = Function::createFromHostFunction(
                                                              jsiRuntime, PropNameID::forAscii(jsiRuntime, "setupMMKVInstance"), 4,
                                                              [](Runtime &runtime, const Value &thisValue, const Value *arguments,
                                                                 size_t count) -> Value {
        NSString *ID = convertJSIStringToNSString(
                                                  runtime, arguments[0].getString(runtime));
        
        MMKVMode mode = (MMKVMode)(int)arguments[1].getNumber();
        NSString *cryptKey = convertJSIStringToNSString(
                                                        runtime, arguments[2].getString(runtime));
        
        NSString *path = convertJSIStringToNSString(
                                                    runtime, arguments[3].getString(runtime));
        
        createInstance(ID, mode, cryptKey, path);
        
        return Value(true);
    });
    
    jsiRuntime.global().setProperty(jsiRuntime, "setupMMKVInstance",
                                    move(setupMMKVInstance));
    
    auto setStringMMKV = Function::createFromHostFunction(
                                                          jsiRuntime, PropNameID::forAscii(jsiRuntime, "setStringMMKV"), 3,
                                                          [](Runtime &runtime, const Value &thisValue, const Value *arguments,
                                                             size_t count) -> Value {
        MMKV *kv = getInstance(convertJSIStringToNSString(
                                                          runtime, arguments[2].getString(runtime)));
        
        if (!kv) {
            return Value::undefined();
        }
        
        NSString *key = convertJSIStringToNSString(
                                                   runtime, arguments[0].getString(runtime));
        
        setIndex(kv, @"stringIndex", key);
        
        [kv setString:convertJSIStringToNSString(
                                                 runtime, arguments[1].getString(runtime))
               forKey:key];
        
        return Value(true);
    });
    
    jsiRuntime.global().setProperty(jsiRuntime, "setStringMMKV",
                                    move(setStringMMKV));
    
    auto getStringMMKV = Function::createFromHostFunction(
                                                          jsiRuntime, PropNameID::forAscii(jsiRuntime, "getStringMMKV"), 2,
                                                          [](Runtime &runtime, const Value &thisValue, const Value *arguments,
                                                             size_t count) -> Value {
        MMKV *kv = getInstance(convertJSIStringToNSString(
                                                          runtime, arguments[1].getString(runtime)));
        
        if (!kv) {
            return Value::undefined();
        }
        
        NSString *key = convertJSIStringToNSString(
                                                   runtime, arguments[0].getString(runtime));
        
        if ([kv containsKey:key]) {
            return Value(
                         convertNSStringToJSIString(runtime, [kv getStringForKey:key]));
        } else {
            return Value::null();
        }
    });
    
    jsiRuntime.global().setProperty(jsiRuntime, "getStringMMKV",
                                    move(getStringMMKV));
    
    auto setMapMMKV = Function::createFromHostFunction(
                                                       jsiRuntime, PropNameID::forAscii(jsiRuntime, "setMapMMKV"), 3,
                                                       [](Runtime &runtime, const Value &thisValue, const Value *arguments,
                                                          size_t count) -> Value {
        MMKV *kv = getInstance(convertJSIStringToNSString(
                                                          runtime, arguments[2].getString(runtime)));
        
        if (!kv) {
            return Value::undefined();
        }
        
        NSString *key = convertJSIStringToNSString(
                                                   runtime, arguments[0].getString(runtime));
        
        setIndex(kv, @"mapIndex", key);
        
        [kv setString:convertJSIStringToNSString(
                                                 runtime, arguments[1].getString(runtime))
               forKey:key];
        
        return Value(true);
    });
    
    jsiRuntime.global().setProperty(jsiRuntime, "setMapMMKV", move(setMapMMKV));
    
    auto getMapMMKV = Function::createFromHostFunction(
                                                       jsiRuntime, PropNameID::forAscii(jsiRuntime, "getMapMMKV"), 2,
                                                       [](Runtime &runtime, const Value &thisValue, const Value *arguments,
                                                          size_t count) -> Value {
        MMKV *kv = getInstance(convertJSIStringToNSString(
                                                          runtime, arguments[1].getString(runtime)));
        
        if (!kv) {
            return Value::undefined();
        }
        
        NSString *key = convertJSIStringToNSString(
                                                   runtime, arguments[0].getString(runtime));
        
        if ([kv containsKey:key]) {
            return Value(
                         convertNSStringToJSIString(runtime, [kv getStringForKey:key]));
        } else {
            return Value::null();
        }
    });
    
    jsiRuntime.global().setProperty(jsiRuntime, "getMapMMKV", move(getMapMMKV));
    
    auto setArrayMMKV = Function::createFromHostFunction(
                                                         jsiRuntime, PropNameID::forAscii(jsiRuntime, "setArrayMMKV"), 3,
                                                         [](Runtime &runtime, const Value &thisValue, const Value *arguments,
                                                            size_t count) -> Value {
        MMKV *kv = getInstance(convertJSIStringToNSString(
                                                          runtime, arguments[2].getString(runtime)));
        
        if (!kv) {
            return Value::undefined();
        }
        
        NSString *key = convertJSIStringToNSString(
                                                   runtime, arguments[0].getString(runtime));
        
        setIndex(kv, @"arrayIndex", key);
        
        [kv setString:convertJSIStringToNSString(
                                                 runtime, arguments[1].getString(runtime))
               forKey:key];
        
        return Value(true);
    });
    
    jsiRuntime.global().setProperty(jsiRuntime, "setArrayMMKV",
                                    move(setArrayMMKV));
    
    auto getArrayMMKV = Function::createFromHostFunction(
                                                         jsiRuntime, PropNameID::forAscii(jsiRuntime, "getArrayMMKV"), 2,
                                                         [](Runtime &runtime, const Value &thisValue, const Value *arguments,
                                                            size_t count) -> Value {
        MMKV *kv = getInstance(convertJSIStringToNSString(
                                                          runtime, arguments[1].getString(runtime)));
        
        if (!kv) {
            return Value::undefined();
        }
        
        NSString *key = convertJSIStringToNSString(
                                                   runtime, arguments[0].getString(runtime));
        
        if ([kv containsKey:key]) {
            return Value(
                         convertNSStringToJSIString(runtime, [kv getStringForKey:key]));
        } else {
            return Value::null();
        }
    });
    
    jsiRuntime.global().setProperty(jsiRuntime, "getArrayMMKV",
                                    move(getArrayMMKV));
    
    auto setNumberMMKV = Function::createFromHostFunction(
                                                          jsiRuntime, PropNameID::forAscii(jsiRuntime, "setNumberMMKV"), 3,
                                                          [](Runtime &runtime, const Value &thisValue, const Value *arguments,
                                                             size_t count) -> Value {
        MMKV *kv = getInstance(convertJSIStringToNSString(
                                                          runtime, arguments[2].getString(runtime)));
        
        if (!kv) {
            return Value::undefined();
        }
        
        NSString *key = convertJSIStringToNSString(
                                                   runtime, arguments[0].getString(runtime));
        
        setIndex(kv, @"numberIndex", key);
        
        [kv setDouble:arguments[1].getNumber() forKey:key];
        
        return Value(true);
    });
    
    jsiRuntime.global().setProperty(jsiRuntime, "setNumberMMKV",
                                    move(setNumberMMKV));
    
    auto getNumberMMKV = Function::createFromHostFunction(
                                                          jsiRuntime, PropNameID::forAscii(jsiRuntime, "getNumberMMKV"), 2,
                                                          [](Runtime &runtime, const Value &thisValue, const Value *arguments,
                                                             size_t count) -> Value {
        MMKV *kv = getInstance(convertJSIStringToNSString(
                                                          runtime, arguments[1].getString(runtime)));
        
        if (!kv) {
            return Value::undefined();
        }
        
        NSString *key = convertJSIStringToNSString(
                                                   runtime, arguments[0].getString(runtime));
        
        if ([kv containsKey:key]) {
            return Value([kv getDoubleForKey:key]);
        } else {
            return Value::null();
        }
    });
    
    jsiRuntime.global().setProperty(jsiRuntime, "getNumberMMKV",
                                    move(getNumberMMKV));
    
    auto setBoolMMKV = Function::createFromHostFunction(
                                                        jsiRuntime, PropNameID::forAscii(jsiRuntime, "setBoolMMKV"), 3,
                                                        [](Runtime &runtime, const Value &thisValue, const Value *arguments,
                                                           size_t count) -> Value {
        MMKV *kv = getInstance(convertJSIStringToNSString(
                                                          runtime, arguments[2].getString(runtime)));
        
        if (!kv) {
            return Value::undefined();
        }
        
        NSString *key = convertJSIStringToNSString(
                                                   runtime, arguments[0].getString(runtime));
        
        setIndex(kv, @"boolIndex", key);
        
        [kv setBool:arguments[1].getBool() forKey:key];
        
        return Value(true);
    });
    
    jsiRuntime.global().setProperty(jsiRuntime, "setBoolMMKV", move(setBoolMMKV));
    
    auto getBoolMMKV = Function::createFromHostFunction(
                                                        jsiRuntime, PropNameID::forAscii(jsiRuntime, "getBoolMMKV"), 2,
                                                        [](Runtime &runtime, const Value &thisValue, const Value *arguments,
                                                           size_t count) -> Value {
        MMKV *kv = getInstance(convertJSIStringToNSString(
                                                          runtime, arguments[1].getString(runtime)));
        
        if (!kv) {
            return Value::undefined();
        }
        
        NSString *key = convertJSIStringToNSString(
                                                   runtime, arguments[0].getString(runtime));
        
        if ([kv containsKey:key]) {
            return Value([kv getBoolForKey:key]);
        } else {
            return Value::null();
        }
    });
    
    jsiRuntime.global().setProperty(jsiRuntime, "getBoolMMKV", move(getBoolMMKV));
    
    auto removeValueMMKV = jsi::Function::createFromHostFunction(
                                                                 jsiRuntime, jsi::PropNameID::forAscii(jsiRuntime, "removeValueMMKV"),
                                                                 2, // key
                                                                 [](jsi::Runtime &runtime, const jsi::Value &thisValue,
                                                                    const jsi::Value *arguments, size_t count) -> jsi::Value {
        MMKV *kv = getInstance(convertJSIStringToNSString(
                                                          runtime, arguments[1].getString(runtime)));
        
        if (!kv) {
            return Value::undefined();
        }
        
        NSString *key = convertJSIStringToNSString(
                                                   runtime, arguments[0].getString(runtime));
        
        removeKeyFromIndexer(kv, key);
        [kv removeValueForKey:key];
        
        return Value(true);
    });
    jsiRuntime.global().setProperty(jsiRuntime, "removeValueMMKV",
                                    std::move(removeValueMMKV));
    
    auto getAllKeysMMKV = jsi::Function::createFromHostFunction(
                                                                jsiRuntime, jsi::PropNameID::forAscii(jsiRuntime, "getAllKeysMMKV"), 1,
                                                                [](jsi::Runtime &runtime, const jsi::Value &thisValue,
                                                                   const jsi::Value *arguments, size_t count) -> jsi::Value {
        MMKV *kv = getInstance(convertJSIStringToNSString(
                                                          runtime, arguments[0].getString(runtime)));
        
        if (!kv) {
            return Value::undefined();
        }
        
        NSArray *keys = [kv allKeys];
        
        return Value(convertNSArrayToJSIArray(runtime, keys));
    });
    jsiRuntime.global().setProperty(jsiRuntime, "getAllKeysMMKV",
                                    std::move(getAllKeysMMKV));
    
    auto getIndexMMKV = jsi::Function::createFromHostFunction(
                                                              jsiRuntime, jsi::PropNameID::forAscii(jsiRuntime, "getIndexMMKV"), 2,
                                                              [](jsi::Runtime &runtime, const jsi::Value &thisValue,
                                                                 const jsi::Value *arguments, size_t count) -> jsi::Value {
        MMKV *kv = getInstance(convertJSIStringToNSString(
                                                          runtime, arguments[1].getString(runtime)));
        if (!kv) {
            return Value::undefined();
        }
        
        NSMutableArray *keys =
        getIndex(kv, convertJSIStringToNSString(
                                                runtime, arguments[0].getString(runtime)));
        return Value(convertNSArrayToJSIArray(runtime, keys));
    });
    
    jsiRuntime.global().setProperty(jsiRuntime, "getIndexMMKV",
                                    std::move(getIndexMMKV));
    
    auto containsKeyMMKV = jsi::Function::createFromHostFunction(
                                                                 jsiRuntime, jsi::PropNameID::forAscii(jsiRuntime, "containsKeyMMKV"), 2,
                                                                 [](jsi::Runtime &runtime, const jsi::Value &thisValue,
                                                                    const jsi::Value *arguments,
                                                                    
                                                                    size_t count) -> jsi::Value {
        MMKV *kv = getInstance(convertJSIStringToNSString(
                                                          runtime, arguments[1].getString(runtime)));
        if (!kv) {
            return Value::undefined();
        }
        return Value(
                     [kv containsKey:convertJSIStringToNSString(
                                                                runtime, arguments[0].getString(runtime))]);
    });
    jsiRuntime.global().setProperty(jsiRuntime, "containsKeyMMKV",
                                    std::move(containsKeyMMKV));
    
    auto clearMMKV = jsi::Function::createFromHostFunction(
                                                           jsiRuntime, jsi::PropNameID::forAscii(jsiRuntime, "clearMMKV"), 1,
                                                           [](jsi::Runtime &runtime, const jsi::Value &thisValue,
                                                              const jsi::Value *arguments,
                                                              
                                                              size_t count) -> jsi::Value {
        MMKV *kv = getInstance(convertJSIStringToNSString(
                                                          runtime, arguments[0].getString(runtime)));
        if (!kv) {
            return Value::undefined();
        }
        
        [kv clearAll];
        
        return Value(true);
    });
    jsiRuntime.global().setProperty(jsiRuntime, "clearMMKV",
                                    std::move(clearMMKV));
    
    auto encryptMMKV = jsi::Function::createFromHostFunction(
                                                             jsiRuntime, jsi::PropNameID::forAscii(jsiRuntime, "encryptMMKV"), 2,
                                                             [](jsi::Runtime &runtime, const jsi::Value &thisValue,
                                                                const jsi::Value *arguments,
                                                                
                                                                size_t count) -> jsi::Value {
        MMKV *kv = getInstance(convertJSIStringToNSString(
                                                          runtime, arguments[1].getString(runtime)));
        if (!kv) {
            return Value::undefined();
        }
        
        NSString *key = convertJSIStringToNSString(
                                                   runtime, arguments[0].getString(runtime));
        
        NSData *cryptKey = [key dataUsingEncoding:NSUTF8StringEncoding];
        [kv reKey:cryptKey];
        
        return Value(true);
    });
    
    jsiRuntime.global().setProperty(jsiRuntime, "encryptMMKV",
                                    std::move(encryptMMKV));
    
    auto decryptMMKV = jsi::Function::createFromHostFunction(
                                                             jsiRuntime, jsi::PropNameID::forAscii(jsiRuntime, "decryptMMKV"), 2,
                                                             [](jsi::Runtime &runtime, const jsi::Value &thisValue,
                                                                const jsi::Value *arguments,
                                                                
                                                                size_t count) -> jsi::Value {
        MMKV *kv = getInstance(convertJSIStringToNSString(
                                                          runtime, arguments[1].getString(runtime)));
        if (!kv) {
            return Value::undefined();
        }
        
        [kv reKey:NULL];
        
        return Value(true);
    });
    
    jsiRuntime.global().setProperty(jsiRuntime, "decryptMMKV",
                                    std::move(decryptMMKV));
    
    // Secure Store
    
    auto setSecureKey = Function::createFromHostFunction(
                                                         jsiRuntime, PropNameID::forAscii(jsiRuntime, "setSecureKey"), 3,
                                                         [](Runtime &runtime, const Value &thisValue, const Value *arguments,
                                                            size_t count) -> Value {
        NSString *alias = convertJSIStringToNSString(
                                                     runtime, arguments[0].getString(runtime));
        NSString *key = convertJSIStringToNSString(
                                                   runtime, arguments[1].getString(runtime));
        NSString *accValue = convertJSIStringToNSString(
                                                        runtime, arguments[2].getString(runtime));
        [_secureStorage setSecureKey:alias
                               value:key
                             options:@{@"accessible" : accValue}];
        
        return Value(true);
    });
    
    jsiRuntime.global().setProperty(jsiRuntime, "setSecureKey",
                                    move(setSecureKey));
    
    auto getSecureKey = Function::createFromHostFunction(
                                                         jsiRuntime, PropNameID::forAscii(jsiRuntime, "getSecureKey"), 3,
                                                         [](Runtime &runtime, const Value &thisValue, const Value *arguments,
                                                            size_t count) -> Value {
        NSString *alias = convertJSIStringToNSString(
                                                     runtime, arguments[0].getString(runtime));
        
        return Value(convertNSStringToJSIString(
                                                runtime, [_secureStorage getSecureKey:alias]));
    });
    
    jsiRuntime.global().setProperty(jsiRuntime, "getSecureKey",
                                    move(getSecureKey));
    
    auto secureKeyExists = Function::createFromHostFunction(
                                                            jsiRuntime, PropNameID::forAscii(jsiRuntime, "secureKeyExists"), 3,
                                                            [](Runtime &runtime, const Value &thisValue, const Value *arguments,
                                                               size_t count) -> Value {
        NSString *alias = convertJSIStringToNSString(
                                                     runtime, arguments[0].getString(runtime));
        
        return Value([_secureStorage secureKeyExists:alias]);
    });
    
    jsiRuntime.global().setProperty(jsiRuntime, "secureKeyExists",
                                    move(secureKeyExists));
    
    auto removeSecureKey = Function::createFromHostFunction(
                                                            jsiRuntime, PropNameID::forAscii(jsiRuntime, "removeSecureKey"), 3,
                                                            [](Runtime &runtime, const Value &thisValue, const Value *arguments,
                                                               size_t count) -> Value {
        NSString *alias = convertJSIStringToNSString(
                                                     runtime, arguments[0].getString(runtime));
        [_secureStorage removeSecureKey:alias];
        return Value(true);
    });
    
    jsiRuntime.global().setProperty(jsiRuntime, "removeSecureKey",
                                    move(removeSecureKey));
    
    // Secure Store End
}

- (void)migrate {
    MMKV *kv = [MMKV mmkvWithID:@"mmkvIdStore"];
    [mmkvInstances setObject:kv forKey:@"mmkvIdStore"];
    if ([kv containsKey:@"mmkvIdData"]) {
        NSMutableDictionary *oldStore =
        [kv getObjectOfClass:NSMutableDictionary.class forKey:@"mmkvIdData"];
        NSArray *keys = [oldStore allKeys];
        
        for (int i = 0; i < keys.count; i++) {
            NSString *storageKey = keys[i];
            NSMutableDictionary *entry = [oldStore objectForKey:storageKey];
            NSError *error;
            NSData *jsonData = [NSJSONSerialization dataWithJSONObject:entry
                                                               options:0
                                                                 error:&error];
            NSString *jsonString =
            [[NSString alloc] initWithData:jsonData
                                  encoding:NSUTF8StringEncoding];
            [kv setString:jsonString forKey:storageKey];
            
            if ([[entry valueForKey:@"encrypted"] boolValue]) {
                NSString *alias = [entry valueForKey:@"alias"];
                if ([_secureStorage searchKeychainCopyMatchingExists:alias]) {
                    NSString *key = [_secureStorage searchKeychainCopyMatching:alias];
                    if (key != nil) {
                        NSData *cryptKey = [key dataUsingEncoding:NSUTF8StringEncoding];
                        MMKV *kvv = [MMKV mmkvWithID:storageKey
                                            cryptKey:cryptKey
                                                mode:MMKVSingleProcess];
                        [self writeToJson:kvv];
                    }
                };
            } else {
                MMKV *kvv = [MMKV mmkvWithID:storageKey mode:MMKVSingleProcess];
                [self writeToJson:kvv];
            }
        }
        
        [kv removeValueForKey:@"mmkvIdData"];
    }
}

- (void)writeToJson:(MMKV *)kv {
    NSArray *mapIndex = getIndex(kv, @"mapIndex");
    if (mapIndex != nil) {
        for (NSString *key in mapIndex) {
            NSDictionary *data = [kv getObjectOfClass:NSDictionary.class forKey:key];
            if (data != nil) {
                NSError *error;
                NSData *jsonData = [NSJSONSerialization dataWithJSONObject:data
                                                                   options:0
                                                                     error:&error];
                NSString *jsonString =
                [[NSString alloc] initWithData:jsonData
                                      encoding:NSUTF8StringEncoding];
                [kv setString:jsonString forKey:key];
            }
        }
    }
    
    NSArray *arrayIndex = getIndex(kv, @"arrayIndex");
    if (arrayIndex != nil) {
        for (NSString *key in arrayIndex) {
            NSDictionary *data =
            [kv getObjectOfClass:NSDictionary.class forKey:key];
            
            if (data != nil) {
                NSMutableArray *array = [data objectForKey:key];
                if (array != nil) {
                    NSError *error;
                    NSData *jsonData = [NSJSONSerialization dataWithJSONObject:array
                                                                       options:0
                                                                         error:&error];
                    NSString *jsonString =
                    [[NSString alloc] initWithData:jsonData
                                          encoding:NSUTF8StringEncoding];
                    [kv setString:jsonString forKey:key];
                }
            }
        }
    }
    
    NSArray *intIndex =
    [kv getObjectOfClass:NSMutableArray.class forKey:@"intIndex"];
    if (intIndex != nil) {
        for (NSString *key in intIndex) {
            int64_t intVal = [kv getInt64ForKey:key];
            [kv setDouble:double(intVal) forKey:key];
        }
        [kv setObject:intIndex forKey:@"numberIndex"];
        [kv removeValueForKey:@"intIndex"];
    }
}

@end
